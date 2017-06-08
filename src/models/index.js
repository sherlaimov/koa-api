import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import config from '../config';

const db = {};

function grab(flag) {
  const index = process.argv.indexOf(flag);
  console.log(process.argv);
  return index === -1 ? null : process.argv[index + 1];
}

const greet = grab('-g');

let sequelize;
if (config.db.url) {
  console.log(config.db.url);
  // , config.db
  sequelize = new Sequelize(config.db.url);
} else {
  sequelize = new Sequelize(config.db.name, config.db.username, config.db.password);
}

fs
  .readdirSync(__dirname)
  .filter(file => file.indexOf('.') !== 0 && file !== 'index.js')
  .forEach(file => {
    // READ THROUGH SEQUELIZE DOCS
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
