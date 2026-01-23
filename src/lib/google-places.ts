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
 * Alternative: Reviews will fall back to static data in google-reviews.json
 */

export interface GoogleReview {
  author: string;
  authorUrl?: string;
  profilePhoto?: string;
  rating: number;
  text: string;
  time: string;
  timestamp?: number;
}

export interface GooglePlaceData {
  rating: number;
  reviewCount: number;
  name: string;
  url: string;
  reviews: GoogleReview[];
}

// Import static reviews as fallback
import staticReviewsData from '../data/google-reviews.json';

// Default fallback values if API is not configured or fails
const FALLBACK_DATA: GooglePlaceData = {
  rating: 5.0,
  reviewCount: 56,
  name: 'Hercules Merchandise Deutschland',
  url: 'https://www.google.com/maps/place//data=!4m7!3m6!1s0x21d159209e369b9d:0xa126617f91835893!8m2!3d30.886403!4d-49.4022062!9m1!1b1',
  reviews: staticReviewsData.reviews as GoogleReview[]
};

// Place ID for Hercules Merchandise Deutschland
// To find your Place ID: https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
const PLACE_ID = 'ChIJtRY2nLY44EcRbp9kBiuZYKI';

// Cache the result during build to avoid multiple API calls
let cachedData: GooglePlaceData | null = null;

/**
 * Fetch Google Place details including rating, review count, and actual reviews
 * Supports multiple methods:
 * 1. Google Places API with GOOGLE_PLACES_API_KEY (fetches real reviews)
 * 2. Fallback to static reviews from google-reviews.json
 */
export async function getGooglePlaceData(): Promise<GooglePlaceData> {
  // Return cached data if available
  if (cachedData) {
    return cachedData;
  }

  // Try Google Places API
  const apiKey = import.meta.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    console.warn('[GooglePlaces] No API key configured. Using static reviews from google-reviews.json');
    console.warn('[GooglePlaces] To fetch live reviews, set GOOGLE_PLACES_API_KEY in .env');
    cachedData = FALLBACK_DATA;
    return cachedData;
  }

  try {
    // Fetch place details including reviews
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=name,rating,user_ratings_total,url,reviews&reviews_sort=newest&key=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Places API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Places API status: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    const result = data.result;

    // Transform Google's review format to our format
    const reviews: GoogleReview[] = (result.reviews || []).map((r: any) => ({
      author: r.author_name,
      authorUrl: r.author_url,
      profilePhoto: r.profile_photo_url,
      rating: r.rating,
      text: r.text,
      time: r.relative_time_description,
      timestamp: r.time
    }));

    cachedData = {
      rating: result.rating || FALLBACK_DATA.rating,
      reviewCount: result.user_ratings_total || FALLBACK_DATA.reviewCount,
      name: result.name || FALLBACK_DATA.name,
      url: result.url || FALLBACK_DATA.url,
      reviews: reviews.length > 0 ? reviews : FALLBACK_DATA.reviews
    };

    console.log(`[GooglePlaces] Fetched: ${cachedData.rating} stars from ${cachedData.reviewCount} reviews (${reviews.length} review texts)`);
    return cachedData;

  } catch (error) {
    console.error('[GooglePlaces] Failed to fetch place data:', error);
    console.warn('[GooglePlaces] Using static reviews from google-reviews.json');
    cachedData = FALLBACK_DATA;
    return cachedData;
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
