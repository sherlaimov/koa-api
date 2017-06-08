const config = {
  port: 3000,
  rootDir: __dirname,
  debug: true,
  secretKey: process.env.SECRET_KEY || 'mybadasskey',
  db: {
    dialect: 'mysql',
    username: 'root',
    url: process.env.DATABASE_URL || 'mysql://root:@localhost:3306/test',
    password: '',
    host: '127.0.0.1',
    port: 3000,
    name: 'test',
  },
};

export default config;
