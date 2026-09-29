const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

const targetUrl = process.argv[2] || 'http://localhost:3000/about.html';
const selector = process.argv[3] || '.about-cta-section';
const outputFile = process.argv[4] || 'scratch/element_capture.png';

console.log(`Capturing ${selector} on ${targetUrl} -> ${outputFile}`);

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--user-data-dir=C:\\Users\\vikra\\AppData\\Local\\Temp\\chrome_dev_cdp_elem',
  '--disable-gpu',
  '--window-size=1440,1000',
  targetUrl
]);

setTimeout(() => {
  http.get('http://127.0.0.1:9222/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const targets = JSON.parse(data);
        const wsUrl = targets[0]?.webSocketDebuggerUrl;
        if (!wsUrl) {
          console.error('No WebSocket URL found');
          chrome.kill();
          process.exit(1);
        }

        const ws = new WebSocket(wsUrl);
        ws.onopen = () => {
          ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
          ws.send(JSON.stringify({ id: 2, method: 'Page.enable' }));

          setTimeout(() => {
            const expr = `
              (() => {
                const el = document.querySelector('${selector}');
                if (!el) return null;
                el.scrollIntoView({ block: 'center' });
                const rect = el.getBoundingClientRect();
                return { x: Math.max(0, rect.x), y: Math.max(0, rect.y), width: rect.width, height: rect.height };
              })()
            `;

            ws.send(JSON.stringify({
              id: 10,
              method: 'Runtime.evaluate',
              params: { expression: expr, returnByValue: true }
            }));
          }, 1200);
        };

        ws.onmessage = (msg) => {
          const parsed = JSON.parse(msg.data);
          if (parsed.id === 10) {
            const rect = parsed.result?.value;
            console.log('Element rect:', rect);
            setTimeout(() => {
              ws.send(JSON.stringify({
                id: 20,
                method: 'Page.captureScreenshot',
                params: {
                  format: 'png',
                  captureBeyondViewport: false,
                  clip: rect ? {
                    x: 0,
                    y: Math.max(0, Math.floor(rect.y) - 50),
                    width: 1440,
                    height: Math.min(1000, Math.ceil(rect.height) + 100),
                    scale: 1
                  } : { x: 0, y: 0, width: 1440, height: 800, scale: 1 }
                }
              }));
            }, 600);
          } else if (parsed.id === 20 && parsed.result?.data) {
            fs.writeFileSync(outputFile, Buffer.from(parsed.result.data, 'base64'));
            console.log(`Saved screenshot to ${outputFile}`);
            ws.close();
            chrome.kill();
            process.exit(0);
          }
        };

        ws.onerror = (err) => {
          console.error('WS Error:', err);
          chrome.kill();
          process.exit(1);
        };
      } catch (err) {
        console.error('Error parsing targets:', err);
        chrome.kill();
        process.exit(1);
      }
    });
  }).on('error', (err) => {
    console.error('HTTP error:', err);
    chrome.kill();
    process.exit(1);
  });
}, 1500);
