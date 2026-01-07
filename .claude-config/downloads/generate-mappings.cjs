const fs = require('fs');
const path = require('path');

// Read all slugs
const deProducts = fs.readFileSync(path.join(__dirname, 'de/product-slugs.txt'), 'utf-8').split('\n').filter(Boolean);
const ukProducts = fs.readFileSync(path.join(__dirname, 'uk/product-slugs.txt'), 'utf-8').split('\n').filter(Boolean);
const frProducts = fs.readFileSync(path.join(__dirname, 'fr/product-slugs.txt'), 'utf-8').split('\n').filter(Boolean);

const deCategories = fs.readFileSync(path.join(__dirname, 'de/categories.txt'), 'utf-8').split('\n').filter(Boolean);
const ukCategories = fs.readFileSync(path.join(__dirname, 'uk/categories.txt'), 'utf-8').split('\n').filter(Boolean);
const frCategories = fs.readFileSync(path.join(__dirname, 'fr/categories.txt'), 'utf-8').split('\n').filter(Boolean);

// Category mappings (positional - they align!)
const categoryMappings = {};
for (let i = 0; i < deCategories.length; i++) {
  categoryMappings[deCategories[i]] = {
    de: deCategories[i],
    en: ukCategories[i] || deCategories[i],
    fr: frCategories[i] || deCategories[i]
  };
}

