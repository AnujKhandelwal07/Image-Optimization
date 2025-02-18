const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('image_optimization', 'postgres', 'root', {
  host: 'localhost',  
  dialect: 'postgres',
});

module.exports = sequelize;
