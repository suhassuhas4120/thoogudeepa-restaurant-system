/**
 * Generate Restaurant Tabletop Edge QR Badges
 * Generates all 37 physical seat QR codes for:
 *  - 2-Seat Tables (2 tables: A-01, A-02) -> 4 QRs
 *  - 3-Seat Tables (3 tables: B-01, B-02, B-03) -> 9 QRs
 *  - 4-Seat Tables (3 tables: C-01, C-02, C-03) -> 12 QRs
 *  - 6-Seat Tables (2 tables: D-01, D-02) -> 12 QRs
 */

const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const BASE_URL = 'https://thoogudeepa-develop.surge.sh';

const TABLE_SPECS = [
  // 2-Seat Tables (2)
  { type: '2-Seat Table', tables: ['A-01', 'A-02'], capacity: 2 },
  // 3-Seat Tables (3)
  { type: '3-Seat Table', tables: ['B-01', 'B-02', 'B-03'], capacity: 3 },
  // 4-Seat Tables (3)
  { type: '4-Seat Table', tables: ['C-01', 'C-02', 'C-03'], capacity: 4 },
  // 6-Seat Tables (2)
  { type: '6-Seat Table', tables: ['D-01', 'D-02'], capacity: 6 },
];

async function generateAllBadges() {
  console.log('Generating QR badges for all requested restaurant tables...');
  
  const allBadges = [];

  for (const spec of TABLE_SPECS) {
    for (const tableNum of spec.tables) {
      for (let seat = 1; seat <= spec.capacity; seat++) {
        const url = `${BASE_URL}/?table=${tableNum}&seat=${seat}`;
        const qrDataUrl = await QRCode.toDataURL(url, {
          errorCorrectionLevel: 'M',
          margin: 2,
          scale: 8,
          color: {
            dark: '#1e293b',
            light: '#ffffff',
          },
        });

        allBadges.push({
          type: spec.type,
          table: tableNum,
          seat,
          url,
          qrDataUrl,
        });
      }
    }
  }

  console.log(`Generated ${allBadges.length} QR codes across 10 tables.`);

  // Generate self-contained HTML page
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thoogudeepa Donne Biryani - Table & Seat QR Badge Sheet</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=JetBrains+Mono:wght@700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      padding: 24px;
    }
    .header {
      max-width: 1200px;
      margin: 0 auto 28px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e2e8f0;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #ea580c, #c2410c);
      color: white;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      box-shadow: 0 10px 20px rgba(234,88,12,0.25);
    }
    .brand-title {
      font-size: 20px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.02em;
    }
    .brand-sub {
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
      margin-top: 2px;
    }
    .actions {
      display: flex;
      gap: 10px;
    }
    .btn {
      padding: 10px 18px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      border: 1px solid #cbd5e1;
      background: white;
      color: #334155;
      transition: all 0.15s ease;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-primary {
      background: #ea580c;
      color: white;
      border-color: #ea580c;
      box-shadow: 0 4px 12px rgba(234,88,12,0.3);
    }
    .btn:hover { transform: translateY(-1px); }
    .filters {
      max-width: 1200px;
      margin: 0 auto 24px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .filter-btn {
      padding: 8px 16px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      border: 1px solid #e2e8f0;
      background: white;
      color: #475569;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .filter-btn.active {
      background: #0f172a;
      color: white;
      border-color: #0f172a;
    }
    .grid {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 20px;
    }
    .badge-card {
      background: white;
      border-radius: 20px;
      border: 2px solid #e2e8f0;
      padding: 18px;
      display: flex;
      flex-col;
      flex-direction: column;
      align-items: center;
      text-align: center;
      box-shadow: 0 4px 12px rgba(15,23,42,0.04);
      transition: all 0.2s ease;
      position: relative;
      page-break-inside: avoid;
    }
    .badge-card:hover {
      border-color: #ea580c;
      box-shadow: 0 12px 24px rgba(234,88,12,0.12);
      transform: translateY(-2px);
    }
    .badge-top-tag {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #ea580c;
      background: #fff7ed;
      border: 1px solid #ffedd5;
      padding: 3px 8px;
      border-radius: 6px;
      margin-bottom: 8px;
    }
    .badge-table-title {
      font-size: 16px;
      font-weight: 900;
      color: #0f172a;
      font-family: 'JetBrains Mono', monospace;
      letter-spacing: -0.02em;
    }
    .badge-seat-pill {
      display: inline-block;
      margin: 6px 0 12px;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      background: #0f172a;
      color: white;
      letter-spacing: 0.05em;
    }
    .qr-container {
      background: #ffffff;
      padding: 10px;
      border-radius: 16px;
      border: 1px solid #f1f5f9;
      box-shadow: inset 0 2px 6px rgba(0,0,0,0.03);
      margin-bottom: 12px;
    }
    .qr-container img {
      display: block;
      width: 170px;
      height: 170px;
    }
    .scan-hint {
      font-size: 11px;
      font-weight: 700;
      color: #059669;
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 8px;
    }
    .badge-url {
      font-size: 10px;
      color: #64748b;
      word-break: break-all;
      background: #f8fafc;
      padding: 6px 8px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      text-decoration: none;
      font-family: 'JetBrains Mono', monospace;
      transition: all 0.15s ease;
    }
    .badge-url:hover {
      color: #ea580c;
      border-color: #cbd5e1;
    }
    @media print {
      body { background: white; padding: 0; }
      .header, .filters, .actions { display: none !important; }
      .grid {
        grid-template-columns: repeat(3, 1fr) !important;
        gap: 16px !important;
      }
      .badge-card {
        border: 2px solid #000 !important;
        box-shadow: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <div class="brand-icon">🍗</div>
      <div>
        <div class="brand-title">Thoogudeepa Donne Biryani Mane</div>
        <div class="brand-sub">Physical Tabletop Edge QR Badges (Multi-Seat QR Dining System)</div>
      </div>
    </div>
    <div class="actions">
      <button onclick="window.print()" class="btn btn-primary">🖨️ Print Badges</button>
      <a href="/" class="btn">📱 Open Customer App</a>
    </div>
  </div>

  <div class="filters">
    <button class="filter-btn active" onclick="filterType('ALL')">All Badges (${allBadges.length})</button>
    <button class="filter-btn" onclick="filterType('2-Seat Table')">2-Seat Tables (4 QRs)</button>
    <button class="filter-btn" onclick="filterType('3-Seat Table')">3-Seat Tables (9 QRs)</button>
    <button class="filter-btn" onclick="filterType('4-Seat Table')">4-Seat Tables (12 QRs)</button>
    <button class="filter-btn" onclick="filterType('6-Seat Table')">6-Seat Tables (12 QRs)</button>
  </div>

  <div class="grid" id="badgeGrid">
    ${allBadges.map((b) => `
      <div class="badge-card" data-type="${b.type}">
        <span class="badge-top-tag">${b.type}</span>
        <div class="badge-table-title">TABLE ${b.table}</div>
        <div class="badge-seat-pill">CHAIR / SEAT ${b.seat}</div>
        <div class="qr-container">
          <img src="${b.qrDataUrl}" alt="QR Table ${b.table} Seat ${b.seat}" />
        </div>
        <div class="scan-hint">📷 Scan Camera to Dine &amp; Order</div>
        <a href="${b.url}" target="_blank" class="badge-url">?table=${b.table}&seat=${b.seat}</a>
      </div>
    `).join('')}
  </div>

  <script>
    function filterType(type) {
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');

      const cards = document.querySelectorAll('.badge-card');
      cards.forEach(card => {
        if (type === 'ALL' || card.getAttribute('data-type') === type) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>
`;

  // Write to public/qr-sheet.html and out/qr-sheet.html
  const publicPath = path.join(__dirname, '..', 'public', 'qr-sheet.html');
  const outPath = path.join(__dirname, '..', 'out', 'qr-sheet.html');

  fs.writeFileSync(publicPath, html, 'utf8');
  console.log('Saved to public/qr-sheet.html');

  if (fs.existsSync(path.join(__dirname, '..', 'out'))) {
    fs.writeFileSync(outPath, html, 'utf8');
    console.log('Saved to out/qr-sheet.html');
  }

  return allBadges;
}

generateAllBadges().catch(console.error);
