import React, { useState, useEffect, useRef } from 'react';

export default function CodePlayground({ initialCode, lang }) {
  const [code, setCode] = useState(initialCode);
  const [triggerRun, setTriggerRun] = useState(0);
  const iframeRef = useRef(null);

  // Sync with initialCode if it changes (when switching lessons)
  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  const normalizedLang = lang ? lang.toLowerCase() : '';

  const handleRun = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let doc = '';

    if (normalizedLang === 'html') {
      doc = code;
    } else {
      // JavaScript execution intercepting console.log
      const escapedCode = code.replace(/<\/script>/g, '<\\/script>');
      doc = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'JetBrains Mono', ui-monospace, monospace;
              font-size: 13px;
              padding: 12px;
              margin: 0;
              color: #e2e8f0;
              background-color: #0f131a;
              white-space: pre-wrap;
              line-height: 1.5;
            }
            .log-line {
              border-bottom: 1px solid #1e293b;
              padding: 4px 0;
            }
            .error-line {
              color: #f87171;
              border-bottom: 1px solid #1e293b;
              padding: 4px 0;
            }
          </style>
        </head>
        <body>
          <div id="__console"></div>
          <script>
            const consoleDiv = document.getElementById('__console');
            
            // Override console.log
            console.log = function(...args) {
              const line = document.createElement('div');
              line.className = 'log-line';
              line.textContent = args.map(arg => {
                if (typeof arg === 'object') {
                  try { return JSON.stringify(arg); } catch(e) { return String(arg); }
                }
                return String(arg);
              }).join(' ');
              consoleDiv.appendChild(line);
            };

            // Override console.error
            console.error = function(...args) {
              const line = document.createElement('div');
              line.className = 'error-line';
              line.textContent = 'Error: ' + args.join(' ');
              consoleDiv.appendChild(line);
            };

            window.onerror = function(message, source, lineno, colno, error) {
              console.error(message);
              return true;
            };

            try {
              ${escapedCode}
            } catch (err) {
              console.error(err.message);
            }
          </script>
        </body>
        </html>
      `;
    }

    // Set doc structure in sandboxed frame
    iframe.srcdoc = doc;
  };

  // Run code once on load
  useEffect(() => {
    handleRun();
  }, [triggerRun, initialCode]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginTop: '12px' }}>
      <textarea
        className="try-editor"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck="false"
      />
      <div className="try-controls" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => {
            setCode(initialCode);
            setTriggerRun(prev => prev + 1);
          }}
          style={{ padding: '6px 12px', fontSize: '12px' }}
        >
          Reset
        </button>
        <button
          className="btn btn-amber btn-sm"
          onClick={() => setTriggerRun(prev => prev + 1)}
          style={{ padding: '6px 16px', fontSize: '12px', fontWeight: 700 }}
        >
          &bull; Run Code
        </button>
      </div>
      <iframe
        ref={iframeRef}
        className="try-output-frame"
        title="Code Playground Output"
        sandbox="allow-scripts"
        style={{
          border: '1px solid var(--ink-border)',
          borderRadius: '6px',
          marginTop: '12px',
          minHeight: normalizedLang === 'html' ? '120px' : '100px',
          background: normalizedLang === 'html' ? '#ffffff' : '#0f131a'
        }}
      />
    </div>
  );
}
