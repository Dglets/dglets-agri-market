var HEADERS = ['Timestamp','Full Name','Email','Phone','Role','State','LGA','Source','User Agent'];

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
    var last = sheet.getLastRow();
    if (last % 2 === 0) sheet.getRange(last, 1, 1, HEADERS.length).setBackground('#f0f7f1');
    return ContentService.createTextOutput(JSON.stringify({ result: 'success', row: last })).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ result: 'error', message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
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
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  ensureHeaders(sheet);
  sheet.appendRow([new Date(),'Test Farmer','test@dgletsagri.com','08012345678','farmer','Kaduna','Chikun','manual-test','Apps Script Test']);
  Logger.log('Test row added successfully');
}
