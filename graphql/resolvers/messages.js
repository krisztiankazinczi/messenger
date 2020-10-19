const { UserInputError, AuthenticationError, ForbiddenError, withFilter } = require('apollo-server');
const { Op } = require('sequelize');

const { Message, User, Reaction } = require('../../models');

module.exports = {
  Query: {
      getMessages: async (parent, { from }, { user }) => {
        try {
          if (!user) throw new AuthenticationError('Unauthenticated');

          const otherUser = await User.findOne({
            where: { username: from },
          })
          if (!otherUser) throw new UserInputError('User not found')
  
          const usernames = [user.username, otherUser.username];

          const messages = await Message.findAll({
            where: { 
              from: { [Op.in]: usernames},
              to: { [Op.in]: usernames}
            },
            order: [['createdAt', 'DESC']]
          })

          return messages          
        } catch (err) {
          console.log(err);
          throw err;
        }
      }
  },
  Mutation: {
    sendMessage: async (parent, { to, content }, { user, pubsub }) => {
      try {
        if (!user) throw new AuthenticationError('Unauthenticated');

        const recipient = await User.findOne({ where: { username: to } });

        if (!recipient) {
          throw new UserInputError('User not found')
        } else if (recipient.username === user.username) {
          throw new UserInputError('You cant message yourself')
        }

        if (!content.trim().length) {
          throw new UserInputError('Message is empty');
        }

        const message = await Message.create({ 
          from: user.username,
          to,
          content
        })

        // inform the subscribed users about the new message
        pubsub.publish('NEW_MESSAGE', { newMessage: message })

        return message;

      } catch (err) {
        console.log(err)
        throw err;
      }
    },
    reactToMessage: async(_, {uuid, content}, { user, pubsub }) => {
      const reactions = ['❤️', '😆', '😯', '😢', '😡', '👍', '👎'];

      try {
        // validate reaction content
        if (!reactions.includes(content)) {
          throw new UserInputError('Invalid Reaction');
        }
        // get User
        const username = user ? user.username : '';
        user = await User.findOne({ where: { username } });

        if (!user) throw new AuthenticationError('Unauthenticated');

        // get Message
        const message = await Message.findOne({ where: { uuid }});
        if (!user) throw new UserInputError('Message not found');

        // if it's not the user message at all
        if (message.from !== user.username && message.to !== user.username) {
          throw new ForbiddenError('Unauthorized')
        }

        let reaction = await Reaction.findOne({ where: {messageId: message.id, userId: user.id}});

        if (reaction) {
          // check if the user already reacted on Message or not
          reaction.content = content;
          await reaction.save(); // update the data in database
        } else {
         // Reaction doesn't exist from this user
         reaction = await Reaction.create({ 
           messageId: message.id,
           userId: user.id, 
           content
         })
        }

        pubsub.publish('NEW_REACTION', { newReaction: reaction })

        return reaction;

      } catch (err) {
        console.log(err);
      }
    }
  },
  Subscription: {
    newMessage: {
      subscribe: withFilter((_, __, { user, pubsub }) => {
        if (!user) throw new AuthenticationError('Unauthenticated');
        return pubsub.asyncIterator(['NEW_MESSAGE'])
      }, ({ newMessage }, args, { user }) => {
        if (newMessage.from === user.username || newMessage.to === user.username) {
          return true
        }
        return false
      } )
    },
    newReaction: {
      subscribe: withFilter((_, __, { user, pubsub }) => {
        if (!user) throw new AuthenticationError('Unauthenticated');
        return pubsub.asyncIterator('NEW_REACTION');
      }, async ({ newReaction }, args, { user }) => {
        const message = await newReaction.getMessage();
        if (message.from === user.username || message.to === user.username) {
          return true
        }
        return false
      } )
    }  
  }
};