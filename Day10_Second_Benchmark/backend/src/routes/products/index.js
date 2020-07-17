const express = require("express");
const db = require("../../db");
const multer = require("multer");
const fs = require("fs-extra");
const { join } = require("path");

const upload = multer();
const router = express.Router();

const imgPath = join(__dirname, "../../../public/products/img");

router.get("/", async (req, res, next) => {
  try {
    const limit = req.query.limit;
    const offset = req.query.offset || 0;
    const category = req.query.category || "";
    const order = req.query.oreder || "asc";

    delete req.query.limit;
    delete req.query.offset;

    const products = await db.query(
      `SELECT * FROM products WHERE category LIKE '%${category}%' LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const nrOfProducts = await db.query(
      `SELECT COUNT(_id) FROM products WHERE category LIKE '%${category}%'`
    );

    res.status(200).send({
      products: products.rows,
      nrOfProducts: nrOfProducts.rows[0].count,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const findProduct = await db.query(
      `SELECT *, products._id As _id, products."createdAt" As productcreation, reviews._id As reviewid, reviews."createdAt" as reviewscreation FROM products LEFT JOIN reviews ON reviews.productid = $1 WHERE products._id = $1`,
      [req.params.id]
    );

    if (findProduct.rowCount !== 0) {
      if (findProduct.rowCount > 1) {
        const nestedData = findProduct.rows.reduce((acc, curr) => {
          const product = acc.find((product) => product._id === curr._id);
          if (product) {
            product.reviews.push({
              _id: curr.reviewid,
              comment: curr.comment,
              rate: curr.rate,
              productid: curr.productid,
            });
          } else {
            acc.push({
              _id: curr._id,
              name: curr.name,
              brand: curr.brand,
              category: curr.category,
              description: curr.description,
              imageurl: curr.imageurl,
              price: curr.price,
              createdAt: curr.createdAt,
              updatedAt: curr.updatedAt,
              reviews: [
                {
                  _id: curr.reviewid,
                  comment: curr.comment,
                  rate: curr.rate,
                  productid: curr.productid,
                },
              ],
            });
          }
          return acc;
        }, []);
        res.status(200).send(nestedData[0]);
      } else {
        if (findProduct.rows[0].reviewid === null) {
          res.status(200).send({
            _id: findProduct.rows[0]._id,
            name: findProduct.rows[0].name,
            brand: findProduct.rows[0].brand,
            category: findProduct.rows[0].category,
            description: findProduct.rows[0].description,
            imageurl: findProduct.rows[0].imageurl,
            price: findProduct.rows[0].price,
            createdAt: findProduct.rows[0].productcreation,
            updatedAt: findProduct.rows[0].updatedAt,
            reviews: [],
          });
        } else {
          res.status(200).send({
            _id: findProduct.rows[0]._id,
            name: findProduct.rows[0].name,
            brand: findProduct.rows[0].brand,
            category: findProduct.rows[0].category,
            description: findProduct.rows[0].description,
            imageurl: findProduct.rows[0].imageurl,
            price: findProduct.rows[0].price,
            createdAt: findProduct.rows[0].productcreation,
            updatedAt: findProduct.rows[0].updatedAt,
            reviews: [
              {
                _id: findProduct.rows[0].reviewid,
                comment: findProduct.rows[0].comment,
                rate: findProduct.rows[0].rate,
                productid: findProduct.rows[0]._id,
              },
            ],
          });
        }
      }
    } else {
      const err = new Error();
      err.httpStatusCode = 404;
      err.message = "Not Found";
      next(err);
    }
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, description, brand, imageurl, price, category } = req.body;
    const addProduct = await db.query(
      `INSERT INTO products (name, description, brand, imageurl, price, category )
                                            Values ( $1, $2, $3, $4, $5, $6 ) RETURNING *`,
      [name, description, brand, imageurl, price, category]
    );

    if (addProduct.rowCount > 0) res.status(201).send(addProduct.rows[0]);
    else res.status(400).send("Bad request");
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { name, description, brand, imageurl, price, category } = req.body;

    const editedProduct = await db.query(
      `UPDATE products SET name = $1, description = $2, brand = $3, price = $4, category = $5, "updatedAt" = $6
                                        WHERE _id = $7 RETURNING *`,
      [name, description, brand, price, category, new Date(), req.params.id]
    );

    if (editedProduct.rowCount > 0) res.status(200).send("Updated");
    else res.status(400).send("Bad request");
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const deleteProduct = await db.query(
      "DELETE FROM products WHERE _id = $1",
      [req.params.id]
    );
    if (deleteProduct.rowCount > 0) {
      if (fs.existsSync(join(imgPath, `${req.params.id}.png`))) {
        await fs.unlink(join(imgPath, `${req.params.id}.png`));
      }
      res.status(200).send("Deleted");
    } else {
      res.status(404).send("Not found");
    }
  } catch (error) {
    next(error);
  }
});

router.post("/:id/upload", upload.single("product"), async (req, res, next) => {
  try {
    await fs.writeFile(join(imgPath, `${req.params.id}.png`), req.file.buffer);
    const addPhoto = await db.query(
      "UPDATE products SET imageurl = $1 WHERE _id = $2",
      [
        `http://localhost:${process.env.PORT}/products/img/${req.params.id}.png`,
        req.params.id,
      ]
    );

    if (addPhoto.rowCount > 0) res.status(201).send("Photo added");
    else res.status(400).send("Bad request");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
