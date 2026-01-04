// Cloudflare Pages Function for Newsletter → Google Sheets sync

interface Env {
  GOOGLE_APPS_SCRIPT_URL?: string;
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
    const email = formData.get('email') as string || '';

    // Validate email
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    // Get current date/time in German format
    const now = new Date();
    const date = now.toLocaleDateString('de-DE');
    const time = now.toLocaleTimeString('de-DE');

    // Check if Google Apps Script URL is configured
    const googleAppsScriptUrl = env.GOOGLE_APPS_SCRIPT_URL;

    if (!googleAppsScriptUrl) {
      console.log('Google Apps Script not configured, logging newsletter subscription:', email);
      return new Response(
        JSON.stringify({ success: true, message: 'Newsletter subscription received (Google Sheets not configured)' }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    // Build URL with query parameters
    const params = new URLSearchParams({
      type: 'newsletter',  // This tells Google Apps Script which sheet to use
      email: email,
      date: date,
      time: time,
      source: request.headers.get('Referer') || 'Unknown'
    });

    const urlWithParams = `${googleAppsScriptUrl}?${params.toString()}`;

    // Send to Google Apps Script
    const response = await fetch(urlWithParams, {
      method: 'GET',
      redirect: 'follow'
    });

    const responseText = await response.text();

    // Log the response for debugging
    console.log('Google Apps Script response:', responseText);

    // Check if response indicates success
    if (responseText.includes('success') || responseText.includes('Data saved') || response.ok) {
      // Return JSON response for AJAX calls
      return new Response(
        JSON.stringify({ success: true, message: 'Newsletter subscription successful', debug: responseText }),
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
        JSON.stringify({ success: false, error: 'Script error', debug: responseText }),
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
    console.error('Newsletter form error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
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
