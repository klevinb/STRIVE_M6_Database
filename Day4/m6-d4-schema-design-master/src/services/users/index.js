const express = require("express")
const q2m = require("query-to-mongo")
const { Types } = require("mongoose")

const UserModel = require("./schema")
const { BooksModel } = require("../books/schema")

const usersRouter = express.Router()

usersRouter.get("/", async (req, res, next) => {
  try {
    const query = q2m(req.query)
    const users = await UserModel.find(query.criteria, query.options.fields)
      .skip(query.options.skip)
      .limit(query.options.limit)
      .sort(query.options.sort)

    res.send({
      data: users,
      total: users.length,
    })
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id
    const user = await UserModel.findById(id)
    res.send(user)
  } catch (error) {
    console.log(error)
    next("While reading users list a problem occurred!")
  }
})

usersRouter.post("/", async (req, res, next) => {
  try {
    const newUser = new UserModel(req.body)
    const { _id } = await newUser.save()

    res.status(201).send(_id)
  } catch (error) {
    next(error)
  }
})

usersRouter.put("/:id", async (req, res, next) => {
  try {
    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
      },
      { runValidators: true }
    )
    if (user) {
      res.send("Ok")
    } else {
      const error = new Error(`User with id ${req.params.id} not found`)
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.delete("/:id", async (req, res, next) => {
  try {
    await UserModel.findByIdAndDelete(req.params.id)

    res.send("Deleted")
  } catch (error) {
    next(error)
  }
})

usersRouter.post("/:id/add-to-cart/:bookId", async (req, res, next) => {
  try {
    //1. Find the book by ID
    const book = await BooksModel.findBookWithAuthors(req.params.bookId)
    if (book) {
      const newBook = { ...book.toObject(), quantity: 1 }
      //2. Check in user's cart if the book is already there

      const isBookThere = await UserModel.findBookInCart(
        req.params.id,
        req.params.bookId
      )
      if (isBookThere) {
        // the book is already in the cart
        //3. Increment the quantity
        await UserModel.incrementCartQuantity(
          req.params.id,
          req.params.bookId,
          1
        )
        res.send("Quantity incremented")
      } else {
        // the book is not in the cart
        await UserModel.addBookToCart(req.params.id, newBook)
        res.send("New book added!")
      }
    } else {
      const error = new Error()
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.delete("/:id/remove-from-cart/:bookId", async (req, res, next) => {
  try {
    await UserModel.removeBookFromCart(req.params.id, req.params.bookId)
    res.send("Ok")
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/:id/calculate-cart-total", async (req, res, next) => {
  try {
    const total = await UserModel.calculateCartTotal(req.params.id)
    res.send({ total })
  } catch (error) {
    next(error)
  }
})

module.exports = usersRouter
