// Interactive CI/CD Pipeline Simulator & Tutorial Dashboard
import { useState, useEffect, useRef } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import './App.css';

const STAGES = [
  {
    id: 'push',
    name: '1. Git Push',
    command: 'git push origin main',
    description: 'Developer pushes code to the remote repository on GitHub. This triggers the GitHub Actions runner.',
    yaml: `on:
  push:
    branches:
      - main`
  },
  {
    id: 'checkout',
    name: '2. Checkout',
    command: 'actions/checkout@v4',
    description: 'Downloads the repository code onto the GitHub virtual runner (Ubuntu VM) so subsequent steps can access it.',
    yaml: `- name: Checkout Code
  uses: actions/checkout@v4`
  },
  {
    id: 'install',
    name: '3. Install Deps',
    command: 'npm ci',
    description: 'Installs dependencies in a clean, reproducible way. "npm ci" (clean install) uses package-lock.json to install the exact same versions of packages every time.',
    yaml: `- name: Set up Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 20
- name: Install dependencies
  run: npm ci`
  },
  {
    id: 'lint',
    name: '4. Lint Check',
    command: 'npm run lint',
    description: 'Analyzes code quality using ESLint. It scans for syntax issues, unused variables, and style warnings. If lint errors are found, the pipeline fails and stops!',
    yaml: `- name: Run Linting
  run: npm run lint`
  },
  {
    id: 'build',
    name: '5. Vite Build',
    command: 'npm run build',
    description: 'Compiles the React application into optimized, production-ready static HTML, CSS, and JS files, saving them in the "dist/" folder.',
    yaml: `- name: Build App
  run: npm run build`
  },
  {
    id: 'deploy',
    name: '6. Deploy (CD)',
    command: 'actions/deploy-pages@v4',
    description: 'Uploads the compiled "dist/" folder as an artifact and publishes it to the web via GitHub Pages. The live site is updated!',
    yaml: `- name: Upload artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: './dist'
- name: Deploy to GitHub Pages
  id: deployment
  uses: actions/deploy-pages@v4`
  }
];

