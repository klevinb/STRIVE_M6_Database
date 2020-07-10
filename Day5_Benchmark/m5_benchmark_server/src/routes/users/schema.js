const mongoose = require("mongoose")
const Schema = mongoose.Schema


const ProductSchema = new Schema(
    {
        name: String,
        brand: String,
        description: String,
        price: Number,
        imageUrl: {
            type: String
        },
        quantity: Number
    }
)

const UserSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        products: [ProductSchema]
    }
)

UserSchema.static("findProductInCart", async function (id, productId) {
    const findProduct = await UserModel.findOne({
        _id: id,
        "products._id": productId,
    })
    return findProduct
})


UserSchema.static("incrementCartQuantity", async function (
    id,
    productId,
    quantity
) {
    await UserModel.findOneAndUpdate(
        {
            _id: id,
            "products._id": productId,
        },
        { $inc: { "products.$.quantity": quantity } }
    )
})

UserSchema.static("addProductToCart", async function (id, product) {
    await UserModel.findOneAndUpdate(
        { _id: id },
        {
            $addToSet: { products: product },
        }
    )
})

UserSchema.static("calculateCartTotal", async function (id) {
    const { products } = await UserModel.findById(id)
    return products
        .map((product) => product.price * product.quantity)
        .reduce((acc, el) => acc + el, 0)
})

const UserModel = mongoose.model("User", UserSchema)
module.exports = UserModel
