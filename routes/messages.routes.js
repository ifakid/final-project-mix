var express = require("express")
var cassandra_db = require("../config/cassandra.config")

var router = express.Router()

router.get('/', function(req,res) {
    var query = "SELECT * FROM messages_uuid"
    cassandra_db.execute(query, [], function(err, result) {
        if (err) {
            res.status(404).send({msg:err})
        } else {
            res.send({messages:result.rows})
        }
    })
})

router.get('/all/:matchid', function(req,res) {
    var query = "SELECT * FROM messages_uuid WHERE match_id=?"
    console.log(req.params.matchid)
    cassandra_db.execute(query, [req.params.matchid], function(err, result) {
        if (err) {
            res.status(404).send({msg:err})
        } else {
            res.send({messages:result.rows})
        }
    })
})

router.post('/send', function(req,res){
    var query = "INSERT INTO messages_uuid (match_id, message_id, attachment_url, message_type, sender_id, text) VALUES (?,now(),?,?,?,?)"
    if (!req.body){
        res.status(404).send({msg:"Required"})
    }

    const body = req.body
    cassandra_db.execute(query, [body.match_id, body.attachment_url, body.message_type, body.sender_id, body.text], function(err, result) {
        if (err) {
            res.status(404).send({msg:err})
        } else {
            res.send({messages:result.rows})
        }
    })
})

module.exports = router