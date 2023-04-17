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

const getRandom = asyncHandler(async (req,res) => {
    const { id, gender } = req.body
    if (!(id && gender)){
        res.status(400)
        throw new Error("Empty field")
    }
    let pipeline = [
        { $match: { gender } },
        { $sample: { size: 20 } }
    ]
    const result1 = await User.aggregate(pipeline)

    var result2 = []
    var promises = []
    
    var query = "SELECT * FROM connections WHERE from_user=? AND to_user=?"
    result1.forEach((result, i) => {
        console.log(id, result._id)
        promises[i] = cassandra_db.execute(query, [id, result._id], { prepared: true })
            .then((result) => {
                console.log(" result: ",result)
                result2.push(result)
            })
            .catch(err => console.log("Error: ",err))
    })
    Promise.allSettled(promises).finally(() => {
        res.status(200).json(result1)
    })
})

const getUser = asyncHandler(async (req,res) => {
    const { id } = req.params
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

module.exports = { addUser, editUser, getRandom, getUser, updateLocation }