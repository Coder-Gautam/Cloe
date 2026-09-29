const http = require('http');
const { spawn } = require('child_process');

const url = process.argv[2] || 'http://localhost:3000/about.html';
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--user-data-dir=C:\\Users\\vikra\\AppData\\Local\\Temp\\chrome_pos',
  url
]);

setTimeout(() => {
  http.get('http://127.0.0.1:9222/json', (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      const targets = JSON.parse(data);
      console.log('Targets:', targets.map(t => ({ type: t.type, url: t.url })));
      const pageTarget = targets.find(t => t.type === 'page' && !t.url.startsWith('chrome')) || targets[0];
      const wsUrl = pageTarget?.webSocketDebuggerUrl;
      const ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        ws.send(JSON.stringify({ id: 99, method: 'Page.enable' }));
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 1,
            method: 'Runtime.evaluate',
            params: {
              expression: `
                (() => {
                  return Array.from(document.querySelectorAll('.eyebrow, [class*="-eyebrow"]')).map(el => {
                    const rect = el.getBoundingClientRect();
                    const cs = window.getComputedStyle(el);
                    return {
                      text: el.innerText.replace(/\\s+/g, ' ').trim(),
                      top: Math.round(rect.top + window.scrollY),
                      color: cs.color,
                      fontWeight: cs.fontWeight,
                      fontSize: cs.fontSize,
                      letterSpacing: cs.letterSpacing
                    };
                  });
                })()
              `,
              returnByValue: true
            }
          }));
        }, 1200);
      };
      ws.onmessage = (m) => {
        const parsed = JSON.parse(m.data);
        if (parsed.id === 1) {
          console.log('Got response for id 1:', JSON.stringify(parsed));
          ws.close();
          chrome.kill();
          process.exit(0);
        }
      };
    });
  });
}, 1500);
