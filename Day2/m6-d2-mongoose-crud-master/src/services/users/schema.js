const { Schema } = require("mongoose")
const mongoose = require("mongoose")

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  age: {
    type: Number,
    min: [18, "You are toooooo young!"],
    max: 65,
    default: 18,
  },
  professions: Array,
})

module.exports = mongoose.model("User", UserSchema)
