const bcrypt = require('bcryptjs');
const { UserInputError, AuthenticationError } = require('apollo-server');
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize');


const { User } = require('../../models');
const { JWT_SECRET } = require('../../config/env');

module.exports = {
  Query: {
    getUsers: async (parent, args, { user }) => {
      try {
        if (!user) throw new AuthenticationError('Unauthenticated');
      

        const users = await User.findAll({ where: { username: { [Op.ne]: user.username }}});
        return users;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    login: async (parent, args) => {
      const { username, password } = args;
      const errors = {};

      try {
        if (username.trim() === '') errors.username = 'username must not be empty';
        if (password === '') errors.password = 'password must not be empty';

        if (Object.keys(errors).length) {
          throw new UserInputError('bad input', { errors });
        }

        const user = await User.findOne({ where: { username }})
        if (!user) {
          errors.username = 'user not found';
        }

        if (Object.keys(errors).length) {
          throw new UserInputError('user not found', { errors });
        }

        const correctPassword = await bcrypt.compare(password, user.password);

        if (!correctPassword) {
          errors.password = 'password is incorrect';
          throw new UserInputError('password is incorrect', { errors });
        }

        const token = jwt.sign({ username }, JWT_SECRET, {expiresIn: 60 * 60 });

        return {
          ...user.toJSON(),
          createdAt: user.createdAt.toISOString(),
          token
        }


      } catch (err) {
        console.log(err)
        throw err;
      }
    }
  },
  Mutation: {
    register: async (_, args) => {
      let { username, email, password, confirmPassword } = args;
      const errors = {};
      try {
        // validate-npm-package-license
        const requiredFields = ['email', 'username', 'password', 'confirmPassword'];

        for (const field of requiredFields) {
          if (args[field].trim() === '') {
            errors[field] = `${field} must be not empty`;
          }
        }

        if (password !== confirmPassword) errors.confirmPassword = 'password must match';

        if (Object.keys(errors).length) {
          throw errors;
        }
        // hash the password
        password = await bcrypt.hash(password, 6);
        // create username
        const user = await User.create({
          username,
          email,
          password
        })
        // return user
        return user;
      } catch (error) {
        console.log(error)
        if (error.name === 'SequelizeUniqueConstraintError') {
          error.errors.forEach(e => (errors[e.path] = `${e.path} is already taken`))
        } else if (error.name === 'SequelizeValidationError') {
          error.errors.forEach(e => (errors[e.path] = e.message))
        }
        throw new UserInputError('Bad Input', { errors })
      }
    }
  }
};