const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ReviewsSchema = new Schema(
    {
        comment: {
            type: String,
            required: true
        },
        rate: {
            type: Number,
            min: [1, "The rate should be at least 1"],
            max: [5, "The max rate that you can give is 5"],
            required: true
        },
        elementId: {
            type: Schema.Types.ObjectId, ref: "Product",
            require: true
        },
        createdAt: {
            type: Date,
            required: true
        }
    }
)

const ReviewModel = mongoose.model("Review", ReviewsSchema)
module.exports = ReviewModel