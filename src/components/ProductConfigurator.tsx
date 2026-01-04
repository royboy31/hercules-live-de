import { useState, useEffect, useMemo } from 'react';

// Types matching the API response
interface TermInfo {
  slug: string;
  name: string;
  description: string;
  thumbnail_id: number;
  thumbnail_url: string;
}

interface AttributeData {
  terms: TermInfo[];
  display_type: 'dropdown' | 'image_selector' | 'select_boxes';
  display_title: string;
  display_description: string;
  enabled_if: string;
  enabled_if_value: string;
  minimum_qty: string;
}

interface AddonOption {
  name: string;
  image: string;
  price_table: Array<{ qty: number; price: number }>;
}

interface AddonData {
  id: number;
  name: string;
  display_type: 'dropdown' | 'image_selector' | 'select_boxes' | 'multiple_choise';
  parent_id: number;
  visible_if_option: string;
  options: AddonOption[];
}

interface VariationData {
  variation_id: number;
  attributes: Record<string, string>;
  display_price: number;
  display_regular_price: number;
  image: { url: string; alt: string } | null;
  is_in_stock: boolean;
  conditional_prices: Array<{ qty: number | string; price: number | string }>;
  lead_time: string;
}

interface ProductConfig {
  product_id: number;
  product_name: string;
  product_slug: string;
  attributes: Record<string, AttributeData>;
  addons: AddonData[];
  variations: VariationData[];
  currency_code: string;
  currency_symbol: string;
  currency_position: string;
  tax_percent: number;
  estimated_delivery_date: string;
  minimum_quantity: string;
  quote_page_url: string;
}

interface ProductConfiguratorProps {
  productSlug: string;
  workerUrl?: string;
}

// Helper to parse float safely
function parseFloatSafe(val: any): number {
  const parsed = parseFloat(String(val));
  return isNaN(parsed) ? 0 : parsed;
}

// Get interpolated price from conditional_prices
function getInterpolatedPrice(conditionalPrices: Array<{ qty: number | string; price: number | string }>, quantity: number): number {
  if (!conditionalPrices || conditionalPrices.length === 0) return 0;

  const sorted = [...conditionalPrices]
    .map(cp => ({ qty: parseFloatSafe(cp.qty), price: parseFloatSafe(cp.price) }))
    .sort((a, b) => a.qty - b.qty);

  // Exact match
  const exact = sorted.find(t => t.qty === quantity);
  if (exact) return exact.price;

  // Interpolation
  let below: { qty: number; price: number } | null = null;
  let above: { qty: number; price: number } | null = null;

  for (const t of sorted) {
    if (t.qty < quantity) below = t;
    if (t.qty > quantity && !above) above = t;
  }

  if (below && above && above.qty !== below.qty) {
    const pA = below.price, pB = above.price;
    const qA = below.qty, qB = above.qty;
    return pA + ((pB - pA) * (quantity - qA)) / (qB - qA);
  }

  if (below) return below.price;
  if (above) return above.price;
  return sorted[0]?.price || 0;
}

// Get addon price for a given quantity
function getAddonPriceForQty(addon: AddonData, selectedValue: string | string[], quantity: number): number {
  if (!selectedValue) return 0;

  const selectedNames = Array.isArray(selectedValue) ? selectedValue : [selectedValue];
  let total = 0;

  for (const name of selectedNames) {
    const option = addon.options.find(o => o.name === name);
    if (!option || !option.price_table || option.price_table.length === 0) continue;

    const sorted = [...option.price_table].sort((a, b) => a.qty - b.qty);
    let price = 0;

    for (let i = sorted.length - 1; i >= 0; i--) {
      if (quantity >= sorted[i].qty) {
        price = sorted[i].price;
        break;
      }
    }

    total += price;
  }

  return total;
}

