const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');

const outputPath = path.join(__dirname, 'outputs');

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const executeCpp = (filepath, inputData = "") => {
  const jobId = path.basename(filepath).split('.')[0];
  const outPath = path.join(outputPath, `${jobId}.exe`);

  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    // Compile using g++
    exec(`g++ "${filepath}" -o "${outPath}"`, (compileErr, stdout, stderr) => {
      if (compileErr || stderr) {
        return reject({
          error: stderr || compileErr.message,
          output: "",
          executionTimeMs: Date.now() - startTime
        });
      }

      // Execute compiled executable with testcase input
      const child = spawn(outPath);
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
        
        // Clean up executable file
        if (fs.existsSync(outPath)) {
          fs.unlink(outPath, () => {});
        }

        if (isTimedOut) {
          return reject({
            error: "Execution Timed Out (Limit: 5 seconds exceeded).",
            output: outputStr,
            executionTimeMs
          });
        }

        if (code !== 0 || errorStr) {
          return reject({
            error: errorStr || `Process exited with code ${code}`,
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
  });
};

module.exports = {
  executeCpp
};
