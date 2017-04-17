const config = {
  port: 3000,
  rootDir: __dirname,
  debug: true,
  secretKey: process.env.SECRET_KEY || 'mybadasskey',
};

process.env.DATABASE_URL = 'mysql://user:root@localhost:3000/test';
process.env.SECRET_KEY = 'mybadasskey';
export default config;