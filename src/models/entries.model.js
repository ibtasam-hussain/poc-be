const mongoose = require("mongoose");

const EntrySchema = new mongoose.Schema({
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
    unitVisited: String,
    remarks: String,
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Entry", EntrySchema);
