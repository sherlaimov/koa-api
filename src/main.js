import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import mount from 'koa-mount';
import koaJWT from 'koa-jwt';
import users from './routes/users';
import api from './api';
import models from './models';
import userData from './utils/placeholder-users.json';

const app = new Koa();
app.use(bodyParser());

const router = new Router({});

app.use(mount('/api', api));

app.use(async (ctx, next) => {
  const start = new Date();
  ctx.value = { firstMiddle: 'This is my value' };
  await next(); // all the chain
  const ms = new Date() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}`);
});

router.post('/users/register', users.register);
router.post('/users/login', users.login);

router.use(koaJWT({ secret: process.env.SECRET_KEY }));
router.get('/users/getall', users.getAllUsers);
router.get('/users/getone/:id', users.getOneUser);
router.post('/users/delete/:id', users.delete);
// POST /api/v1/auth/recover-password
app.use(router.routes()).use(router.allowedMethods());

models.sequelize.sync({ force: true }).then(() => {
  models.User.findAll().then(users => {
    if (users.length === 0) {
      models.User
        .bulkCreate(userData.users)
        .then(console.log('*** Creating fake users ***'))
        .catch(e => console.log(e));
    }
  });
  app.listen(3000, () => console.log('Listening on port 3000'));
});
