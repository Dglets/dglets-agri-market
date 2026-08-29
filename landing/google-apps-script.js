/**
 * DG-LETS Agri Market — Google Apps Script Form Handler
 * -------------------------------------------------------
 * SETUP: Only 4 steps needed:
 * 1. Go to sheets.google.com → create blank spreadsheet
 *    Name it: DG-LETS Early Access Signups
 * 2. Click Extensions → Apps Script
 * 3. Delete all code → paste this entire file → Save (Ctrl+S)
 *    Name the project: DG-LETS Form Handler
 * 4. Deploy → New deployment → gear icon → Web app
 *    Execute as: Me
 *    Who has access: Anyone
 *    → Deploy → Authorize → Copy the Web App URL
 *    → Paste it into app.js at: const SHEET_URL = '...'
 *
 * That's it. Headers are created automatically.
 * -------------------------------------------------------
 */

var HEADERS = [
  'Timestamp',
  'Full Name',
  'Email',
  'Phone',
  'Role',
  'State',
  'LGA',
  'Source',
  'User Agent',
];

/* Auto-create headers if sheet is empty */
function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    /* Style the header row */
    var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground('#1e5c3a');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setFontSize(11);
    sheet.setFrozenRows(1);
    /* Auto-resize columns */
    for (var i = 1; i <= HEADERS.length; i++) {
      sheet.setColumnWidth(i, 160);
    }
  }
}

/* Handle POST — form submissions */
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    ensureHeaders(sheet);

    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date(),
      data.name        || '',
      data.email       || '',
      data.phone       || '',
      data.role        || '',
      data.state       || '',
      data.lga         || '',
      data.source      || 'early-access-form',
      data.userAgent   || '',
    ]);

    /* Highlight new rows alternately for readability */
    var lastRow = sheet.getLastRow();
    if (lastRow % 2 === 0) {
      sheet.getRange(lastRow, 1, 1, HEADERS.length)
           .setBackground('#f0f7f1');
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success', row: lastRow }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/* Handle GET — health check so we can verify the URL works */
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  ensureHeaders(sheet);

  var count = Math.max(0, sheet.getLastRow() - 1); /* subtract header row */

  return ContentService
    .createTextOutput(JSON.stringify({
      status:  'DG-LETS form collector is active',
      signups: count,
      sheet:   SpreadsheetApp.getActiveSpreadsheet().getName(),
      time:    new Date().toISOString(),
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/* Run this manually inside Apps Script to verify everything works */
function testSubmission() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  ensureHeaders(sheet);
  sheet.appendRow([
    new Date(),
    'Test User',
    'test@dgletsagri.com',
    '08012345678',
    'farmer',
    'Kaduna',
    'Chikun',
    'test-run',
    'Apps Script Manual Test',
  ]);
  Logger.log('✅ Test row added. Check your spreadsheet.');
}
