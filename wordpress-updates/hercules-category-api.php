<?php
/**
 * Plugin Name: Hercules Category API
 * Description: Custom REST API endpoint for product categories with second_description and FAQ
 * Version: 1.2.0
 * Author: Hercules Merchandise
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register custom REST API routes for categories
 */
add_action('rest_api_init', function() {
    // Get all categories
    register_rest_route('hercules/v1', '/categories', [
        'methods' => 'GET',
        'callback' => 'hercules_get_all_categories',
        'permission_callback' => '__return_true',
    ]);

    // Get single category by slug
    register_rest_route('hercules/v1', '/category/(?P<slug>[a-zA-Z0-9-]+)', [
        'methods' => 'GET',
        'callback' => 'hercules_get_category_by_slug',
        'permission_callback' => '__return_true',
        'args' => [
            'slug' => [
                'required' => true,
                'type' => 'string',
            ],
        ],
    ]);
});

/**
 * Get all product categories with custom meta
 */
function hercules_get_all_categories() {
    $categories = get_terms([
        'taxonomy' => 'product_cat',
        'hide_empty' => false,
    ]);

    if (is_wp_error($categories)) {
        return new WP_REST_Response(['error' => 'Failed to fetch categories'], 500);
    }

    $result = [];
    foreach ($categories as $category) {
        $result[] = hercules_format_category($category);
    }

    return new WP_REST_Response($result, 200);
}

/**
 * Get single category by slug
 */
function hercules_get_category_by_slug($request) {
    $slug = $request->get_param('slug');

    $term = get_term_by('slug', $slug, 'product_cat');

    if (!$term || is_wp_error($term)) {
        return new WP_REST_Response(['error' => 'Category not found'], 404);
    }

    return new WP_REST_Response(hercules_format_category($term), 200);
}

/**
 * Format category with custom meta fields
 */
function hercules_format_category($category) {
    // Get second description from term meta
    $second_description = get_term_meta($category->term_id, 'seconddesc', true);

    // Get FAQ from ACF repeater field (if using ACF)
    // Field name: 'category_faq' - repeater with sub-fields 'question' and 'answer'
    $faq = [];

    // Try ACF first
    if (function_exists('get_field')) {
        $acf_faq = get_field('category_faq', 'product_cat_' . $category->term_id);
        if (is_array($acf_faq)) {
            foreach ($acf_faq as $item) {
                if (!empty($item['question']) && !empty($item['answer'])) {
                    $faq[] = [
                        'question' => $item['question'],
                        'answer' => $item['answer'],
                    ];
                }
            }
        }
    }

    // Fallback: try term_meta directly (if FAQ is stored as serialized array)
    if (empty($faq)) {
        $meta_faq = get_term_meta($category->term_id, 'category_faq', true);
        if (is_array($meta_faq)) {
            foreach ($meta_faq as $item) {
                if (!empty($item['question']) && !empty($item['answer'])) {
                    $faq[] = [
                        'question' => $item['question'],
                        'answer' => $item['answer'],
                    ];
                }
            }
        }
    }

    // Get SEO override fields from term meta
    $seo_h1 = get_term_meta($category->term_id, 'seo_h1', true);
    $seo_title = get_term_meta($category->term_id, 'seo_title', true);

    return [
        'id' => $category->term_id,
        'name' => $category->name,
        'slug' => $category->slug,
        'parent' => $category->parent,
        'count' => $category->count,
        'description' => $category->description,
        'second_description' => $second_description ?: null,
        'faq' => $faq,
        'seo_h1' => $seo_h1 ?: null,
        'seo_title' => $seo_title ?: null,
    ];
}

/**
 * Add SEO fields to the Edit Category form
 */
add_action('product_cat_edit_form_fields', function($term) {
    $seo_h1 = get_term_meta($term->term_id, 'seo_h1', true);
    $seo_title = get_term_meta($term->term_id, 'seo_title', true);
    ?>
    <tr class="form-field">
        <th scope="row"><label for="seo_h1">SEO H1</label></th>
        <td>
            <input type="text" name="seo_h1" id="seo_h1" value="<?php echo esc_attr($seo_h1); ?>" style="width: 100%;" />
            <p class="description">Override the &lt;h1&gt; on the collection page. Leave empty to use the category name.</p>
        </td>
    </tr>
    <tr class="form-field">
        <th scope="row"><label for="seo_title">SEO Title</label></th>
        <td>
            <input type="text" name="seo_title" id="seo_title" value="<?php echo esc_attr($seo_title); ?>" style="width: 100%;" />
            <p class="description">Override the meta &lt;title&gt; on the collection page. Leave empty to use the category name. Do not include the site name — it is appended automatically.</p>
        </td>
    </tr>
    <?php
});

/**
 * Add SEO fields to the Add Category form
 */
add_action('product_cat_add_form_fields', function() {
    ?>
    <div class="form-field">
        <label for="seo_h1">SEO H1</label>
        <input type="text" name="seo_h1" id="seo_h1" value="" />
        <p class="description">Override the &lt;h1&gt; on the collection page. Leave empty to use the category name.</p>
    </div>
    <div class="form-field">
        <label for="seo_title">SEO Title</label>
        <input type="text" name="seo_title" id="seo_title" value="" />
        <p class="description">Override the meta &lt;title&gt; on the collection page. Leave empty to use the category name. Do not include the site name — it is appended automatically.</p>
    </div>
    <?php
});

/**
 * Save SEO fields when category is created or updated
 */
add_action('edited_product_cat', 'hercules_save_category_seo_fields');
add_action('created_product_cat', 'hercules_save_category_seo_fields');
function hercules_save_category_seo_fields($term_id) {
    if (isset($_POST['seo_h1'])) {
        $value = sanitize_text_field($_POST['seo_h1']);
        if ($value) {
            update_term_meta($term_id, 'seo_h1', $value);
        } else {
            delete_term_meta($term_id, 'seo_h1');
        }
    }
    if (isset($_POST['seo_title'])) {
        $value = sanitize_text_field($_POST['seo_title']);
        if ($value) {
            update_term_meta($term_id, 'seo_title', $value);
        } else {
            delete_term_meta($term_id, 'seo_title');
        }
    }
}
