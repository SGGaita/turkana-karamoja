<?php
/**
 * Plugin Name: Turkana Admin CPT Lists
 * Description: Themed list tables with review actions for Organizations, Alerts, and Reports.
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

function tk_hub_review_statuses() {
    return [
        'pending' => __('Pending', 'turkana-headless'),
        'approved' => __('Approved', 'turkana-headless'),
        'rejected' => __('Rejected', 'turkana-headless'),
        'withdrawal_requested' => __('Withdrawal requested', 'turkana-headless'),
        'withdrawn' => __('Withdrawn', 'turkana-headless'),
    ];
}

/** The partner-portal plugin (tk-partner-portal.php) is the source of truth for review
 *  state — it stores it under the protected meta key `_tk_review_status` (with extra
 *  withdrawal states this admin screen didn't originally know about). This used to read
 *  a separate, never-synced `review_status` key, so an admin approving/rejecting here
 *  silently diverged from what the partner dashboard showed. Prefer `_tk_review_status`,
 *  and fall back to the legacy key / post status only for older posts that predate it. */
function tk_hub_get_review_status($post_id) {
    $statuses = tk_hub_review_statuses();
    $canonical = get_post_meta($post_id, '_tk_review_status', true);
    if ($canonical && array_key_exists($canonical, $statuses)) {
        return $canonical;
    }
    $legacy = get_post_meta($post_id, 'review_status', true);
    if ($legacy && array_key_exists($legacy, $statuses)) {
        return $legacy;
    }
    $post = get_post($post_id);
    if (!$post) {
        return 'pending';
    }
    if ($post->post_status === 'publish') {
        return 'approved';
    }
    if ($legacy === 'rejected') {
        return 'rejected';
    }
    return 'pending';
}

function tk_hub_review_badge($status) {
    $map = [
        'pending' => 'tk-hub-badge-pending',
        'approved' => 'tk-hub-badge-approved',
        'rejected' => 'tk-hub-badge-rejected',
        'withdrawal_requested' => 'tk-hub-badge-pending',
        'withdrawn' => 'tk-hub-badge-rejected',
    ];
    $class = $map[$status] ?? 'tk-hub-badge-pending';
    $labels = tk_hub_review_statuses();
    return '<span class="tk-hub-badge ' . esc_attr($class) . '">' . esc_html($labels[$status] ?? $status) . '</span>';
}

function tk_hub_alert_level_badge($level) {
    $level = strtolower((string) $level);
    $map = ['red' => 'tk-hub-badge-red', 'orange' => 'tk-hub-badge-orange', 'yellow' => 'tk-hub-badge-yellow', 'green' => 'tk-hub-badge-green'];
    $class = $map[$level] ?? 'tk-hub-badge-yellow';
    return '<span class="tk-hub-badge ' . esc_attr($class) . '">' . esc_html(strtoupper($level ?: '—')) . '</span>';
}

function tk_hub_action_btn($url, $label, $type = 'neutral') {
    return sprintf(
        '<a class="tk-hub-btn tk-hub-btn-%s" href="%s">%s</a>',
        esc_attr($type),
        esc_url($url),
        esc_html($label)
    );
}

function tk_hub_render_actions_wrap($buttons) {
    if (empty($buttons)) {
        echo '<span class="tk-hub-btn-muted">' . esc_html__('—', 'turkana-headless') . '</span>';
        return;
    }
    echo '<div class="tk-hub-actions">' . implode('', $buttons) . '</div>';
}