export default function ProductConfigurator({ productSlug, workerUrl = 'https://hercules-product-sync.gilles-86d.workers.dev' }: ProductConfiguratorProps) {
  const [config, setConfig] = useState<ProductConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Step state
  const [maxVisibleStep, setMaxVisibleStep] = useState(0);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [selectedAddons, setSelectedAddons] = useState<Record<number, string | string[]>>({});
  const [quantitySelected, setQuantitySelected] = useState(0);
  const [tempQuantity, setTempQuantity] = useState(50);

  // Fetch product config on mount
  useEffect(() => {
    async function fetchConfig() {
      try {
        console.log('[ProductConfigurator] Fetching config for:', productSlug);
        const url = `${workerUrl}/product-config/${productSlug}`;
        console.log('[ProductConfigurator] URL:', url);

        const response = await fetch(url);
        console.log('[ProductConfigurator] Response status:', response.status);

        if (!response.ok) {
          const text = await response.text();
          console.error('[ProductConfigurator] Error response:', text);
          throw new Error(`Failed to fetch product config: ${response.status}`);
        }

        const data = await response.json();
        console.log('[ProductConfigurator] Config loaded:', data.product_name);
        setConfig(data);

        // Set initial temp quantity from minimum
        const minQty = parseInt(data.minimum_quantity || '50', 10);
        setTempQuantity(minQty > 0 ? minQty : 50);
      } catch (err) {
        console.error('[ProductConfigurator] Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, [productSlug, workerUrl]);

  // Get attribute keys (filtered for visibility)
  const attributeKeys = useMemo(() => {
    if (!config) return [];
    return Object.keys(config.attributes);
  }, [config]);

  // Check if an attribute should be visible based on enabled_if conditions
  const isAttributeVisible = (attrKey: string, index: number): boolean => {
    if (!config) return false;
    if (index === 0) return true; // First attribute is always visible

    const attr = config.attributes[attrKey];
    if (!attr.enabled_if || !attr.enabled_if_value) return true;

    // Find the controlling attribute
    const controllingKey = attributeKeys.find(k => k.includes(attr.enabled_if));
    if (!controllingKey) return true;

    return selectedAttributes[controllingKey] === attr.enabled_if_value;
  };

  // Get visible addons based on selection hierarchy
  const visibleAddons = useMemo(() => {
    if (!config || config.addons.length === 0) return [];

    const visible: AddonData[] = [];

    config.addons
      .filter(a => a.parent_id === 0)
      .forEach(parent => {
        visible.push(parent);

        // Find child if parent selection matches visible_if_option
        const child = config.addons.find(
          a => a.parent_id === parent.id && selectedAddons[parent.id] === a.visible_if_option
        );

        if (child) {
          visible.push(child);

          // Find grandchild
          const grandchild = config.addons.find(
            a => a.parent_id === child.id && selectedAddons[child.id] === a.visible_if_option
          );

          if (grandchild) {
            visible.push(grandchild);
          }
        }
      });

    return visible;
  }, [config, selectedAddons]);

  // Find matching variation based on selected attributes
  const matchedVariation = useMemo(() => {
    if (!config) return null;

    return config.variations.find(v => {
      return Object.entries(v.attributes).every(([key, value]) => {
        const normalizedKey = key.replace('attribute_', '');
        const selectedValue = selectedAttributes[key] || selectedAttributes[`attribute_${normalizedKey}`] || selectedAttributes[normalizedKey];
        return selectedValue === value;
      });
    }) || null;
  }, [config, selectedAttributes]);

  // Calculate quantity range
  const quantityRange = useMemo(() => {
    const prices = matchedVariation?.conditional_prices || config?.variations?.[0]?.conditional_prices;
    if (!prices?.length) {
      return { min: 50, max: 500 };
    }

    const qtys = prices.map(p => parseFloatSafe(p.qty));
    return {
      min: Math.min(...qtys),
      max: Math.max(...qtys),
    };
  }, [matchedVariation, config]);

  // Calculate final price
  const priceInfo = useMemo(() => {
    if (!matchedVariation || quantitySelected <= 0) return null;

    const basePrice = getInterpolatedPrice(matchedVariation.conditional_prices, quantitySelected);

    let addonPrice = 0;
    for (const addon of visibleAddons) {
      if (selectedAddons[addon.id]) {
        addonPrice += getAddonPriceForQty(addon, selectedAddons[addon.id], quantitySelected);
      }
    }

    const pricePerPiece = basePrice + addonPrice;
    const totalExclVat = pricePerPiece * quantitySelected;
    const taxMultiplier = config ? 1 + (config.tax_percent / 100) : 1.19;
    const totalInclVat = totalExclVat * taxMultiplier;

    return {
      pricePerPiece,
      totalExclVat,
      totalInclVat,
      leadTime: matchedVariation.lead_time || '5 Wochen',
    };
  }, [matchedVariation, quantitySelected, visibleAddons, selectedAddons, config]);

  // Handle attribute selection
  const handleAttributeSelect = (attrKey: string, value: string, stepIndex: number) => {
    setSelectedAttributes(prev => ({ ...prev, [attrKey]: value }));
    setMaxVisibleStep(stepIndex + 1);
  };

  // Handle addon selection
  const handleAddonSelect = (addonId: number, value: string | string[], stepIndex: number) => {
    setSelectedAddons(prev => ({ ...prev, [addonId]: value }));
    setMaxVisibleStep(stepIndex + 1);
  };

  // Handle quantity confirmation
  const handleQuantityConfirm = () => {
    if (tempQuantity >= quantityRange.min && tempQuantity <= quantityRange.max) {
      setQuantitySelected(tempQuantity);
      setMaxVisibleStep(attributeKeys.length + visibleAddons.length + 1);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div id="pearl-wc-steps-form">
        <div className="pearl-step-indicator">
          <h2>Laden...</h2>
        </div>
      </div>
    );
  }

  // Render error state
  if (error || !config) {
    return (
      <div id="pearl-wc-steps-form">
        <div className="pearl-step-indicator">
          <h2>Fehler beim Laden der Konfiguration</h2>
          {error && <p style={{ color: '#dc3545', fontSize: '14px', marginTop: '10px' }}>{error}</p>}
          <p style={{ color: '#666', fontSize: '12px', marginTop: '5px' }}>Slug: {productSlug}</p>
        </div>
      </div>
    );
  }

  const currencySymbol = config.currency_symbol || '\u20AC';
  const totalSteps = attributeKeys.length + visibleAddons.length + 1; // +1 for quantity
  const quantityStepIndex = attributeKeys.length + visibleAddons.length;
  const minQuantity = parseInt(config.minimum_quantity || '50', 10);

  // Check if all selections are complete for add to cart
  const allAttributesSelected = attributeKeys.every(key => selectedAttributes[key]);
  const allAddonsSelected = visibleAddons.every(addon => selectedAddons[addon.id]);
  const canAddToCart = allAttributesSelected && allAddonsSelected && quantitySelected > 0 && matchedVariation;

  // Calculate current visible step number (excluding hidden default attributes)
  const currentStepNum = Math.min(maxVisibleStep + 1, totalSteps);

  return (
    <div id="pearl-wc-steps-form" className="pearl-wc-steps-form">
      {/* Step indicator - matches WordPress exactly */}
      <div className="pearl-step-indicator">
        <h2>ERSTELLEN SIE IHR PRODUKT — SCHRITT {currentStepNum} VON {totalSteps}</h2>
        <span>AB {minQuantity} STÜCKE</span>
      </div>

      {/* Attribute Steps */}
      {attributeKeys.map((attrKey, index) => {
        if (!isAttributeVisible(attrKey, index)) return null;

        const attr = config.attributes[attrKey];
        const isExpanded = maxVisibleStep === index;
        const selectedValue = selectedAttributes[attrKey];
        const isCompleted = !!selectedValue;

        // Check if this is a hidden default attribute
        if (attr.terms.length === 1 && attr.terms[0].slug === 'default') {
          // Auto-select default and skip
          if (!selectedAttributes[attrKey]) {
            setSelectedAttributes(prev => ({ ...prev, [attrKey]: 'default' }));
          }
          return null;
        }

        const stepClass = `pearl-step ${isExpanded ? '' : 'collapsed'} ${isCompleted && !isExpanded ? 'selected' : ''}`.trim();

        return (
          <div key={attrKey} className={stepClass} onClick={!isExpanded && isCompleted ? () => setMaxVisibleStep(index) : undefined}>
            <h3>
              {!isExpanded && isCompleted ? (
                <>
                  <div className="kd-prod-attribute-title-wrapper">
                    <span>{index + 1}: {attr.display_title || attrKey.replace('pa_', '')}</span>
                  </div>
                  <span className="kd-selected-val">{attr.terms.find(t => t.slug === selectedValue)?.name || selectedValue}</span>
                  <button type="button" className="kd-selected-chng-btn" onClick={(e) => { e.stopPropagation(); setMaxVisibleStep(index); }}>
                    Ändern
                  </button>
                </>
              ) : (
                <div className="kd-prod-attribute-title-wrapper">
                  <span>{index + 1}: {attr.display_title || attrKey.replace('pa_', '')}</span>
                </div>
              )}
            </h3>

            {isExpanded && (
              <div className="kd-step-collapse">
                {attr.display_description && <p style={{ marginBottom: '10px', color: '#666' }}>{attr.display_description}</p>}

                {/* Image Selector */}
                {attr.display_type === 'image_selector' && (
                  <div className="kd-image-selector" style={{ display: 'flex', flexFlow: 'row wrap', gap: '20px' }}>
                    {attr.terms.map(term => (
                      <div
                        key={term.slug}
                        className="kd-image-selector-col"
                        onClick={() => handleAttributeSelect(attrKey, term.slug, index)}
                        style={{
                          border: selectedValue === term.slug ? '2px solid #469ADC' : '1px solid #ccc',
                          background: selectedValue === term.slug ? '#e6f0fa' : '#fff',
                          padding: '10px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexFlow: 'row',
                          width: '30.5%',
                        }}
                      >
                        <div className="kd-image-selector-title">{term.name}</div>
                        {term.thumbnail_url && (
                          <img
                            src={term.thumbnail_url}
                            alt={term.name}
                            style={{ height: '48px', objectFit: 'contain', marginLeft: '5px' }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Dropdown */}
                {attr.display_type === 'dropdown' && (
                  <select
                    value={selectedValue || ''}
                    onChange={e => handleAttributeSelect(attrKey, e.target.value, index)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ddd' }}
                  >
                    <option value="">Wählen Sie eine Option</option>
                    {attr.terms.map(term => (
                      <option key={term.slug} value={term.slug}>{term.name}</option>
                    ))}
                  </select>
                )}

                {/* Select Boxes */}
                {attr.display_type === 'select_boxes' && (
                  <div className="box-selector" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {attr.terms.map(term => (
                      <div
                        key={term.slug}
                        className="box-selector-item"
                        onClick={() => handleAttributeSelect(attrKey, term.slug, index)}
                        style={{
                          cursor: 'pointer',
                          border: selectedValue === term.slug ? '2px solid #469ADC' : '1px solid #ddd',
                          padding: '10px',
                          borderRadius: '10px',
                          width: '31%',
                          background: selectedValue === term.slug ? '#e6f0fa' : '#fff',
                        }}
                      >
                        <strong>{term.name}</strong>
                        {term.description && <p style={{ fontSize: '12px', marginTop: '5px' }}>{term.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Addon Steps */}
      {visibleAddons.map((addon, addonIndex) => {
        const stepIndex = attributeKeys.length + addonIndex;
        const isExpanded = maxVisibleStep === stepIndex;
        const selectedValue = selectedAddons[addon.id];
        const isCompleted = !!selectedValue;

        const stepClass = `pearl-step ${isExpanded ? '' : 'collapsed'} ${isCompleted && !isExpanded ? 'selected' : ''}`.trim();
        const displayStepNum = stepIndex + 1;

        return (
          <div key={`addon_${addon.id}`} className={stepClass} onClick={!isExpanded && isCompleted ? () => setMaxVisibleStep(stepIndex) : undefined}>
            <h3>
              {!isExpanded && isCompleted ? (
                <>
                  <div className="kd-prod-attribute-title-wrapper">
                    <span>{displayStepNum}: {addon.name}</span>
                  </div>
                  <span className="kd-selected-val">{Array.isArray(selectedValue) ? selectedValue.join(', ') : selectedValue}</span>
                  <button type="button" className="kd-selected-chng-btn" onClick={(e) => { e.stopPropagation(); setMaxVisibleStep(stepIndex); }}>
                    Ändern
                  </button>
                </>
              ) : (
                <div className="kd-prod-attribute-title-wrapper">
                  <span>{displayStepNum}: {addon.name}</span>
                </div>
              )}
            </h3>

            {isExpanded && (
              <div className="kd-step-collapse">
                {/* Image Selector for addons */}
                {addon.display_type === 'image_selector' && (
                  <div className="kd-image-selector" style={{ display: 'flex', flexFlow: 'row wrap', gap: '20px' }}>
                    {addon.options.map(option => (
                      <div
                        key={option.name}
                        className="kd-image-selector-col"
                        onClick={() => handleAddonSelect(addon.id, option.name, stepIndex)}
                        style={{
                          border: selectedValue === option.name ? '2px solid #469ADC' : '1px solid #ccc',
                          background: selectedValue === option.name ? '#e6f0fa' : '#fff',
                          padding: '10px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexFlow: 'row',
                          width: '30.5%',
                        }}
                      >
                        <div className="kd-image-selector-title">{option.name}</div>
                        {option.image && (
                          <img
                            src={option.image}
                            alt={option.name}
                            style={{ height: '48px', objectFit: 'contain', marginLeft: '5px' }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Dropdown for addons */}
                {addon.display_type === 'dropdown' && (
                  <select
                    value={typeof selectedValue === 'string' ? selectedValue : ''}
                    onChange={e => handleAddonSelect(addon.id, e.target.value, stepIndex)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ddd' }}
                  >
                    <option value="">Wählen Sie eine Option</option>
                    {addon.options.map(option => (
                      <option key={option.name} value={option.name}>{option.name}</option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Quantity Step - Always show */}
      {(matchedVariation || config.variations?.length > 0) && (
        <div className={`pearl-step ${maxVisibleStep === quantityStepIndex ? '' : 'collapsed'} ${quantitySelected > 0 && maxVisibleStep !== quantityStepIndex ? 'selected' : ''}`.trim()}>
          <h3>
            {maxVisibleStep !== quantityStepIndex && quantitySelected > 0 ? (
              <>
                <div className="kd-prod-attribute-title-wrapper">
                  <span>{quantityStepIndex + 1}: Wählen Sie Ihre Menge</span>
                  <small>(Die angezeigten Preise sind netto)</small>
                </div>
                <span className="kd-selected-val">{quantitySelected}</span>
                <button type="button" className="kd-selected-chng-btn" onClick={(e) => { e.stopPropagation(); setMaxVisibleStep(quantityStepIndex); }}>
                  Ändern
                </button>
              </>
            ) : (
              <div className="kd-prod-attribute-title-wrapper">
                <span>{quantityStepIndex + 1}: Wählen Sie Ihre Menge</span>
                <small>(Die angezeigten Preise sind netto)</small>
              </div>
            )}
          </h3>

          {maxVisibleStep === quantityStepIndex && (
            <div className="kd-step-collapse">
              {/* Quantity tier options */}
              {(matchedVariation?.conditional_prices || config.variations?.[0]?.conditional_prices || []).map((tier, idx) => {
                const tierQty = parseFloatSafe(tier.qty);
                const tierPrice = parseFloatSafe(tier.price);

                // Calculate addon price for this tier
                let addonPrice = 0;
                for (const addon of visibleAddons) {
                  if (selectedAddons[addon.id]) {
                    addonPrice += getAddonPriceForQty(addon, selectedAddons[addon.id], tierQty);
                  }
                }
                const totalPrice = tierPrice + addonPrice;

                // Calculate savings percentage vs first tier
                const pricesArray = matchedVariation?.conditional_prices || config.variations?.[0]?.conditional_prices || [];
                const firstTier = pricesArray[0];
                const firstPrice = firstTier ? parseFloatSafe(firstTier.price) + (visibleAddons.reduce((sum, addon) =>
                  sum + (selectedAddons[addon.id] ? getAddonPriceForQty(addon, selectedAddons[addon.id], parseFloatSafe(firstTier.qty)) : 0), 0)) : 0;
                const savings = firstPrice > 0 ? Math.round((1 - totalPrice / firstPrice) * 100) : 0;

                return (
                  <label key={idx} className="kd-radio-option">
                    <div>
                      <input
                        type="radio"
                        name="qty_option"
                        checked={quantitySelected === tierQty}
                        onChange={() => {
                          setQuantitySelected(tierQty);
                          setTempQuantity(tierQty);
                          setMaxVisibleStep(quantityStepIndex + 1);
                        }}
                      />
                      <span>{tierQty}</span>
                    </div>
                    <div className="kd-radio-meta">
                      {savings > 0 && (
                        <span className="save">SPEICHERN {savings}%</span>
                      )}
                      <span>{currencySymbol}{totalPrice.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </label>
                );
              })}

              {/* 500+ Contact option */}
              <label className="kd-radio-option">
                <div>
                  <input
                    type="radio"
                    name="qty_option"
                    checked={false}
                    onChange={() => {}}
                  />
                  <span>500+</span>
                </div>
                <div className="kd-radio-meta">
                  <button type="button" className="step-contact" onClick={() => window.location.href = '/kontakt/'}>
                    KONTAKTIEREN SIE UNS
                  </button>
                </div>
              </label>

              {/* Custom quantity slider */}
              <div className="range-wrapper">
                <h4 className="specific-qty-title">Oder wählen Sie eine bestimmte Menge</h4>

                <div className="kd-range-slider-container">
                  <div className="kd-qty-display">{tempQuantity}</div>
                  <input
                    type="range"
                    min={quantityRange.min}
                    max={quantityRange.max}
                    value={tempQuantity}
                    onChange={e => setTempQuantity(parseInt(e.target.value))}
                    style={{
                      background: `linear-gradient(to right, #253461 0%, #253461 ${((tempQuantity - quantityRange.min) / (quantityRange.max - quantityRange.min)) * 100}%, #E3E3E3 ${((tempQuantity - quantityRange.min) / (quantityRange.max - quantityRange.min)) * 100}%, #E3E3E3 100%)`,
                    }}
                  />
                  {/* Tick marks */}
                  <div className="kd-range-ticks">
                    {Array.from({ length: 11 }, (_, i) => {
                      const tickValue = Math.round(quantityRange.min + (i * (quantityRange.max - quantityRange.min) / 10));
                      return (
                        <span key={i} className="kd-qty-range-price-tooltip">{tickValue}</span>
                      );
                    })}
                  </div>
                </div>

                <div className="kd-qty-controls">
                  <input
                    type="number"
                    className="kd-qty-input"
                    min={quantityRange.min}
                    max={quantityRange.max}
                    value={tempQuantity}
                    onChange={e => setTempQuantity(parseInt(e.target.value) || quantityRange.min)}
                  />
                  <button type="button" className="kd-round-btn" onClick={() => setTempQuantity(prev => Math.min(quantityRange.max, prev + 1))}>+</button>
                  <button type="button" className="kd-round-btn" onClick={() => setTempQuantity(prev => Math.max(quantityRange.min, prev - 1))}>-</button>
                  <button type="button" className="kd-verify-qty-btn" onClick={handleQuantityConfirm}>
                    BESTÄTIGEN
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {priceInfo && quantitySelected > 0 && (
        <div className="variation-summary">
          <h3 className="your-offer-title">{quantityStepIndex + 2}. Ihr Angebot</h3>
          <table className="offer-table">
            <tbody>
              <tr>
                <td>Versand Deutschland oder Österreich</td>
                <td className="kd-free-value">Kostenlos</td>
              </tr>
              <tr>
                <td>Einrichtungsgebühr</td>
                <td className="kd-free-value">Kostenlos</td>
              </tr>
              <tr>
                <td>Preis netto pro Stück</td>
                <td className="kd-price-value">{currencySymbol}{priceInfo.pricePerPiece.toFixed(2).replace('.', ',')}</td>
              </tr>
              <tr>
                <td>Gesamt (netto)</td>
                <td className="kd-total-value">{currencySymbol}{priceInfo.totalExclVat.toFixed(2).replace('.', ',')}</td>
              </tr>
              <tr>
                <td>Gesamt (brutto)</td>
                <td>{currencySymbol}{priceInfo.totalInclVat.toFixed(2).replace('.', ',')}</td>
              </tr>
              <tr>
                <td>Lieferzeit</td>
                <td>
                  {config.estimated_delivery_date && <div>{config.estimated_delivery_date}</div>}
                  <div>{priceInfo.leadTime}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Action Buttons */}
      <div className="kd-action-btns-wrapper">
        <div className="kd-single-action-btn">
          <button
            type="button"
            disabled={!canAddToCart}
            onClick={() => window.location.href = `/quote-generator/`}
          >
            Erstellen Sie Ihr Angebot
          </button>
        </div>
        <div className="kd-single-action-btn">
          <button
            type="button"
            disabled={!canAddToCart}
            onClick={() => {
              // Add to cart logic - will need to call WooCommerce API
              const cartUrl = `/kaufen/${productSlug}/`;
              window.location.href = cartUrl;
            }}
          >
            In den Warenkorb
          </button>
        </div>
      </div>
    </div>
  );
}
