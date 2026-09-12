import React, { useState, useEffect } from 'react';
import axios from 'axios';
import stubs from './defaultStubs';
import './App.css';
import { Play, Code2, Terminal, Clock, FileText, CheckCircle2, AlertTriangle, Github, History } from 'lucide-react';

const API_BASE = "http://localhost:5000";

function App() {
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState(stubs.cpp);
  const [customInput, setCustomInput] = useState('5');
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [output, setOutput] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [execTime, setExecTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [jobHistory, setJobHistory] = useState([]);

  // Language switch handler - auto loads starter code stub
  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(stubs[lang] || '');
  };

  // Submit code for execution
  const handleSubmit = async () => {
    if (!code || code.trim() === '') return;
    setLoading(true);
    setJobStatus('queued');
    setOutput('');
    setErrorDetails('');

    try {
      const response = await axios.post(`${API_BASE}/run`, {
        language,
        code,
        input: customInput
      });

      if (response.data.success) {
        setJobId(response.data.jobId);
      }
    } catch (err) {
      setLoading(false);
      setJobStatus('error');
      setErrorDetails(err.response?.data?.error || err.message || "Failed to submit code execution job.");
    }
  };

  // Polling mechanism (useEffect)
  useEffect(() => {
    let intervalId = null;

    if (jobId && (jobStatus === 'queued' || jobStatus === 'running')) {
      intervalId = setInterval(async () => {
        try {
          const res = await axios.get(`${API_BASE}/status`, { params: { id: jobId } });
          const { success, job } = res.data;

          if (success && job) {
            setJobStatus(job.status);
            if (job.status === 'success') {
              setOutput(job.output);
              setExecTime(job.executionTimeMs);
              setLoading(false);
              clearInterval(intervalId);
              fetchJobHistory();
            } else if (job.status === 'error') {
              setErrorDetails(job.error);
              setOutput(job.output);
              setExecTime(job.executionTimeMs);
              setLoading(false);
              clearInterval(intervalId);
              fetchJobHistory();
            }
          }
        } catch (err) {
          console.error("Polling status error:", err);
        }
      }, 800);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [jobId, jobStatus]);

  const fetchJobHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/job`);
      if (res.data.success) {
        setJobHistory(res.data.jobs || []);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchJobHistory();
  }, []);

  return (
    <div className="ide-container">
      {/* Navbar Header */}
      <header className="ide-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(88, 166, 255, 0.15)', padding: '0.6rem', borderRadius: '0.75rem', color: '#58A6FF' }}>
            <Code2 size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#F0F6FC' }}>
              Online Code Compiler
            </h1>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#8B949E' }}>
              Node.js • Express • Bull Queue • MongoDB • ReactJS
            </p>
          </div>
        </div>

        <a
          href="https://github.com/AdityaPratap-521"
          target="_blank"
          rel="noopener noreferrer"
          className="github-badge"
        >
          <Github size={16} />
          <span>AdityaPratap-521</span>
        </a>
      </header>

      {/* Compiler IDE Layout */}
      <div className="ide-grid">
        {/* Code Editor Panel */}
        <div className="editor-card">
          <div className="editor-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <select value={language} onChange={handleLanguageChange} className="lang-select">
                <option value="cpp">C++ (g++ 6.3 / GCC)</option>
                <option value="python">Python 3.13</option>
              </select>
              <span style={{ fontSize: '0.75rem', color: '#8B949E' }}>
                Automatic Starter Code Loaded
              </span>
            </div>

            <button onClick={handleSubmit} disabled={loading} className="btn-run">
              <Play size={16} fill="white" />
              <span>{loading ? "Compiling..." : "Run Code"}</span>
            </button>
          </div>

          {/* Source Code Textarea */}
          <textarea
            rows={15}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="code-textarea"
            placeholder="Write your C++ or Python code here..."
          />

          {/* Test Case Input Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#C9D1D9', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={14} color="#58A6FF" />
              Test Case Input (stdin)
            </label>
            <textarea
              rows={3}
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="input-textarea"
              placeholder="Enter custom input data (stdin) for your program..."
            />
          </div>
        </div>

        {/* Output & Terminal Panel */}
        <div className="output-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Terminal size={18} color="#3FB950" />
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#F0F6FC' }}>
                Output Terminal
              </h3>
            </div>

            {/* Execution Status Badge */}
            {jobStatus && (
              <span className={`status-badge status-${jobStatus}`}>
                {jobStatus === 'queued' && 'Queued'}
                {jobStatus === 'running' && 'Running...'}
                {jobStatus === 'success' && 'Success'}
                {jobStatus === 'error' && 'Error'}
              </span>
            )}
          </div>

          {/* Execution Time Readout */}
          {execTime > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#8B949E' }}>
              <Clock size={12} />
              <span>Execution Time: {execTime} ms</span>
            </div>
          )}

          {/* Terminal Box */}
          <div className="terminal-box">
            {errorDetails ? (
              <span style={{ color: '#F85149' }}>
                [Compilation / Execution Error]:
                {'\n'}{errorDetails}
              </span>
            ) : output ? (
              <span style={{ color: '#E6EDE3' }}>{output}</span>
            ) : loading ? (
              <span style={{ color: '#D29922' }}>
                [Worker Queue]: Code queued. Polling execution status...
              </span>
            ) : (
              <span style={{ color: '#6E7681' }}>
                Terminal ready. Click "Run Code" to compile and view output.
              </span>
            )}
          </div>

          {/* Job History Drawer */}
          <div style={{ borderTop: '1px solid #30363D', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', fontWeight: 700, color: '#C9D1D9', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <History size={14} color="#A855F7" />
              Recent Executions History (MongoDB)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '140px', overflowY: 'auto' }}>
              {jobHistory.length > 0 ? (
                jobHistory.map((j) => (
                  <div key={j._id} style={{ background: '#0D1117', padding: '0.4rem 0.75rem', borderRadius: '0.4rem', border: '1px solid #21262D', display: 'flex', justify: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                    <span style={{ color: j.language === 'cpp' ? '#58A6FF' : '#3FB950', fontWeight: 700 }}>
                      {j.language.toUpperCase()}
                    </span>
                    <span style={{ color: j.status === 'success' ? '#3FB950' : '#F85149' }}>
                      {j.status}
                    </span>
                    <span style={{ color: '#8B949E' }}>
                      {j.executionTimeMs ? `${j.executionTimeMs}ms` : ''}
                    </span>
                  </div>
                ))
              ) : (
                <span style={{ fontSize: '0.75rem', color: '#6E7681' }}>No past executions logged yet.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
