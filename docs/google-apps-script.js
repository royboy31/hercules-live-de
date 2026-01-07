/**
 * Google Apps Script for Hercules Contact Form & Newsletter
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com
 * 2. Create a new project
 * 3. Replace the code with this script
 * 4. Click Deploy > New deployment
 * 5. Select "Web app"
 * 6. Set "Execute as" to "Me"
 * 7. Set "Who has access" to "Anyone"
 * 8. Click Deploy and copy the Web App URL
 * 9. Set GOOGLE_APPS_SCRIPT_URL secret in Cloudflare Pages with this URL
 */

// Your Google Spreadsheet ID (from the URL)
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

// Sheet names
const CONTACT_SHEET_NAME = 'Kontaktanfragen';
const NEWSLETTER_SHEET_NAME = 'Newsletter';
const QUANTITY_REQUEST_SHEET_NAME = 'Mengenanfragen';
const EXPRESS_DELIVERY_SHEET_NAME = 'Expresslieferung';

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    const params = e.parameter;
    // Check both 'type' (newsletter) and 'formType' (contact/quantity)
    const type = params.type || params.formType || 'contact';

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);

    if (type === 'newsletter') {
      // Handle newsletter subscription
      return handleNewsletter(spreadsheet, params);
    } else if (type === 'quantity_request') {
      // Handle quantity request form (with product info)
      return handleQuantityRequest(spreadsheet, params);
    } else if (type === 'expressdelivery') {
      // Handle express delivery request
      return handleExpressDelivery(spreadsheet, params);
    } else {
      // Handle contact form (default)
      return handleContact(spreadsheet, params);
    }
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleContact(spreadsheet, params) {
  // Get or create the contact sheet
  let sheet = spreadsheet.getSheetByName(CONTACT_SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(CONTACT_SHEET_NAME);
    // Add headers
    sheet.appendRow([
      'Datum',
      'Uhrzeit',
      'Name',
      'Email',
      'Telefon',
      'Nachricht',
      'Dateien',
      'Seite',
      'URL',
      'Zeitstempel'
    ]);
    // Format headers
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold');
  }

  // Add the contact data
  sheet.appendRow([
    params.date || new Date().toLocaleDateString('de-DE'),
    params.time || new Date().toLocaleTimeString('de-DE'),
    params.name || '',
    params.email || '',
    params.phone || '',
    params.message || '',
    params.files || '',
    params.pageTitle || '',
    params.pageUrl || '',
    new Date().toISOString()
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ success: true, message: 'Data saved to Kontaktanfragen' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleNewsletter(spreadsheet, params) {
  // Get or create the newsletter sheet
  let sheet = spreadsheet.getSheetByName(NEWSLETTER_SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(NEWSLETTER_SHEET_NAME);
    // Add headers
    sheet.appendRow([
      'Datum',
      'Uhrzeit',
      'Email',
      'Quelle',
      'Zeitstempel'
    ]);
    // Format headers
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
  }

  // Check for duplicate email
  const data = sheet.getDataRange().getValues();
  const emails = data.map(row => row[2]); // Email is in column 3 (index 2)

  if (emails.includes(params.email)) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Email already subscribed' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Add the newsletter subscription
  sheet.appendRow([
    params.date || new Date().toLocaleDateString('de-DE'),
    params.time || new Date().toLocaleTimeString('de-DE'),
    params.email || '',
    params.source || '',
    new Date().toISOString()
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ success: true, message: 'Data saved to Newsletter' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleQuantityRequest(spreadsheet, params) {
  // Get or create the quantity request sheet
  let sheet = spreadsheet.getSheetByName(QUANTITY_REQUEST_SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(QUANTITY_REQUEST_SHEET_NAME);
    // Add headers matching WordPress quantity request format
    sheet.appendRow([
      'Datum',
      'Uhrzeit',
      'Vorname',
      'Nachname',
      'Email',
      'Telefon',
      'Produkt ID',
      'Produktname',
      'Menge',
      'Attribute',
      'Addons',
      'Nachricht',
      'Dateien',
      'Seiten-URL',
      'Zeitstempel'
    ]);
    // Format headers
    sheet.getRange(1, 1, 1, 15).setFontWeight('bold');
    // Set column widths for better readability
    sheet.setColumnWidth(10, 200); // Attribute column wider
    sheet.setColumnWidth(11, 200); // Addons column wider
    sheet.setColumnWidth(12, 300); // Message column wider
  }

  // Parse name into first/last if provided as single field
  let firstName = params.firstName || '';
  let lastName = params.lastName || '';
  if (!firstName && !lastName && params.name) {
    const nameParts = params.name.split(' ');
    firstName = nameParts[0] || '';
    lastName = nameParts.slice(1).join(' ') || '';
  }

  // Add the quantity request data
  sheet.appendRow([
    params.date || new Date().toLocaleDateString('de-DE'),
    params.time || new Date().toLocaleTimeString('de-DE'),
    firstName,
    lastName,
    params.email || '',
    params.phone || '',
    params.productId || '',
    params.productName || '',
    params.quantity || '',
    params.attributes || '',
    params.addons || '',
    params.message || '',
    params.files || '',
    params.pageUrl || '',
    new Date().toISOString()
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ success: true, message: 'Data saved to Mengenanfragen' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleExpressDelivery(spreadsheet, params) {
  // Get or create the express delivery sheet
  let sheet = spreadsheet.getSheetByName(EXPRESS_DELIVERY_SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(EXPRESS_DELIVERY_SHEET_NAME);
    // Add headers matching express delivery form fields
    sheet.appendRow([
      'Datum',
      'Uhrzeit',
      'Name',
      'Email',
      'Telefon',
      'Gewünschtes Lieferdatum',
      'Produkt ID',
      'Produktname',
      'Menge',
      'Preis pro Stück',
      'Attribute',
      'Addons',
      'Nachricht',
      'Dateien',
      'Seiten-URL',
      'Zeitstempel'
    ]);
    // Format headers
    sheet.getRange(1, 1, 1, 16).setFontWeight('bold');
    // Set column widths for better readability
    sheet.setColumnWidth(6, 150);  // Gewünschtes Lieferdatum wider
    sheet.setColumnWidth(8, 200);  // Produktname wider
    sheet.setColumnWidth(11, 200); // Attribute column wider
    sheet.setColumnWidth(12, 200); // Addons column wider
    sheet.setColumnWidth(13, 300); // Message column wider
  }

  // Add the express delivery request data
  sheet.appendRow([
    params.date || new Date().toLocaleDateString('de-DE'),
    params.time || new Date().toLocaleTimeString('de-DE'),
    params.name || '',
    params.email || '',
    params.phone || '',
    params.desiredDate || '',
    params.productId || '',
    params.productName || '',
    params.quantity || '',
    params.pricePerPiece || '',
    params.attributes || '',
    params.addons || '',
    params.message || '',
    params.files || '',
    params.pageUrl || '',
    new Date().toISOString()
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ success: true, message: 'Data saved to Expresslieferung' }))
    .setMimeType(ContentService.MimeType.JSON);
}
