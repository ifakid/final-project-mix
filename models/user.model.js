const mongoose = require("mongoose")
const uuid = require("uuid")

const imageSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuid.v4
    },
    about: {
        type: String
    },
    birthdate: {
        type: Date,
        required: true
    },
    discovery: {
        type: Boolean,
        default: true
    },
    email: {
        type: String,
        required: true
    },
    fakultas: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    jurusan: {
        type: String,
        required: true
    },
    number: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number]
        }
    },
    images: [imageSchema]
})

module.exports = mongoose.model("User", userSchema)