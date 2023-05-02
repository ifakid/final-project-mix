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
    var query = "SELECT * FROM messages WHERE match_id=?"

    cassandra_db.execute(query, [req.params.matchid], function(err, result) {
        if (err) {
            res.status(404).send({msg:err})
        } else {
            res.send({messages:result.rows})
        }
    })
})

router.post('/send', function(req,res){
    var query = "INSERT INTO messages (match_id, message_id, attachment_url, message_type, sender_id, body) VALUES (?,now(),?,?,?,?)"
    const { match_id, attachment_url, message_type, sender_id, body } = req.body
    if (!(match_id && message_type && sender_id)) {
        res.status(404).send({msg:"Required"})
    }

    cassandra_db.execute(query, [match_id, attachment_url, message_type, sender_id, body], function(err, result) {
        if (err) {
            res.status(404).send({msg:err})
        } else {
            res.send({messages:result.rows})
        }
    })
})

module.exports = router