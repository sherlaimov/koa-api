import jwt from 'jsonwebtoken';
import models from '../models';
// import { secretKey } from '../config';
import config from '../config';


const auth = {};

function getToken(user) {
  const token = jwt.sign(user, config.secretKey, {
    expiresIn: 40000,
  });
  return token;
}

auth.recoverPass = async (ctx, next) => {
  const { email } = ctx.request.body;
  if (email) {
    await models.User.findOne({ where: { email } }).then(user => {
      const token = getToken(user.userData);
      ctx.set('Content-type', 'application/json;utf8');
      ctx.body = { status: 'success', token };
    });
  } else {
    ctx.response.body = { error: 'User with specified email was not found' };
  }
};

export default auth;
