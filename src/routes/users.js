import jwt from 'jsonwebtoken';
import config from '../config';
import models from '../models';

const users = {};

function getToken(user) {
  const token = jwt.sign(user, config.secretKey, {
    expiresIn: 40000,
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
        } else {
          ctx.response.body = { error: 'Invalid password' };
        }
      })
      .catch(err => {
        ctx.response.body = JSON.stringify(err);
        throw Error(err);
      });
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
      })
      .catch(err => {
        ctx.response.body = { message: err.message };
      });
  } else {
    ctx.response.body = {
      message: 'Please, specify login, password and email to register a new user',
    };
  }
};

users.getById = async (ctx, next) => {
  // console.log(JSON.stringify(ctx, null, 2));
  const id = ctx.params.id;
  await models.User
    .findOne({ where: { id } })
    .then(user => {
      if (null !== user) {
        ctx.set('Content-type', 'application/json;charset=utf8');
        ctx.body = JSON.stringify(user);
      } else {
        ctx.set('Content-type', 'application/json;charset=utf8');
        ctx.body = { message: 'User not found' };
      }
    })
    .catch(err => ctx.response.body = { message: err.message });
};

users.update = async (ctx, next) => {
  const id = parseInt(ctx.params.id);
  // if password is not specified, does it get updated in DB?
  const { user } = ctx.state;
  const { login, password, email } = ctx.request.body;
  // (ctx.headers).admin
  if (user.isAdmin || user.id === id) {
    await models.User
      .findOne({ where: { id } })
      .then(user =>
        user.update({
          login,
          password,
          email,
        }))
      .then(user => {
        if (user) {
          ctx.set('Content-Type', 'application/json;utf8');
          ctx.response.body = {
            status: 'User successfully updated',
            login: user.userData.login,
            email: user.userData.email,
          };
        }
      })
      .catch(err => ctx.response.body = { message: err.message });
  } else {
    ctx.set('Content-Type', 'application/json;utf8');
    ctx.body = { message: 'Only admins may update other users' };
  }
};

users.delete = async (ctx, next) => {
  const deleteId = parseInt(ctx.params.id);
  const { id, isAdmin } = ctx.state.user;
  if (isAdmin && deleteId !== id) {
    await models.User
      .destroy({ where: { id: deleteId } })
      .then(deletedRecord => {
        if (deletedRecord === 1) {
          ctx.response.status = 200;
          ctx.body = { message: 'Deleted successfully' };
        } else {
          ctx.response.status = 404;
          ctx.body = { status: 'Failed. Record not found' };
        }
      })
      .catch(err => ctx.response.body = { message: err.message });
  } else if (!isAdmin) {
    ctx.body = { message: 'Only admin can perform this action' };
  } else {
    ctx.body = { message: 'Admin cannot delete himself' };
  }
};

users.getAll = async (ctx, next) => {
  await models.User
    .findAll({
      attributes: ['id', 'login', 'email'],
      order: '"createdAt" DESC',
    })
    .then(data => data.map(instance => instance.userData))
    .then(data => {
      ctx.set('Content-type', 'application/json;charset=utf8');
      ctx.response.body = JSON.stringify(data);
    })
    .catch(err => ctx.response.body = { message: err.message });
};

export default users;
