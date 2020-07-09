const { Schema } = require("mongoose")
const mongoose = require("mongoose")

const BookSchema = new Schema(
  {
    _id: {
      type: String,
      validate: {
        validator: async (value) => {
          const asinExists = await BooksModel.findOne({ _id: value })
          if (asinExists) {
            throw new Error("ASIN already in database")
          }
        },
      },
    },
    title: String,
    description: String,
    year: Number,
    genre: Array,
    price: { type: Number, required: true },
    authors: [{ type: Schema.Types.ObjectId, ref: "Author" }],
  },
  { _id: false }
)

BookSchema.static("findBookWithAuthors", async function (id) {
  const book = await BooksModel.findOne({ _id: id }).populate("authors")
  return book
})

BookSchema.post("validate", function (error, doc, next) {
  if (error) {
    error.httpStatusCode = 400
    next(error)
  } else {
    next()
  }
})

BookSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoError" && error.code === 11000) {
    next(new Error("There was a duplicate key error"))
  } else {
    next()
  }
})

const BooksModel = mongoose.model("Book", BookSchema)
module.exports = { BooksModel, BookSchema }
