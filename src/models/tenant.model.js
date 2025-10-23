const mongoose = require("mongoose");
const crypto = require("crypto");

const TenantSchema = new mongoose.Schema(
  {
    picture: String,
    firstName: String,
    lastName: String,
    dob: Date,
    idLastFour: String,
    idHash: { type: String, unique: true },
    status: { type: String, enum: ["active", "banned", "visitor"], default: "visitor" },
  },
  { timestamps: true }
);

// Static method to hash full ID
TenantSchema.statics.hashId = function (fullId) {
  return crypto.createHash("sha256").update(fullId).digest("hex");
};

module.exports = mongoose.model("Tenant", TenantSchema);
