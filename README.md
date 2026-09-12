# Online Code Compiler (C++ & Python)

An asynchronous, queue-backed **Online Code Compiler** supporting **C++** and **Python 3** code execution with custom test case inputs, job status tracking in MongoDB, load-balanced Bull queue workers, automatic starter templates, and live frontend polling.

Developer: [AdityaPratap-521](https://github.com/AdityaPratap-521)

---

## ✨ Features Worked On

1. **Automatic Starter Templates (`defaultStubs.js`)**:
   - Automatic language selection for **C++** and **Python 3** pre-loading starter code stubs.
   - Integrated custom test case input field (stdin) streamed directly to execution processes.

2. **MongoDB Data Storage & Job Status Tracking**:
   - Integrated MongoDB for job telemetry storage (Job ID, Language, Code, Input, Status, Output, Stderr, Execution Time).
   - Live frontend polling (`useEffect` & `useState`) polling `/status?id=jobId` every 800ms until completion.

3. **Queue-Backed Execution & Load Balancing**:
   - Utilized **Bull Queue** for job queuing and load balancing.
   - Safe asynchronous `child_process` compilation & execution (`g++` & `python`) with 5-second infinite loop timeout safeguards.

---

## 🧠 Tech Stack

- **Backend**: Node.js, Express, Bull (Redis queue), MongoDB (Mongoose), `fs`, `child_process`
- **Frontend**: ReactJS (`useState`, `useEffect`), Axios, Lucide React, CSS3 Dark IDE Theme
- **Compilers**: MinGW `g++` (C++), `Python 3`

---

## 🚀 Steps to Run the Online Compiler

### 1. Go to the backend folder from the terminal
```bash
cd backend
npm install
node index.js
```
The Node.js server will start on `http://localhost:5000`.

### 2. Go to the client directory then run npm start
```bash
cd client
npm install
npm start
```

### 3. Open localhost:3000 in the browser
Open `http://localhost:3000` in your web browser to compile C++ and Python code with custom inputs!
