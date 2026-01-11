/**
 * Google Apps Script for Hercules Contact Form & Newsletter
 * Version: 2.0.0 - With R2 File URL Support
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com
 * 2. Create a new project (or open existing)
 * 3. Replace the code with this script
 * 4. Update SPREADSHEET_ID with your Google Sheet ID
 * 5. Click Deploy > New deployment (or Manage deployments > Edit)
 * 6. Select "Web app"
 * 7. Set "Execute as" to "Me"
 * 8. Set "Who has access" to "Anyone"
 * 9. Click Deploy and copy the Web App URL
 * 10. Set GOOGLE_APPS_SCRIPT_URL secret in Cloudflare Worker
 *
 * MIGRATION: Run migrateAllSheets() once from the script editor to add
 * the "Dateien" column to any existing sheets that are missing it.
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

// Your Google Spreadsheet ID (from the URL)
// Example: https://docs.google.com/spreadsheets/d/THIS_IS_YOUR_ID/edit
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

// Sheet names
const CONTACT_SHEET_NAME = 'Kontaktanfragen';
const NEWSLETTER_SHEET_NAME = 'Newsletter';
const QUANTITY_REQUEST_SHEET_NAME = 'Mengenanfragen';
const EXPRESS_DELIVERY_SHEET_NAME = 'Expresslieferung';

// Column configurations for each sheet type
const SHEET_CONFIGS = {
  contact: {
    name: CONTACT_SHEET_NAME,
    headers: [
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
    ],
    filesColumnIndex: 7 // 1-based index
  },
  newsletter: {
    name: NEWSLETTER_SHEET_NAME,
    headers: [
      'Datum',
      'Uhrzeit',
      'Email',
      'Quelle',
      'Zeitstempel'
    ],
    filesColumnIndex: null // No files column
  },
  quantity_request: {
    name: QUANTITY_REQUEST_SHEET_NAME,
    headers: [
      'Datum',
      'Uhrzeit',
      'Vorname',
      'Nachname',
      'Email',
      'Telefon',
      'Produkt ID',
      'Produktname',
      'Menge',
      'Stückpreis',
      'Attribute',
      'Addons',
      'Nachricht',
      'Dateien',
      'Seiten-URL',
      'Zeitstempel'
    ],
    filesColumnIndex: 14
  },
  expressdelivery: {
    name: EXPRESS_DELIVERY_SHEET_NAME,
    headers: [
      'Datum',
      'Uhrzeit',
      'Name',
      'Email',
      'Telefon',
      'Gewünschtes Lieferdatum',
      'Produkt ID',
      'Produktname',
      'Menge',
      'Stückpreis',
      'Attribute',
      'Addons',
      'Nachricht',
      'Dateien',
      'Seiten-URL',
      'Zeitstempel'
    ],
    filesColumnIndex: 14
  }
};

// ============================================================================
// MAIN REQUEST HANDLERS
// ============================================================================

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
      return handleNewsletter(spreadsheet, params);
    } else if (type === 'quantity_request' || type === 'quantity') {
      return handleQuantityRequest(spreadsheet, params);
    } else if (type === 'expressdelivery' || type === 'express_delivery') {
      return handleExpressDelivery(spreadsheet, params);
    } else {
      return handleContact(spreadsheet, params);
    }
  } catch (error) {
    console.error('Error handling request:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================================
// SHEET HELPERS
// ============================================================================

/**
 * Get or create a sheet with the correct headers
 */
function getOrCreateSheet(spreadsheet, config) {
  let sheet = spreadsheet.getSheetByName(config.name);

  if (!sheet) {
    // Create new sheet with headers
    sheet = spreadsheet.insertSheet(config.name);
    sheet.appendRow(config.headers);
    sheet.getRange(1, 1, 1, config.headers.length).setFontWeight('bold');

    // Set column widths for better readability
    if (config.name === QUANTITY_REQUEST_SHEET_NAME || config.name === EXPRESS_DELIVERY_SHEET_NAME) {
      sheet.setColumnWidth(8, 200);  // Produktname wider
      sheet.setColumnWidth(11, 200); // Attribute column wider
      sheet.setColumnWidth(12, 200); // Addons column wider
      sheet.setColumnWidth(13, 300); // Message column wider
      sheet.setColumnWidth(14, 400); // Dateien column wider for URLs
    }
    if (config.name === CONTACT_SHEET_NAME) {
      sheet.setColumnWidth(6, 300);  // Nachricht wider
      sheet.setColumnWidth(7, 400);  // Dateien wider for URLs
    }
  } else {
    // Check if "Dateien" column exists and add if missing
    ensureDateienColumn(sheet, config);
  }

  return sheet;
}

