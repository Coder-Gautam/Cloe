const http = require('http');
const { spawn } = require('child_process');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9555',
  '--user-data-dir=C:\\Users\\vikra\\AppData\\Local\\Temp\\chrome_dev_eval2',
  '--disable-gpu',
  'http://localhost:3000/about.html'
]);

setTimeout(() => {
  http.get('http://127.0.0.1:9555/json', (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      const wsUrl = JSON.parse(data)[0]?.webSocketDebuggerUrl;
      const ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 2,
            method: 'Runtime.evaluate',
            params: {
              expression: `(() => {
                const el = document.querySelector(".about-hero-btn-group");
                const b1 = document.querySelector(".about-btn-primary");
                return JSON.stringify({
                  html: el ? el.outerHTML : null,
                  rect: el ? el.getBoundingClientRect() : null,
                  styleDisplay: el ? window.getComputedStyle(el).display : null,
                  b1Rect: b1 ? b1.getBoundingClientRect() : null,
                  b1Opacity: b1 ? window.getComputedStyle(b1).opacity : null,
                  b1Visibility: b1 ? window.getComputedStyle(b1).visibility : null,
                  heroHeight: document.querySelector(".about-hero")?.offsetHeight,
                  heroGridHeight: document.querySelector(".about-hero-grid")?.offsetHeight,
                  heroMediaHeight: document.querySelector(".about-hero-media-col")?.offsetHeight,
                  heroContentColHeight: document.querySelector(".about-hero-content-col")?.offsetHeight
                });
              })()`
            }
          }));
        }, 1500);
      };
      ws.onmessage = (msg) => {
        const p = JSON.parse(msg.data);
        if (p.id === 2) {
          console.log('DOM Evaluation:', p.result.result.value);
          ws.close();
          chrome.kill();
          process.exit(0);
        }
      };
    });
  });
}, 2000);
