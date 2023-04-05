const asyncHandler = require("express-async-handler")

const User = require("../models/user.model")

const getImages = asyncHandler(async (req,res) => {
    const { id } = req.body
    if (!id) {
        res.status(400)
        throw new Error("Empty field")
    }
    const result = await User.findById(id)
    if (!result){
        res.status(404).json("Not found")
    } else {
        res.status(200).json(result.images)
    }
})

const deleteImage = asyncHandler(async (req,res) => {
    const { userId, imageId } = req.body
    if (!(userId && imageId)){
        res.status(400)
        throw new Error("Empty field")
    }
    const result1 = await User.findById(userId)
    if (result1.images.length == 1) {
        res.status(401).json("No images left")
    } else {
        const result2 = await User.findByIdAndUpdate(userId, {
            $pull: { images: {_id:imageId } }
        })
        res.status(200).json(result2)
    }
})

const addImage = asyncHandler(async (req,res) => {
    const { userId, imageUrl } = req.body
    if (!(userId && imageUrl)){
        res.status(400)
        throw new Error("Empty field")
    }
    const result1 = await User.findById(userId)
    if (result1.images.length == 9) {
        res.status(401).json("Too many images!")
    } else {
        const result2 = await User.findByIdAndUpdate(userId, {
            $push: { images: { url: imageUrl }}
        })
        res.status(200).json(result2)
    }
})

module.exports = {getImages, deleteImage, addImage}