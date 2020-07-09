const { Schema } = require("mongoose")
const mongoose = require("mongoose")
const v = require("validator")

const BookCartSchema = new Schema({
  _id: String,
  title: String,
  description: String,
  year: Number,
  genre: Array,
  price: Number,
  authors: [{ _id: Schema.Types.ObjectId, name: String, surname: String }],
  quantity: Number,
})

const UserSchema = new Schema(
  {
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
      validate: {
        validator: async (value) => {
          if (!v.isEmail(value)) {
            throw new Error("Email is invalid")
          } else {
            const checkEmail = await UserModel.findOne({ email: value })
            if (checkEmail) {
              throw new Error("Email already existant!")
            }
          }
        },
      },
    },
    age: {
      type: Number,
      min: [18, "You are toooooo young!"],
      max: [65, "You are toooooo old!"],
      validate(value) {
        if (value < 0) {
          throw new Error("Age must be a positive number!")
        }
      },
    },
    professions: Array,
    cart: [BookCartSchema],
  },
  { timestamps: true }
)

UserSchema.static("findBookInCart", async function (id, bookId) {
  const isBookThere = await UserModel.findOne({
    _id: id,
    "cart._id": bookId,
  })
  return isBookThere
})

UserSchema.static("incrementCartQuantity", async function (
  id,
  bookId,
  quantity
) {
  await UserModel.findOneAndUpdate(
    {
      _id: id,
      "cart._id": bookId,
    },
    { $inc: { "cart.$.quantity": quantity } }
  )
})

UserSchema.static("addBookToCart", async function (id, book) {
  await UserModel.findOneAndUpdate(
    { _id: id },
    {
      $addToSet: { cart: book },
    }
  )
})

UserSchema.static("removeBookFromCart", async function (id, bookId) {
  await UserModel.findByIdAndUpdate(id, {
    $pull: { cart: { _id: bookId } },
  })
})

UserSchema.static("calculateCartTotal", async function (id) {
  const { cart } = await UserModel.findById(id)
  return cart
    .map((book) => book.price * book.quantity)
    .reduce((acc, el) => acc + el, 0)
})

UserSchema.post("validate", function (error, doc, next) {
  if (error) {
    error.httpStatusCode = 400
    next(error)
  } else {
    next()
  }
})

UserSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoError" && error.code === 11000) {
    error.httpStatusCode = 400
    next(error)
  } else {
    next()
  }
})

const UserModel = mongoose.model("User", UserSchema)

module.exports = UserModel
