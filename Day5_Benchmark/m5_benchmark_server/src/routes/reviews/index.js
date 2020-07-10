const express = require("express")
const path = require("path")
const uniqid = require("uniqid")
const fs = require("fs")
const { writeFile } = require("fs-extra")
const { check, validationResult } = require("express-validator")
const ReviewModel = require("./schema")
const ProductModel = require("../products/schema")

const router = express.Router()

router.get("/", async (req, res) => {
  const reviews = await ReviewModel.find({})
  res.status(200).send(reviews)
})

router.get("/:id", async (req, res, next) => {
  try {
    const review = await ReviewModel.findById(req.params.id)
    if (review) {
      res.status(200).send(review)
    } else {
      const err = new Error()
      err.httpStatusCode = 404
      err.message = "No product with that ID"
      next(err)
    }
  } catch (error) {
    next(error)
  }
})


router.post(
  "/",
  [
    check("comment")
      .isLength({ min: 4 })
      .withMessage("Write more text please!")
      .exists()
      .withMessage("Write your comment please!"),

    check("rate")
      .isInt({ max: 5 })
      .withMessage("Rate cannot be more than 5 please!")
      .exists()
      .withMessage("Give your rating please!"),

    check("elementId")
      .exists()
      .withMessage("Insert product ID please!"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        let err = new Error()
        err.message = errors
        err.httpStatusCode = 444
        next(err)
      }
      else {

        const newReview = {
          ...req.body,
          createdAt: new Date(),
        }

        const addNewReview = new ReviewModel(newReview)
        const { _id } = await addNewReview.save()
        const reviewAt = await ProductModel.addReviewToProduct(req.body.elementId, _id)
        res.status(201).send("Created")

      }
    } catch (error) {
      next(error)
    }
  }
)


router.put("/:id", async (req, res, next) => {
  try {
    const findReview = await ReviewModel.findById(req.params.id)
    if (findReview) {
      const updateReview = await ReviewModel.findByIdAndUpdate(req.params.id, {
        ...req.body
      })
      res.status(200).send("Edited")
    } else {
      const err = new Error()
      err.httpStatusCode = 404
      err.message = "No product with that ID"
      next(err)
    }
  } catch (error) {
    next(error)
  }
})

router.delete("/:id", async (req, res, next) => {
  try {
    const findReview = await ReviewModel.findById(req.params.id)
    if (findReview) {
      const deletedReview = await ReviewModel.findByIdAndDelete(req.params.id)
      res.status(200).send("Deleted")
    } else {
      const err = new Error()
      err.httpStatusCode = 404
      err.message = "No product with that ID"
      next(err)
    }
  } catch (error) {
    next(error)
  }
})
module.exports = router