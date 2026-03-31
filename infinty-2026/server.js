const http = require('http');
const https = require('https');
const fs = require('fs');
const crypto = require('crypto');

/*
    Simple Node.js server for Infinity 2026 registration demo.
    - No npm install or package.json required.
    - Serves registration.html and handles /create-order POST using Razorpay Test API.
    - Uses only built-in 'http', 'https', 'fs', and 'crypto' modules.
    - Replace RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET with your credentials or set ENV vars.
*/

const PORT = 3000;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_SXqOW3Iy6obVwz';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'Fc46sO4HIcm6StozWUB5LVfi';

function serveFile(res, path, contentType) {
    fs.readFile(path, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
        } else {
            res.writeHead(200, {'Content-Type': contentType});
            res.end(data);
        }
    });
}

function parseJsonBody(req, cb) {
    let body = '';
    req.on('data', (chunk) => body += chunk);
    req.on('end', () => {
        try { cb(JSON.parse(body)); }
        catch (e) { cb({}); }
    });
}

function createRazorpayOrder(amount, receipt) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            amount: amount,
            currency: 'INR',
            receipt: receipt,
            payment_capture: 1
        });

        const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

        const options = {
            hostname: 'api.razorpay.com',
            path: '/v1/orders',
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const razorReq = https.request(options, (razorRes) => {
            let responseData = '';
            razorRes.on('data', (chunk) => responseData += chunk);
            razorRes.on('end', () => {
                if (razorRes.statusCode >= 200 && razorRes.statusCode < 300) {
                    try { resolve(JSON.parse(responseData)); }
                    catch (err) { reject(new Error('Invalid JSON from Razorpay: ' + err.message)); }
                } else {
                    reject(new Error(`Razorpay HTTP ${razorRes.statusCode}: ${responseData}`));
                }
            });
        });

        razorReq.on('error', reject);
        razorReq.write(data);
        razorReq.end();
    });
}

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && (req.url === '/' || req.url === '/registration.html')) {
        serveFile(res, './registration.html', 'text/html');
        return;
    }

    if (req.method === 'POST' && req.url === '/create-order') {
        parseJsonBody(req, async (body) => {
            const amount = Number(body.amount || 10000);
            const receipt = `infinty_${Date.now()}`;
            try {
                const order = await createRazorpayOrder(amount, receipt);
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(order));
            } catch (err) {
                res.writeHead(500, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({error: err.message}));
            }
        });
        return;
    }

    if (req.method === 'POST' && req.url === '/razorpay-webhook') {
        let raw = '';
        req.on('data', (chunk) => raw += chunk);
        req.on('end', () => {
            const signature = req.headers['x-razorpay-signature'];
            const expectedSig = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET).update(raw).digest('hex');
            if (signature !== expectedSig) {
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({status: 'invalid-signature'}));
                return;
            }
            const payload = JSON.parse(raw);
            if (payload.event === 'payment.captured') {
                console.log('Webhook captured:', payload.payload.payment.entity);
                // TODO store in database
            }
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({status: 'ok'}));
        });
        return;
    }

    res.writeHead(404);
    res.end('Not found');
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
