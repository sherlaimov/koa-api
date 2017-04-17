import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import models from '../models';

const auth = {};

auth.auth = async (ctx, next) => {
  console.log('*** INSIDE AUTH ***');
  const { user } = ctx;
  if (user) {
    const token = jwt.sign(user, process.env.SECRET_KEY, {
      expiresIn: 400000,
    });
    ctx.response.body = { success: true, token };
  }
    await next();
  // if (secretToken) {
  //   console.log(secretToken);

  //   try {
  //     const decoded = jwt.verify(secretToken, process.env.SECRET_KEY);
  //     if (decoded) {
  //       await next();
  //     }
  //   } catch (err) {
  //     ctx.response.body = { error: err.message };
  //   }
  // } else {
  //   // ctx.response.body = { message: 'This route is secure. Please, authorize to get access' };
  // }
};

export default auth;
