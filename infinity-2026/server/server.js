const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/*
  Simple Node.js server for Infinity 2026 registration demo.
  - No npm install or package.json required.
  - Built only with Node's standard library.
  - Persists registrations in a local JSON file.
  - Exposes a tiny API for the static GitHub Pages registration form.
  - Logs are intentionally verbose for dev/testing.
*/

const PORT = Number(process.env.PORT || 3000);
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_SXqOW3Iy6obVwz';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'Fc46sO4HIcm6StozWUB5LVfi';  // Since this is a test key, i'm exposing it here, but the real key shouldnt be exposed anywhere in public code. It's to be managed through env vars.

const DB_PATH = path.join(__dirname, 'registrations.json');
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',   // here in prod, we should allow only from the sa-fet domain and its sub domains, since the frontend is expected to be served from GitHub Pages, but routed through the fet-hub proxy.
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Razorpay-Signature'
};

const ALLOWED_STATUSES = new Set([
  'created',
  'checkout_opened',
  'checkout_cancelled',
  'payment_failed',
  'payment_success_client',
  'paid'
]);

let registrations = loadDatabase();

function log(...args) {
  console.log('[server]', ...args);
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    ...CORS_HEADERS,
    'Content-Type': 'application/json; charset=utf-8'
  });
  res.end(JSON.stringify(payload, null, 2));
}

function loadDatabase() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, '[]\n', 'utf8');
      log('created empty database file at', DB_PATH);
      return [];
    }

    const raw = fs.readFileSync(DB_PATH, 'utf8').trim();
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    log('loaded registrations:', Array.isArray(parsed) ? parsed.length : 0);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    log('database load failed, starting empty:', err.message);
    return [];
  }
}

function saveDatabase() {
  fs.writeFileSync(DB_PATH, JSON.stringify(registrations, null, 2) + '\n', 'utf8');
  log('database saved:', registrations.length, 'registration(s)');
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1024 * 64) {
        reject(new Error('Body too large'));
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });

    req.on('error', reject);
  });
}

function validateRegistrationInput(body) {
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const phone = String(body.phone || '').trim();
  const amount = Number(body.amount);

  if (!name) return {ok: false, error: 'Name is required'};
  if (!email) return {ok: false, error: 'Email is required'};
  if (!phone) return {ok: false, error: 'Phone is required'};
  if (!Number.isInteger(amount) || amount <= 0) {
    return {ok: false, error: 'Amount must be a positive integer in paise'};
  }

  return {ok: true, value: {name, email, phone, amount}};
}

function createRazorpayOrder(amount, receipt) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      amount,
      currency: 'INR',
      receipt,
      payment_capture: 1
    });

    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
    const requestOptions = {
      hostname: 'api.razorpay.com',
      path: '/v1/orders',
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    log('creating Razorpay order', {amount, receipt});

    const razorReq = https.request(requestOptions, (razorRes) => {
      let responseData = '';
      razorRes.on('data', (chunk) => (responseData += chunk));
      razorRes.on('end', () => {
        log('Razorpay order response', razorRes.statusCode, responseData);

        if (razorRes.statusCode >= 200 && razorRes.statusCode < 300) {
          try {
            resolve(JSON.parse(responseData));
          } catch (err) {
            reject(new Error(`Could not parse Razorpay response: ${err.message}`));
          }
          return;
        }

        reject(new Error(`Razorpay HTTP ${razorRes.statusCode}: ${responseData}`));
      });
    });

    razorReq.on('error', reject);
    razorReq.write(payload);
    razorReq.end();
  });
}

function handleOptions(res) {
  res.writeHead(204, CORS_HEADERS);
  res.end();
}

function findRegistration(orderId) {
  return registrations.find((registration) => registration.order_id === orderId);
}

function appendEvent(registration, status, detail = {}) {
  const at = new Date().toISOString();

  if (!Array.isArray(registration.events)) {
    registration.events = [];
  }

  registration.events.push({status, at, detail});

  if (!(registration.status === 'paid' && status !== 'paid')) {
    registration.status = status;
  }

  registration.updatedAt = at;

  if (status === 'paid') {
    registration.paidAt = at;
  }

  return registration;
}

