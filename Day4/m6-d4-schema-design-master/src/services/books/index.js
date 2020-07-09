const express = require("express")

const { BooksModel } = require("./schema")

const booksRouter = express.Router()

booksRouter.get("/", async (req, res, next) => {
  try {
    const books = await BooksModel.find(req.query).populate("authors")
    res.send(books)
  } catch (error) {
    next(error)
  }
})

booksRouter.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id
    const book = await BooksModel.findBookWithAuthors(id)
    res.send(book)
  } catch (error) {
    next(error)
  }
})

booksRouter.post("/", async (req, res, next) => {
  try {
    const newbook = new BooksModel(req.body)
    const { _id } = await newbook.save()

    res.status(201).send(_id)
  } catch (error) {
    next(error)
  }
})

booksRouter.put("/:id", async (req, res, next) => {
  try {
    const book = await BooksModel.findByIdAndUpdate(req.params.id, req.body)
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
    const book = await BooksModel.findByIdAndDelete(req.params.id)
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
