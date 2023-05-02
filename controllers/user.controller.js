const asyncHandler = require("express-async-handler")

var cassandra_db = require("../config/cassandra.config")
const User = require("../models/user.model")

const addUser = asyncHandler(async (req,res) => {
    const { about, birthdate, discovery, email, fakultas, gender, jurusan, number, username, longitude, latitude, images } = req.body
    if (!(birthdate && email && fakultas && gender && jurusan && number && username)){
        res.status(400)
        throw new Error("Empty field")
    }

    const coord = [longitude, latitude]
    const user = await User.create({
        about,
        birthdate,
        discovery,
        email,
        fakultas,
        gender,
        jurusan,
        number,
        location: {
            type: "Point",
            coordinates: coord
        },
        username, 
        images
    })
    res.status(200).json(user)
})

const editUser = asyncHandler(async (req,res) => {
    const {id, about} = req.body
    if (!(id && about)){
        res.status(400)
        throw new Error("Empty field")
    }
    const result = await User.findByIdAndUpdate(id, {
        about
    })
    if (!result){
        res.status(404).json("Not found")
    } else {
        res.status(200).json(result)
    }
})

const getRandomMC = asyncHandler(async (req,res) => {
    const { id, gender } = req.query
    const longitude = parseFloat(req.query.longitude)
    const latitude = parseFloat(req.query.latitude)
    const distance = parseFloat(req.query.distance)
    const minAge = parseInt(req.query.minAge)
    const maxAge = parseInt(req.query.maxAge)

    const now = new Date(Date.now())

    if (!(id && gender && longitude && latitude)){
        res.status(400)
        throw new Error("Empty field")
    }

    let agg1 = { $geoNear: {
        near: { 
            type: "Point", 
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        distanceField: "distance",
    }}
    let agg2 = { $match: { 
        gender: gender,
        discovery: true
    }}
    let agg3 = { $sample: { size: 50 } }

    if (distance) {
        agg1["$geoNear"]["maxDistance"] = distance
    }
    if (minAge){
        if (!agg2["$match"]["birthdate"]) {
            agg2["$match"]["birthdate"] = {}
        }
        const min_y = now.getFullYear() - minAge

        agg2["$match"]["birthdate"]["$lt"] = new Date(min_y, now.getMonth(), now.getDate())

    }
    if (maxAge){
        if (!agg2["$match"]["birthdate"]) {
            agg2["$match"]["birthdate"] = {}
        }
        const max_y = now.getFullYear() - maxAge
        agg2["$match"]["birthdate"]["$gte"] = new Date(max_y, now.getMonth(), now.getDate())
    }

    let pipeline = [agg1, agg2, agg3]
    const result1 = await User.aggregate(pipeline)

    // ---

    var result2 = []
    var promises = []
    
    var query = "SELECT * FROM connections_by_to WHERE from_user=? AND to_user=?"
    result1.forEach((result, i) => {
        promises[i] = cassandra_db.execute(query, [id, result._id], { prepared: true })
            .then((res) => {
                if (res.rowLength == 0) { 
                    result2.push(result)
                }
            })
            .catch(err => console.log("Error: ",err))
    })
    Promise.allSettled(promises).finally(() => {
        res.status(200).json({users: result2})
    })
})

const getRandom = asyncHandler(async (req,res) => {
    const { id, gender } = req.query
    const longitude = parseFloat(req.query.longitude)
    const latitude = parseFloat(req.query.latitude)
    const distance = parseFloat(req.query.distance)
    const minAge = parseInt(req.query.minAge)
    const maxAge = parseInt(req.query.maxAge)

    const now = new Date(Date.now())

    if (!(id && gender && longitude && latitude)){
        res.status(400)
        throw new Error("Empty field")
    }

    var result1;
    try {
        var query = "SELECT * FROM connections WHERE from_user = ?"
        result1 = await cassandra_db.execute(query, [id])
    } catch (err) {
        if (err) {
            res.status(400).send({ msg:err })
        }
    }

    if (result1) {
        result1 = result1.rows.map(e => e["to_user"].toString())
    } else {
        result1 = []
    }
    result1.push(id)

    // ---

    let agg1 = { $geoNear: {
        near: { 
            type: "Point", 
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        distanceField: "distance",
    }}
    let agg2 = { $match: { 
        gender: gender, 
        discovery: true,
        _id: { $nin: result1 }, 
    }}
    let agg3 = { $sample: { size: 20 } }

    if (distance) {
        agg1["$geoNear"]["maxDistance"] = distance
    }
    if (minAge){
        if (!agg2["$match"]["birthdate"]) {
            agg2["$match"]["birthdate"] = {}
        }
        const min_y = now.getFullYear() - minAge

        agg2["$match"]["birthdate"]["$lt"] = new Date(min_y, now.getMonth(), now.getDate())

    }
    if (maxAge){
        if (!agg2["$match"]["birthdate"]) {
            agg2["$match"]["birthdate"] = {}
        }
        const max_y = now.getFullYear() - maxAge
        agg2["$match"]["birthdate"]["$gte"] = new Date(max_y, now.getMonth(), now.getDate())
    }

    let pipeline = [agg1, agg2, agg3]
   
    const result2 = await User.aggregate(pipeline)
    res.status(200).json({"users": result2})
    
})

const getUser = asyncHandler(async (req,res) => {
    const { id } = req.query
    if (!id) {
        res.status(400)
        throw new Error("Empty field")
    }
    const result = await User.findById(id)
    if (!result){
        res.status(404).json("Not found")
    } else {
        res.status(200).json(result)
    }
})

const updateLocation = asyncHandler(async (req,res) => {
    const { id, latitude, longitude } = req.body
    if (!(id && latitude && longitude)) {
        res.status(400)
        throw new Error("Empty field")
    }
    const result = await User.findByIdAndUpdate(id, {
        $set: {
            location: {
                type: "Point",
                coordinates: [longitude, latitude]
            }
        }
    })
    if (!result){
        res.status(404).json("Not found")
    } else {
        res.status(200).json(result)
    }
})

module.exports = { addUser, editUser, getRandom, getUser, updateLocation, getRandomMC }