const Bull = require('bull');
const Job = require('./models/Job');
const { executeCpp } = require('./executeCpp');
const { executePy } = require('./executePy');

// Hybrid Job Store for local/standalone execution fallback
const memoryJobStore = new Map();

let jobQueue = null;

try {
  jobQueue = new Bull('job-runner-queue', {
    redis: {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT || 6379,
      connectTimeout: 1000,
      maxRetriesPerRequest: 1
    }
  });

  jobQueue.on('failed', (error) => {
    console.warn(`[Bull Queue] Redis connection notice: ${error.message}. Running async worker fallback.`);
  });
} catch (e) {
  console.warn("[Bull Queue] Queue fallback mode initialized.");
}

const addJobToQueue = async (jobId) => {
  if (jobQueue && jobQueue.client && jobQueue.client.status === 'ready') {
    await jobQueue.add({ id: jobId });
  } else {
    // Process asynchronously in background queue fallback
    setImmediate(() => processJobById(jobId));
  }
};

const processJobById = async (jobId) => {
  let jobRecord = null;
  try {
    jobRecord = await Job.findById(jobId);
  } catch (err) {
    jobRecord = memoryJobStore.get(jobId);
  }

  if (!jobRecord) {
    jobRecord = memoryJobStore.get(jobId);
  }

  if (!jobRecord) {
    throw new Error(`Job ${jobId} not found in database.`);
  }

  jobRecord.startedAt = new Date();
  jobRecord.status = 'running';
  if (jobRecord.save) await jobRecord.save().catch(() => {});

  try {
    let result;
    if (jobRecord.language === 'cpp') {
      result = await executeCpp(jobRecord.filepath, jobRecord.input);
    } else if (jobRecord.language === 'python') {
      result = await executePy(jobRecord.filepath, jobRecord.input);
    } else {
      throw new Error(`Unsupported language: ${jobRecord.language}`);
    }

    jobRecord.completedAt = new Date();
    jobRecord.status = 'success';
    jobRecord.output = result.output;
    jobRecord.executionTimeMs = result.executionTimeMs;
  } catch (errorObj) {
    jobRecord.completedAt = new Date();
    jobRecord.status = 'error';
    jobRecord.error = errorObj.error || String(errorObj);
    jobRecord.output = errorObj.output || "";
    jobRecord.executionTimeMs = errorObj.executionTimeMs || 0;
  }

  if (jobRecord.save) {
    await jobRecord.save().catch(() => {});
  }
  memoryJobStore.set(String(jobRecord._id || jobId), jobRecord);
};

if (jobQueue) {
  jobQueue.process(async (job) => {
    await processJobById(job.data.id);
  });
}

module.exports = {
  addJobToQueue,
  memoryJobStore
};
