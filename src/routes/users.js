import jwt from 'jsonwebtoken';
import models from '../models';

const users = {};

function getToken(user) {
  const token = jwt.sign(user, process.env.SECRET_KEY, {
    expiresIn: 400000,
  });
  return token;
}

users.login = async (ctx, next) => {
  const { login, password } = ctx.request.body;
  if (login) {
    await models.User
      .findOne({ where: { login } })
      .then(user => {
        if (user.comparePassword(password)) {
          const token = getToken(user.userData);
          ctx.response.body = { success: true, token };
          // next();
        } else {
          ctx.response.body = { error: 'Invalid password' };
        }
      })
      .catch(err => ctx.response.body = JSON.stringify(err));
  }
};

users.register = async (ctx, next) => {
  const { login, password, email } = ctx.request.body;
  if (login && password) {
    await models.User
      .create({
        login,
        password,
        isAdmin: false,
        email,
      })
      .then(user => {
        const token = getToken(user.userData);
        ctx.response.body = { success: true, token };
        // next();
      })
      .catch(err => {
        console.log(err);
        ctx.response.body = { message: err.message };
      });
  } else {
    ctx.response.body = {
      message: 'Please, specify login, password and email to register a new user',
    };
  }
};

users.getOneUser = async (ctx, next) => {
  // console.log(JSON.stringify(ctx, null, 2));
  const id = ctx.params.id;
  await models.User
    .findOne({ where: { id } })
    .then(user => {
      console.log(user);
      ctx.body = JSON.stringify(user);
    })
    .catch(err => ctx.response.body = { message: err.message });
};

users.delete = async (ctx, next) => {
  const id = ctx.params.id;
  await models.User
    .destroy({ where: { id } })
    .then(deletedRecord => {
      if (deletedRecord === 1) {
        ctx.response.status = 200;
        ctx.body = { message: 'Deleted successfully' };
      } else {
        ctx.response.status = 404;
        ctx.body = { message: 'Failed. Record not found' };
      }
    })
    .catch(err => ctx.response.body = { message: err.message });
};

users.getAllUsers = async (ctx, next) => {
  await models.User
    .findAll({
      attributes: ['id', 'login', 'email'],
      order: '"createdAt" DESC',
    })
    .then(data => data.map(instance => instance.dataValues))
    .then(data => ctx.response.body = JSON.stringify(data))
    .catch(err => ctx.response.body = { message: err.message });
};

export default users;
