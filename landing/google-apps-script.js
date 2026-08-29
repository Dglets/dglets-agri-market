/* ============================================================
   DG-LETS Agri Market — Google Apps Script
   Form collector + instant email notifications

   IMPORTANT: This script must be opened from inside your
   Google Sheet (Extensions → Apps Script), NOT as a
   standalone script. That is what makes getActiveSpreadsheet()
   work correctly.
   ============================================================ */

var HEADERS = ['Timestamp','Full Name','Email','Phone','Role','State','LGA','Source','User Agent'];

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('No spreadsheet found. Open this script from inside your Google Sheet via Extensions → Apps Script.');
  return ss.getSheets()[0];
}

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

function sendNotification(data, rowNum, spreadsheetId) {
  try {
    var email   = Session.getActiveUser().getEmail();
    var subject = '🌱 New DG-LETS Signup — ' + (data.name || 'Unknown') + ' (' + (data.role || '—') + ')';
    var sheetUrl = 'https://docs.google.com/spreadsheets/d/' + spreadsheetId;

    var plain =
      'New early access signup on DG-LETS Agri Market.\n\n' +
      'Name:   ' + (data.name  || '—') + '\n' +
      'Email:  ' + (data.email || '—') + '\n' +
      'Phone:  ' + (data.phone || '—') + '\n' +
      'Role:   ' + (data.role  || '—') + '\n' +
      'State:  ' + (data.state || '—') + '\n' +
      'LGA:    ' + (data.lga   || '—') + '\n' +
      'Source: ' + (data.source|| '—') + '\n' +
      'Time:   ' + new Date().toLocaleString() + '\n\n' +
      'Row ' + rowNum + ' added.\nView sheet: ' + sheetUrl + '\n\n' +
      '— DG-LETS Agri Market';

    var html =
      '<div style="font-family:Arial,sans-serif;max-width:540px">' +
        '<div style="background:#1e5c3a;padding:20px 24px;border-radius:8px 8px 0 0">' +
          '<h2 style="color:white;margin:0;font-size:1rem">🌱 New DG-LETS Early Access Signup</h2>' +
        '</div>' +
        '<div style="background:#f9fafb;padding:20px 24px;border:1px solid #e5e7eb;border-top:none">' +
          '<table style="width:100%;font-size:.9rem;border-collapse:collapse">' +
            row('Name',   data.name)  +
            row('Email',  data.email) +
            row('Phone',  data.phone) +
            row('Role',   data.role, true) +
            row('State',  data.state) +
            row('LGA',    data.lga)   +
            row('Source', data.source)+
            row('Time',   new Date().toLocaleString()) +
          '</table>' +
          '<div style="margin-top:18px">' +
            '<a href="' + sheetUrl + '" style="background:#1e5c3a;color:white;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:700;font-size:.85rem">View All Signups →</a>' +
          '</div>' +
        '</div>' +
        '<div style="padding:12px 24px;font-size:.72rem;color:#9ca3af;text-align:center">' +
          'DG-LETS Agri Market · "From Farm to Phone. Market to the World."' +
        '</div>' +
      '</div>';

    MailApp.sendEmail({ to: email, subject: subject, body: plain, htmlBody: html });
    Logger.log('Email sent to: ' + email);
  } catch(err) {
    Logger.log('Email failed: ' + err.toString());
  }
}

function row(label, value, badge) {
  var val = value || '—';
  var cell = badge
    ? '<span style="background:#d8f3dc;color:#1e5c3a;padding:2px 10px;border-radius:50px;font-size:.78rem;font-weight:700">' + val + '</span>'
    : '<span style="color:#111827">' + val + '</span>';
  return '<tr><td style="padding:7px 0;color:#6b7280;width:80px">' + label + '</td><td style="padding:7px 0">' + cell + '</td></tr>';
}

function doPost(e) {
  try {
    var sheet = getSheet();
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
    if (lastRow % 2 === 0) sheet.getRange(lastRow, 1, 1, HEADERS.length).setBackground('#f0f7f1');
    sendNotification(data, lastRow, SpreadsheetApp.getActiveSpreadsheet().getId());
    return ContentService.createTextOutput(JSON.stringify({ result: 'success', row: lastRow })).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ result: 'error', message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var sheet = getSheet();
  ensureHeaders(sheet);
  var count = Math.max(0, sheet.getLastRow() - 1);
  return ContentService.createTextOutput(JSON.stringify({
    status: 'DG-LETS form collector is active',
    signups: count,
    sheet: SpreadsheetApp.getActiveSpreadsheet().getName(),
    time: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function testSubmission() {
  var sheet = getSheet();
  ensureHeaders(sheet);
  var data = { name:'Test Farmer', email:'test@dgletsagri.com', phone:'08012345678', role:'farmer', state:'Kaduna', lga:'Chikun', source:'manual-test', userAgent:'Apps Script Test' };
  sheet.appendRow([new Date(), data.name, data.email, data.phone, data.role, data.state, data.lga, data.source, data.userAgent]);
  sendNotification(data, sheet.getLastRow(), SpreadsheetApp.getActiveSpreadsheet().getId());
  Logger.log('Done. Check your sheet and inbox.');
}
