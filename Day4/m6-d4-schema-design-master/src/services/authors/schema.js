const { Schema } = require("mongoose")
const mongoose = require("mongoose")

const AuthorSchema = new Schema({
  name: String,
  surname: String,
})

module.exports = mongoose.model("Author", AuthorSchema)
