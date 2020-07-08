const { Schema } = require("mongoose")
const mongoose = require("mongoose")

const StudentSchema = new Schema(
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
        },
        date: {
            type: Date,
            required: true,
        },
        numberOfProjects: {
            type: Number,
        },
        professions: {
            type: Array,
            required: true
        }
    }
)

module.exports = mongoose.model("Student", StudentSchema)