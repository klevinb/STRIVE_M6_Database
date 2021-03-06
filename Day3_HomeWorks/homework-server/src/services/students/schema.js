const { Schema } = require("mongoose")
const mongoose = require("mongoose")
const npmValidator = require("validator")

const StudentSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            validate: {
                validator: (value) => {
                    if (!npmValidator.isLength(value, { min: 4 })) {
                        throw new Error("Name should be at least 4chars long!")
                    }
                }
            }
        },
        surname: {
            type: String,
            required: true,
            validate: {
                validator: (value) => {
                    if (!npmValidator.isLength(value, { min: 4 })) {
                        throw new Error("Surname should be at least 4chars long!")
                    }
                }
            }
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            validate: {
                validator: async (value) => {
                    if (!npmValidator.isEmail(value)) {
                        throw new Error("Email is invalid")
                    } else {
                        const checkEmail = await StudentModel.findOne({ email: value })
                        if (checkEmail) {
                            throw new Error("Email already existant!")
                        }
                    }
                },
            },
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

const StudentModel = mongoose.model("Student", StudentSchema)

module.exports = StudentModel