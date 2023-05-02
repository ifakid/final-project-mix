const asyncHandler = require("express-async-handler")

var cassandra_db = require("../config/cassandra.config")

const getAll = asyncHandler(async (req,res) => {
    var query = "SELECT * FROM messages"
    try {
        var result = await cassandra_db.execute(query, [])
        res.send({messages:result.rows})
    } catch (err) {
        res.status(404).send({ msg:err })
    }
})

const getAllFromMatch = asyncHandler(async (req,res) => {
    var query = "SELECT * FROM messages WHERE match_id=?"

    try {
        var result = await cassandra_db.execute(query, [req.params.matchid])
        res.send({ messages:result.rows })
    } catch (err) {
        res.status(404).send({ msg:err })
    }
})

const sendMessage = asyncHandler(async (req,res) => {
    if (!req.body){
        res.status(404).send({ msg:"Required" })
    }

    var query = "INSERT INTO messages (match_id, message_id, attachment_url, message_type, sender_id, text) VALUES (?,now(),?,?,?,?)"
    const body = req.body
    try {
        var result = await cassandra_db.execute(query, [body.match_id, body.attachment_url, body.message_type, body.sender_id, body.text])
        res.send({ messages:result.rows })
    } catch (err) {
        res.status(404).send({ msg:err })
    }
})

module.exports = { getAll, getAllFromMatch, sendMessage }