function recordEvent(orderId, status, detail = {}) {
  if (!ALLOWED_STATUSES.has(status)) {
    throw new Error(`Unsupported status: ${status}`);
  }

  const registration = findRegistration(orderId);
  if (!registration) {
    return null;
  }

  if (status === 'paid' && registration.status === 'paid') {
    return registration;
  }

  appendEvent(registration, status, detail);
  saveDatabase();
  return registration;
}

const server = http.createServer(async (req, res) => {
  log('incoming', req.method, req.url);

  if (req.method === 'OPTIONS') {
    handleOptions(res);
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    sendJson(res, 200, {ok: true, registrations: registrations.length});
    return;
  }

  if (req.method === 'GET' && req.url === '/registrations') {
    sendJson(res, 200, registrations);
    return;
  }

  if (req.method === 'POST' && req.url === '/register') {
    try {
      const body = await parseJsonBody(req);
      log('register payload received', body);

      const input = validateRegistrationInput(body);
      if (!input.ok) {
        sendJson(res, 400, {error: input.error});
        return;
      }

      const receipt = `infinty_${Date.now()}`;
      const order = await createRazorpayOrder(input.value.amount, receipt);
      const now = new Date().toISOString();

      const registration = {
        id: `reg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name: input.value.name,
        email: input.value.email,
        phone: input.value.phone,
        amount: input.value.amount,
        receipt,
        order_id: order.id,
        status: 'created',
        events: [{status: 'created', at: now, detail: {source: 'register'}}],
        createdAt: now,
        updatedAt: now
      };

      registrations.push(registration);
      saveDatabase();

      log('registration created', registration.id, 'order', order.id);
      sendJson(res, 200, {registration, order});
    } catch (err) {
      log('register failed', err.message);
      sendJson(res, 500, {error: err.message});
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/registration-event') {
    try {
      const body = await parseJsonBody(req);
      const orderId = String(body.order_id || '').trim();
      const status = String(body.status || '').trim();
      const detail = body.detail && typeof body.detail === 'object' ? body.detail : {};

      if (!orderId) {
        sendJson(res, 400, {error: 'order_id is required'});
        return;
      }

      if (!status) {
        sendJson(res, 400, {error: 'status is required'});
        return;
      }

      const updated = recordEvent(orderId, status, detail);
      if (!updated) {
        sendJson(res, 404, {error: 'Registration not found for that order_id'});
        return;
      }

      log('registration event recorded', updated.id, status);
      sendJson(res, 200, {registration: updated});
    } catch (err) {
      log('registration-event failed', err.message);
      sendJson(res, 500, {error: err.message});
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/razorpay-webhook') {
    let raw = '';

    req.on('data', (chunk) => {
      raw += chunk;
    });

    req.on('end', () => {
      log('webhook received, raw length', raw.length);

      const signature = req.headers['x-razorpay-signature'];
      const expectedSignature = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET).update(raw).digest('hex');

      if (signature !== expectedSignature) {
        log('webhook signature mismatch');
        sendJson(res, 400, {status: 'invalid-signature'});
        return;
      }

      let payload;
      try {
        payload = JSON.parse(raw);
      } catch (err) {
        log('webhook JSON parse failed', err.message);
        sendJson(res, 400, {status: 'bad-json'});
        return;
      }

      if (payload.event === 'payment.captured') {
        const payment = payload.payload.payment.entity;
        const updated = recordEvent(payment.order_id, 'paid', {
          source: 'webhook',
          payment_id: payment.id,
          payment_method: payment.method
        });

        if (updated) {
          updated.payment_id = payment.id;
          updated.payment_method = payment.method;
          saveDatabase();
          log('registration marked paid', updated.id, 'payment', payment.id);
        } else {
          log('no registration found for order', payment.order_id);
        }
      } else {
        log('webhook event ignored', payload.event);
      }

      sendJson(res, 200, {status: 'ok'});
    });

    return;
  }

  log('404', req.method, req.url);
  sendJson(res, 404, {error: 'Not found'});
});

server.listen(PORT, () => {
  log(`listening on http://localhost:${PORT}`);
});