const mongoose = require("mongoose")

const reportSchema = new mongoose.Schema({
    reportedBy: {
        type: String,
        required: true
    },
    reportedItem: {
        type: String
    },
    reportType: {
        type: String,
        required: true
    },
    details: {
        type: String
    },
    resolved: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model("Report", reportSchema)