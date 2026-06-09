<?php
/**
 * Plugin Name: Hercules Distributor Role & Discount
 * Description: Registers a "Distributor" (Händler) WooCommerce customer role with an editable discount % user meta.
 *              Discount stored as user meta `distributor_discount` (0-100).
 * Version: 1.0.0
 * Author: Hercules Merchandise
 */

if ( ! defined( 'ABSPATH' ) ) exit;

/* ───────────────────────────────────────────
 * Locale-aware labels
 * ─────────────────────────────────────────── */
function hercules_dist_label( $key ) {
    $locale = get_locale();

    if ( strpos( $locale, 'de' ) === 0 ) {
        $labels = array(
            'role_name'       => 'Händler',
            'column_title'    => 'Händlerrabatt',
            'profile_heading' => 'Händlerrabatt',
            'profile_label'   => 'Rabatt (%)',
            'profile_desc'    => 'Prozentualer Rabatt auf alle Bestellungen dieses Händlers.',
        );
    } elseif ( strpos( $locale, 'fr' ) === 0 ) {
        $labels = array(
            'role_name'       => 'Distributeur',
            'column_title'    => 'Remise distributeur',
            'profile_heading' => 'Remise distributeur',
            'profile_label'   => 'Remise (%)',
            'profile_desc'    => 'Pourcentage de remise appliqué à toutes les commandes de ce distributeur.',
        );
    } else {
        $labels = array(
            'role_name'       => 'Distributor',
            'column_title'    => 'Distributor Discount',
            'profile_heading' => 'Distributor Discount',
            'profile_label'   => 'Discount (%)',
            'profile_desc'    => 'Percentage discount applied to all orders for this distributor.',
        );
    }

    return isset( $labels[ $key ] ) ? $labels[ $key ] : $key;
}

/* ───────────────────────────────────────────
 * 1. Register "distributor" role (once)
 *    Same capabilities as "customer"
 * ─────────────────────────────────────────── */
add_action( 'init', function () {
    if ( get_role( 'distributor' ) ) return;

    add_role( 'distributor', hercules_dist_label( 'role_name' ), array(
        'read' => true,
    ) );
} );

/* ───────────────────────────────────────────
 * 2. Admin Users list — "Händlerrabatt" column
 * ─────────────────────────────────────────── */
add_filter( 'manage_users_columns', function ( $columns ) {
    $new = array();
    foreach ( $columns as $key => $label ) {
        $new[ $key ] = $label;
        if ( $key === 'role' ) {
            $new['distributor_discount'] = hercules_dist_label( 'column_title' );
        }
    }
    return $new;
} );

add_filter( 'manage_users_custom_column', function ( $output, $column_name, $user_id ) {
    if ( $column_name !== 'distributor_discount' ) return $output;

    $user = get_userdata( $user_id );
    if ( ! $user || ! in_array( 'distributor', (array) $user->roles, true ) ) {
        return '—';
    }

    $discount = get_user_meta( $user_id, 'distributor_discount', true );
    if ( $discount === '' || $discount === false ) return '0%';

    return esc_html( floatval( $discount ) . '%' );
}, 10, 3 );

add_filter( 'manage_users_sortable_columns', function ( $columns ) {
    $columns['distributor_discount'] = 'distributor_discount';
    return $columns;
} );

add_action( 'pre_get_users', function ( $query ) {
    if ( 'distributor_discount' === $query->get( 'orderby' ) ) {
        $query->set( 'meta_key', 'distributor_discount' );
        $query->set( 'orderby', 'meta_value_num' );
    }
} );

/* ───────────────────────────────────────────
 * 3. Editable field on User Profile (WP Admin → Users → Edit)
 * ─────────────────────────────────────────── */
add_action( 'show_user_profile', 'hercules_distributor_discount_field' );
add_action( 'edit_user_profile', 'hercules_distributor_discount_field' );

function hercules_distributor_discount_field( $user ) {
    if ( ! in_array( 'distributor', (array) $user->roles, true ) ) return;

    $discount = get_user_meta( $user->ID, 'distributor_discount', true );
    if ( $discount === '' || $discount === false ) $discount = 0;
    ?>
    <h3><?php echo esc_html( hercules_dist_label( 'profile_heading' ) ); ?></h3>
    <table class="form-table">
        <tr>
            <th><label for="distributor_discount"><?php echo esc_html( hercules_dist_label( 'profile_label' ) ); ?></label></th>
            <td>
                <input type="number" name="distributor_discount" id="distributor_discount"
                       value="<?php echo esc_attr( floatval( $discount ) ); ?>"
                       min="0" max="100" step="0.5" style="width:80px;" />
                <span class="description"><?php echo esc_html( hercules_dist_label( 'profile_desc' ) ); ?></span>
            </td>
        </tr>
    </table>
    <?php
}