/**
 * Ensure the "Dateien" column exists in an existing sheet
 */
function ensureDateienColumn(sheet, config) {
  if (!config.filesColumnIndex) return; // Sheet doesn't need files column

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const hasDateienColumn = headers.includes('Dateien');

  if (!hasDateienColumn) {
    // Insert "Dateien" column at the correct position
    const insertPosition = config.filesColumnIndex;
    sheet.insertColumnBefore(insertPosition);
    sheet.getRange(1, insertPosition).setValue('Dateien').setFontWeight('bold');
    sheet.setColumnWidth(insertPosition, 400); // Wide enough for URLs

    console.log(`Added "Dateien" column to ${config.name} at position ${insertPosition}`);
  }
}

// ============================================================================
// FORM HANDLERS
// ============================================================================

function handleContact(spreadsheet, params) {
  const config = SHEET_CONFIGS.contact;
  const sheet = getOrCreateSheet(spreadsheet, config);

  // Add the contact data
  sheet.appendRow([
    params.date || new Date().toLocaleDateString('de-DE'),
    params.time || new Date().toLocaleTimeString('de-DE'),
    params.name || '',
    params.email || '',
    params.phone || '',
    params.message || '',
    params.files || '',  // File URLs from R2
    params.pageTitle || '',
    params.pageUrl || '',
    new Date().toISOString()
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ success: true, message: 'Data saved to Kontaktanfragen' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleNewsletter(spreadsheet, params) {
  const config = SHEET_CONFIGS.newsletter;
  const sheet = getOrCreateSheet(spreadsheet, config);

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
  const config = SHEET_CONFIGS.quantity_request;
  const sheet = getOrCreateSheet(spreadsheet, config);

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
    params.pricePerPiece || '',
    params.attributes || '',
    params.addons || '',
    params.message || '',
    params.files || '',  // File URLs from R2
    params.pageUrl || '',
    new Date().toISOString()
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ success: true, message: 'Data saved to Mengenanfragen' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleExpressDelivery(spreadsheet, params) {
  const config = SHEET_CONFIGS.expressdelivery;
  const sheet = getOrCreateSheet(spreadsheet, config);

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
    params.files || '',  // File URLs from R2
    params.pageUrl || '',
    new Date().toISOString()
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ success: true, message: 'Data saved to Expresslieferung' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================================
// MIGRATION FUNCTION - Run this once to add "Dateien" column to existing sheets
// ============================================================================

/**
 * Run this function manually from the script editor to migrate existing sheets.
 * Go to: Run > Run function > migrateAllSheets
 */
function migrateAllSheets() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);

  console.log('Starting migration...');

  // Migrate each sheet type
  for (const [type, config] of Object.entries(SHEET_CONFIGS)) {
    if (!config.filesColumnIndex) {
      console.log(`Skipping ${config.name} - no files column needed`);
      continue;
    }

    const sheet = spreadsheet.getSheetByName(config.name);
    if (sheet) {
      console.log(`Checking ${config.name}...`);
      ensureDateienColumn(sheet, config);
    } else {
      console.log(`Sheet ${config.name} does not exist yet - will be created on first submission`);
    }
  }

  console.log('Migration complete!');

  // Return summary
  return 'Migration complete. Check the execution log for details.';
}

/**
 * Test function to verify the script is working
 */
function testScript() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheets = spreadsheet.getSheets().map(s => s.getName());

  console.log('Spreadsheet ID:', SPREADSHEET_ID);
  console.log('Available sheets:', sheets.join(', '));

  return {
    spreadsheetId: SPREADSHEET_ID,
    sheets: sheets,
    expectedSheets: [CONTACT_SHEET_NAME, NEWSLETTER_SHEET_NAME, QUANTITY_REQUEST_SHEET_NAME, EXPRESS_DELIVERY_SHEET_NAME]
  };
}
