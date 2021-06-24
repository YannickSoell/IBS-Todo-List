const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  text: {
    type: String,
    required: true
  },
  datum: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  complete: {
    type: Boolean,
    default: false,
    required: true
  }
}, { timestamps: { createdAt: 'created_at' } });

mongoose.model(`Todo`, todoSchema);
