import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import App from './src/App'
import KombaiWrapper from './KombaiWrapper'
import ErrorBoundary from '@kombai/react-error-boundary'
import './src/index.css'

// Global console filter: reduce noisy logs (67 logs) and keep meaningful errors visible
// Toggle with VITE_DEBUG_LOGS=true to restore full logging during debugging
(() => {
  const env = (import.meta as any)?.env || {};
  const DEBUG_LOGS = String(env.VITE_DEBUG_LOGS || '').toLowerCase() === 'true';

  if (DEBUG_LOGS) return; // do nothing if explicitly enabled

  const original = {
    log: console.log,
    info: console.info,
    debug: console.debug,
    warn: console.warn,
    error: console.error,
  } as const;

  // Silence non-essential logs
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};

  // De-duplicate repeated warns/errors that often flood the console in dev
  const seenWarns = new Set<string>();
  const seenErrors = new Set<string>();
  const makeKey = (args: unknown[]) => {
    try {
      return JSON.stringify(args, (_k, v) => (v instanceof Error ? v.message : v));
    } catch {
      return args.map((a) => String(a)).join('|');
    }
  };

  console.warn = (...args: any[]) => {
    const key = makeKey(args);
    if (seenWarns.has(key)) return;
    seenWarns.add(key);
    original.warn(...args);
  };

  console.error = (...args: any[]) => {
    const key = makeKey(args);
    if (seenErrors.has(key)) return;
    seenErrors.add(key);
    original.error(...args);
  };
})();

// Main App with Routing
const AppWithRouting: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Main App Route */}
        <Route path="/*" element={<App />} />
        
        {/* Redirect root to main app */}
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        {/* Ensure bare /availability also resolves */}
        <Route path="/availability" element={<Navigate to="/availability/calendar" replace />} />
      </Routes>
    </Router>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <KombaiWrapper>
        <AppWithRouting />
      </KombaiWrapper>
    </ErrorBoundary>
  </StrictMode>,
)