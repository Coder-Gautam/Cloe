const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

const url = process.argv[2] || 'http://localhost:3000/partnership.html';
const selector = process.argv[3] || '.home-cta-eyebrow';
const outputFile = process.argv[4] || 'scratch/clip.png';

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9225',
  '--user-data-dir=C:\\Users\\vikra\\AppData\\Local\\Temp\\chrome_clip2',
  url
]);

setTimeout(() => {
  http.get('http://127.0.0.1:9225/json', (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      const targets = JSON.parse(data);
      const pageTarget = targets.find(t => t.type === 'page' && !t.url.startsWith('chrome')) || targets[0];
      const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

      ws.onopen = () => {
        ws.send(JSON.stringify({ id: 1, method: 'Page.enable' }));
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 2,
            method: 'Runtime.evaluate',
            params: {
              expression: `
                (() => {
                  if (window.gsap) {
                    gsap.globalTimeline.progress(1);
                  }
                  const el = document.querySelector('${selector}');
                  if (!el) return null;
                  el.scrollIntoView({ block: 'center' });
                  el.style.opacity = '1';
                  el.style.visibility = 'visible';
                  const r = el.getBoundingClientRect();
                  return {
                    x: Math.max(0, Math.floor(window.scrollX + r.left) - 40),
                    y: Math.max(0, Math.floor(window.scrollY + r.top) - 20),
                    width: Math.min(1440, Math.ceil(r.width) + 80),
                    height: Math.ceil(r.height) + 40
                  };
                })()
              `,
              returnByValue: true
            }
          }));
        }, 1200);
      };

      ws.onmessage = (m) => {
        const msg = JSON.parse(m.data);
        if (msg.id === 2) {
          const clip = msg.result?.result?.value;
          console.log('Absolute Clip:', clip);
          if (!clip) {
            console.error('Element not found');
            chrome.kill();
            process.exit(1);
          }
          ws.send(JSON.stringify({
            id: 3,
            method: 'Page.captureScreenshot',
            params: {
              format: 'png',
              captureBeyondViewport: true,
              clip: { ...clip, scale: 1 }
            }
          }));
        } else if (msg.id === 3) {
          fs.writeFileSync(outputFile, Buffer.from(msg.result.data, 'base64'));
          console.log(`Saved screenshot to ${outputFile}`);
          ws.close();
          chrome.kill();
          process.exit(0);
        }
      };
    });
  });
}, 1500);
