const { DataTypes } = require('sequelize');
const sequelize = require('./db');

// Define the ImageLog model
const ImageLog = sequelize.define('ImageLog', {
  original_name: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },
  optimized_path: { 
    type: DataTypes.TEXT 
  },
  status: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },
  error_message: { 
    type: DataTypes.TEXT 
  },
  start_time: { 
    type: DataTypes.DATE 
  },
  end_time: { 
    type: DataTypes.DATE 
  },
  processing_duration: { 
    type: DataTypes.INTEGER 
  },
  original_size: { 
      type: DataTypes.INTEGER 
  },
  optimized_size: { 
      type: DataTypes.INTEGER 
  },
  createdAt: { 
    type: DataTypes.DATE, 
    allowNull: false, 
    defaultValue: DataTypes.NOW 
  },
  updatedAt: { 
    type: DataTypes.DATE, 
    allowNull: false, 
    defaultValue: DataTypes.NOW 
  }
}, {
  tableName: 'image_logs',  
  timestamps: false,       
});

module.exports = ImageLog;
