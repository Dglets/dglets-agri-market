/**
 * DG-LETS Agri Market — Google Apps Script Form Handler
 * -------------------------------------------------------
 * SETUP INSTRUCTIONS:
 * 1. Go to sheets.google.com — create a new spreadsheet
 * 2. Name it: DG-LETS Early Access Signups
 * 3. Add these headers in Row 1:
 *    A1: Timestamp  B1: Full Name  C1: Email  D1: Phone
 *    E1: Role       F1: State      G1: LGA    H1: Source
 * 4. Click Extensions → Apps Script
 * 5. Delete all existing code, paste this entire file
 * 6. Click Save → name project "DG-LETS Form Handler"
 * 7. Click Deploy → New deployment
 * 8. Gear icon → Web app
 * 9. Execute as: Me | Who has access: Anyone
 * 10. Click Deploy → Authorize → Copy the Web App URL
 * 11. Paste the URL into app.js at: const SHEET_URL = '...'
 * -------------------------------------------------------
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data  = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date(),                        // Timestamp
      data.name   || '',                 // Full Name
      data.email  || '',                 // Email
      data.phone  || '',                 // Phone
      data.role   || '',                 // Role
      data.state  || '',                 // State
      data.lga    || '',                 // LGA
      data.source || 'early-access-form' // Source
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/* Optional: test this function manually inside Apps Script editor */
function testSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.appendRow([
    new Date(),
    'Test User',
    'test@example.com',
    '08012345678',
    'farmer',
    'Kaduna',
    'Chikun',
    'test'
  ]);
  Logger.log('Test row added successfully');
}
