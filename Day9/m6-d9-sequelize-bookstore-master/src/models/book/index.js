const orm = require("../../db")
const Sequelize = require("sequelize")
const Review = require("../review")
const Cart = require("../cart")

const Book = orm.define("Books", {
    asin: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    category: {
        type: Sequelize.STRING,
        allowNull: false
    },
    img: {
        type: Sequelize.STRING,
        allowNull: false
    },
    price: {
        type: Sequelize.NUMBER,
        allowNull: false
    }
}, {
    timestamps: false
})

Book.hasMany(Review, {
    foreignKey: "bookid"
})

Book.hasMany(Cart, {
    foreignKey: "bookid"
})

module.exports = Book
