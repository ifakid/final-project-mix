var express = require("express")
var uuid = require("uuid")
var cassandra_db = require("../config/cassandra.config")

var router = express.Router()

router.get('/', function(req,res) {
    var query = "SELECT * FROM connections_uuid"
    cassandra_db.execute(query, [], function(err, result) {
        if (err) {
            res.status(404).send({msg:err})
        } else {
            res.send({messages:result.rows})
        }
    })
})

router.get('/find', function(req,res) {
    var query = "SELECT * FROM connections"
    console.log(req.body)
    cassandra_db.execute(query, [], function(err, result) {
        if (err) {
            res.status(404).send({msg:err})
        } else {
            res.send({messages:result.rows})
        }
    })
})

router.get('/all', function(req,res) {
    var query = "SELECT * FROM connections_by_type_uuid WHERE from_user=? AND status=?"
    const { id } = req.query
    if (!id){
        res.status(404).send({ message:"ID required!" })
    }
    cassandra_db.execute(query, [id, "Match"], function(err, result) {
        if (err) {
            res.status(404).send({msg:err})
        } else {
            res.send({ messages:result.rows })
        }
    })
})

/*router.post('/add', function(req,res) {
    const uid = uuid.v4()
    var query1 = "INSERT INTO connections (from_user, to_user, match_id, status, timestamp) VALUES (?,?,?,?,toTimestamp(now()))"
    var query2 = "INSERT INTO connections_by_type (from_user, to_user, match_id, status, timestamp) VALUES (?,?,?,?,toTimestamp(now()))"
    if (!req.body || !req.body.from_user || !req.body.to_user || !req.body.status){
        res.status(404).send({msg:"Required"})
    }
    
    cassandra_db.execute(query1, [req.body.from_user, req.body.to_user, uid, req.body.status], function(err, result) {
        if (err) {
            res.status(404).send({msg:err})
        } else {
            cassandra_db.execute(query2, [req.body.from_user, req.body.to_user, uid, req.body.status], function(err, result) {
                if (err) {
                    res.status(404).send({msg:err})
                } else {
                    res.send({message: "Success!"})
                }
            })
        }
    })
})*/

router.post('/add', function(req,res) {
    const { from_user, to_user, status } = req.body
    if (!(from_user && to_user && status)){
        res.status(404).send({ message: "Required" })
    }

    if (status == "Like"){
        // Fetch status
        var query0 = "SELECT * FROM connections_uuid WHERE from_user = ? AND to_user = ?"
        cassandra_db.execute(query, [], function(err, result) {
            if (err) {
                res.status(404).send({msg:err})
            } else {
                res.send({messages:result.rows})
            }
        })
    }

    const uid = uuid.v4()
    var query1 = "INSERT INTO connections_uuid (from_user, to_user, match_id, status, timestamp) VALUES (?,?,?,?,toTimestamp(now()))"
    var query2 = "INSERT INTO connections_by_type_uuid (from_user, to_user, match_id, status, timestamp) VALUES (?,?,?,?,toTimestamp(now()))"
    const queries = [
        { query: query1, params: [req.body.from_user, req.body.to_user, uid, req.body.status]},
        { query: query2, params: [req.body.from_user, req.body.to_user, uid, req.body.status]}
    ]
    
    cassandra_db.batch(queries, function(err) {
        if (err) {
            res.status(404).send({ error: err})
        } else {
            res.send({message: "Success!"})
        }
    })
})

module.exports = router