const mongoose = require("mongoose");
const crypto = require("crypto");

const TenantSchema = new mongoose.Schema(
  {
    picture: String, // image from scanned ID
    firstName: String,
    lastName: String,
    dob: Date,
    idLastFour: String,

    // SHA256 hash of full ID for duplicate detection
    idHash: { type: String, unique: true, required: true },

    // "visitor" = default, "active"/"banned" can be set later
    status: {
      type: String,
      enum: ["active", "banned", "visitor"],
      default: "visitor",
    },

    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

// 🔐 Hashing function to anonymize full ID
TenantSchema.statics.hashId = function (fullId) {
  return crypto.createHash("sha256").update(fullId).digest("hex");
};

module.exports = mongoose.model("Tenant", TenantSchema);
