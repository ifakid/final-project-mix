const express = require("express")
const router = express.Router()

const { getImages, deleteImage, addImage } = require("../controllers/image.controller")

router.route("/").get(getImages)
router.route("/").delete(deleteImage)
router.route("/").post(addImage)

module.exports = router