// Cloudflare Pages Function for Contact Form → Google Sheets sync
// Uses Google Apps Script Web App

interface Env {
  GOOGLE_APPS_SCRIPT_URL?: string;
}

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  time: string;
  pageTitle: string;
  pageUrl: string;
  files: string;
  formType: string;
  productName: string;
  productId: string;
  quantity: string;
  pricePerPiece: string;
  desiredDate: string;
  attributes: string;
  addons: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  try {
    // Parse form data
    const formData = await request.formData();

    // Collect file names
    const fileNames: string[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file_') && value instanceof File) {
        fileNames.push(value.name);
      }
    }

    // Check form type - handle quantity request form differently
    const formType = formData.get('formType') as string || 'contact';
    const firstName = formData.get('firstName') as string || '';
    const lastName = formData.get('lastName') as string || '';

    // Build name from firstName + lastName if provided (quantity form)
    const name = firstName && lastName
      ? `${firstName} ${lastName}`
      : formData.get('name') as string || '';

    const contactData: ContactFormData = {
      name: name,
      email: formData.get('email') as string || '',
      phone: formData.get('phone') as string || '',
      message: formData.get('message') as string || '',
      date: formData.get('date') as string || new Date().toLocaleDateString('de-DE'),
      time: formData.get('time') as string || new Date().toLocaleTimeString('de-DE'),
      pageTitle: formData.get('pageTitle') as string || 'Unknown',
      pageUrl: formData.get('pageUrl') as string || 'Unknown',
      files: fileNames.length > 0 ? fileNames.join(', ') : (formData.get('files') as string || ''),
      formType: formType,
      productName: formData.get('productName') as string || '',
      productId: formData.get('productId') as string || '',
      quantity: formData.get('quantity') as string || '',
      pricePerPiece: formData.get('pricePerPiece') as string || '',
      desiredDate: formData.get('desiredDate') as string || '',
      attributes: formData.get('attributes') as string || '',
      addons: formData.get('addons') as string || ''
    };

    // Validate required fields
    if (!contactData.name || !contactData.email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Name und Email sind erforderlich' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    // Check if Google Apps Script URL is configured
    const googleAppsScriptUrl = env.GOOGLE_APPS_SCRIPT_URL;

    if (!googleAppsScriptUrl) {
      console.log('Google Apps Script not configured, logging form submission:', contactData);
      return new Response(
        JSON.stringify({ success: true, message: 'Form received (Google Sheets not configured)' }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    // Build URL with query parameters (workaround for Google Apps Script POST issues)
    const params = new URLSearchParams({
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone,
      message: contactData.message,
      date: contactData.date,
      time: contactData.time,
      pageTitle: contactData.pageTitle,
      pageUrl: contactData.pageUrl,
      files: contactData.files,
      formType: contactData.formType,
      productName: contactData.productName,
      productId: contactData.productId,
      quantity: contactData.quantity,
      pricePerPiece: contactData.pricePerPiece,
      desiredDate: contactData.desiredDate,
      attributes: contactData.attributes,
      addons: contactData.addons
    });

    const urlWithParams = `${googleAppsScriptUrl}?${params.toString()}`;

    // Use GET request with parameters (more reliable with Google Apps Script)
    const response = await fetch(urlWithParams, {
      method: 'GET',
      redirect: 'follow'
    });

    const responseText = await response.text();

    // Check if response indicates success
    if (responseText.includes('success') || responseText.includes('Data saved') || response.ok) {
      return new Response(
        JSON.stringify({ success: true, message: 'Nachricht erfolgreich gesendet' }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    } else {
      console.error('Google Apps Script response:', responseText);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Google Apps Script error',
          details: responseText.substring(0, 500)
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }
  } catch (error) {
    console.error('Contact form error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
        debug: errorMessage
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
