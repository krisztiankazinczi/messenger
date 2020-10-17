const bcrypt = require('bcryptjs');
const { UserInputError } = require('apollo-server');

const { User } = require('../models');

module.exports = {
  Query: {
    getUsers: async () => {
      try {
        const users = await User.findAll()
        return users;
      } catch (error) {
        console.log(error);
      }
    },
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