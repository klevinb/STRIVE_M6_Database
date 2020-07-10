const mongoose = require("mongoose")
const Schema = mongoose.Schema


const ProductSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        brand: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            validate(value) {
                if (value < 0) {
                    throw new Error("Price should be a least 0$")
                }
            }
        },
        imageUrl: {
            type: String
        },
        reviews: [{
            type: Schema.Types.ObjectId, ref: "Review"
        }]
        ,
        category: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            required: true
        },
        updatedAt: {
            type: Date,
            required: true
        }
    }
)

ProductSchema.static("addReviewToProduct", async function (id, reviewId) {
    await ProductModel.findByIdAndUpdate(id,
        {
            $addToSet: { reviews: reviewId }
        }
    )
})

const ProductModel = mongoose.model("Product", ProductSchema)

module.exports = ProductModel