add_action( 'personal_options_update', 'hercules_distributor_discount_save' );
add_action( 'edit_user_profile_update', 'hercules_distributor_discount_save' );

function hercules_distributor_discount_save( $user_id ) {
    if ( ! current_user_can( 'edit_user', $user_id ) ) return;

    $user = get_userdata( $user_id );
    if ( ! $user || ! in_array( 'distributor', (array) $user->roles, true ) ) return;

    if ( isset( $_POST['distributor_discount'] ) ) {
        $val = floatval( $_POST['distributor_discount'] );
        $val = max( 0, min( 100, $val ) );
        update_user_meta( $user_id, 'distributor_discount', $val );
    }
}

/* ───────────────────────────────────────────
 * 4. Cart discount — negative fee
 * ─────────────────────────────────────────── */
add_action( 'woocommerce_cart_calculate_fees', function ( $cart ) {
    if ( is_admin() && ! defined( 'DOING_AJAX' ) ) return;

    $user = wp_get_current_user();
    if ( ! $user || ! in_array( 'distributor', (array) $user->roles, true ) ) return;

    $discount = floatval( get_user_meta( $user->ID, 'distributor_discount', true ) );
    if ( $discount <= 0 ) return;

    $subtotal = $cart->get_subtotal();
    $fee      = -1 * round( $subtotal * ( $discount / 100 ), 2 );

    $label = sprintf( '%s (%s%%)', hercules_dist_label( 'column_title' ), $discount );
    $cart->add_fee( $label, $fee, true );
} );

/* ───────────────────────────────────────────
 * 5. Save discount % as order meta
 * ─────────────────────────────────────────── */
add_action( 'woocommerce_checkout_create_order', function ( $order, $data ) {
    $user = $order->get_user();
    if ( ! $user || ! in_array( 'distributor', (array) $user->roles, true ) ) return;

    $discount = floatval( get_user_meta( $user->get( 'ID' ), 'distributor_discount', true ) );
    if ( $discount > 0 ) {
        $order->update_meta_data( '_distributor_discount_percent', $discount );
    }
}, 10, 2 );

/* ───────────────────────────────────────────
 * 6. Account dashboard banner
 * ─────────────────────────────────────────── */
add_action( 'woocommerce_account_dashboard', function () {
    $user = wp_get_current_user();
    if ( ! in_array( 'distributor', (array) $user->roles, true ) ) return;

    $discount = floatval( get_user_meta( $user->ID, 'distributor_discount', true ) );
    if ( $discount <= 0 ) return;

    $locale = get_locale();
    if ( strpos( $locale, 'de' ) === 0 ) {
        $msg = sprintf( 'Sie erhalten einen Händlerrabatt von <strong>%s%%</strong> auf alle Bestellungen.', $discount );
    } elseif ( strpos( $locale, 'fr' ) === 0 ) {
        $msg = sprintf( 'Vous bénéficiez d\'une remise distributeur de <strong>%s%%</strong> sur toutes les commandes.', $discount );
    } else {
        $msg = sprintf( 'You receive a distributor discount of <strong>%s%%</strong> on all orders.', $discount );
    }

    echo '<div style="background:#e6f9f3;border:1px solid #10C99E;border-radius:10px;padding:15px 20px;margin-bottom:20px;color:#253461;font-family:Jost,sans-serif;">' . $msg . '</div>';
} );

/* ───────────────────────────────────────────
 * 7. Order detail — show applied discount
 * ─────────────────────────────────────────── */
add_action( 'woocommerce_order_details_after_order_table', function ( $order ) {
    $discount = $order->get_meta( '_distributor_discount_percent' );
    if ( ! $discount || floatval( $discount ) <= 0 ) return;

    $locale = get_locale();
    if ( strpos( $locale, 'de' ) === 0 ) {
        $msg = sprintf( 'Händlerrabatt: %s%% angewendet', $discount );
    } elseif ( strpos( $locale, 'fr' ) === 0 ) {
        $msg = sprintf( 'Remise distributeur : %s%% appliquée', $discount );
    } else {
        $msg = sprintf( 'Distributor discount: %s%% applied', $discount );
    }

    echo '<p style="color:#10C99E;font-weight:500;margin-top:10px;">' . esc_html( $msg ) . '</p>';
} );

/* ───────────────────────────────────────────
 * 8. Admin order detail — show discount %
 * ─────────────────────────────────────────── */
add_action( 'woocommerce_admin_order_data_after_billing_address', function ( $order ) {
    $discount = $order->get_meta( '_distributor_discount_percent' );
    if ( ! $discount || floatval( $discount ) <= 0 ) return;

    echo '<p><strong>' . esc_html( hercules_dist_label( 'column_title' ) ) . ':</strong> ' . esc_html( $discount ) . '%</p>';
} );
