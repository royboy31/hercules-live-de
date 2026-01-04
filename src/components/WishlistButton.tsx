import { useState, useEffect, useCallback } from 'react';

interface WishlistButtonProps {
  productId: number;
  className?: string;
  size?: number;
}

const WISHLIST_CACHE_KEY = 'hercules_wishlist';
const WISHLIST_CACHE_DURATION = 30000; // 30 seconds

// Use the same domain when accessed through Edge Router
const getApiBaseUrl = () => {
  if (typeof window === 'undefined') return '';

  const hostname = window.location.hostname;

  // If accessed through Edge Router or production domain, use relative URL for cookies
  if (
    hostname.includes('hercules-edge-router') ||
    hostname.includes('hercules-merchandise.de') ||
    hostname === 'localhost'
  ) {
    return '';
  }

  // For direct Cloudflare Pages access, use staging URL
  return 'https://staging.hercules-merchandise.de';
};

// Global wishlist state to avoid multiple API calls
let globalWishlistIds: number[] = [];
let globalWishlistFetched = false;
let globalWishlistFetchPromise: Promise<number[]> | null = null;

export default function WishlistButton({ productId, className = '', size = 20 }: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  // Fetch wishlist from API or cache
  const fetchWishlist = useCallback(async (): Promise<number[]> => {
    // If already fetching, wait for that promise
    if (globalWishlistFetchPromise) {
      return globalWishlistFetchPromise;
    }

    // Check cache first
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(WISHLIST_CACHE_KEY);
      if (cached) {
        try {
          const { ids, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < WISHLIST_CACHE_DURATION) {
            globalWishlistIds = ids;
            globalWishlistFetched = true;
            return ids;
          }
        } catch (e) {
          // Invalid cache, continue to fetch
        }
      }
    }

    // Fetch from API
    globalWishlistFetchPromise = (async () => {
      try {
        const baseUrl = getApiBaseUrl();
        const response = await fetch(`${baseUrl}/wp-json/hercules/v1/wishlist`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const ids = data.product_ids || [];

        // Cache the result
        if (typeof window !== 'undefined') {
          localStorage.setItem(WISHLIST_CACHE_KEY, JSON.stringify({
            ids,
            timestamp: Date.now(),
          }));
        }

        globalWishlistIds = ids;
        globalWishlistFetched = true;
        return ids;
      } catch (err) {
        console.error('Failed to fetch wishlist:', err);
        return [];
      } finally {
        globalWishlistFetchPromise = null;
      }
    })();

    return globalWishlistFetchPromise;
  }, []);

  // Check if this product is in wishlist
  useEffect(() => {
    const checkWishlist = async () => {
      const ids = await fetchWishlist();
      setIsInWishlist(ids.includes(productId));
      setLoading(false);
    };

    checkWishlist();
  }, [productId, fetchWishlist]);

  // Toggle wishlist state
  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (toggling) return;
    setToggling(true);

    try {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/wp-json/hercules/v1/wishlist/toggle`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ product_id: productId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setIsInWishlist(data.in_wishlist);

        // Update global state and cache
        if (data.in_wishlist) {
          if (!globalWishlistIds.includes(productId)) {
            globalWishlistIds.push(productId);
          }
        } else {
          globalWishlistIds = globalWishlistIds.filter(id => id !== productId);
        }

        // Update cache
        if (typeof window !== 'undefined') {
          localStorage.setItem(WISHLIST_CACHE_KEY, JSON.stringify({
            ids: globalWishlistIds,
            timestamp: Date.now(),
          }));
        }

        // Dispatch custom event for other wishlist buttons
        window.dispatchEvent(new CustomEvent('hercules:wishlist-updated', {
          detail: { productId, inWishlist: data.in_wishlist }
        }));
      }
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    } finally {
      setToggling(false);
    }
  };

  // Listen for wishlist updates from other buttons
  useEffect(() => {
    const handleWishlistUpdate = (e: CustomEvent) => {
      if (e.detail.productId === productId) {
        setIsInWishlist(e.detail.inWishlist);
      }
    };

    window.addEventListener('hercules:wishlist-updated', handleWishlistUpdate as EventListener);
    return () => {
      window.removeEventListener('hercules:wishlist-updated', handleWishlistUpdate as EventListener);
    };
  }, [productId]);

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: `${size + 16}px`,
    height: `${size + 16}px`,
    background: 'white',
    border: '1px solid #dcdcdc',
    borderRadius: '50%',
    cursor: toggling ? 'wait' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: loading ? 0.5 : 1,
    padding: 0,
    position: 'relative',
  };

  const heartFilledPath = "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";
  const heartOutlinePath = "M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z";

  return (
    <button
      onClick={toggleWishlist}
      className={`wishlist-button ${isInWishlist ? 'in-wishlist' : ''} ${className}`}
      style={buttonStyle}
      disabled={loading || toggling}
      aria-label={isInWishlist ? 'Von Wunschliste entfernen' : 'Zur Wunschliste hinzufügen'}
      title={isInWishlist ? 'Von Wunschliste entfernen' : 'Zur Wunschliste hinzufügen'}
    >
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        style={{ transition: 'all 0.2s ease' }}
      >
        <path
          d={isInWishlist ? heartFilledPath : heartOutlinePath}
          fill={isInWishlist ? '#e91e63' : 'none'}
          stroke={isInWishlist ? '#e91e63' : '#666'}
          strokeWidth={isInWishlist ? 0 : 1.5}
        />
      </svg>
      {toggling && (
        <span style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.8)',
          borderRadius: '50%',
        }}>
          <span style={{
            width: '12px',
            height: '12px',
            border: '2px solid #ddd',
            borderTopColor: '#e91e63',
            borderRadius: '50%',
            animation: 'wishlist-spin 0.6s linear infinite',
          }}></span>
        </span>
      )}
      <style>{`
        @keyframes wishlist-spin {
          to { transform: rotate(360deg); }
        }
        .wishlist-button:hover {
          border-color: #e91e63 !important;
          transform: scale(1.1);
        }
        .wishlist-button:hover svg path {
          stroke: #e91e63;
        }
      `}</style>
    </button>
  );
}
