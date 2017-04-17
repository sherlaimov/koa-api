import fs from "fs";
import path from "path";
import Sequelize from "sequelize";
import config from "../config";

if (process.env.DATABASE_URL) {
  const sequelize = new Sequelize(process.env.DATABASE_URL, config);
} 

const sequelize = new Sequelize("test", "root", "");

const db = {};

fs
  .readdirSync(__dirname)
  .filter(file => {
    return file.indexOf(".") !== 0 && file !== "index.js";
  })
  .forEach(file => {
    // READ THROUGH SEQUELIZE DOCS
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