function tk_hub_content_approve($post_id) {
    if (!current_user_can('edit_post', $post_id)) {
        return new WP_Error('forbidden', 'Forbidden');
    }
    wp_update_post(['ID' => $post_id, 'post_status' => 'publish']);
    update_post_meta($post_id, 'review_status', 'approved');
    // Canonical key the partner-portal plugin (and partner dashboard) actually reads.
    update_post_meta($post_id, '_tk_review_status', 'approved');
    $post = get_post($post_id);
    if ($post && $post->post_type === 'tk_alert') {
        $lat = get_post_meta($post_id, 'latitude', true);
        $lng = get_post_meta($post_id, 'longitude', true);
        $area = get_post_meta($post_id, 'area', true);
        if (($lat !== '' && $lng !== '') || $area !== '') {
            update_post_meta($post_id, 'publish_on_map', '1');
        }
    }
    return true;
}

function tk_hub_content_reject($post_id) {
    if (!current_user_can('edit_post', $post_id)) {
        return new WP_Error('forbidden', 'Forbidden');
    }
    wp_update_post(['ID' => $post_id, 'post_status' => 'draft']);
    update_post_meta($post_id, 'review_status', 'rejected');
    // Canonical key the partner-portal plugin (and partner dashboard) actually reads.
    update_post_meta($post_id, '_tk_review_status', 'rejected');
    return true;
}

function tk_hub_handle_content_action($post_id, $action) {
    check_admin_referer('tk_content_action_' . $post_id);
    $post = get_post($post_id);
    if (!$post || !in_array($post->post_type, ['tk_alert', 'tk_report'], true)) {
        wp_die(__('Invalid item.', 'turkana-headless'));
    }
    $result = $action === 'approve' ? tk_hub_content_approve($post_id) : tk_hub_content_reject($post_id);
    if (is_wp_error($result)) {
        wp_die(esc_html($result->get_error_message()));
    }
    $args = [
        'tk_content_action' => $action,
        'tk_content_id' => $post_id,
    ];
    $redirect_to = isset($_GET['redirect_to']) ? wp_unslash($_GET['redirect_to']) : '';
    $base = admin_url('edit.php?post_type=' . $post->post_type);
    if ($redirect_to && str_starts_with(esc_url_raw($redirect_to), admin_url())) {
        $base = $redirect_to;
        unset($args['post_type']);
    } else {
        $args['post_type'] = $post->post_type;
    }
    wp_safe_redirect(add_query_arg($args, $base));
    exit;
}

add_action('admin_action_tk_approve_content', function () {
    if (!isset($_GET['post'])) {
        wp_die(__('Missing ID.', 'turkana-headless'));
    }
    tk_hub_handle_content_action((int) $_GET['post'], 'approve');
});

add_action('admin_action_tk_reject_content', function () {
    if (!isset($_GET['post'])) {
        wp_die(__('Missing ID.', 'turkana-headless'));
    }
    tk_hub_handle_content_action((int) $_GET['post'], 'reject');
});

function tk_hub_content_action_buttons($post_id, $post_type) {
    if (!current_user_can('edit_post', $post_id)) {
        return [];
    }
    $status = tk_hub_get_review_status($post_id);
    $buttons = [];
    $nonce = 'tk_content_action_' . $post_id;

    if ($status !== 'approved') {
        $buttons[] = tk_hub_action_btn(
            wp_nonce_url(admin_url('admin.php?action=tk_approve_content&post=' . $post_id), $nonce),
            __('Approve', 'turkana-headless'),
            'approve'
        );
    }
    if ($status !== 'rejected') {
        $buttons[] = tk_hub_action_btn(
            wp_nonce_url(admin_url('admin.php?action=tk_reject_content&post=' . $post_id), $nonce),
            __('Reject', 'turkana-headless'),
            'reject'
        );
    }
    $buttons[] = tk_hub_action_btn(get_edit_post_link($post_id, 'raw'), __('Edit', 'turkana-headless'), 'neutral');
    if ($post_type === 'tk_report') {
        $file = get_post_meta($post_id, 'file_url', true);
        if ($file) {
            $buttons[] = tk_hub_action_btn($file, __('File', 'turkana-headless'), 'neutral');
        }
    }
    return $buttons;
}

