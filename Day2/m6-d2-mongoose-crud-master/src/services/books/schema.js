const { Schema } = require("mongoose")
const mongoose = require("mongoose")

const BookSchema = new Schema(
  {
    _id: String,
    title: String,
    author: String,
    description: String,
    year: Number,
    genre: Array,
    price: Number,
  },
  { _id: false }
)

module.exports = mongoose.model("Book", BookSchema)
