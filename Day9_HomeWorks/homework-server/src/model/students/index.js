const orm = require("../../db");
const Sequelize = require("sequelize");
const Project = require("../projects");

const Student = orm.define(
  "students",
  {
    studentid: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    surname: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    birthday: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

Student.hasMany(Project, {
  foreignKey: "studentid",
});

module.exports = Student;
