<?php
/**
 * Plugin Name: Turkana Admin Dashboard
 * Description: Karamoja widgets for the WordPress admin dashboard home screen.
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

function tk_dashboard_pending_content_count($post_type) {
    $query = new WP_Query([
        'post_type' => $post_type,
        'post_status' => 'draft',
        'posts_per_page' => 1,
        'fields' => 'ids',
        'meta_query' => [
            'relation' => 'OR',
            [
                'key' => 'review_status',
                'value' => 'pending',
                'compare' => '=',
            ],
            [
                'key' => 'review_status',
                'compare' => 'NOT EXISTS',
            ],
        ],
    ]);
    return (int) $query->found_posts;
}

function tk_dashboard_published_count($post_type) {
    $counts = wp_count_posts($post_type);
    return (int) ($counts->publish ?? 0);
}

function tk_dashboard_stats() {
    $pending_orgs = function_exists('tk_org_count_by_status') ? tk_org_count_by_status('pending') : 0;
    $pending_alerts = tk_dashboard_pending_content_count('tk_alert');
    $pending_reports = tk_dashboard_pending_content_count('tk_report');

    return [
        'orgs_pending' => $pending_orgs,
        'orgs_approved' => function_exists('tk_org_count_by_status') ? tk_org_count_by_status('approved') : 0,
        'alerts_pending' => $pending_alerts,
        'alerts_live' => tk_dashboard_published_count('tk_alert'),
        'reports_pending' => $pending_reports,
        'reports_live' => tk_dashboard_published_count('tk_report'),
        'total_pending' => $pending_orgs + $pending_alerts + $pending_reports,
    ];
}

function tk_dashboard_recent_items($post_type, $limit = 5) {
    $args = [
        'post_type' => $post_type,
        'post_status' => ['draft', 'publish', 'pending', 'private'],
        'posts_per_page' => $limit,
        'orderby' => 'date',
        'order' => 'DESC',
    ];

    if ($post_type === 'tk_organization') {
        $args['meta_key'] = 'verification_status';
    }

    return get_posts($args);
}

function tk_dashboard_item_status_label($post) {
    if ($post->post_type === 'tk_organization') {
        $status = function_exists('tk_org_get_status') ? tk_org_get_status($post->ID) : 'pending';
        return $status;
    }
    if (function_exists('tk_hub_get_review_status')) {
        return tk_hub_get_review_status($post->ID);
    }
    return $post->post_status === 'publish' ? 'approved' : 'pending';
}

function tk_dashboard_item_edit_url($post) {
    if ($post->post_type === 'tk_organization' && function_exists('tk_org_admin_profile_url')) {
        return tk_org_admin_profile_url($post->ID);
    }
    return get_edit_post_link($post->ID, 'raw');
}

function tk_dashboard_list_url($post_type, $filter = '') {
    $base = admin_url('edit.php?post_type=' . $post_type);
    if ($post_type === 'tk_organization' && $filter) {
        return add_query_arg('tk_verification', $filter, $base);
    }
    return $base;
}

function tk_dashboard_frontend_url() {
    return defined('TK_HUB_NEXT_URL') ? rtrim(TK_HUB_NEXT_URL, '/') : 'http://localhost:3000';
}

function tk_dashboard_render_overview_widget() {
    $stats = tk_dashboard_stats();
    $frontend = tk_dashboard_frontend_url();
    ?>
    <div class="tk-dash-welcome">
        <div class="tk-dash-welcome-text">
            <h3><?php esc_html_e('Karamoja Climate Change Knowledge and Information', 'turkana-headless'); ?></h3>
            <p><?php esc_html_e('Manage partner organisations, advisories, and reports for the cross-border climate platform.', 'turkana-headless'); ?></p>
            <div class="tk-dash-welcome-actions">
                <a class="button button-primary" href="<?php echo esc_url($frontend); ?>" target="_blank" rel="noopener"><?php esc_html_e('View Karamoja', 'turkana-headless'); ?></a>
                <?php if ($stats['total_pending'] > 0) : ?>
                    <a class="button" href="<?php echo esc_url(tk_dashboard_list_url('tk_organization', 'pending')); ?>"><?php esc_html_e('Review pending items', 'turkana-headless'); ?></a>
                <?php endif; ?>
            </div>
        </div>
        <div class="tk-dash-stat-grid">
            <a class="tk-dash-stat tk-dash-stat-org" href="<?php echo esc_url(tk_dashboard_list_url('tk_organization')); ?>">
                <span class="tk-dash-stat-val"><?php echo esc_html((string) $stats['orgs_approved']); ?></span>
                <span class="tk-dash-stat-label"><?php esc_html_e('Approved orgs', 'turkana-headless'); ?></span>
                <?php if ($stats['orgs_pending'] > 0) : ?>
                    <span class="tk-dash-stat-badge"><?php echo esc_html(sprintf(_n('%d pending', '%d pending', $stats['orgs_pending'], 'turkana-headless'), $stats['orgs_pending'])); ?></span>
                <?php endif; ?>
            </a>
            <a class="tk-dash-stat tk-dash-stat-alert" href="<?php echo esc_url(tk_dashboard_list_url('tk_alert')); ?>">
                <span class="tk-dash-stat-val"><?php echo esc_html((string) $stats['alerts_live']); ?></span>
                <span class="tk-dash-stat-label"><?php esc_html_e('Live advisories', 'turkana-headless'); ?></span>
                <?php if ($stats['alerts_pending'] > 0) : ?>
                    <span class="tk-dash-stat-badge"><?php echo esc_html(sprintf(_n('%d pending', '%d pending', $stats['alerts_pending'], 'turkana-headless'), $stats['alerts_pending'])); ?></span>
                <?php endif; ?>
            </a>
            <a class="tk-dash-stat tk-dash-stat-report" href="<?php echo esc_url(tk_dashboard_list_url('tk_report')); ?>">
                <span class="tk-dash-stat-val"><?php echo esc_html((string) $stats['reports_live']); ?></span>
                <span class="tk-dash-stat-label"><?php esc_html_e('Published reports', 'turkana-headless'); ?></span>
                <?php if ($stats['reports_pending'] > 0) : ?>
                    <span class="tk-dash-stat-badge"><?php echo esc_html(sprintf(_n('%d pending', '%d pending', $stats['reports_pending'], 'turkana-headless'), $stats['reports_pending'])); ?></span>
                <?php endif; ?>
            </a>
        </div>
    </div>
    <?php
}

function tk_dashboard_pending_items($post_type, $limit = 3) {
    if ($post_type === 'tk_organization') {
        return get_posts([
            'post_type' => 'tk_organization',
            'post_status' => ['draft', 'publish', 'pending', 'private'],
            'posts_per_page' => $limit,
            'orderby' => 'date',
            'order' => 'DESC',
            'meta_key' => 'verification_status',
            'meta_value' => 'pending',
        ]);
    }

    return get_posts([
        'post_type' => $post_type,
        'post_status' => 'draft',
        'posts_per_page' => $limit,
        'orderby' => 'date',
        'order' => 'DESC',
        'meta_query' => [
            'relation' => 'OR',
            [
                'key' => 'review_status',
                'value' => 'pending',
                'compare' => '=',
            ],
            [
                'key' => 'review_status',
                'compare' => 'NOT EXISTS',
            ],
        ],
    ]);
}

function tk_dashboard_render_pending_widget() {
    $stats = tk_dashboard_stats();
    if ($stats['total_pending'] < 1) {
        echo '<p class="tk-dash-empty">' . esc_html__('Nothing awaiting review. All caught up!', 'turkana-headless') . '</p>';
        return;
    }

    $groups = [
        [
            'label' => __('Organisations', 'turkana-headless'),
            'count' => $stats['orgs_pending'],
            'url' => tk_dashboard_list_url('tk_organization', 'pending'),
            'items' => tk_dashboard_pending_items('tk_organization', 3),
        ],
        [
            'label' => __('Advisories', 'turkana-headless'),
            'count' => $stats['alerts_pending'],
            'url' => tk_dashboard_list_url('tk_alert'),
            'items' => tk_dashboard_pending_items('tk_alert', 3),
        ],
        [
            'label' => __('Reports', 'turkana-headless'),
            'count' => $stats['reports_pending'],
            'url' => tk_dashboard_list_url('tk_report'),
            'items' => tk_dashboard_pending_items('tk_report', 3),
        ],
    ];

    echo '<ul class="tk-dash-pending-list">';
    foreach ($groups as $group) {
        if ($group['count'] < 1) {
            continue;
        }
        echo '<li class="tk-dash-pending-group">';
        echo '<div class="tk-dash-pending-head">';
        echo '<strong>' . esc_html($group['label']) . '</strong>';
        echo '<a href="' . esc_url($group['url']) . '">' . esc_html(sprintf(_n('%d item', '%d items', $group['count'], 'turkana-headless'), $group['count'])) . '</a>';
        echo '</div>';
        if (!empty($group['items'])) {
            echo '<ul class="tk-dash-pending-items">';
            foreach ($group['items'] as $post) {
                $edit = tk_dashboard_item_edit_url($post);
                if (!$edit) {
                    continue;
                }
                echo '<li><a href="' . esc_url($edit) . '">' . esc_html(get_the_title($post)) . '</a></li>';
            }
            echo '</ul>';
        }
        echo '</li>';
    }
    echo '</ul>';
}

function tk_dashboard_render_quick_links_widget() {
    $frontend = tk_dashboard_frontend_url();
    $links = [
        ['label' => __('Partner Organisations', 'turkana-headless'), 'url' => tk_dashboard_list_url('tk_organization'), 'sub' => __('Review registrations', 'turkana-headless')],
        ['label' => __('Advisories & Warnings', 'turkana-headless'), 'url' => tk_dashboard_list_url('tk_alert'), 'sub' => __('Approve early warnings', 'turkana-headless')],
        ['label' => __('Reports & Documents', 'turkana-headless'), 'url' => tk_dashboard_list_url('tk_report'), 'sub' => __('Review uploaded files', 'turkana-headless')],
        ['label' => __('Site Logo', 'turkana-headless'), 'url' => admin_url('themes.php?page=tk-hub-branding'), 'sub' => __('Branding & logo', 'turkana-headless')],
        ['label' => __('Karamoja Hero', 'turkana-headless'), 'url' => admin_url('themes.php?page=tk-hub-hero'), 'sub' => __('Home page banner', 'turkana-headless')],
        ['label' => __('View public site', 'turkana-headless'), 'url' => $frontend, 'sub' => __('Open Next.js frontend', 'turkana-headless'), 'external' => true],
    ];
    echo '<ul class="tk-dash-quick-links">';
    foreach ($links as $link) {
        $target = !empty($link['external']) ? ' target="_blank" rel="noopener"' : '';
        echo '<li><a href="' . esc_url($link['url']) . '"' . $target . '>';
        echo esc_html($link['label']);
        echo '<span>' . esc_html($link['sub']) . '</span>';
        echo '</a></li>';
    }
    echo '</ul>';
}

function tk_dashboard_render_activity_widget() {
    $types = [
        'tk_organization' => __('Organisation', 'turkana-headless'),
        'tk_alert' => __('Advisory', 'turkana-headless'),
        'tk_report' => __('Report', 'turkana-headless'),
    ];
    $items = [];
    foreach (array_keys($types) as $type) {
        foreach (tk_dashboard_recent_items($type, 3) as $post) {
            $items[] = $post;
        }
    }
    usort($items, function ($a, $b) {
        return strtotime($b->post_date) - strtotime($a->post_date);
    });
    $items = array_slice($items, 0, 8);

    if (empty($items)) {
        echo '<p class="tk-dash-empty">' . esc_html__('No submissions yet.', 'turkana-headless') . '</p>';
        return;
    }

    echo '<table class="tk-dash-activity widefat striped">';
    echo '<thead><tr><th>' . esc_html__('Item', 'turkana-headless') . '</th><th>' . esc_html__('Type', 'turkana-headless') . '</th><th>' . esc_html__('Status', 'turkana-headless') . '</th><th>' . esc_html__('Date', 'turkana-headless') . '</th></tr></thead><tbody>';
    foreach ($items as $post) {
        $edit = tk_dashboard_item_edit_url($post);
        $status = tk_dashboard_item_status_label($post);
        $badge = function_exists('tk_hub_review_badge') ? tk_hub_review_badge($status) : esc_html(ucfirst($status));
        echo '<tr>';
        echo '<td><a href="' . esc_url($edit ?: '#') . '">' . esc_html(get_the_title($post) ?: __('(no title)', 'turkana-headless')) . '</a></td>';
        echo '<td>' . esc_html($types[$post->post_type] ?? $post->post_type) . '</td>';
        echo '<td>' . $badge . '</td>';
        echo '<td>' . esc_html(get_the_date('j M Y', $post)) . '</td>';
        echo '</tr>';
    }
    echo '</tbody></table>';
}

add_action('wp_dashboard_setup', function () {
    if (!current_user_can('edit_posts')) {
        return;
    }

    remove_meta_box('dashboard_primary', 'dashboard', 'side');
    remove_action('welcome_panel', 'wp_welcome_panel');

    wp_add_dashboard_widget(
        'tk_hub_overview',
        __('Karamoja Overview', 'turkana-headless'),
        'tk_dashboard_render_overview_widget',
        null,
        null,
        'normal',
        'high'
    );

    wp_add_dashboard_widget(
        'tk_hub_pending',
        __('Pending Review', 'turkana-headless'),
        'tk_dashboard_render_pending_widget',
        null,
        null,
        'normal',
        'high'
    );

    wp_add_dashboard_widget(
        'tk_hub_activity',
        __('Recent Submissions', 'turkana-headless'),
        'tk_dashboard_render_activity_widget',
        null,
        null,
        'normal',
        'default'
    );

    if (current_user_can('manage_options')) {
        wp_add_dashboard_widget(
            'tk_hub_quick_links',
            __('Karamoja Quick Links', 'turkana-headless'),
            'tk_dashboard_render_quick_links_widget',
            null,
            null,
            'side',
            'high'
        );
    }
});

add_action('admin_enqueue_scripts', function ($hook) {
    if ($hook !== 'index.php') {
        return;
    }
    $css = __DIR__ . '/assets/admin-dashboard.css';
    if (file_exists($css)) {
        wp_enqueue_style(
            'tk-admin-dashboard',
            plugin_dir_url(__FILE__) . 'assets/admin-dashboard.css',
            [],
            (string) filemtime($css)
        );
    }
});

add_action('admin_head-index.php', function () {
    echo '<style>#dashboard-widgets .postbox#tk_hub_overview .postbox-header h2,#dashboard-widgets .postbox#tk_hub_pending .postbox-header h2{color:#3D2B1F;}</style>';
});
