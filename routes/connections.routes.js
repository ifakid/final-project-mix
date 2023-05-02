var express = require("express")

var router = express.Router()

const { getAllMatch, addConnection, getAll } = require("../controllers/connections.controller")

router.route('/').get(getAll)
router.route('/all').get(getAllMatch)
router.route('/add').post(addConnection)
// router.route('/specific').get(getSpecificConnection)

module.exports = router