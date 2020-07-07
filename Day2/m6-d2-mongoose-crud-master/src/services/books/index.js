const express = require("express")

const BookSchema = require("./schema")

const booksRouter = express.Router()

booksRouter.get("/", async (req, res, next) => {
  try {
    const books = await BookSchema.find(req.query)
    res.send(books)
  } catch (error) {
    next(error)
  }
})

booksRouter.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id
    const book = await BookSchema.findById(id)
    if (book) {
      res.send(book)
    } else {
      const error = new Error()
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    console.log(error)
    next("While reading books list a problem occurred!")
  }
})

booksRouter.post("/", async (req, res, next) => {
  try {
    const newbook = new BookSchema(req.body)
    const { _id } = await newbook.save()

    res.status(201).send(_id)
  } catch (error) {
    next(error)
  }
})

booksRouter.put("/:id", async (req, res, next) => {
  try {
    const book = await BookSchema.findByIdAndUpdate(req.params.id, req.body)
    console.log(book)
    if (book) {
      res.send("Ok")
    } else {
      const error = new Error(`book with id ${req.params.id} not found`)
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    next(error)
  }
})

booksRouter.delete("/:id", async (req, res, next) => {
  try {
    const book = await BookSchema.findByIdAndDelete(req.params.id)
    if (book) {
      res.send("Deleted")
    } else {
      const error = new Error(`book with id ${req.params.id} not found`)
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    next(error)
  }
})

module.exports = booksRouter
