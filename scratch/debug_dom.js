const http = require('http');
const { spawn } = require('child_process');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9777',
  '--user-data-dir=C:\\Users\\vikra\\AppData\\Local\\Temp\\chrome_dev_debug',
  '--disable-gpu',
  'http://localhost:3000/about.html'
]);

setTimeout(() => {
  http.get('http://127.0.0.1:9777/json', (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      const targets = JSON.parse(data);
      const target = targets.find(t => t.type === 'page' && t.url.includes('about.html')) || targets.find(t => t.type === 'page');
      const ws = new WebSocket(target.webSocketDebuggerUrl);
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
                const col = document.querySelector(".about-hero-content-col");
                const hero = document.querySelector(".about-hero");
                return JSON.stringify({
                  btnGroupExists: !!el,
                  btnGroupHTML: el ? el.outerHTML : null,
                  btnGroupRect: el ? el.getBoundingClientRect() : null,
                  btnGroupDisplay: el ? window.getComputedStyle(el).display : null,
                  b1Rect: b1 ? b1.getBoundingClientRect() : null,
                  b1Opacity: b1 ? window.getComputedStyle(b1).opacity : null,
                  b1Visibility: b1 ? window.getComputedStyle(b1).visibility : null,
                  b1Color: b1 ? window.getComputedStyle(b1).color : null,
                  b1Bg: b1 ? window.getComputedStyle(b1).backgroundColor : null,
                  colRect: col ? col.getBoundingClientRect() : null,
                  heroRect: hero ? hero.getBoundingClientRect() : null
                });
              })()`
            }
          }));
        }, 1500);
      };
      ws.onmessage = (msg) => {
        const p = JSON.parse(msg.data);
        if (p.id === 2) {
          console.log('DEBUG DOM RESULT:\n', p.result.result.value);
          ws.close();
          chrome.kill();
          process.exit(0);
        }
      };
    });
  });
}, 2000);
