import Koa from 'koa';
import jwt from 'jsonwebtoken';

const app = new Koa();

app.use((ctx, next) => {
  // check header or url parameters or post parameters for token
  // const token = ctx.body.token || ctx.query.token || ctx.headers['x-access-token'];
  const user = {
    username: 'test',
    email: 'test@mail.com',
  };
  const token = jwt.sign(user, process.env.SECRET_KEY, {
    expiresIn: 4000,
  });
  ctx.response.body = {
    success: true,
    token,
  };
  // next();
});

export default app;
