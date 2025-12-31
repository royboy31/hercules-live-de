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

    const contactData: ContactFormData = {
      name: formData.get('name') as string || '',
      email: formData.get('email') as string || '',
      phone: formData.get('phone') as string || '',
      message: formData.get('message') as string || '',
      date: formData.get('date') as string || new Date().toLocaleDateString('de-DE'),
      time: formData.get('time') as string || new Date().toLocaleTimeString('de-DE'),
      pageTitle: formData.get('pageTitle') as string || 'Unknown',
      pageUrl: formData.get('pageUrl') as string || 'Unknown',
      files: fileNames.join(', ')
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
      files: contactData.files
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
      throw new Error('Unexpected response from Google Apps Script');
    }
  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
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
