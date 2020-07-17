const express = require("express");
const db = require("../../db");

const router = express();

router.get("/", async (req, res, next) => {
  try {
    const findReview = await db.query("SELECT * FROM reviews ");
    if (findReview.rowCount > 0) res.status(200).send(findReview.rows);
    else res.status(404).send("Not found");
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const findReview = await db.query("SELECT * FROM reviews WHERE _id = $1", [
      req.params.id,
    ]);
    if (findReview.rowCount > 0) res.status(200).send(findReview.rows[0]);
    else res.status(404).send("Not found");
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { comment, rate, productid } = req.body;
    const addReview = await db.query(
      `INSERT INTO reviews (comment, rate, productid) Values ($1, $2, $3) RETURNING *`,
      [comment, rate, productid]
    );
    if (addReview.rowCount > 0) res.status(201).send(addReview.rows[0]);
    else res.status(400).send("Bad request");
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { comment, rate } = req.body;
    const updateReview = await db.query(
      "UPDATE reviews SET comment = $1, rate = $2 WHERE _id = $3",
      [comment, rate, req.params.id]
    );

    if (updateReview.rowCount > 0) res.status(200).send("Updated");
    else res.status(404).send("Not found");
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const deleteProduct = await db.query("DELETE FROM reviews WHERE _id = $1", [
      req.params.id,
    ]);

    if (deleteProduct.rowCount > 0) res.status(200).send("Deleted");
    else res.status(404).send("Not found");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
