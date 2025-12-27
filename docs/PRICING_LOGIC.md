# Pearl WC Steps Variation - Pricing Logic Documentation

## Overview

This document outlines the pricing logic used by the `pearl-wc-steps-variation` WordPress plugin for the Hercules Merchandise site. This information is essential for the headless Astro implementation to correctly calculate and display product prices.

**Source:** Extracted from plugin code at `staging.hercules-merchandise.de/wp-content/plugins/pearl-wc-steps-variation/`

## 1. Conditional (Quantity-Based) Pricing

### Meta Key
`_conditional_prices` - Stored on each **variation** (not the parent product)

### Data Structure
```php
array(
    array('qty' => 50, 'price' => '4.50'),
    array('qty' => 100, 'price' => '4.00'),
    array('qty' => 200, 'price' => '3.50'),
    array('qty' => 500, 'price' => '3.00'),
)
```

### Price Calculation Algorithm
From `includes/ajax-handler.php`:

```javascript
function calculateProratedPrice(conditionalPrices, selectedQty) {
  // Sort by quantity ascending
  const sorted = [...conditionalPrices].sort((a, b) => a.qty - b.qty);

  // Find exact match
  const exactMatch = sorted.find(row => row.qty === selectedQty);
  if (exactMatch) return exactMatch.price;

  // Find surrounding tiers
  let below = null;
  let above = null;

  for (const row of sorted) {
    if (row.qty < selectedQty) {
      below = row;
    } else if (row.qty > selectedQty) {
      above = row;
      break;
    }
  }

  // Linear interpolation between tiers
  if (below && above) {
    const priceA = below.price;
    const priceB = above.price;
    const qtyA = below.qty;
    const qtyB = above.qty;
    return priceA + ((priceB - priceA) * (selectedQty - qtyA)) / (qtyB - qtyA);
  }

  // Fallback to nearest tier
  if (below) return below.price;
  if (above) return above.price;

  return null;
}
```

**Key Points:**
- Prices are **interpolated** between quantity tiers (not stepped)
- Below minimum tier → uses first tier price
- Above maximum tier → uses last tier price

---

## 2. Addon-Based Pricing

### Meta Keys

| Meta Key | Stored On | Description |
|----------|-----------|-------------|
| `_product_addon_options` | Parent product | Full addon configuration with pricing |
| `_product_allowed_addon_ids` | Parent product | Array of addon taxonomy term IDs |

### Data Structure
```php
// _product_addon_options
array(
    addon_term_id => array(
        'options' => array(
            array(
                'name' => 'Mit Bommel',           // Option name
                'image' => 'https://...',         // Option image URL
                'price_table' => array(           // Quantity-based addon pricing
                    array('qty' => 50, 'price' => 0.50),
                    array('qty' => 100, 'price' => 0.45),
                    array('qty' => 200, 'price' => 0.40),
                )
            ),
            array(
                'name' => 'Ohne Bommel',
                'image' => 'https://...',
                'price_table' => array(
                    array('qty' => 50, 'price' => 0),
                    array('qty' => 100, 'price' => 0),
                )
            ),
        ),
        'visible_if_option' => 'Some Parent Option'  // Conditional visibility
    ),
)
```

### Addon Price Calculation
Addon prices are **added per piece** to the base variation price:

```javascript
function calculateTotalPrice(basePrice, addons, quantity) {
  let addonPricePerPiece = 0;

  for (const addon of selectedAddons) {
    // Find price for quantity from addon's price_table
    const addonPrice = calculateProratedPrice(addon.price_table, quantity);
    addonPricePerPiece += addonPrice;
  }

  const unitPrice = basePrice + addonPricePerPiece;
  const total = unitPrice * quantity;

  return { unitPrice, addonPricePerPiece, total };
}
```

---

## 3. Additional Meta Fields

### On Variations
| Meta Key | Description |
|----------|-------------|
| `_conditional_prices` | Quantity-based pricing tiers |
| `_lead_time` | Estimated delivery time |

### On Parent Products
| Meta Key | Description |
|----------|-------------|
| `_product_addon_options` | Addon configurations with pricing |
| `_product_allowed_addon_ids` | Enabled addon term IDs |
| `_estimated_delivery_date` | Estimated delivery date (YYYY-MM-DD) |

---

## 4. Cart Item Data

When adding to cart via AJAX, these custom fields are stored:

```javascript
cart_item_data = {
  custom_price: 4.25,           // Calculated unit price (base + addons)
  addons: [...],                // Selected addon options
  addon_price_per_piece: 0.50,  // Total addon price per unit
  min_qty: 50                   // Minimum quantity for this configuration
}
```

---

## 5. AJAX Endpoints

### Find Matching Variation
**Action:** `pearl_wc_find_variation`

**Request:**
```javascript
{
  action: 'pearl_wc_find_variation',
  nonce: pearl_wc_nonce,
  product_id: 6721,
  attributes: JSON.stringify({
    'attribute_pa_format': '140-x-18-cm-standard',
    'attribute_pa_farbe': '1-5-farben'
  }),
  quantity: 100
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    variation_id: 6732,
    price: '€4.00',              // Formatted HTML
    price_num: 4.00,             // Numeric value
    attributes: {...},
    conditional_prices: [...],    // Full pricing table
    lead_time: '4-6 weeks'
  }
}
```

