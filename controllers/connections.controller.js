const asyncHandler = require("express-async-handler")
const uuid = require("uuid")

var cassandra_db = require("../config/cassandra.config")

const getAll = asyncHandler(async (req,res) => {
    var query = "SELECT * FROM connections"
    try {
        var result = await cassandra_db.execute(query, [])
        res.send({ messages:result.rows })
    } catch (err){
        res.status(400).send({msg:err})
    }
    
})

const getAllMatch = asyncHandler(async (req,res) => {
    const { id } = req.query
    if (!id){
        res.status(404).send({ message:"ID required!" })
    }

    var query = "SELECT * FROM connections_by_type WHERE from_user=? AND status=?"
    try {
        var result = await cassandra_db.execute(query, [id, "Match"])
        res.send({ matches:result.rows })
    } catch (err) {
        res.status(404).send({ msg:err })
    }
})

const addConnection = asyncHandler(async (req,res) => {
    const { from_user, to_user, status } = req.body
    if (!(from_user && to_user && status)){
        res.status(404).send({ message: "Required" })
    }

    const uid = uuid.v4()
    var query1 = "INSERT INTO connections (from_user, to_user, match_id, status, timestamp) VALUES (?,?,?,?,toTimestamp(now()))"
    var query2 = "INSERT INTO connections_by_type (from_user, to_user, match_id, status, timestamp) VALUES (?,?,?,?,toTimestamp(now()))"
    var query3 = "INSERT INTO connections_by_to (from_user, to_user, match_id, status, timestamp) VALUES (?,?,?,?,toTimestamp(now()))"
    const queries = [
        { query: query2, params: [from_user, to_user, uid, status]},
        { query: query3, params: [from_user, to_user, uid, status]},
        { query: query1, params: [from_user, to_user, uid, status]},
    ]

    if (status == "Like"){
        // Fetch status
        var query0 = "SELECT * FROM connections_by_to WHERE from_user = ? AND to_user = ?"

        try {
            var result0 = await cassandra_db.execute(query0, [to_user,from_user])

            if (result0.rows.length != 0 && result0.rows[0].status == "Like"){
                queries.push({ query: query1, params: [from_user, to_user, uid, "Match"]})
                queries.push({ query: query1, params: [to_user, from_user, uid, "Match"]})

                queries.push({ query: query2, params: [from_user, to_user, uid, "Match"]})
                queries.push({ query: query2, params: [to_user, from_user, uid, "Match"]})

                queries.push({ query: query3, params: [from_user, to_user, uid, "Match"]})
                queries.push({ query: query3, params: [to_user, from_user, uid, "Match"]})
            }
        } catch (err) {
            res.status(400).send({ error: err })
            throw new Error(err)
        }
    }

    try {
        var result1 = await cassandra_db.batch(queries)
        res.send({message: "Success!"})
     } catch (err) {
        res.status(400).send({ error: err })
        throw new Error(err)
     }
})

module.exports = { getAllMatch, addConnection, getAll }