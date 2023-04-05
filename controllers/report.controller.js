const asyncHandler = require("express-async-handler")
const Report = require("../models/report.model")

const addReport = asyncHandler(async (req,res) => {
    const { reportedBy, reportedItem, reportType, details, resolved } = req.body
    if (!(reportType && reportedBy)) {
        res.status(400)
        throw new Error("Field required")
    }
    const report = await Report.create({
        reportedBy,
        reportedItem,
        reportType,
        details,
        resolved
    })
    res.status(200).json(report)
})

const getReport = asyncHandler(async (req,res) => {
    const result = await Report.find({ resolved: false })
    res.status(200).json(result)
})

const markAsResolved = asyncHandler(async (req,res) => {
    const { id } = req.body
    if (!id) {
        res.status(400)
        throw new Error("Field required")
    }
    const result = await Report.findByIdAndUpdate(id, { resolved: true })
    if (!result){
        res.status(404).json("Not found")
    } else {
        res.status(200).json(result)
    }
})

module.exports = { addReport, getReport, markAsResolved }