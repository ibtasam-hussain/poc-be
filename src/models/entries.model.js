const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema({
    tenantModel: { type: mongoose.Schema.Types.ObjectId, ref: "License", required: true },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Entry", entrySchema);