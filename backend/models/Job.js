const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  language: {
    type: String,
    required: true,
    enum: ["cpp", "python"]
  },
  filepath: {
    type: String
  },
  code: {
    type: String,
    required: true
  },
  input: {
    type: String,
    default: ""
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  output: {
    type: String
  },
  error: {
    type: String
  },
  executionTimeMs: {
    type: Number
  },
  status: {
    type: String,
    default: "queued",
    enum: ["pending", "queued", "running", "success", "error"]
  }
});

module.exports = mongoose.model('Job', JobSchema);
