import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import koaJWT from 'koa-jwt';
import users from './routes/users';
import models from './models';
import userData from './utils/placeholder-users.json';
import auth from './routes/auth';
import config from './config';

const app = new Koa();
app.use(bodyParser());

const router = new Router({
  prefix: '/api/v1',
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
router.post('/auth/recover-password', auth.recoverPass);
// POST /api/v1/auth/recover-password
// POST /api/v1/users/LOGOUT????

router.use(koaJWT({ secret: config.secretKey }));
router.get('/users/getall', users.getAll);
router.get('/users/getone/:id', users.getById);

router.post('/users/update/:id', users.update);
router.post('/users/delete/:id', users.delete);
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