### Add to Cart with Custom Price
**Action:** `pearl_wc_add_to_cart_custom`

**Request:**
```javascript
{
  action: 'pearl_wc_add_to_cart_custom',
  nonce: pearl_wc_nonce,
  product_id: 6721,
  variation_id: 6732,
  quantity: 100,
  price_num: 4.00,
  addons: JSON.stringify([...]),
  addonsPricePerpiece: 0.50,
  minQty: 50
}
```

---

## 6. WooCommerce REST API Extension

To sync pricing data via the WooCommerce REST API, we need to expose these meta fields.

### Required WordPress Plugin/Code

Add to theme's `functions.php` or create a small plugin:

```php
<?php
// Expose conditional prices on variations
add_filter('woocommerce_rest_prepare_product_variation_object', function($response, $object, $request) {
    $data = $response->get_data();
    $data['conditional_prices'] = get_post_meta($object->get_id(), '_conditional_prices', true) ?: [];
    $data['lead_time'] = get_post_meta($object->get_id(), '_lead_time', true) ?: '';
    $response->set_data($data);
    return $response;
}, 10, 3);

// Expose addon options on products
add_filter('woocommerce_rest_prepare_product_object', function($response, $object, $request) {
    $data = $response->get_data();
    $data['addon_options'] = get_post_meta($object->get_id(), '_product_addon_options', true) ?: [];
    $data['allowed_addon_ids'] = get_post_meta($object->get_id(), '_product_allowed_addon_ids', true) ?: [];
    $data['estimated_delivery_date'] = get_post_meta($object->get_id(), '_estimated_delivery_date', true) ?: '';
    $response->set_data($data);
    return $response;
}, 10, 3);
```

---

## 7. Complete Sync Data Structure

### Product JSON Structure for Astro

```json
{
  "id": 6721,
  "name": "Personalisierter HD-Fußballschal",
  "slug": "personalisierter-fussballschal",
  "type": "variable",
  "price_range": {
    "min": 5.30,
    "max": 10.95
  },
  "estimated_delivery_date": "2025-02-15",
  "attributes": [
    {
      "id": 1,
      "name": "Format",
      "slug": "pa_format",
      "options": ["120x15cm", "140x18cm", "160x18cm", "180x18cm"]
    },
    {
      "id": 28,
      "name": "Farbe",
      "slug": "pa_farbe",
      "options": ["1-5 Farben", "5+ Farben"]
    }
  ],
  "variations": [
    {
      "id": 6732,
      "attributes": {
        "format": "120-x-15-cm-fur-kinder",
        "farbe": "1-5-farben"
      },
      "conditional_prices": [
        { "qty": 50, "price": 5.30 },
        { "qty": 100, "price": 4.80 },
        { "qty": 200, "price": 4.30 },
        { "qty": 500, "price": 3.80 }
      ],
      "lead_time": "4-6 Wochen"
    }
  ],
  "addon_options": {
    "123": {
      "options": [
        {
          "name": "Mit Bommel",
          "image": "https://...",
          "price_table": [
            { "qty": 50, "price": 0.50 },
            { "qty": 100, "price": 0.45 }
          ]
        }
      ],
      "visible_if_option": null
    }
  },
  "allowed_addon_ids": [123, 124, 125]
}
```

---

## 8. Frontend Price Calculator (React Component)

```tsx
interface ConditionalPrice {
  qty: number;
  price: number;
}

interface PriceCalculatorProps {
  conditionalPrices: ConditionalPrice[];
  addonPrices?: ConditionalPrice[];
  quantity: number;
}

function calculatePrice({ conditionalPrices, addonPrices = [], quantity }: PriceCalculatorProps) {
  // Calculate base price with interpolation
  const basePrice = interpolatePrice(conditionalPrices, quantity);

  // Calculate addon price
  let addonTotal = 0;
  for (const addon of addonPrices) {
    addonTotal += interpolatePrice(addon, quantity);
  }

  const unitPrice = basePrice + addonTotal;
  const subtotal = unitPrice * quantity;

  return {
    basePrice,
    addonTotal,
    unitPrice,
    subtotal,
    formatted: new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(unitPrice)
  };
}

function interpolatePrice(prices: ConditionalPrice[], qty: number): number {
  const sorted = [...prices].sort((a, b) => a.qty - b.qty);

  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].qty === qty) return sorted[i].price;
    if (sorted[i].qty > qty) {
      if (i === 0) return sorted[0].price;
      const prev = sorted[i - 1];
      const next = sorted[i];
      return prev.price +
        ((next.price - prev.price) * (qty - prev.qty)) / (next.qty - prev.qty);
    }
  }

  return sorted[sorted.length - 1].price;
}
```

---

## Notes

- MalCare security plugin was blocking access (now disabled on staging)
- The pricing uses **linear interpolation** between quantity tiers, not stepped pricing
- Addon prices are calculated separately and added per-piece
- All prices are stored and calculated in EUR
