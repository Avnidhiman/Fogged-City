import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = 'C:\\Users\\Shreya Srivastava\\.gemini\\antigravity\\brain\\f038ecdf-416c-40f4-9038-d9c7b7029667';

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Locate Edge or Chrome
const possiblePaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
];

let browserPath = possiblePaths.find(p => fs.existsSync(p));
if (!browserPath) {
  console.error('No browser executable found!');
  process.exit(1);
}

console.log('Using browser at:', browserPath);

// Start browser with remote debugging port
const port = 9222;
const browserProc = spawn(browserPath, [
  `--remote-debugging-port=${port}`,
  '--headless=new',
  '--disable-gpu',
  '--window-size=1280,800',
  'about:blank'
]);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getWsUrl() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      const data = await res.json();
      if (data.webSocketDebuggerUrl) return data.webSocketDebuggerUrl;
    } catch (e) {
      await sleep(300);
    }
  }
  throw new Error('Could not connect to browser CDP endpoint');
}

async function run() {
  try {
    const wsUrl = await getWsUrl();
    console.log('Connected to CDP at:', wsUrl);

    const ws = new WebSocket(wsUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        const { resolve, reject } = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };

    function sendCommand(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        callbacks.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    async function evaluate(expression) {
      const res = await sendCommand('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
      });
      return res?.result?.value;
    }

    async function screenshot(filename) {
      const filePath = path.join(OUT_DIR, filename);
      const res = await sendCommand('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
      console.log(`Saved screenshot: ${filePath} (${fs.statSync(filePath).size} bytes)`);
    }

    // Enable domains
    await sendCommand('Page.enable');
    await sendCommand('Runtime.enable');

    console.log('Navigating to http://localhost:5173/ ...');
    await sendCommand('Page.navigate', { url: 'http://localhost:5173/' });
    await sleep(2000);

    // 1. Cold Open screenshot
    console.log('Step 1: Capturing Cold Open...');
    await screenshot('cold_open.png');

    // 2. Click TAP TO BEGIN
    console.log('Step 2: Clicking TAP TO BEGIN...');
    await evaluate(`(() => {
      const btn = document.querySelector('.tap-to-begin-btn') || document.querySelector('.cold-open-screen');
      if (btn) btn.click();
    })()`);
    await sleep(1000);
    console.log('Capturing Team Setup...');
    await screenshot('team_setup.png');

    // 3. Fill in Team Name 'Fog Walkers', player 1 'Aisha', player 2 'Rohan'. Click Continue.
    console.log('Step 3: Filling Team Setup...');
    await evaluate(`(() => {
      const setNativeValue = (element, value) => {
        const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
        const prototype = Object.getPrototypeOf(element);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
        if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
          prototypeValueSetter.call(element, value);
        } else {
          valueSetter.call(element, value);
        }
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      };

      const teamInput = document.getElementById('teamName');
      if (teamInput) setNativeValue(teamInput, 'Fog Walkers');

      const playerInputs = document.querySelectorAll('.player-input');
      if (playerInputs[0]) setNativeValue(playerInputs[0], 'Aisha');
      if (playerInputs[1]) setNativeValue(playerInputs[1], 'Rohan');

      const continueBtn = document.querySelector('.continue-btn');
      if (continueBtn) continueBtn.click();
    })()`);
    await sleep(1000);

    // 4. Role Select screenshot
    console.log('Step 4: Capturing Role Select...');
    await screenshot('role_select.png');

    // 5. Click Continue to enter map -> Fogged Map screenshot
    console.log('Step 5: Entering Fogged Map...');
    await evaluate(`(() => {
      const continueBtn = document.querySelector('.continue-btn');
      if (continueBtn) continueBtn.click();
    })()`);
    await sleep(1000);
    console.log('Capturing Fogged Map...');
    await screenshot('fogged_map.png');

    // 6. Click Zone 1 -> Click I'VE ARRIVED -> Zone 1 riddle screen
    console.log('Step 6: Clicking Zone 1...');
    await evaluate(`(() => {
      const z1 = document.querySelector('.marker-1');
      if (z1) z1.click();
    })()`);
    await sleep(800);

    console.log('Clicking I HAVE ARRIVED...');
    await evaluate(`(() => {
      const arrivedBtn = document.querySelector('.arrived-btn');
      if (arrivedBtn) arrivedBtn.click();
    })()`);
    await sleep(800);
    console.log('Capturing Zone 1 riddle screen...');
    await screenshot('zone1_riddle.png');

    // 7. Submit answer 'clock'
    console.log('Step 7: Submitting answer clock...');
    await evaluate(`(() => {
      const setNativeValue = (element, value) => {
        const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
        const prototype = Object.getPrototypeOf(element);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
        if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
          prototypeValueSetter.call(element, value);
        } else {
          valueSetter.call(element, value);
        }
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      };

      const ansInput = document.getElementById('riddleAnswer');
      if (ansInput) setNativeValue(ansInput, 'clock');

      const submitBtn = document.querySelector('.submit-ans-btn');
      if (submitBtn) submitBtn.click();
    })()`);
    await sleep(2500); // Wait for riddle solved timeout (1800ms) and redirect back to map

    // 8. Zone 2
    console.log('Step 8: Clicking Zone 2...');
    await evaluate(`(() => {
      const z2 = document.querySelector('.marker-2');
      if (z2) z2.click();
    })()`);
    await sleep(800);

    console.log('Clicking I HAVE ARRIVED for Zone 2...');
    await evaluate(`(() => {
      const arrivedBtn = document.querySelector('.arrived-btn');
      if (arrivedBtn) arrivedBtn.click();
    })()`);
    await sleep(800);

    console.log('Submitting answer sign...');
    await evaluate(`(() => {
      const setNativeValue = (element, value) => {
        const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
        const prototype = Object.getPrototypeOf(element);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
        if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
          prototypeValueSetter.call(element, value);
        } else {
          valueSetter.call(element, value);
        }
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      };

      const ansInput = document.getElementById('riddleAnswer');
      if (ansInput) setNativeValue(ansInput, 'sign');

      const submitBtn = document.querySelector('.submit-ans-btn');
      if (submitBtn) submitBtn.click();
    })()`);
    await sleep(2500);

    // 9. Zone 3
    console.log('Step 9: Clicking Zone 3...');
    await evaluate(`(() => {
      const z3 = document.querySelector('.marker-3');
      if (z3) z3.click();
    })()`);
    await sleep(800);

    console.log('Clicking I HAVE ARRIVED for Zone 3...');
    await evaluate(`(() => {
      const arrivedBtn = document.querySelector('.arrived-btn');
      if (arrivedBtn) arrivedBtn.click();
    })()`);
    await sleep(800);

    console.log('Submitting answer table...');
    await evaluate(`(() => {
      const setNativeValue = (element, value) => {
        const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
        const prototype = Object.getPrototypeOf(element);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
        if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
          prototypeValueSetter.call(element, value);
        } else {
          valueSetter.call(element, value);
        }
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      };

      const ansInput = document.getElementById('riddleAnswer');
      if (ansInput) setNativeValue(ansInput, 'table');

      const submitBtn = document.querySelector('.submit-ans-btn');
      if (submitBtn) submitBtn.click();
    })()`);
    await sleep(2500); // Redirects to /reveal

    // 10. Reveal Scene screenshot
    console.log('Step 10: Capturing Reveal Scene...');
    await screenshot('reveal_scene.png');

    // 11. Click Continue -> Final Scene screenshot
    console.log('Step 11: Clicking Continue to Final Scene...');
    await evaluate(`(() => {
      const contBtn = document.querySelector('.reveal-continue-btn') || document.querySelector('.reveal-screen');
      if (contBtn) contBtn.click();
    })()`);
    await sleep(1000);
    console.log('Capturing Final Scene...');
    await screenshot('final_scene.png');

    console.log('ALL SCREENSHOTS COMPLETED SUCCESSFULLY!');
    ws.close();
  } catch (err) {
    console.error('Error during execution:', err);
  } finally {
    browserProc.kill();
  }
}

run();