// Known product translations (manual mapping based on common patterns)
const knownMappings = {
  // Exact matches
  'baseball-cap': { de: 'baseball-cap', en: 'baseball-cap', fr: 'casquette-de-baseball' },

  // Handball
  'personalisiertes-handball-trikot': { de: 'personalisiertes-handball-trikot', en: 'custom-handball-shirt', fr: 'maillot-de-handball-personnalise' },

  // Caps
  'personalisierte-snapback-cap': { de: 'personalisierte-snapback-cap', en: 'customised-snapback-cap', fr: 'snapback' },
  'personalisierte-trucker-cap': { de: 'personalisierte-trucker-cap', en: 'customised-trucker-cap', fr: 'casquette-trucker-personnalisee' },
  'schlichte-standard-mutze': { de: 'schlichte-standard-mutze', en: 'cutom-basic-beanie-hats-with-embroidery', fr: 'bonnet-personnalise-broderie-basique' },
  'alaska-mutze': { de: 'alaska-mutze', en: 'custom-alaska-hat-with-embroidery', fr: 'bonnet-personnalise-broderie-alaska' },

  // Football/Retro
  'personalisiertes-retro-fussballtrikot': { de: 'personalisiertes-retro-fussballtrikot', en: 'custom-retro-football-shirt', fr: 'maillot-de-football-vintage-retro-personnalise' },
  'personalisiertes-fussballtrikot': { de: 'personalisiertes-fussballtrikot', en: 'custom-football-shirts', fr: 'maillot-de-football-personnalise' },
  'personalisierter-fussballschal': { de: 'personalisierter-fussballschal', en: 'custom-football-scarf', fr: 'echarpe-personnalisee-jacquard' },

  // Polo/Hoodie/Sweatshirt
  'bedrucktes-poloshirt': { de: 'bedrucktes-poloshirt', en: 'printed-poloshirt', fr: 'polo-imprime' },
  'bedruckter-hoodie': { de: 'bedruckter-hoodie', en: 'printed-hoodies', fr: 'hoodie-personnalise' },
  'bedrucktes-sweatshirt': { de: 'bedrucktes-sweatshirt', en: 'printed-sweatshirt', fr: 'sweat-personnalise' },
  'bedrucktes-tshirt': { de: 'bedrucktes-tshirt', en: 'printed-t-shirt', fr: 't-shirt-personnalise' },
  'massgeschneiderter-hoodie': { de: 'massgeschneiderter-hoodie', en: 'custom-made-hoodie', fr: 'hoodie-sur-mesure' },
  'massgeschneidetes-sweatshirt': { de: 'massgeschneidetes-sweatshirt', en: 'custom-made-sweatshirt', fr: 'sweat-sur-mesure' },
  'massgeschneidertes-poloshirt': { de: 'massgeschneidertes-poloshirt', en: 'custom-made-poloshirt', fr: 'polo-sur-mesure' },
  'massgeschneidertes-tshirt': { de: 'massgeschneidertes-tshirt', en: 'custom-made-t-shirt', fr: 't-shirt-sur-mesure' },

  // Other sports
  'personalisiertes-feldhockey-trikot': { de: 'personalisiertes-feldhockey-trikot', en: 'custom-field-hockey-shirt', fr: 'maillot-de-hockey-sur-gazon-personnalise' },
  'personalisiertes-volleyball-trikot': { de: 'personalisiertes-volleyball-trikot', en: 'custom-volleyball-shirt', fr: 'maillot-de-volley-ball-personnalise' },
  'personalisiertes-basketball-trikot': { de: 'personalisiertes-basketball-trikot', en: 'custom-basketball-shirts', fr: 'maillot-de-basket-personnalise' },
  'personalisierte-rugby-trikots': { de: 'personalisierte-rugby-trikots', en: 'custom-printed-rugby-shirts', fr: 'maillot-de-rugby-personnalise' },

  // Socks
  'klassische-socken': { de: 'klassische-socken', en: 'classic-socks', fr: 'chaussettes-classiques' },
  'sportsocken': { de: 'sportsocken', en: 'sports-socks', fr: 'chaussettes-de-sport' },
  'fussball-socken': { de: 'fussball-socken', en: 'football-socks', fr: 'chaussettes-de-football' },
  'knoechelsocken': { de: 'knoechelsocken', en: 'ankle-socks', fr: 'soquettes' },

  // Scarves
  'individuell-gewebter-schal': { de: 'individuell-gewebter-schal', en: 'custom-woven-scarf', fr: 'echarpe-personnalisee-tissee' },
  'personalisierter-fleece-schal': { de: 'personalisierter-fleece-schal', en: 'custom-fleece-scarf', fr: 'echarpe-personnalisee-polaire' },
  'individuell-bedruckter-fanschal': { de: 'individuell-bedruckter-fanschal', en: 'custom-printed-scarves', fr: 'echarpe-personnalisee-sublimee' },
  'personalisierter-business-schal': { de: 'personalisierter-business-schal', en: 'custom-business-scarves', fr: 'echarpe-personnalisee-business' },
  'personalisierter-jacquard-schal': { de: 'personalisierter-jacquard-schal', en: 'custom-jacquard-scarves', fr: 'echarpe-personnalisee-jacquard' },
  'personalisierter-blockstreifen-schal': { de: 'personalisierter-blockstreifen-schal', en: 'custom-rugby-scarves-with-embroidery', fr: 'echarpes-personnalisees-a-blocs-avec-broderie' },
  'personalisierter-retro-strickschal': { de: 'personalisierter-retro-strickschal', en: 'scarf-custom-retro', fr: 'echarpe-personnalisee-retro' },
  'personalisierter-rippstrick-schal': { de: 'personalisierter-rippstrick-schal', en: 'scarf-custom-ribbed', fr: 'echarpe-personnalisee-nervuree' },
  'personalisierter-premium-schal': { de: 'personalisierter-premium-schal', en: 'custom-premium-fashion-scarves', fr: 'echarpe-personnalisee-premium' },
  'personalisierter-autoschal': { de: 'personalisierter-autoschal', en: 'custom-car-scarves', fr: 'echarpes-personnalisee-voiture' },
  'personalisierter-schal-aus-recycelter-baumwolle': { de: 'personalisierter-schal-aus-recycelter-baumwolle', en: 'custom-recyled-cotton-scarves', fr: 'echarpe-personnalisee-coton-recycle' },
  'personalisierter-hd-deluxe-schal-mit-gewebten-aufnahern': { de: 'personalisierter-hd-deluxe-schal-mit-gewebten-aufnahern', en: 'custom-hd-deluxe-scarf-with-woven-badges', fr: 'echarpe-personnalisee-hd-deluxe-avec-badges' },
  'individuell-gestrickter-schlauchschal': { de: 'individuell-gestrickter-schlauchschal', en: 'custom-knitted-neckwarmers-and-snoods', fr: 'tour-de-cou-personnalise-1' },
  'personalisierter-3-in-1-schal': { de: 'personalisierter-3-in-1-schal', en: 'custom-printed-multiscarf', fr: 'cache-cou-personnalise-foot' },

  // Beanies
  'custom-football-beanie-hats': { de: 'custom-football-beanie-hats', en: 'custom-football-beanie-hats', fr: 'bonnets-personnalises' },
  'personalisierte-wintermutze': { de: 'personalisierte-wintermutze', en: 'custom-winter-beanie-hats', fr: 'bonnet-personnalise-broderie-hiver' },
  'personalisierte-wendemutze': { de: 'personalisierte-wendemutze', en: 'custom-reversible-beanie-hats', fr: 'bonnet-personnalise-broderie-reversible' },
  'personalisierte-vintage-mutze': { de: 'personalisierte-vintage-mutze', en: 'custom-vintage-beanie-hats', fr: 'bonnet-personnalise-broderie-vintage' },
  'personalisierte-business-mutze': { de: 'personalisierte-business-mutze', en: 'custom-business-beanie-hats', fr: 'bonnet-personnalise-broderie-business' },
  'personalisierte-zopfmuster-mutze': { de: 'personalisierte-zopfmuster-mutze', en: 'custom-cable-knitted-beanie-hats', fr: 'bonnet-personnalise-broderie-torsade' },
  'bedruckte-mutze': { de: 'bedruckte-mutze', en: 'custom-printed-beanies', fr: 'bonnet-imprime-sur-mesure' },

  // Running/Fitness
  'personalisiertes-laufshirt-2': { de: 'personalisiertes-laufshirt-2', en: 'custom-running-shirt', fr: 'singlet-running-personnalise' },
  'personalisiertes-laufshirt': { de: 'personalisiertes-laufshirt', en: 'custom-running-singlet', fr: 'maillot-running-personnalise' },
  'personalisiertes-fitness-singlet': { de: 'personalisiertes-fitness-singlet', en: 'custom-fitness-singlet', fr: 'singlet-fitness-personnalise' },
  'personalisiertes-fitness-top': { de: 'personalisiertes-fitness-top', en: 'custom-fitness-top', fr: 'brassiere-fitness-personnalisee' },
  'personalisierte-fitness-leggings': { de: 'personalisierte-fitness-leggings', en: 'custom-fitness-leggings', fr: 'leggings-de-fitness-personnalises' },

  // Accessories
  'personalisiertes-schlusselband': { de: 'personalisiertes-schlusselband', en: 'custom-lanyard', fr: 'tour-de-cou-personnalise' },
  'personalisiertes-kissen': { de: 'personalisiertes-kissen', en: 'custom-woven-or-printed-pillow', fr: 'coussin-brode-personnalise' },
  'personalisiertes-stadiumkissen': { de: 'personalisiertes-stadiumkissen', en: 'custom-printed-stadium-cushions', fr: 'coussin-de-stade-personnalise' },
  'personalisierter-fischerhut': { de: 'personalisierter-fischerhut', en: 'custom-made-bucket-hats', fr: 'bob-personnalise' },
  'personalisierte-radsportmutze': { de: 'personalisierte-radsportmutze', en: 'custom-cycling-cap', fr: 'casquette-de-cyclisme-personnalisee' },
  'personalisierte-cap': { de: 'personalisierte-cap', en: 'custom-made-baseball-caps', fr: 'casquette-personnalisee' },

  // Golf
  'personalisiertes-golf-poloshirt': { de: 'personalisiertes-golf-poloshirt', en: 'custom-golf-poloshirt', fr: 'polo-de-golf-personnalise' },

  // Weihnachten/Christmas
  'personalisierter-weihnachtspullover': { de: 'personalisierter-weihnachtspullover', en: 'custom-christmas-jumpers', fr: 'pull-de-noel-personnalise' },
  'personalisierte-weihnachtskugeln': { de: 'personalisierte-weihnachtskugeln', en: 'custom-printed-christmas-baubles', fr: 'boules-de-noel-personnalisees' },
  'winter-geschenkbox': { de: 'winter-geschenkbox', en: 'giftbox-winter', fr: 'coffret-cadeau-personnalise' },

  // Towels
  'personalisierte-handtucher': { de: 'personalisierte-handtucher', en: 'custom-jacquard-woven-towels', fr: 'serviette-personnalisee' },
  'jacquard-webhandtuch': { de: 'jacquard-webhandtuch', en: 'custom-sublimated-towels', fr: 'serviette-tissee-jacquard' },

  // Pennants
  'individuell-gedruckter-wimpel': { de: 'individuell-gedruckter-wimpel', en: 'custom-printed-pennants', fr: 'fanion-personnalise-imprime' },
  'personalisierter-grosswimpel': { de: 'personalisierter-grosswimpel', en: 'custom-large-pennant', fr: 'fanion-grand-format-personnalise-imprime' },

  // Flags
  'personalisierte-flagge': { de: 'personalisierte-flagge', en: 'custom-printed-flags', fr: 'drapeau-personnalise' },
  'handflaggen': { de: 'handflaggen', en: 'custom-printed-hand-flags-for-fans', fr: 'drapeaux-a-main' },
  'papier-handflaggen': { de: 'papier-handflaggen', en: 'paper-hand-flags', fr: 'drapeaux-a-main-en-papier' },

  // Bags
  'personalisierter-turnbeutel': { de: 'personalisierter-turnbeutel', en: 'custom-printed-drawstring-bags', fr: 'sac-de-sport-personnalises' },
  'sport-bag-customs': { de: 'sport-bag-customs', en: 'sport-bag-customs', fr: 'sac-de-sport-personnalisable' },
  'personalisierter-rucksack': { de: 'personalisierter-rucksack', en: 'backpack-custom', fr: 'sac-a-dos-personnalise' },

  // Drinkware
  'personalisierte-sport-trinkflasche': { de: 'personalisierte-sport-trinkflasche', en: 'custom-sports-water-bottles', fr: 'bidon-deau' },
  'personalisierte-tasse': { de: 'personalisierte-tasse', en: 'custom-printed-mugs', fr: 'tasse-personnalisee-football' },

  // Fan items
  'schaumstofffinger': { de: 'schaumstofffinger', en: 'custom-printed-giant-hand-for-fans', fr: 'main-geante' },
  'fanklapper': { de: 'fanklapper', en: 'custom-fan-hand-clappers', fr: 'clap-clap' },
  'klatschstangen': { de: 'klatschstangen', en: 'custom-printed-thundersticks', fr: 'clapsticks-gonflables' },
  'gesichtsfarbe': { de: 'gesichtsfarbe', en: 'custom-face-paints-for-fans', fr: 'stick-maquillage' },

  // Misc
  'personalisierte-badeschlappen': { de: 'personalisierte-badeschlappen', en: 'custom-club-slides-and-slippers', fr: 'claquettes-personnalisees-club' },
  'personalisierter-trainingsanzug': { de: 'personalisierter-trainingsanzug', en: 'custom-printed-tracksuits', fr: 'training-personnalise' },
  'personalisierte-trainer-jacke': { de: 'personalisierte-trainer-jacke', en: 'custom-printed-coach-jackets', fr: 'veste-de-coach' },
  'personalisierte-regenjacke': { de: 'personalisierte-regenjacke', en: 'custom-printed-rain-jackets', fr: 'veste-de-pluie-football' },
  'personalisiertes-aufwarmtrikot': { de: 'personalisiertes-aufwarmtrikot', en: 'jersey-entrainement-custom', fr: 'maillot-entrainement-personnalise' },
  'personalisiertes-mini-trikot': { de: 'personalisiertes-mini-trikot', en: 'custom-printed-mini-kits', fr: 'mini-equipement-personnalise' },
  'personalisierter-sport-schlusselanhanger': { de: 'personalisierter-sport-schlusselanhanger', en: 'custom-sports-keyring', fr: 'porte-cles-sport-personnalise' },
  'personalisierte-federmappe': { de: 'personalisierte-federmappe', en: 'custom-pencil-cases', fr: 'trousse-football' },
  'personalisiertes-kuscheltier': { de: 'personalisiertes-kuscheltier', en: 'plush-toy', fr: 'peluche-personnalisee' },
  'personalisierte-anstecknadeln': { de: 'personalisierte-anstecknadeln', en: 'custom-lapel-pins', fr: 'pins' },
  'personalisierte-decke': { de: 'personalisierte-decke', en: 'custom-blanket', fr: 'couverture-personnalisee' },
  'personalisierte-auswechselbank-decke': { de: 'personalisierte-auswechselbank-decke', en: 'custom-professional-dugout-blankets', fr: 'couverture-personnalisee-joueur' },
  'personalisierte-gesichtsmasken': { de: 'personalisierte-gesichtsmasken', en: 'custom-printed-face-masks', fr: 'masque-de-protection-personnalise' },
  'personalisierte-handschuhe': { de: 'personalisierte-handschuhe', en: 'custom-knitted-gloves', fr: 'gants-de-football-personnalises' },
  'personalisierter-regenschirm': { de: 'personalisierter-regenschirm', en: 'custom-printed-umbrellas', fr: 'parapluie-personnalisable' },
  'bedruckter-fussball': { de: 'bedruckter-fussball', en: 'customised-leather-footballs', fr: 'ballons-de-foot-personnalisee' },
  'individuell-gewebter-aufnaher': { de: 'individuell-gewebter-aufnaher', en: 'custom-woven-badges-for-football-and-rugby', fr: 'badges-personnalises' },
  'personalisiertes-radsport-trikot': { de: 'personalisiertes-radsport-trikot', en: 'custom-cycling-jersey', fr: 'maillot-cyclisme-personnalise' },
  'personalisiertes-shooting-shirt': { de: 'personalisiertes-shooting-shirt', en: 'custom-basketball-shooting-shirts', fr: 'surmaillot-basket-personnalise' },

  // HD Scarf (UK specific)
  'custom-hd-football-made-in-the-uk': { de: 'personalisierter-fussballschal', en: 'custom-hd-football-made-in-the-uk', fr: 'echarpe-hd-deluxe-personnalisee' },
};

// Create final product mappings
const productMappings = {};

// Add all known mappings
for (const [deSlug, mapping] of Object.entries(knownMappings)) {
  if (deProducts.includes(deSlug)) {
    productMappings[deSlug] = mapping;
  }
}

// Output stats
console.log('Category mappings:', Object.keys(categoryMappings).length);
console.log('Product mappings:', Object.keys(productMappings).length);
console.log('DE products total:', deProducts.length);
console.log('Unmapped DE products:', deProducts.filter(p => !productMappings[p]).length);

// Output unmapped products for review
console.log('\n--- Unmapped DE products ---');
deProducts.filter(p => !productMappings[p]).forEach(p => console.log(p));

// Save mappings as JSON
const output = {
  categories: categoryMappings,
  products: productMappings,
  unmappedDE: deProducts.filter(p => !productMappings[p]),
  unmappedUK: ukProducts.filter(p => !Object.values(productMappings).some(m => m.en === p)),
  unmappedFR: frProducts.filter(p => !Object.values(productMappings).some(m => m.fr === p))
};

fs.writeFileSync(path.join(__dirname, 'mappings.json'), JSON.stringify(output, null, 2));
console.log('\nMappings saved to mappings.json');
