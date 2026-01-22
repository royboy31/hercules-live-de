/**
 * Google Places API utility for fetching review data at build time
 *
 * To use this, you need:
 * 1. A Google Cloud project with Places API enabled
 * 2. An API key with Places API access
 * 3. Set GOOGLE_PLACES_API_KEY in your .env file
 *
 * Free tier: $200/month credit (~11,700 Place Details requests)
 *
 * Alternative: Set GOOGLE_REVIEWS_RATING and GOOGLE_REVIEWS_COUNT
 * in your .env file to use static values without API calls
 */

export interface GooglePlaceData {
  rating: number;
  reviewCount: number;
  name: string;
  url: string;
}

// Default fallback values if API is not configured or fails
const FALLBACK_DATA: GooglePlaceData = {
  rating: 5.0,
  reviewCount: 56,
  name: 'Hercules Merchandising France',
  url: 'https://maps.app.goo.gl/ji5Rv488CH5KZc5p6'
};

// Place ID for Hercules Merchandising France
// To find your Place ID: https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
const PLACE_ID = 'ChIJnZs2nhVZFRIRk1iDkX9hJqE';

// Cache the result during build to avoid multiple API calls
let cachedData: GooglePlaceData | null = null;

/**
 * Fetch Google Place details including rating and review count
 * Supports multiple methods:
 * 1. Environment variables (GOOGLE_REVIEWS_RATING, GOOGLE_REVIEWS_COUNT) - no API needed
 * 2. Google Places API with GOOGLE_PLACES_API_KEY
 * 3. Fallback to default values
 */
export async function getGooglePlaceData(): Promise<GooglePlaceData> {
  // Return cached data if available
  if (cachedData) {
    return cachedData;
  }

  // Method 1: Check for static environment variables (no API needed)
  const envRating = import.meta.env.GOOGLE_REVIEWS_RATING;
  const envCount = import.meta.env.GOOGLE_REVIEWS_COUNT;

  if (envRating && envCount) {
    cachedData = {
      rating: parseFloat(envRating),
      reviewCount: parseInt(envCount, 10),
      name: FALLBACK_DATA.name,
      url: FALLBACK_DATA.url
    };
    console.log(`[GooglePlaces] Using env vars: ${cachedData.rating} stars from ${cachedData.reviewCount} reviews`);
    return cachedData;
  }

  // Method 2: Try Google Places API
  const apiKey = import.meta.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    console.warn('[GooglePlaces] No API key configured. Using fallback data.');
    console.warn('[GooglePlaces] Options to enable dynamic reviews:');
    console.warn('  1. Set GOOGLE_PLACES_API_KEY for API access');
    console.warn('  2. Set GOOGLE_REVIEWS_RATING and GOOGLE_REVIEWS_COUNT for static values');
    return FALLBACK_DATA;
  }

  try {
    // Use legacy Places API - more widely available
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=name,rating,user_ratings_total,url&key=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Places API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Places API status: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    const result = data.result;
    cachedData = {
      rating: result.rating || FALLBACK_DATA.rating,
      reviewCount: result.user_ratings_total || FALLBACK_DATA.reviewCount,
      name: result.name || FALLBACK_DATA.name,
      url: result.url || FALLBACK_DATA.url
    };

    console.log(`[GooglePlaces] Fetched: ${cachedData.rating} stars from ${cachedData.reviewCount} reviews`);
    return cachedData;

  } catch (error) {
    console.error('[GooglePlaces] Failed to fetch place data:', error);
    console.warn('[GooglePlaces] Using fallback data.');
    return FALLBACK_DATA;
  }
}

/**
 * Get the star rating as a display string (e.g., "4.9")
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1).replace('.', ','); // German format: 4,9
}

/**
 * Get the review count as a display string (e.g., "100+ Bewertungen")
 */
export function formatReviewCount(count: number): string {
  if (count >= 1000) {
    return `${Math.floor(count / 1000)}k+ Bewertungen`;
  }
  return `${count}+ Bewertungen`;
}
