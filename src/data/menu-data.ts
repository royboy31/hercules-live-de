/**
 * Shared menu data - fetched ONCE at build time and cached
 * This prevents Header, MobileMenu, and StickyHeader from each making separate API calls
 */

const MENU_API_URL = 'https://hercules-merchandise.de/wp-json/hercules/v1/main-header-menu';
const iconBaseUrl = 'https://hercules-merchandise.de/wp-content/uploads/hercules-menu-icons/';

export interface MenuItem {
  label: string;
  href: string;
  icon_url: string;
}

export interface MenuData {
  sportarten: MenuItem[];
  produkte: MenuItem[];
  themen: MenuItem[];
  directLinks: { label: string; href: string }[];
}

// Fallback data (used if API fails)
const fallbackData: MenuData = {
  sportarten: [
    { label: 'Fußball', href: '/kollektionen/fussball/', icon_url: iconBaseUrl + 'Football.svg' },
    { label: 'Rugby', href: '/kollektionen/rugby/', icon_url: iconBaseUrl + 'Rugby-1.svg' },
    { label: 'Basketball', href: '/kollektionen/basketball/', icon_url: iconBaseUrl + 'Basketball-1.svg' },
    { label: 'Laufen', href: '/kollektionen/laufen/', icon_url: iconBaseUrl + 'running-1.svg' },
    { label: 'Feldhockey', href: '/kollektionen/feldhockey/', icon_url: iconBaseUrl + 'field-hockey-1.svg' },
    { label: 'Volleyball', href: '/kollektionen/volleyball/', icon_url: iconBaseUrl + 'volleyball-1.svg' },
    { label: 'Handball', href: '/kollektionen/handball/', icon_url: iconBaseUrl + 'handball-1.svg' },
    { label: 'Radfahren', href: '/kollektionen/radfahren/', icon_url: iconBaseUrl + 'cycling-1.svg' },
    { label: 'Fitness', href: '/kollektionen/fitness/', icon_url: iconBaseUrl + 'fitness-1.svg' },
    { label: 'Golf', href: '/kollektionen/golf/', icon_url: iconBaseUrl + 'golf-1.svg' },
    { label: 'eSports', href: '/kollektionen/esport/', icon_url: iconBaseUrl + 'esport-1.svg' },
  ],
  produkte: [
    { label: 'Sportbekleidung', href: '/kollektionen/personalisierte-sportbekleidung/', icon_url: iconBaseUrl + 'teamwear-1.svg' },
    { label: 'Schals', href: '/kollektionen/personalisierte-fanschals/', icon_url: iconBaseUrl + 'scarves-1.svg' },
    { label: 'Mützen', href: '/kollektionen/personalisierte-mutzen/', icon_url: iconBaseUrl + 'beanies-3.svg' },
    { label: 'Kopfbedeckung', href: '/kollektionen/kopfbedeckung/', icon_url: iconBaseUrl + 'cap-1.svg' },
    { label: 'Wimpel', href: '/kollektionen/personalisierte-wimpel/', icon_url: iconBaseUrl + 'pennants-3.svg' },
    { label: 'Handtücher', href: '/kollektionen/handtucher/', icon_url: iconBaseUrl + 'towelst-1.svg' },
    { label: 'Flaggen', href: '/kollektionen/flaggen/', icon_url: iconBaseUrl + 'flags-1.svg' },
    { label: 'Schuhwerk', href: '/kollektionen/schuhwerk/', icon_url: iconBaseUrl + 'footwear-1.svg' },
    { label: 'Taschen', href: '/kollektionen/taschen/', icon_url: iconBaseUrl + 'sportsbag-1.svg' },
    { label: 'Textilien', href: '/kollektionen/personalisierte-textilien/', icon_url: iconBaseUrl + 'textile-1.svg' },
    { label: 'Trinkflaschen', href: '/kollektionen/trinkflaschen/', icon_url: iconBaseUrl + 'drinkware-1.svg' },
    { label: 'Bälle', href: '/kollektionen/balle/', icon_url: iconBaseUrl + 'balls-1.svg' },
    { label: 'Zubehör', href: '/kollektionen/zubehor/', icon_url: iconBaseUrl + 'accessories-1.svg' },
  ],
  themen: [
    { label: 'Sommer', href: '/kollektionen/sommer/', icon_url: iconBaseUrl + 'summer-1.svg' },
    { label: 'Winter', href: '/kollektionen/winter/', icon_url: iconBaseUrl + 'winter-1.svg' },
    { label: 'Nachhaltigkeit', href: '/kollektionen/nachhaltigkeit/', icon_url: iconBaseUrl + 'sustainable-2.svg' },
    { label: 'Hergestellt in Europa', href: '/kollektionen/hergestellt-in-europa/', icon_url: iconBaseUrl + 'made-in-europe-1.svg' },
    { label: 'Mode', href: '/kollektionen/mode/', icon_url: iconBaseUrl + 'fashion-1.svg' },
    { label: 'Schulanfang', href: '/kollektionen/schulanfang/', icon_url: iconBaseUrl + 'back-to-school-1.svg' },
    { label: 'Tifo', href: '/kollektionen/tifo/', icon_url: iconBaseUrl + 'tifo-1.svg' },
    { label: 'Weihnachten', href: '/kollektionen/weihnachten/', icon_url: iconBaseUrl + 'christmas-1.svg' },
    { label: 'Kleine Preise', href: '/kollektionen/kleine-preise/', icon_url: iconBaseUrl + 'smallprices.svg' },
    { label: 'Geschäft', href: '/kollektionen/business/', icon_url: iconBaseUrl + 'business.svg' },
    { label: 'Werbegeschenke', href: '/kollektionen/werbegeschenke/', icon_url: iconBaseUrl + 'giive-aways.svg' },
    { label: 'Kinder', href: '/kollektionen/kinder/', icon_url: iconBaseUrl + 'kids.svg' },
  ],
  directLinks: [
    { label: 'Sportbekleidung', href: '/kollektionen/personalisierte-sportbekleidung/' },
    { label: 'Schals', href: '/kollektionen/personalisierte-fanschals/' },
    { label: 'Kopfbedeckung', href: '/kollektionen/kopfbedeckung/' },
    { label: 'Mützen', href: '/kollektionen/personalisierte-mutzen/' },
  ],
};

// Cache the menu data - only fetch once per build
let cachedMenuData: MenuData | null = null;

export async function getMenuData(): Promise<MenuData> {
  // Return cached data if available
  if (cachedMenuData) {
    return cachedMenuData;
  }

  try {
    const response = await fetch(MENU_API_URL);
    if (response.ok) {
      const data = await response.json();

      cachedMenuData = {
        sportarten: data.dropdowns?.sportarten?.map((item: any) => ({
          label: item.title,
          href: item.url,
          icon_url: item.icon_url || ''
        })) || fallbackData.sportarten,

        produkte: data.dropdowns?.produkte?.map((item: any) => ({
          label: item.title,
          href: item.url,
          icon_url: item.icon_url || ''
        })) || fallbackData.produkte,

        themen: data.dropdowns?.themen?.map((item: any) => ({
          label: item.title,
          href: item.url,
          icon_url: item.icon_url || ''
        })) || fallbackData.themen,

        directLinks: data.directLinks?.map((item: any) => ({
          label: item.label,
          href: item.href
        })) || fallbackData.directLinks,
      };

      return cachedMenuData;
    }
  } catch (error) {
    console.warn('Failed to fetch menu from API, using fallback:', error);
  }

  cachedMenuData = fallbackData;
  return cachedMenuData;
}
