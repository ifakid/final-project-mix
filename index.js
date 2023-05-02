const express = require("express")
require('dotenv').config()

const connectDb = require("./config/mongo.config")
connectDb()

var routes = require("./routes/index.routes")
var messageRoutes = require("./routes/messages.routes")
var connectionRoutes = require("./routes/connections.routes")
var userRoutes = require("./routes/user.routes")
var reportRoutes = require("./routes/report.routes")
var imageRoutes = require("./routes/image.routes")

var app = express()

app.use(express.json())

app.use('/', routes)
app.use('/messages', messageRoutes)
app.use('/connections', connectionRoutes)
app.use('/users', userRoutes)
app.use('/images', imageRoutes)
app.use('/reports',reportRoutes)

app.use(function (req, res, next) {
    var err = new Error("Not found")
    err.status = 404
    next(err)
})

app.listen(3000, () => {
    console.log("Listening...")
})