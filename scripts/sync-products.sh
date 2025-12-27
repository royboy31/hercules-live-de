#!/bin/bash
# Daily sync script for homepage products
# This script fetches products with tag "homepage" from WordPress staging site
# and downloads their images locally

set -e

# Configuration
PROJECT_DIR="/home/kamindu/Headerless Herculess site/astro-hercules"
IMAGES_DIR="$PROJECT_DIR/public/images/products"
DATA_FILE="$PROJECT_DIR/src/data/homepage-products.json"
STAGING_URL="https://staging.hercules-merchandise.de"
LOG_FILE="$PROJECT_DIR/scripts/sync.log"

# Create directories if they don't exist
mkdir -p "$IMAGES_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "Starting product sync..."

# Fetch homepage HTML
log "Fetching homepage HTML..."
TEMP_HTML=$(mktemp)
curl -s "$STAGING_URL" -o "$TEMP_HTML" 2>/dev/null || {
    log "ERROR: Failed to fetch homepage"
    rm -f "$TEMP_HTML"
    exit 1
}

# Extract product data from HTML (products with homepage tag in the carousel)
log "Extracting product data..."

# Create temporary JSON file
TEMP_JSON=$(mktemp)
echo '{"products": [' > "$TEMP_JSON"

# Product IDs to look for (homepage tagged products)
PRODUCT_IDS=(4280 6721 4253 10105 4381 4294 4332 4213)

first=true
for id in "${PRODUCT_IDS[@]}"; do
    # Extract product data from HTML
    PRODUCT_BLOCK=$(grep -A50 "post-$id product" "$TEMP_HTML" 2>/dev/null | head -60)

    if [ -n "$PRODUCT_BLOCK" ]; then
        # Extract URL
        PRODUCT_URL=$(echo "$PRODUCT_BLOCK" | grep -oP 'href="[^"]+/produkte/[^"]+' | head -1 | sed 's/href="//')
        SLUG=$(echo "$PRODUCT_URL" | grep -oP '/produkte/\K[^/]+' | head -1)

        # Extract image URL
        IMAGE_URL=$(echo "$PRODUCT_BLOCK" | grep -oP 'src="https://staging\.hercules-merchandise\.de/wp-content/uploads/[^"]+\.(png|jpg|webp)"' | head -1 | sed 's/src="//' | sed 's/"$//')

        # Extract product title
        TITLE=$(echo "$PRODUCT_BLOCK" | grep -oP 'elementor-heading-title[^>]*>\K[^<]+' | head -1)

        # Extract alt text
        ALT=$(echo "$PRODUCT_BLOCK" | grep -oP 'alt="[^"]+"' | head -1 | sed 's/alt="//' | sed 's/"$//')

        if [ -n "$SLUG" ] && [ -n "$IMAGE_URL" ] && [ -n "$TITLE" ]; then
            # Download image
            IMAGE_FILENAME=$(basename "$IMAGE_URL")
            LOCAL_IMAGE="/images/products/$IMAGE_FILENAME"

            log "Downloading image for $TITLE..."
            curl -s "$IMAGE_URL" -o "$IMAGES_DIR/$IMAGE_FILENAME" 2>/dev/null

            # Check if image downloaded successfully (not an error page)
            FILE_SIZE=$(stat -c%s "$IMAGES_DIR/$IMAGE_FILENAME" 2>/dev/null || echo "0")
            if [ "$FILE_SIZE" -lt 1000 ]; then
                log "WARNING: Image for $TITLE may not have downloaded correctly (size: $FILE_SIZE bytes)"
            fi

            # Add to JSON
            if [ "$first" = true ]; then
                first=false
            else
                echo "," >> "$TEMP_JSON"
            fi

            cat >> "$TEMP_JSON" << EOF
    {
      "id": $id,
      "name": "$TITLE",
      "slug": "$SLUG",
      "image": "$LOCAL_IMAGE",
      "alt": "$ALT"
    }
EOF
            log "Added: $TITLE"
        else
            log "WARNING: Could not extract data for product ID $id"
        fi
    else
        log "WARNING: Product ID $id not found in HTML"
    fi
done

echo "" >> "$TEMP_JSON"
echo '  ]' >> "$TEMP_JSON"
echo '}' >> "$TEMP_JSON"

# Validate JSON
if python3 -c "import json; json.load(open('$TEMP_JSON'))" 2>/dev/null; then
    mv "$TEMP_JSON" "$DATA_FILE"
    log "Product data updated successfully!"
else
    log "ERROR: Generated JSON is invalid"
    cat "$TEMP_JSON" >> "$LOG_FILE"
    rm -f "$TEMP_JSON"
    exit 1
fi

# Cleanup
rm -f "$TEMP_HTML"

log "Sync completed successfully!"
log "Products synced: ${#PRODUCT_IDS[@]}"
log "Images stored in: $IMAGES_DIR"
log "Data file: $DATA_FILE"
