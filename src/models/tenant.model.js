const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const licenseSchema = new Schema(
  {
    lastName: { type: String, required: true },
    firstName: { type: String, required: true },
    middleName: { type: String },
    issueDate: { type: String }, // or Date if you plan to convert
    dateOfBirth: { type: String },
    expiryDate: { type: String },
    genderCode: { type: String },
    height: { type: String },
    eyeColor: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String },
    uniqueId: { type: String, unique: true, index: true },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model("License", licenseSchema);
