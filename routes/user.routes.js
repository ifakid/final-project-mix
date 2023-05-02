const express = require("express")
const router = express.Router()

const { addUser, editUser, getRandom, getUser, updateLocation, getRandomMC } = require("../controllers/user.controller")

router.route("/random").get(getRandom)
router.route("/randomMC").get(getRandomMC)
router.route("/").post(addUser)
router.route("/").patch(editUser)
router.route("/").get(getUser)
router.route("/location").patch(updateLocation)

module.exports = router