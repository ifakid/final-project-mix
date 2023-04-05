const express = require("express")
const router = express.Router()

const { addUser, editUser, getRandom, getUser, updateLocation,  } = require("../controllers/user.controller")
const { getImages, deleteImage, addImage } = require("../controllers/image.controller")

router.route("/").get(getRandom)
router.route("/adduser").post(addUser)
router.route("/editUser").patch(editUser)
router.route("/find").get(getUser)
router.route("/updateLocation").patch(updateLocation)

router.route("/images").get(getImages)
router.route("/deleteImage").delete(deleteImage)
router.route("/addImage").post(addImage)

module.exports = router