function tk_hub_org_action_buttons($post_id) {
    if (!function_exists('tk_org_get_status') || !current_user_can('edit_post', $post_id)) {
        return [];
    }
    $status = tk_org_get_status($post_id);
    $buttons = [];
    $nonce = 'tk_org_action_' . $post_id;

    if ($status !== 'approved') {
        $buttons[] = tk_hub_action_btn(
            wp_nonce_url(admin_url('admin.php?action=tk_approve_org&post=' . $post_id), $nonce),
            __('Approve', 'turkana-headless'),
            'approve'
        );
    }
    if ($status !== 'rejected') {
        $buttons[] = tk_hub_action_btn(
            wp_nonce_url(admin_url('admin.php?action=tk_reject_org&post=' . $post_id), $nonce),
            __('Reject', 'turkana-headless'),
            'reject'
        );
    }
    if (function_exists('tk_org_admin_profile_url')) {
        $buttons[] = tk_hub_action_btn(tk_org_admin_profile_url($post_id), __('Profile', 'turkana-headless'), 'neutral');
    }
    return $buttons;
}

function tk_hub_insert_columns($columns, $extra) {
    $new = [];
    foreach ($columns as $key => $label) {
        $new[$key] = $label;
        if ($key === 'title') {
            foreach ($extra as $col_key => $col_label) {
                $new[$col_key] = $col_label;
            }
        }
    }
    $new['tk_actions'] = __('Actions', 'turkana-headless');
    return $new;
}

/* Organizations — Actions column */
add_filter('manage_tk_organization_posts_columns', function ($columns) {
    $columns['tk_actions'] = __('Actions', 'turkana-headless');
    return $columns;
}, 99);

add_action('manage_tk_organization_posts_custom_column', function ($column, $post_id) {
    if ($column === 'tk_actions') {
        tk_hub_render_actions_wrap(tk_hub_org_action_buttons($post_id));
    }
}, 15, 2);

add_filter('post_row_actions', function ($actions, $post) {
    if ($post->post_type === 'tk_organization') {
        unset($actions['tk_approve'], $actions['tk_reject'], $actions['tk_profile']);
    }
    return $actions;
}, 99, 2);

/* Alerts */
add_filter('manage_tk_alert_posts_columns', function ($columns) {
    return tk_hub_insert_columns($columns, [
        'tk_alert_level' => __('Level', 'turkana-headless'),
        'tk_area' => __('Area', 'turkana-headless'),
        'tk_map' => __('Map', 'turkana-headless'),
        'tk_source' => __('Source', 'turkana-headless'),
        'tk_review' => __('Review', 'turkana-headless'),
    ]);
});

add_action('manage_tk_alert_posts_custom_column', function ($column, $post_id) {
    switch ($column) {
        case 'tk_alert_level':
            echo tk_hub_alert_level_badge(get_post_meta($post_id, 'alert_level', true));
            break;
        case 'tk_area':
            echo esc_html(get_post_meta($post_id, 'area', true) ?: '—');
            break;
        case 'tk_map':
            $on_map = (bool) get_post_meta($post_id, 'publish_on_map', true);
            $has_coords = get_post_meta($post_id, 'latitude', true) !== '' && get_post_meta($post_id, 'longitude', true) !== '';
            if ($on_map && $has_coords) {
                echo '<span class="tk-hub-badge tk-hub-badge-approved" style="font-size:10px;">' . esc_html__('On map', 'turkana-headless') . '</span>';
            } elseif ($has_coords) {
                echo '<span style="font-size:11px;color:#9A9A9A;">' . esc_html__('—', 'turkana-headless') . '</span>';
            } else {
                echo '<span style="font-size:11px;color:#b45309;">' . esc_html__('No pin', 'turkana-headless') . '</span>';
            }
            break;
        case 'tk_source':
            echo esc_html(get_post_meta($post_id, 'source', true) ?: '—');
            break;
        case 'tk_review':
            echo tk_hub_review_badge(tk_hub_get_review_status($post_id));
            break;
        case 'tk_actions':
            tk_hub_render_actions_wrap(tk_hub_content_action_buttons($post_id, 'tk_alert'));
            break;
    }
}, 10, 2);

