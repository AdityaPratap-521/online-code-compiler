require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./database');
const Job = require('./models/Job');
const { generateFile } = require('./generateFile');
const { addJobToQueue, memoryJobStore } = require('./jobQueue');

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

connectDB();

app.get('/', (req, res) => {
  return res.json({
    app: "Online Code Compiler",
    languages: ["C++ (g++)", "Python 3"],
    developer: "AdityaPratap-521",
    github_profile: "https://github.com/AdityaPratap-521",
    status: "Online"
  });
});

app.post('/run', async (req, res) => {
  const { language = "cpp", code, input = "" } = req.body;

  if (!code || code.trim() === "") {
    return res.status(400).json({ success: false, error: "Empty code body provided." });
  }

  try {
    const format = language === "cpp" ? "cpp" : "py";
    const filepath = await generateFile(format, code);

    let job;
    try {
      job = await new Job({ language, filepath, code, input, status: "queued" }).save();
    } catch (dbErr) {
      // In-memory fallback if MongoDB is not running locally
      const mockId = Date.now().toString();
      job = {
        _id: mockId,
        language,
        filepath,
        code,
        input,
        submittedAt: new Date(),
        status: "queued"
      };
      memoryJobStore.set(mockId, job);
    }

    const jobId = String(job._id);
    await addJobToQueue(jobId);

    return res.status(201).json({ success: true, jobId, status: "queued" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/status', async (req, res) => {
  const jobId = req.query.id;
  if (!jobId) {
    return res.status(400).json({ success: false, error: "Missing job id parameter" });
  }

  try {
    let job = null;
    try {
      job = await Job.findById(jobId);
    } catch (err) {
      job = memoryJobStore.get(jobId);
    }

    if (!job) {
      job = memoryJobStore.get(jobId);
    }

    if (!job) {
      return res.status(404).json({ success: false, error: "Invalid job id" });
    }

    return res.status(200).json({
      success: true,
      job: {
        id: job._id,
        language: job.language,
        status: job.status,
        output: job.output || "",
        error: job.error || "",
        executionTimeMs: job.executionTimeMs || 0,
        submittedAt: job.submittedAt,
        completedAt: job.completedAt
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/job', async (req, res) => {
  try {
    let jobs = [];
    try {
      jobs = await Job.find().sort({ submittedAt: -1 }).limit(20);
    } catch (dbErr) {
      jobs = Array.from(memoryJobStore.values()).reverse().slice(0, 20);
    }
    return res.status(200).json({ success: true, jobs });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Online Compiler Server] Running on port ${PORT}`);
});
