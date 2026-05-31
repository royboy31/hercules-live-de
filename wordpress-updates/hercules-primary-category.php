<?php
/**
 * Plugin Name: Hercules Primary Category
 * Description: Adds a "Primary Category" selector to products and exposes it via WC REST API.
 *              Used for consistent breadcrumbs across the headless Astro frontend.
 * Version: 1.0.0
 * Author: Hercules Merchandise
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Add Primary Category meta box to product edit screen
 */
add_action('add_meta_boxes', function() {
    add_meta_box(
        'hercules_primary_category',
        'Primary Category (Breadcrumb)',
        'hercules_primary_category_render',
        'product',
        'side',
        'default'
    );
});

/**
 * Render the Primary Category meta box
 */
function hercules_primary_category_render($post) {
    $current = get_post_meta($post->ID, '_primary_category', true);
    $terms = wp_get_post_terms($post->ID, 'product_cat', ['fields' => 'all']);

    wp_nonce_field('hercules_primary_category_save', 'hercules_primary_category_nonce');

    if (empty($terms) || is_wp_error($terms)) {
        echo '<p>No categories assigned to this product.</p>';
        return;
    }

    echo '<p><label for="hercules_primary_cat">Select the primary category for breadcrumbs:</label></p>';
    echo '<select id="hercules_primary_cat" name="hercules_primary_cat" style="width:100%">';
    echo '<option value="">-- Auto (first category) --</option>';
    foreach ($terms as $term) {
        $selected = ($current == $term->term_id) ? ' selected' : '';
        echo '<option value="' . esc_attr($term->term_id) . '"' . $selected . '>' . esc_html($term->name) . '</option>';
    }
    echo '</select>';
    echo '<p class="description">This category will appear in the breadcrumb trail on the product page.</p>';
}

/**
 * Save the Primary Category meta
 */
add_action('save_post_product', function($post_id) {
    if (!isset($_POST['hercules_primary_category_nonce']) ||
        !wp_verify_nonce($_POST['hercules_primary_category_nonce'], 'hercules_primary_category_save')) {
        return;
    }
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    $value = isset($_POST['hercules_primary_cat']) ? sanitize_text_field($_POST['hercules_primary_cat']) : '';
    if ($value) {
        update_post_meta($post_id, '_primary_category', intval($value));
    } else {
        delete_post_meta($post_id, '_primary_category');
    }
});

/**
 * Expose primary_category in WooCommerce REST API product response
 */
add_filter('woocommerce_rest_prepare_product_object', function($response, $product, $request) {
    $primary_cat_id = get_post_meta($product->get_id(), '_primary_category', true);

    $primary_category = null;
    if ($primary_cat_id) {
        $term = get_term(intval($primary_cat_id), 'product_cat');
        if ($term && !is_wp_error($term)) {
            $primary_category = [
                'id'   => $term->term_id,
                'name' => $term->name,
                'slug' => $term->slug,
            ];
        }
    }

    $response->data['primary_category'] = $primary_category;
    return $response;
}, 10, 3);

/**
 * Also expose via the WP REST API for bulk import
 * Allows setting _primary_category via POST /wp-json/wp/v2/product/{id}
 */
add_action('rest_api_init', function() {
    register_rest_field('product', 'primary_category_id', [
        'get_callback' => function($post) {
            return get_post_meta($post['id'], '_primary_category', true) ?: null;
        },
        'update_callback' => function($value, $post) {
            if ($value) {
                update_post_meta($post->ID, '_primary_category', intval($value));
            } else {
                delete_post_meta($post->ID, '_primary_category');
            }
        },
        'schema' => [
            'type' => ['integer', 'null'],
            'description' => 'Primary category term ID for breadcrumbs',
        ],
    ]);
});
