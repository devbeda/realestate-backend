// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Hash password before saving
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare passwords
adminSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
