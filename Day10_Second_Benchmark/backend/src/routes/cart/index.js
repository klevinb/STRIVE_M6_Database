const express = require("express");
const db = require("../../db");

const router = express();

router.get("/:id", async (req, res, next) => {
  try {
    const cart = await db.query(`SELECT  name,price as unitary_price, COUNT(*) As quantity, COUNT(*) * price as total
    FROM shoppingcart JOIN products ON shoppingcart.productid = products._id
    WHERE userid = 1
    GROUP BY name, price`);

    res.send(cart.rows);
  } catch (error) {
    next(error);
  }
});
router.post("/:id/add-product-to-cart/:productId", async (req, res, next) => {
  try {
    const cart = await db.query(
      `INSERT INTO shoppingcart (productid, userid) Values ( $1 , $2)`,
      [req.params.productId, 1]
    );

    res.send(cart.rows);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
