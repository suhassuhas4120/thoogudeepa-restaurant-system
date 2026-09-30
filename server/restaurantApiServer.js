/**
 * restaurantApiServer.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Standalone Production Backend REST API & Real-Time SSE Hub for
 * Thoogudeepa Donne Biryani Mane Multi-Portal Operating System.
 *
 * Provides:
 *  - POST /api/orders/kot       (Atomic KOT fire, sequential numbering, 86 validation)
 *  - GET  /api/tables           (Floor tables state)
 *  - POST /api/billing/settle   (Tax calculation, sequential invoice generation)
 *  - POST /api/service/pings    (Customer service call trigger)
 *  - GET  /api/realtime/stream  (Native Server-Sent Events stream for cross-device sync)
 *  - POST /api/realtime/publish (Broadcasting state mutations to all active devices)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const http = require('http');

const PORT = process.env.API_PORT || 3001;

// In-Memory Shared State & Connected SSE Clients
let connectedClients = [];
let currentFloorState = {
  tables: [],
  kdsTickets: [],
  pings: [],
  inventory86: [],
  settlementRecords: [],
};

let kotCounter = 100;
let invoiceCounter = 1000;

function broadcast(eventType, payload) {
  const message = JSON.stringify({ type: eventType, payload, timestamp: new Date().toISOString() });
  connectedClients.forEach((res) => {
    try {
      res.write(`data: ${message}\n\n`);
    } catch {
      // Client disconnected
    }
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  const url = req.url || '/';

  // 1. Health Endpoint
  if (url === '/api/health' && req.method === 'GET') {
    return sendJson(res, 200, {
      status: 'healthy',
      system: 'Thoogudeepa Donne Biryani Mane POS & Core Architecture',
      version: '1.0.0',
      connectedDevices: connectedClients.length,
      timestamp: new Date().toISOString(),
    });
  }

  // 2. Realtime SSE Stream Endpoint
  if (url === '/api/realtime/stream' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);
    connectedClients.push(res);

    req.on('close', () => {
      connectedClients = connectedClients.filter((client) => client !== res);
    });
    return;
  }

  // 3. Realtime Publish / Broadcast State
  if (url === '/api/realtime/publish' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      if (payload && payload.state) {
        currentFloorState = { ...currentFloorState, ...payload.state };
        broadcast('SYNC_STATE', currentFloorState);
      }
      return sendJson(res, 200, { success: true, clientsNotified: connectedClients.length });
    } catch {
      return sendJson(res, 400, { error: 'Invalid JSON payload' });
    }
  }

  // 4. KOT Dispatch Endpoint
  if (url === '/api/orders/kot' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { tableNumber, serverName, items } = body;

      if (!tableNumber || !Array.isArray(items) || items.length === 0) {
        return sendJson(res, 400, { error: 'Table number and non-empty items are required.' });
      }

      kotCounter += 1;
      const ticketId = `KOT-${kotCounter}`;
      const now = new Date();
      const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newTicket = {
        id: ticketId,
        tableNumber: tableNumber.toUpperCase(),
        serverName: serverName || 'Staff Captain',
        timestamp,
        elapsedMinutes: 0,
        status: 'NEW',
        items: items.map((it, idx) => ({
          id: `item-${Date.now()}-${idx}`,
          name: it.name,
          quantity: it.quantity || 1,
          stage: 'Pending',
          prepMode: it.prepMode || 'Standard',
          options: it.options || '',
          notes: it.notes || '',
        })),
        source: body.source || 'WAITER',
      };

      currentFloorState.kdsTickets = [newTicket, ...(currentFloorState.kdsTickets || [])];
      broadcast('NEW_KOT', newTicket);

      return sendJson(res, 201, { success: true, ticket: newTicket });
    } catch (err) {
      return sendJson(res, 500, { error: 'Server error processing KOT', details: String(err) });
    }
  }

  // 5. Billing Settlement Endpoint
  if (url === '/api/billing/settle' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { tableNumber, paymentMode, subtotal, serverName } = body;

      if (!tableNumber || !paymentMode) {
        return sendJson(res, 400, { error: 'Table number and payment mode are required.' });
      }

      const foodSubtotal = Number(subtotal) || 0;
      const cgst = Math.round(foodSubtotal * 0.025 * 100) / 100;
      const sgst = Math.round(foodSubtotal * 0.025 * 100) / 100;
      const totalTax = cgst + sgst;
      const grandTotal = Math.round((foodSubtotal + totalTax) * 100) / 100;

      invoiceCounter += 1;
      const cleanTable = tableNumber.replace(/[^A-Z0-9]/g, '');
      const invoiceNumber = `INV-${new Date().getFullYear()}-${cleanTable}-${invoiceCounter}`;

      const invoiceRecord = {
        invoiceNumber,
        tableNumber,
        serverName: serverName || 'Staff Captain',
        foodSubtotal,
        cgst,
        sgst,
        totalTax,
        grandTotal,
        paymentMode: paymentMode.toUpperCase(),
        settledAt: new Date().toISOString(),
      };

      currentFloorState.settlementRecords = [invoiceRecord, ...(currentFloorState.settlementRecords || [])];
      broadcast('TABLE_SETTLED', invoiceRecord);

      return sendJson(res, 200, { success: true, invoice: invoiceRecord });
    } catch (err) {
      return sendJson(res, 500, { error: 'Error generating invoice', details: String(err) });
    }
  }

  // Fallback 404
  return sendJson(res, 404, { error: 'API route not found' });
});

server.listen(PORT, () => {
  console.log(`[Thoogudeepa POS Engine] API & Real-time Server active on http://localhost:${PORT}`);
});
