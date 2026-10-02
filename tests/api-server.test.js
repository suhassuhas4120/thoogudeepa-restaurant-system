/**
 * api-server.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * HTTP Integration Test for restaurantApiServer.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

const http = require('http');

console.log('🧪 [API SERVER TEST]: Verifying Standalone REST & SSE Server...\n');

// 1. Start the server on port 3002
process.env.API_PORT = '3002';
require('../server/restaurantApiServer.js');

function postJson(urlPath, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3002,
        path: urlPath,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getJson(urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:3002${urlPath}`, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
  });
}

async function runApiTests() {
  // Test 1: Health check
  const health = await getJson('/api/health');
  console.log('✔ GET /api/health returned:', health.statusCode, health.data.status);
  if (health.statusCode !== 200 || health.data.status !== 'healthy') {
    throw new Error('Health check failed');
  }

  // Test 2: Fire KOT
  const kot = await postJson('/api/orders/kot', {
    tableNumber: 'A-01',
    serverName: 'Captain Ramesh',
    items: [{ name: 'Special Chicken Donne Biryani', quantity: 2, prepMode: 'Standard' }],
  });
  console.log('✔ POST /api/orders/kot returned:', kot.statusCode, kot.data.ticket?.id);
  if (kot.statusCode !== 201 || !kot.data.ticket?.id.startsWith('KOT-')) {
    throw new Error('KOT creation failed');
  }

  // Test 3: Settle Bill
  const settle = await postJson('/api/billing/settle', {
    tableNumber: 'A-01',
    paymentMode: 'UPI',
    subtotal: 560,
    serverName: 'Captain Ramesh',
  });
  console.log('✔ POST /api/billing/settle returned:', settle.statusCode, settle.data.invoice?.invoiceNumber, 'Grand Total:', settle.data.invoice?.grandTotal);
  if (settle.statusCode !== 200 || !settle.data.invoice?.invoiceNumber) {
    throw new Error('Billing settlement failed');
  }

  console.log('\n🎉 ALL REST API ENDPOINTS VERIFIED AND RESPONDING 200/201 OK!\n');
  process.exit(0);
}

// Give server 500ms to bind, then run tests
setTimeout(runApiTests, 500);
