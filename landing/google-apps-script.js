/* ============================================================
   DG-LETS Agri Market — Google Apps Script
   Form collector + instant email notifications
   ============================================================ */

/* ── Config ── */
var NOTIFY_EMAIL = Session.getActiveUser().getEmail(); /* sends to YOUR Google account email */
var SHEET_NAME   = 'DG-LETS Early Access Signups';
var HEADERS      = ['Timestamp','Full Name','Email','Phone','Role','State','LGA','Source','User Agent'];

/* ── Auto-create styled headers ── */
function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    var r = sheet.getRange(1, 1, 1, HEADERS.length);
    r.setBackground('#1e5c3a');
    r.setFontColor('#ffffff');
    r.setFontWeight('bold');
    sheet.setFrozenRows(1);
    for (var i = 1; i <= HEADERS.length; i++) sheet.setColumnWidth(i, 160);
  }
}

/* ── Send email notification ── */
function sendNotification(data, rowNum) {
  try {
    var subject = '🌱 New DG-LETS Signup — ' + (data.name || 'Unknown') + ' (' + (data.role || 'unknown role') + ')';

    var body =
      'A new early access signup was just submitted on DG-LETS Agri Market.\n\n' +
      '─────────────────────────────\n' +
      '  Name:    ' + (data.name  || '—') + '\n' +
      '  Email:   ' + (data.email || '—') + '\n' +
      '  Phone:   ' + (data.phone || '—') + '\n' +
      '  Role:    ' + (data.role  || '—') + '\n' +
      '  State:   ' + (data.state || '—') + '\n' +
      '  LGA:     ' + (data.lga   || '—') + '\n' +
      '  Source:  ' + (data.source || '—') + '\n' +
      '  Time:    ' + new Date().toLocaleString() + '\n' +
      '─────────────────────────────\n\n' +
      'Row ' + rowNum + ' added to your Google Sheet.\n\n' +
      'View all signups:\n' +
      'https://docs.google.com/spreadsheets/d/' + SpreadsheetApp.getActiveSpreadsheet().getId() + '\n\n' +
      '— DG-LETS Agri Market\n' +
      '"From Farm to Phone. Market to the World."';

    var htmlBody =
      '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">' +
      '<div style="background:#1e5c3a;padding:24px 28px;border-radius:10px 10px 0 0">' +
      '<h2 style="color:white;margin:0;font-size:1.1rem">🌱 New DG-LETS Early Access Signup</h2>' +
      '</div>' +
      '<div style="background:#f9fafb;padding:24px 28px;border:1px solid #e5e7eb;border-top:none">' +
      '<table style="width:100%;border-collapse:collapse;font-size:.92rem">' +
      '<tr><td style="padding:8px 0;color:#6b7280;width:100px">Name</td><td style="padding:8px 0;font-weight:600;color:#111827">'  + (data.name  || '—') + '</td></tr>' +
      '<tr><td style="padding:8px 0;color:#6b7280">Email</td><td style="padding:8px 0;font-weight:600;color:#111827">'             + (data.email || '—') + '</td></tr>' +
      '<tr><td style="padding:8px 0;color:#6b7280">Phone</td><td style="padding:8px 0;color:#111827">'                            + (data.phone || '—') + '</td></tr>' +
      '<tr><td style="padding:8px 0;color:#6b7280">Role</td><td style="padding:8px 0"><span style="background:#d8f3dc;color:#1e5c3a;padding:3px 10px;border-radius:50px;font-size:.8rem;font-weight:700">' + (data.role || '—') + '</span></td></tr>' +
      '<tr><td style="padding:8px 0;color:#6b7280">State</td><td style="padding:8px 0;color:#111827">'                            + (data.state || '—') + '</td></tr>' +
      '<tr><td style="padding:8px 0;color:#6b7280">LGA</td><td style="padding:8px 0;color:#111827">'                              + (data.lga   || '—') + '</td></tr>' +
      '<tr><td style="padding:8px 0;color:#6b7280">Source</td><td style="padding:8px 0;color:#111827">'                           + (data.source|| '—') + '</td></tr>' +
      '<tr><td style="padding:8px 0;color:#6b7280">Time</td><td style="padding:8px 0;color:#111827">'                             + new Date().toLocaleString() + '</td></tr>' +
      '</table>' +
      '<div style="margin-top:20px;padding-top:16px;border-top:1px solid #e5e7eb">' +
      '<a href="https://docs.google.com/spreadsheets/d/' + SpreadsheetApp.getActiveSpreadsheet().getId() + '" ' +
      'style="background:#1e5c3a;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:700;font-size:.88rem">View All Signups in Google Sheet →</a>' +
      '</div>' +
      '</div>' +
      '<div style="padding:14px 28px;font-size:.75rem;color:#9ca3af;text-align:center">' +
      'DG-LETS Agri Market · "From Farm to Phone. Market to the World."' +
      '</div>' +
      '</div>';

    MailApp.sendEmail({
      to:       NOTIFY_EMAIL,
      subject:  subject,
      body:     body,
      htmlBody: htmlBody
    });

  } catch(err) {
    Logger.log('Email notification failed: ' + err.toString());
  }
}

/* ── Handle POST — form submission ── */
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    ensureHeaders(sheet);
    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date(),
      data.name      || '',
      data.email     || '',
      data.phone     || '',
      data.role      || '',
      data.state     || '',
      data.lga       || '',
      data.source    || 'early-access-form',
      data.userAgent || ''
    ]);

    var lastRow = sheet.getLastRow();

    /* Alternate row colour */
    if (lastRow % 2 === 0) {
      sheet.getRange(lastRow, 1, 1, HEADERS.length).setBackground('#f0f7f1');
    }

    /* Send email notification */
    sendNotification(data, lastRow);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success', row: lastRow }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/* ── Handle GET — health check ── */
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  ensureHeaders(sheet);
  var count = Math.max(0, sheet.getLastRow() - 1);
  return ContentService
    .createTextOutput(JSON.stringify({
      status:  'DG-LETS form collector is active',
      signups: count,
      sheet:   SpreadsheetApp.getActiveSpreadsheet().getName(),
      time:    new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ── Manual test — run this inside Apps Script to verify email ── */
function testSubmission() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  ensureHeaders(sheet);
  var testData = {
    name: 'Test Farmer', email: 'test@dgletsagri.com',
    phone: '08012345678', role: 'farmer',
    state: 'Kaduna', lga: 'Chikun',
    source: 'manual-test', userAgent: 'Apps Script Test'
  };
  sheet.appendRow([new Date(), testData.name, testData.email, testData.phone,
    testData.role, testData.state, testData.lga, testData.source, testData.userAgent]);
  sendNotification(testData, sheet.getLastRow());
  Logger.log('✅ Test row added and notification email sent to: ' + NOTIFY_EMAIL);
}