/* Reports */
add_filter('manage_tk_report_posts_columns', function ($columns) {
    return tk_hub_insert_columns($columns, [
        'tk_report_tag' => __('Category', 'turkana-headless'),
        'tk_keywords' => __('Keywords', 'turkana-headless'),
        'tk_partner_orgs' => __('Organisation', 'turkana-headless'),
        'tk_file' => __('File', 'turkana-headless'),
        'tk_downloads' => __('Downloads', 'turkana-headless'),
        'tk_review' => __('Review', 'turkana-headless'),
    ]);
});

add_filter('manage_edit-tk_report_sortable_columns', function ($columns) {
    $columns['tk_downloads'] = 'tk_downloads';
    return $columns;
});

add_action('manage_tk_report_posts_custom_column', function ($column, $post_id) {
    switch ($column) {
        case 'tk_report_tag':
            $tag = get_post_meta($post_id, 'tag', true);
            echo $tag ? '<span class="tk-hub-tag">' . esc_html($tag) . '</span>' : '—';
            break;
        case 'tk_keywords':
            $keywords = function_exists('tk_parse_keywords_meta')
                ? tk_parse_keywords_meta(get_post_meta($post_id, 'keywords', true))
                : [];
            if (empty($keywords)) {
                echo '—';
                break;
            }
            echo esc_html(implode(', ', array_slice($keywords, 0, 4)));
            if (count($keywords) > 4) {
                echo ' <span class="tk-hub-btn-muted">+' . (count($keywords) - 4) . '</span>';
            }
            break;
        case 'tk_partner_orgs':
            echo esc_html(get_post_meta($post_id, 'partner_orgs', true) ?: '—');
            break;
        case 'tk_file':
            $url = get_post_meta($post_id, 'file_url', true);
            echo $url ? '<a href="' . esc_url($url) . '" target="_blank" rel="noopener" class="tk-hub-btn tk-hub-btn-neutral" style="padding:2px 8px;">PDF</a>' : '—';
            break;
        case 'tk_downloads':
            if (function_exists('tk_report_render_download_cell')) {
                tk_report_render_download_cell($post_id);
            } else {
                echo esc_html((int) get_post_meta($post_id, 'download_count', true));
            }
            break;
        case 'tk_review':
            echo tk_hub_review_badge(tk_hub_get_review_status($post_id));
            break;
        case 'tk_actions':
            tk_hub_render_actions_wrap(tk_hub_content_action_buttons($post_id, 'tk_report'));
            break;
    }
}, 10, 2);

add_action('rest_after_insert_tk_alert', function ($post, $request, $creating) {
    if ($creating) {
        update_post_meta($post->ID, 'review_status', 'pending');
    }
}, 20, 3);

add_action('rest_after_insert_tk_report', function ($post, $request, $creating) {
    if ($creating) {
        update_post_meta($post->ID, 'review_status', 'pending');
    }
}, 20, 3);

add_action('init', function () {
    register_post_meta('tk_alert', 'review_status', ['type' => 'string', 'single' => true, 'show_in_rest' => true, 'default' => 'pending']);
    register_post_meta('tk_report', 'review_status', ['type' => 'string', 'single' => true, 'show_in_rest' => true, 'default' => 'pending']);
}, 20);

