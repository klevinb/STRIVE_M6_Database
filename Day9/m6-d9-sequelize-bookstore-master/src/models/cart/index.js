const orm = require("../../db")
const  Sequelize  = require("sequelize")
const Book = require("../book")

const Cart = orm.define("shoppingcart", {
    id: {
        type: Sequelize.NUMBER,
        primaryKey: true,
        autoIncrement: true
    },
    bookid: {
        type: Sequelize.STRING,
        allowNull: false
    },
    userid: {
        type: Sequelize.NUMBER,
        allowNull: false
    }
}, {
    timestamps: false,
    tableName: "shoppingcart",
    freezeTableName: true
})

module.exports = Cart
