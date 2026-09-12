const { spawn } = require('child_process');

const executePy = (filepath, inputData = "") => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const child = spawn('python', [filepath]);

    let outputStr = "";
    let errorStr = "";
    let isTimedOut = false;

    const timer = setTimeout(() => {
      isTimedOut = true;
      child.kill();
    }, 5000); // 5 sec timeout

    if (inputData) {
      child.stdin.write(inputData);
      child.stdin.end();
    }

    child.stdout.on('data', (data) => {
      outputStr += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorStr += data.toString();
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      const executionTimeMs = Date.now() - startTime;

      if (isTimedOut) {
        return reject({
          error: "Execution Timed Out (Limit: 5 seconds exceeded).",
          output: outputStr,
          executionTimeMs
        });
      }

      if (code !== 0 || errorStr) {
        return reject({
          error: errorStr || `Python process exited with code ${code}`,
          output: outputStr,
          executionTimeMs
        });
      }

      resolve({
        output: outputStr,
        executionTimeMs
      });
    });
  });
};

module.exports = {
  executePy
};
