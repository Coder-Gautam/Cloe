const http = require('http');
const { spawn } = require('child_process');

async function testPage(pageUrl, selectors) {
  return new Promise((resolve) => {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
      '--headless=new',
      '--remote-debugging-port=9223',
      '--user-data-dir=C:\\Users\\vikra\\AppData\\Local\\Temp\\chrome_dev_eyebrows',
      '--disable-gpu',
      '--window-size=1440,1000',
      pageUrl
    ]);

    setTimeout(() => {
      http.get('http://127.0.0.1:9223/json', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const targets = JSON.parse(data);
            const wsUrl = targets[0]?.webSocketDebuggerUrl;
            if (!wsUrl) {
              chrome.kill();
              return resolve({ error: 'No WS URL' });
            }

            const ws = new WebSocket(wsUrl);
            ws.onopen = () => {
              ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));

              const expr = `
                (${JSON.stringify(selectors)}).map(sel => {
                  const el = document.querySelector(sel);
                  if (!el) return { selector: sel, error: 'Not found' };
                  const cs = window.getComputedStyle(el);
                  const dash = el.querySelector('.eyebrow-dash, .about-eyebrow-dash, .books-eyebrow-dash, .podcast-eyebrow-dash') || el.previousElementSibling;
                  const dashCs = dash ? window.getComputedStyle(dash) : null;
                  return {
                    selector: sel,
                    text: el.innerText.trim(),
                    color: cs.color,
                    fontSize: cs.fontSize,
                    fontWeight: cs.fontWeight,
                    lineHeight: cs.lineHeight,
                    letterSpacing: cs.letterSpacing,
                    textTransform: cs.textTransform,
                    dash: dash ? {
                      width: dashCs.width,
                      height: dashCs.height,
                      bg: dashCs.backgroundColor
                    } : null
                  };
                })
              `;

              setTimeout(() => {
                ws.send(JSON.stringify({
                  id: 2,
                  method: 'Runtime.evaluate',
                  params: { expression: expr, returnByValue: true }
                }));
              }, 800);
            };

            ws.onmessage = (msg) => {
              const res = JSON.parse(msg.data);
              if (res.id === 2) {
                chrome.kill();
                resolve(res.result?.value);
              }
            };
          } catch (e) {
            chrome.kill();
            resolve({ error: e.message });
          }
        });
      });
    }, 1500);
  });
}

async function run() {
  console.log('--- Checking About Page ---');
  const about = await testPage('http://localhost:3000/about.html', [
    '#about-hero .about-eyebrow',
    '#about-convictions .about-eyebrow',
    '#about-cta .about-eyebrow'
  ]);
  console.log(JSON.stringify(about, null, 2));

  console.log('--- Checking Books Page ---');
  const books = await testPage('http://localhost:3000/books.html', [
    '#books-hero .books-eyebrow',
    '#books-why .books-eyebrow',
    '#books-laws .books-eyebrow',
    '#books-models .books-eyebrow'
  ]);
  console.log(JSON.stringify(books, null, 2));

  console.log('--- Checking Partnership Page ---');
  const partnership = await testPage('http://localhost:3000/partnership.html', [
    '.partnership-eyebrow',
    '.opportunity-eyebrow',
    '.home-cta-eyebrow'
  ]);
  console.log(JSON.stringify(partnership, null, 2));

  console.log('--- Checking Home Page ---');
  const home = await testPage('http://localhost:3000/index.html', [
    '.hero-eyebrow',
    '.partnership-eyebrow',
    '.problem-eyebrow',
    '.model-5p-eyebrow',
    '.home-cta-eyebrow'
  ]);
  console.log(JSON.stringify(home, null, 2));

  console.log('--- Checking Podcasts Page ---');
  const podcasts = await testPage('http://localhost:3000/podcasts.html', [
    '#podcast-hero .podcast-eyebrow',
    '#podcast-strip .strip-eyebrow',
    '#podcast-episode .podcast-eyebrow',
    '#podcast-archive .podcast-eyebrow'
  ]);
  console.log(JSON.stringify(podcasts, null, 2));

  process.exit(0);
}

run();
