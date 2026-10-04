<?php
/**
 * Plugin Name: Turkana Report Downloads
 * Description: Tracks public report downloads from the Next.js library and exposes totals by language version.
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

const TK_REPORT_DOWNLOAD_COOLDOWN = 20;

function tk_report_collect_files($post_id) {
    $raw = get_post_meta($post_id, 'report_files', true);
    $files = function_exists('tk_hub_decode_list_meta')
        ? tk_hub_decode_list_meta($raw)
        : (is_array($raw) ? $raw : []);

    if (empty($files)) {
        $url = get_post_meta($post_id, 'file_url', true);
        if ($url) {
            $files[] = [
                'url' => $url,
                'size' => get_post_meta($post_id, 'file_size', true),
                'language' => 'en',
                'label' => __('English', 'turkana-headless'),
                'filename' => '',
            ];
        }
    }

    return is_array($files) ? array_values($files) : [];
}

function tk_report_normalize_file_url($url) {
    $url = trim((string) $url);
    if ($url === '') {
        return '';
    }
    $parts = wp_parse_url($url);
    $path = isset($parts['path']) ? rawurldecode($parts['path']) : $url;
    return untrailingslashit(strtolower($path));
}

function tk_report_download_version_key($file) {
    $lang = strtolower(sanitize_key($file['language'] ?? ''));
    if ($lang) {
        return $lang;
    }
    $filename = sanitize_file_name($file['filename'] ?? '');
    if ($filename) {
        return strtolower($filename);
    }
    $norm = tk_report_normalize_file_url($file['url'] ?? '');
    if ($norm) {
        return substr(md5($norm), 0, 12);
    }
    return 'file';
}

function tk_report_match_download_file($post_id, $url, $language) {
    $files = tk_report_collect_files($post_id);
    if (empty($files)) {
        return null;
    }

    $norm = tk_report_normalize_file_url($url);
    if ($norm) {
        foreach ($files as $file) {
            if (tk_report_normalize_file_url($file['url'] ?? '') === $norm) {
                return $file;
            }
        }
    }

    $lang = strtolower(sanitize_key($language));
    if ($lang) {
        foreach ($files as $file) {
            if (strtolower(sanitize_key($file['language'] ?? '')) === $lang) {
                return $file;
            }
        }
    }

    if (count($files) === 1 && ($norm === '' || $lang === '')) {
        return $files[0];
    }

    return null;
}

function tk_report_get_download_counts($post_id) {
    $raw = get_post_meta($post_id, 'download_counts', true);
    return is_array($raw) ? $raw : [];
}

function tk_report_get_download_stats($post_id) {
    $files = tk_report_collect_files($post_id);
    $stored = tk_report_get_download_counts($post_id);
    $versions = [];
    $seen = [];

    foreach ($files as $file) {
        $key = tk_report_download_version_key($file);
        $row = isset($stored[$key]) && is_array($stored[$key]) ? $stored[$key] : [];
        $count = isset($row['count']) ? (int) $row['count'] : (is_numeric($stored[$key] ?? null) ? (int) $stored[$key] : 0);
        $versions[] = [
            'key' => $key,
            'language' => $file['language'] ?? ($row['language'] ?? $key),
            'label' => $file['label'] ?? ($row['label'] ?? ($file['language'] ?? $key)),
            'filename' => $file['filename'] ?? ($row['filename'] ?? ''),
            'url' => $file['url'] ?? ($row['url'] ?? ''),
            'count' => $count,
        ];
        $seen[$key] = true;
    }

    foreach ($stored as $key => $row) {
        if (isset($seen[$key])) {
            continue;
        }
        if (is_array($row)) {
            $versions[] = [
                'key' => $key,
                'language' => $row['language'] ?? $key,
                'label' => $row['label'] ?? $key,
                'filename' => $row['filename'] ?? '',
                'url' => $row['url'] ?? '',
                'count' => (int) ($row['count'] ?? 0),
            ];
        }
    }

    $total = (int) get_post_meta($post_id, 'download_count', true);
    if ($total < 1) {
        $total = 0;
        foreach ($versions as $version) {
            $total += (int) $version['count'];
        }
    }

    return [
        'total' => $total,
        'versions' => $versions,
        'last_downloaded_at' => get_post_meta($post_id, 'last_downloaded_at', true) ?: '',
    ];
}

function tk_report_increment_downloads($post_id, $file) {
    $key = tk_report_download_version_key($file);
    $total = (int) get_post_meta($post_id, 'download_count', true);
    update_post_meta($post_id, 'download_count', $total + 1);

    $counts = tk_report_get_download_counts($post_id);
    if (!isset($counts[$key]) || !is_array($counts[$key])) {
        $counts[$key] = ['count' => 0];
    }
    $counts[$key]['count'] = (int) ($counts[$key]['count'] ?? 0) + 1;
    $counts[$key]['language'] = sanitize_text_field($file['language'] ?? $key);
    $counts[$key]['label'] = sanitize_text_field($file['label'] ?? ($file['language'] ?? $key));
    $counts[$key]['filename'] = sanitize_text_field($file['filename'] ?? '');
    $counts[$key]['url'] = esc_url_raw($file['url'] ?? '');
    update_post_meta($post_id, 'download_counts', $counts);
    update_post_meta($post_id, 'last_downloaded_at', current_time('mysql'));

    return tk_report_get_download_stats($post_id);
}

function tk_report_download_client_ip() {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    return $ip ? sanitize_text_field($ip) : 'unknown';
}

function tk_rest_track_report_download(WP_REST_Request $request) {
    $post_id = (int) $request['id'];
    $post = get_post($post_id);
    if (!$post || $post->post_type !== 'tk_report' || $post->post_status !== 'publish') {
        return new WP_Error('not_found', 'Report not found', ['status' => 404]);
    }

    $body = $request->get_json_params();
    if (!is_array($body)) {
        $body = [];
    }

    $url = esc_url_raw($body['url'] ?? '');
    $language = sanitize_text_field($body['language'] ?? '');
    $file = tk_report_match_download_file($post_id, $url, $language);
    if (!$file) {
        return new WP_Error('unknown_file', 'That file is not attached to this report', ['status' => 400]);
    }

    if (!empty($body['label']) && empty($file['label'])) {
        $file['label'] = sanitize_text_field($body['label']);
    }
    if (!empty($body['filename']) && empty($file['filename'])) {
        $file['filename'] = sanitize_text_field($body['filename']);
    }

    $key = tk_report_download_version_key($file);
    $cooldown_id = 'tk_rdl_' . md5($post_id . '|' . $key . '|' . tk_report_download_client_ip());
    if (get_transient($cooldown_id)) {
        return rest_ensure_response(array_merge(tk_report_get_download_stats($post_id), [
            'ok' => true,
            'counted' => false,
        ]));
    }
    set_transient($cooldown_id, 1, TK_REPORT_DOWNLOAD_COOLDOWN);

    $stats = tk_report_increment_downloads($post_id, $file);
    $stats['ok'] = true;
    $stats['counted'] = true;
    return rest_ensure_response($stats);
}

add_action('rest_api_init', function () {
    register_rest_route('tk/v1', '/reports/(?P<id>\d+)/download', [
        'methods' => 'POST',
        'permission_callback' => '__return_true',
        'callback' => 'tk_rest_track_report_download',
        'args' => [
            'id' => [
                'required' => true,
                'validate_callback' => function ($value) {
                    return is_numeric($value) && (int) $value > 0;
                },
            ],
        ],
    ]);
});

add_action('init', function () {
    if (!post_type_exists('tk_report')) {
        return;
    }
    register_post_meta('tk_report', 'download_count', [
        'type' => 'integer',
        'single' => true,
        'default' => 0,
        'show_in_rest' => true,
        'auth_callback' => function () {
            return current_user_can('edit_posts');
        },
    ]);
}, 30);

function tk_report_render_download_cell($post_id) {
    $stats = tk_report_get_download_stats($post_id);
    echo '<div class="tk-hub-dl">';
    echo '<strong class="tk-hub-dl-total">' . esc_html(number_format_i18n($stats['total'])) . '</strong>';
    if (!empty($stats['versions'])) {
        echo '<div class="tk-hub-dl-versions">';
        foreach ($stats['versions'] as $version) {
            $label = strtoupper((string) ($version['language'] ?: $version['label'] ?: $version['key']));
            echo '<span title="' . esc_attr($version['label'] ?: $label) . '">'
                . esc_html($label) . ' ' . esc_html(number_format_i18n($version['count']))
                . '</span>';
        }
        echo '</div>';
    }
    echo '</div>';
}

function tk_report_is_download_sort($query) {
    if (!is_admin() || !$query instanceof WP_Query || !$query->is_main_query()) {
        return false;
    }
    if ($query->get('post_type') !== 'tk_report' && $query->get('post_type') !== ['tk_report']) {
        $screen = function_exists('get_current_screen') ? get_current_screen() : null;
        if (!$screen || $screen->id !== 'edit-tk_report') {
            return false;
        }
    }
    return $query->get('orderby') === 'tk_downloads';
}

add_filter('posts_join', function ($join, $query) {
    if (!tk_report_is_download_sort($query)) {
        return $join;
    }
    global $wpdb;
    $join .= " LEFT JOIN {$wpdb->postmeta} AS tk_dl ON ({$wpdb->posts}.ID = tk_dl.post_id AND tk_dl.meta_key = 'download_count') ";
    return $join;
}, 10, 2);

add_filter('posts_orderby', function ($orderby, $query) {
    if (!tk_report_is_download_sort($query)) {
        return $orderby;
    }
    $order = strtoupper((string) $query->get('order')) === 'ASC' ? 'ASC' : 'DESC';
    return "CAST(COALESCE(tk_dl.meta_value, '0') AS SIGNED) {$order}";
}, 10, 2);