function tk_hub_list_banners() {
    return [
        'tk_organization' => [
            'title' => __('Partner Organisations', 'turkana-headless'),
            'desc' => __('Review registration applications. Use the Actions column to approve or reject organisations.', 'turkana-headless'),
            'links' => [],
        ],
        'tk_alert' => [
            'title' => __('Advisories & Early Warnings', 'turkana-headless'),
            'desc' => __('Review partner advisories. Approved items publish to the Karamoja early warnings page.', 'turkana-headless'),
            'links' => [['label' => __('View on Karamoja', 'turkana-headless'), 'url' => 'http://localhost:3000/early-warnings', 'external' => true]],
        ],
        'tk_report' => [
            'title' => __('Reports & Documents', 'turkana-headless'),
            'desc' => __('Review uploaded reports. Approved items appear in the public reports library. The Downloads column counts each file version downloaded from that library.', 'turkana-headless'),
            'links' => [['label' => __('View on Karamoja', 'turkana-headless'), 'url' => 'http://localhost:3000/reports', 'external' => true]],
        ],
    ];
}

add_action('all_admin_notices', function () {
    $screen = get_current_screen();
    if (!$screen || $screen->base !== 'edit') {
        return;
    }
    $banners = tk_hub_list_banners();
    if (!isset($banners[$screen->post_type])) {
        return;
    }
    $b = $banners[$screen->post_type];
    echo '<div class="tk-hub-list-banner"><h1>' . esc_html($b['title']) . '</h1><p>' . esc_html($b['desc']) . '</p>';
    if (!empty($b['links'])) {
        echo '<div class="tk-hub-banner-actions">';
        foreach ($b['links'] as $link) {
            $target = !empty($link['external']) ? ' target="_blank" rel="noopener"' : '';
            echo '<a class="button button-secondary" href="' . esc_url($link['url']) . '"' . $target . '>' . esc_html($link['label']) . '</a>';
        }
        echo '</div>';
    }
    echo '</div>';
}, 5);

add_action('admin_notices', function () {
    $screen = get_current_screen();
    if (!$screen || !in_array($screen->post_type, ['tk_alert', 'tk_report'], true)) {
        return;
    }
    if (isset($_GET['tk_content_action'], $_GET['tk_content_id'])) {
        $action = sanitize_key($_GET['tk_content_action']);
        $title = get_the_title((int) $_GET['tk_content_id']);
        if ($action === 'approve') {
            echo '<div class="notice notice-success is-dismissible"><p>' . esc_html(sprintf(__('"%s" approved and published.', 'turkana-headless'), $title)) . '</p></div>';
        } elseif ($action === 'reject') {
            echo '<div class="notice notice-warning is-dismissible"><p>' . esc_html(sprintf(__('"%s" rejected.', 'turkana-headless'), $title)) . '</p></div>';
        }
    }
});

add_action('admin_enqueue_scripts', function ($hook) {
    if ($hook !== 'edit.php') {
        return;
    }
    $type = isset($_GET['post_type']) ? sanitize_key($_GET['post_type']) : 'post';
    if (!in_array($type, ['tk_organization', 'tk_alert', 'tk_report'], true)) {
        return;
    }
    $css = __DIR__ . '/assets/admin-cpt-lists.css';
    if (file_exists($css)) {
        wp_enqueue_style('tk-admin-cpt-lists', plugin_dir_url(__FILE__) . 'assets/admin-cpt-lists.css', [], (string) filemtime($css));
    }
});

add_action('admin_head', function () {
    $screen = get_current_screen();
    if (!$screen || $screen->base !== 'edit' || !in_array($screen->post_type, ['tk_organization', 'tk_alert', 'tk_report'], true)) {
        return;
    }
    echo '<style>.post-type-' . esc_attr($screen->post_type) . ' .wrap > h1.wp-heading-inline,'
        . '.post-type-' . esc_attr($screen->post_type) . ' .wrap > hr.wp-header-end{display:none!important;}'
        . '.column-tk_downloads{width:130px;}'
        . '.tk-hub-dl-total{font-size:15px;color:#3D2B1F;}'
        . '.tk-hub-dl-versions{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;}'
        . '.tk-hub-dl-versions span{font-size:10px;background:#FDF6EC;color:#6B4226;padding:1px 6px;border-radius:999px;white-space:nowrap;}'
        . '</style>';
});
