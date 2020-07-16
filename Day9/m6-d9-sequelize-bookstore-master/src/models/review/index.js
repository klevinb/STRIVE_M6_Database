const Sequelize  = require("sequelize")
const { NUMBER, STRING } = require("sequelize")
const orm = require("../../db")

const Review = orm.define("reviews", {
    id: {
        type: NUMBER,
        primaryKey: true,
        autoIncrement: true
    },
    userid: {
        type: NUMBER,
        allowNull: false
    },
    bookid: {
        type: STRING,
        allowNull: false
    },
    comment: {
        type: STRING,
        allowNull: false
    },
    rate: {
        type: NUMBER,
        allowNull: false
    }
}, {
    timestamps: false
})

module.exports = Review