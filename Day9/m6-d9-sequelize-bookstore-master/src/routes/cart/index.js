const Cart = require("../../models/cart")
const Book = require("../../models/book")
const express = require("express")
const Sequelize = require("sequelize")
const orm = require("../../db")

const router = express.Router()

router.post("/", async(req, res)=> {
    res.send(await Cart.create(req.body))
})

router.get("/:userId", async (req, res) => {
     const response = await orm.query(`SELECT asin, title, img, category, price as unitary_price, COUNT(*) As quantity, COUNT(*) * price as total
                                      FROM shoppingcart JOIN "Books" ON shoppingcart.bookid = "Books".asin
                                      WHERE userid = ?
                                      GROUP BY asin
                                      `, {
                                        replacements: [req.params.userId],
                                        type: Sequelize.QueryTypes.SELECT
                                    }
                                          ) 

    res.send(response)              
})

router.delete("/:userId/:asin", async (req, res)=>{

    const response = await Cart.destroy({
        where: {
            [Sequelize.Op.and]: [{
                userid: req.params.userId
            },{
                bookid: req.params.asin
            }]
        },
        limit: 1
    })

    res.send({test: response})
})

// router.get("/:userId", async(req, res)=>{
//     // const response = await Cart.findAll({
//     //      include: Book,
//     //      where: { userid: req.params.userId}
//     // })
//     const response = await Book.findAll({
//         attributes: 
//         [ "title", "img", "category", "price", "asin",
//             [ Sequelize.fn("COUNT", Sequelize.col('bookid')), "quantity"]
//         ],
//         group: [ "title", "img", "category", "price", "asin"],
//         include: [{
//             model: Cart,
//             as: "shoppingcarts",
//             through: { 
//                 attributes: [] 
//             }
//         }],
//         where: {
//             '$shoppingcarts.userid$': req.params.userId
//         }
//     })

//     res.send(response)
// })



module.exports = router