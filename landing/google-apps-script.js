var HEADERS = ['Timestamp','Full Name','Email','Phone','Role','State','LGA','Source','User Agent'];

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('No spreadsheet bound. Open via Extensions → Apps Script from inside your Google Sheet.');
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

function sendNotification(data, rowNum) {
  var to      = 'dgletsagritech5@gmail.com';
  var subject = '🌱 New DG-LETS Signup — ' + (data.name || 'Unknown') + ' (' + (data.role || '—') + ')';

  var body =
    'New early access signup on DG-LETS Agri Market.\n\n' +
    'Name:   ' + (data.name   || '—') + '\n' +
    'Email:  ' + (data.email  || '—') + '\n' +
    'Phone:  ' + (data.phone  || '—') + '\n' +
    'Role:   ' + (data.role   || '—') + '\n' +
    'State:  ' + (data.state  || '—') + '\n' +
    'LGA:    ' + (data.lga    || '—') + '\n' +
    'Source: ' + (data.source || '—') + '\n' +
    'Time:   ' + new Date().toLocaleString() + '\n' +
    'Row:    ' + rowNum + '\n\n' +
    '— DG-LETS Agri Market\n' +
    '"From Farm to Phone. Market to the World."';

  MailApp.sendEmail(to, subject, body);
  Logger.log('Notification sent to ' + to);
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
    sendNotification(data, lastRow);
    return ContentService.createTextOutput(JSON.stringify({ result: 'success', row: lastRow })).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    Logger.log('doPost error: ' + err.toString());
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
  var data = {
    name: 'Test Farmer', email: 'test@dgletsagri.com',
    phone: '08012345678', role: 'farmer',
    state: 'Kaduna', lga: 'Chikun',
    source: 'manual-test', userAgent: 'Apps Script Test'
  };
  sheet.appendRow([new Date(), data.name, data.email, data.phone, data.role, data.state, data.lga, data.source, data.userAgent]);
  sendNotification(data, sheet.getLastRow());
  Logger.log('Done — check sheet and inbox.');
}

function testEmailDirect() {
  MailApp.sendEmail('dgletsagritech5@gmail.com', 'DG-LETS Test Email', 'MailApp is working correctly.');
  Logger.log('SUCCESS — email sent');
}