function App() {
  const [selectedStage, setSelectedStage] = useState(STAGES[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(-1);
  const [simulationStatus, setSimulationStatus] = useState('idle'); // idle, running, success, failed
  const [introduceLintError, setIntroduceLintError] = useState(false);
  const [logs, setLogs] = useState([]);
  
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const addLog = (message, type = 'info') => {
    setLogs((prev) => [...prev, { text: message, type, time: new Date().toLocaleTimeString() }]);
  };

  const runSimulation = async () => {
    if (isSimulating) return;
    
    setIsSimulating(true);
    setSimulationStatus('running');
    setLogs([]);
    
    // Step 1: Git Push
    setSimulationStep(0);
    addLog('🚀 Running command: git push origin main', 'command');
    await delay(1500);
    addLog('✓ Pushed commits to https://github.com/ponaalagar/ci-cd.git', 'success');
    addLog('🔔 GitHub Webhook received. Triggering workflow "Deploy React App to GitHub Pages"...', 'info');
    
    // Step 2: Checkout
    setSimulationStep(1);
    addLog('🚀 Triggered Job: deploy on ubuntu-latest runner', 'info');
    addLog('🏃 Running command: uses: actions/checkout@v4', 'command');
    await delay(1500);
    addLog('✓ Checked out commit hashes successfully.', 'success');
    
    // Step 3: Install Deps
    setSimulationStep(2);
    addLog('🏃 Running command: npm ci', 'command');
    await delay(2000);
    addLog('✓ Installed 135 dependencies in 2.05s', 'success');
    
    // Step 4: Lint Check
    setSimulationStep(3);
    addLog('🏃 Running command: npm run lint', 'command');
    await delay(1800);
    
    if (introduceLintError) {
      addLog('⚠️  [eslint] Found 1 error in src/App.jsx:', 'error');
      addLog('❌   line 12:9 - \'unusedVariable\' is defined but never used (no-unused-vars)', 'error');
      addLog('❌ Error: Process completed with exit code 1. Pipeline failed.', 'error');
      setSimulationStatus('failed');
      setIsSimulating(false);
      return;
    } else {
      addLog('✓ ESLint checks passed. No code issues found!', 'success');
    }
    
    // Step 5: Vite Build
    setSimulationStep(4);
    addLog('🏃 Running command: npm run build', 'command');
    await delay(2200);
    addLog('✓ vite v5.x.x building app...', 'info');
    addLog('✓ dist/index.html                     0.45 kB │ gzip: 0.28 kB', 'info');
    addLog('✓ dist/assets/index-B1z9YxPl.css      4.12 kB │ gzip: 1.45 kB', 'info');
    addLog('✓ dist/assets/index-CnD_z0Zq.js     145.22 kB │ gzip: 46.12 kB', 'info');
    addLog('✓ Production build compiled successfully in 2.1s', 'success');
    
    // Step 6: Deploy
    setSimulationStep(5);
    addLog('🏃 Running command: uses: actions/upload-pages-artifact@v3', 'command');
    await delay(1200);
    addLog('✓ Artifact uploaded successfully.', 'success');
    addLog('🏃 Running command: uses: actions/deploy-pages@v4', 'command');
    await delay(2000);
    addLog('🎉 Deployment successful!', 'success');
    addLog('🌐 Live URL: https://ponaalagar.github.io/ci-cd/', 'success-link');
    
    setSimulationStatus('success');
    setIsSimulating(false);
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const resetSimulation = () => {
    setIsSimulating(false);
    setSimulationStep(-1);
    setSimulationStatus('idle');
    setLogs([]);
  };

  return (
    <div className="container">
      <header className="app-header">
        <div className="logos">
          <img src={viteLogo} className="logo vite-logo" alt="Vite logo" />
          <span className="plus">+</span>
          <img src={reactLogo} className="logo react-logo" alt="React logo" />
          <span className="plus">+</span>
          <div className="github-actions-icon">
            <svg viewBox="0 0 16 16" width="36" height="36" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
          </div>
        </div>
        <h1>Interactive CI/CD Pipeline Tutorial By O.K.Ponaalagar</h1>
        <p className="subtitle">
          Learn how GitHub Actions automates testing, building, and deploying React apps to GitHub Pages.
        </p>
      </header>

      <main className="dashboard">
        {/* SECTION 1: PIPELINE PIPELINE INTERACTIVE DIAGRAM */}
        <section className="card pipeline-section">
          <h2>CI/CD Pipeline Stages</h2>
          <p className="section-desc">Click any stage block to view its job description and workflow syntax.</p>
          
          <div className="pipeline-flow">
            {STAGES.map((stage, idx) => {
              const isActive = simulationStep === idx;
              const isCompleted = simulationStep > idx;
              const isFailedStage = simulationStatus === 'failed' && simulationStep === idx;
              
              let statusClass = '';
              if (isActive) statusClass = 'stage-active';
              else if (isFailedStage) statusClass = 'stage-failed';
              else if (isCompleted) statusClass = 'stage-completed';
              
              return (
                <div key={stage.id} className="stage-wrapper">
                  <button 
                    onClick={() => setSelectedStage(stage)}
                    className={`stage-node ${selectedStage.id === stage.id ? 'stage-selected' : ''} ${statusClass}`}
                  >
                    <div className="stage-status-indicator"></div>
                    <div className="stage-name">{stage.name}</div>
                    <code className="stage-cmd">{stage.command}</code>
                  </button>
                  {idx < STAGES.length - 1 && (
                    <div className={`flow-connector ${isCompleted ? 'connector-completed' : ''} ${isActive ? 'connector-active' : ''}`}>
                      <div className="arrow">➔</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="stage-details">
            <div className="stage-details-header">
              <h3>{selectedStage.name} Details</h3>
              <code>{selectedStage.command}</code>
            </div>
            <div className="stage-details-body">
              <div className="stage-desc-column">
                <h4>What it does under the hood:</h4>
                <p>{selectedStage.description}</p>
              </div>
              <div className="stage-code-column">
                <h4>GitHub Workflow YAML configuration:</h4>
                <pre><code>{selectedStage.yaml}</code></pre>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: SIMULATOR CONTROL & TERMINAL */}
        <section className="card simulator-section">
          <div className="simulator-controls-header">
            <h2>Workflow Pipeline Simulator</h2>
            <div className="controls-group">
              <label className="switch-label">
                <input 
                  type="checkbox" 
                  checked={introduceLintError} 
                  onChange={(e) => setIntroduceLintError(e.target.checked)}
                  disabled={isSimulating}
                />
                <span className="slider"></span>
                Introduce Lint Error (Break Pipeline)
              </label>

              {simulationStatus === 'idle' ? (
                <button className="btn btn-primary" onClick={runSimulation}>
                  Simulate Push & Deploy
                </button>
              ) : (
                <button className="btn btn-secondary" onClick={resetSimulation} disabled={isSimulating}>
                  Reset Runner
                </button>
              )}
            </div>
          </div>

          <div className="terminal">
            <div className="terminal-header">
              <div className="terminal-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <div className="terminal-title">github-actions-runner (ubuntu-latest)</div>
              <div className={`runner-status-pill ${simulationStatus}`}>
                {simulationStatus.toUpperCase()}
              </div>
            </div>
            
            <div className="terminal-body">
              {logs.length === 0 && (
                <div className="terminal-placeholder">
                  Click "Simulate Push & Deploy" above to start the pipeline simulation...
                </div>
              )}
              {logs.map((log, idx) => (
                <div key={idx} className={`log-line log-${log.type}`}>
                  <span className="log-time">[{log.time}]</span>
                  <span className="log-text">{log.text}</span>
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
          </div>
        </section>

        {/* SECTION 3: TUTORIAL / CHEAT SHEET */}
        <section className="card info-section">
          <h2>CI/CD Cheat Sheet for Classmates</h2>
          <div className="info-grid">
            <div className="info-box">
              <h3>What is CI/CD?</h3>
              <p>
                <strong>Continuous Integration (CI)</strong> automatically merges and tests code changes. 
                In this project, CI is represented by <strong>lint checking</strong> and <strong>compilation (building)</strong>.
              </p>
              <p style={{ marginTop: '8px' }}>
                <strong>Continuous Delivery (CD)</strong> automatically deploys tested code to production (e.g. GitHub Pages) 
                so changes are visible to users immediately.
              </p>
            </div>
            <div className="info-box">
              <h3>Core Local Scripts</h3>
              <ul>
                <li><code>npm run dev</code>: Runs application locally in development mode (hot reloading).</li>
                <li><code>npm run lint</code>: Runs ESLint static analysis to verify code quality.</li>
                <li><code>npm run build</code>: Packages React project into static web assets (`dist/`).</li>
              </ul>
            </div>
            <div className="info-box">
              <h3>Key GH Pages Settings</h3>
              <p>
                To allow GitHub Actions to deploy directly, the repository setting must be changed. 
                Go to <strong>Settings → Pages → Build and deployment → Source</strong> and select <strong>GitHub Actions</strong>.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>CI/CD Learning Sandbox | Created with React, Vite, and GitHub Actions</p>
      </footer>
    </div>
  );
}

export default App;
