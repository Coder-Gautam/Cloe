const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

const targetUrl = process.argv[2] || 'http://localhost:3000/about.html';
const outputFile = process.argv[3] || 'about_hero_rendered.png';
const scrollToY = parseInt(process.argv[4] || '0', 10);
const clipHeight = parseInt(process.argv[5] || '900', 10);

console.log(`Starting capture: ${targetUrl} -> ${outputFile}, scrollY=${scrollToY}, height=${clipHeight}`);

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--user-data-dir=C:\\Users\\vikra\\AppData\\Local\\Temp\\chrome_dev_cdp',
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
            if (scrollToY > 0) {
              ws.send(JSON.stringify({
                id: 10,
                method: 'Runtime.evaluate',
                params: { expression: `window.scrollTo(0, ${scrollToY}); if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh(); document.querySelectorAll('[style*="opacity"]').forEach(e => e.style.opacity = '1');` }
              }));
            }

            setTimeout(() => {
              ws.send(JSON.stringify({
                id: 3,
                method: 'Page.captureScreenshot',
                params: {
                  format: 'png',
                  captureBeyondViewport: false,
                  clip: {
                    x: 0,
                    y: 0,
                    width: 1440,
                    height: clipHeight,
                    scale: 1
                  }
                }
              }));
            }, 800);
          }, 1200);
        };

        ws.onmessage = (msg) => {
          const parsed = JSON.parse(msg.data);
          if (parsed.id === 3 && parsed.result?.data) {
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
