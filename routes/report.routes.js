const express = require("express")
const router = express.Router()

const { addReport, getReport, markAsResolved } = require("../controllers/report.controller")

router.route("/").get(getReport)
router.route("/addReport").post(addReport)
router.route("/markAsResolved").patch(markAsResolved)

module.exports = router