import {Sequelize, DataTypes} from "Sequelize";

export const seq = new Sequelize("postgres", "postgres", "admin", {
    host: "localhost",
    dialect: "postgres",
  });


export const User_model = seq.define("users", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    datecreated: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    datemodified: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    secret_key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    timestamps: false,
  });
  

  export const Subject_model = seq.define("subjects", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    timestamps: false,
  });
  

  