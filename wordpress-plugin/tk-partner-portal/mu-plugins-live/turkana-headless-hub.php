<?php
/**
 * Plugin Name: Turkana Headless Hub
 * Description: CPTs, REST meta (acf-shaped), and CORS for the Next.js climate hub.
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

require_once __DIR__ . '/turkana-hub-i18n.php';

define('TK_HUB_CORS_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000');
define('TK_HUB_NEXT_URL', 'http://localhost:3000');
define('TK_HUB_PUSH_SECRET', 'dba3cec14588fca3ac040833e6727c602e7841a1dd5aa89c5b48b8f92450d37b');

/* ---------- CORS for Next.js dev ---------- */
add_action('init', function () {
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    $allowed = array_map('trim', explode(',', TK_HUB_CORS_ORIGINS));
    if ($origin && in_array($origin, $allowed, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');
    }
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        status_header(204);
        exit;
    }
}, 1);

add_filter('rest_pre_serve_request', function ($value) {
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    $allowed = array_map('trim', explode(',', TK_HUB_CORS_ORIGINS));
    if ($origin && in_array($origin, $allowed, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');
    }
    return $value;
});

/* ---------- Custom post types ---------- */
add_action('init', function () {
    $types = [
        'tk_alert' => ['Alert', 'Alerts'],
        'tk_report' => ['Report', 'Reports'],
        'tk_initiative' => ['Initiative', 'Initiatives'],
        'tk_organization' => ['Organization', 'Organizations'],
        'tk_programme' => ['Programme', 'Programmes'],
        'tk_water_point' => ['Water Point', 'Water Points'],
        'tk_assistance_site' => ['Assistance Site', 'Assistance Sites'],
        'tk_planting_advisory' => ['Planting Advisory', 'Planting Advisories'],
    ];

    foreach ($types as $slug => $labels) {
        $args = [
            'labels' => [
                'name' => $labels[1],
                'singular_name' => $labels[0],
            ],
            'public' => true,
            'show_in_rest' => true,
            'rest_base' => $slug,
            'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'custom-fields'],
            'has_archive' => false,
            'menu_icon' => 'dashicons-admin-site-alt3',
        ];

        if ($slug === 'tk_organization') {
            $args['labels'] = [
                'name' => 'Organizations',
                'singular_name' => 'Organization',
                'menu_name' => 'Organizations',
                'all_items' => 'All Organizations',
                'add_new' => 'Add Organization',
                'add_new_item' => 'Add Organization',
                'edit_item' => 'Review Organization',
                'new_item' => 'New Organization',
                'view_item' => 'View Organization',
                'search_items' => 'Search Organizations',
                'not_found' => 'No organizations found',
                'not_found_in_trash' => 'No organizations found in Trash',
            ];
            $args['supports'] = ['title'];
            $args['menu_icon'] = 'dashicons-building';
            $args['description'] = 'Partner organisation registrations and verified publishers';
        }

        register_post_type($slug, $args);
    }
});

/* ---------- Meta registered for REST ---------- */
function tk_register_meta($post_type, $meta_key, $type = 'string') {
    register_post_meta($post_type, $meta_key, [
        'type' => $type,
        'single' => true,
        'show_in_rest' => true,
        'auth_callback' => function () {
            return current_user_can('edit_posts');
        },
    ]);
}

add_action('init', function () {
    tk_register_meta('tk_alert', 'alert_level');
    tk_register_meta('tk_alert', 'area');
    tk_register_meta('tk_alert', 'body');
    tk_register_meta('tk_alert', 'source');
    tk_register_meta('tk_alert', 'issued_date');
    tk_register_meta('tk_alert', 'valid_until');
    tk_register_meta('tk_alert', 'organization_id');
    tk_register_meta('tk_alert', 'advisory_type');
    tk_register_meta('tk_alert', 'target_groups');
    tk_register_meta('tk_alert', 'keywords');
    tk_register_meta('tk_alert', 'latitude');
    tk_register_meta('tk_alert', 'longitude');
    tk_register_meta('tk_alert', 'location_label');
    register_post_meta('tk_alert', 'actions', [
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
    ]);
    register_post_meta('tk_alert', 'advisory_files', [
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
    ]);
    register_post_meta('tk_alert', 'publish_on_map', [
        'type' => 'boolean',
        'single' => true,
        'show_in_rest' => true,
        'default' => false,
    ]);

    tk_register_meta('tk_report', 'tag');
    tk_register_meta('tk_report', 'partner_orgs');
    tk_register_meta('tk_report', 'file_url');
    tk_register_meta('tk_report', 'file_size');
    tk_register_meta('tk_report', 'publication_date');
    tk_register_meta('tk_report', 'keywords');
    tk_register_meta('tk_report', 'organization_id');
    tk_register_meta('tk_report', 'description');
    tk_register_meta('tk_report', 'categories');
    tk_register_meta('tk_report', 'countries');
    register_post_meta('tk_report', 'is_new', ['type' => 'boolean', 'single' => true, 'show_in_rest' => true]);
    register_post_meta('tk_report', 'is_updated', ['type' => 'boolean', 'single' => true, 'show_in_rest' => true]);
    register_post_meta('tk_report', 'report_files', [
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
    ]);

    tk_register_meta('tk_initiative', 'tag');
    tk_register_meta('tk_initiative', 'tag_color');
    tk_register_meta('tk_initiative', 'description');
    tk_register_meta('tk_initiative', 'image_url');

    tk_register_meta('tk_organization', 'abbreviation');
    tk_register_meta('tk_organization', 'org_type');
    tk_register_meta('tk_organization', 'country_flag');
    tk_register_meta('tk_organization', 'portal_url');
    tk_register_meta('tk_organization', 'contact_email');
    tk_register_meta('tk_organization', 'contact_name');
    tk_register_meta('tk_organization', 'contact_phone');
    tk_register_meta('tk_organization', 'description');
    register_post_meta('tk_organization', 'verification_status', [
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'default' => 'pending',
    ]);
    tk_register_meta('tk_organization', 'reviewed_at');
    tk_register_meta('tk_organization', 'reviewed_by');
    tk_register_meta('tk_organization', 'wp_user_id');

    tk_register_meta('tk_programme', 'emoji_icon');
    tk_register_meta('tk_programme', 'description');
    tk_register_meta('tk_programme', 'languages');
    tk_register_meta('tk_programme', 'color');
    tk_register_meta('tk_programme', 'image_url');
    tk_register_meta('tk_programme', 'link_url');

    tk_register_meta('tk_water_point', 'point_type');
    tk_register_meta('tk_water_point', 'status');
    tk_register_meta('tk_water_point', 'description');
    tk_register_meta('tk_water_point', 'region');
    tk_register_meta('tk_water_point', 'location_label');
    tk_register_meta('tk_water_point', 'latitude');
    tk_register_meta('tk_water_point', 'longitude');
    tk_register_meta('tk_water_point', 'last_updated');

    tk_register_meta('tk_assistance_site', 'site_type');
    tk_register_meta('tk_assistance_site', 'agency');
    tk_register_meta('tk_assistance_site', 'description');
    tk_register_meta('tk_assistance_site', 'region');
    tk_register_meta('tk_assistance_site', 'location_label');
    tk_register_meta('tk_assistance_site', 'latitude');
    tk_register_meta('tk_assistance_site', 'longitude');
    tk_register_meta('tk_assistance_site', 'schedule');
    tk_register_meta('tk_assistance_site', 'contact');

    tk_register_meta('tk_planting_advisory', 'crop');
    tk_register_meta('tk_planting_advisory', 'season');
    tk_register_meta('tk_planting_advisory', 'region');
    tk_register_meta('tk_planting_advisory', 'description');
    tk_register_meta('tk_planting_advisory', 'window_start');
    tk_register_meta('tk_planting_advisory', 'window_end');
    tk_register_meta('tk_planting_advisory', 'status');
    tk_register_meta('tk_planting_advisory', 'agro_dealer');
    tk_register_meta('tk_planting_advisory', 'languages');

    tk_register_meta('post', 'radio_frequency');
    tk_register_meta('post', 'radio_languages');
    tk_register_meta('post', 'broadcast_times');
    register_post_meta('post', 'post_files', [
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
    ]);
});

define('TK_COMMUNITY_INITIATIVES_SLUG', 'community-initiatives');

function tk_ensure_community_initiatives_category() {
    if (get_category_by_slug(TK_COMMUNITY_INITIATIVES_SLUG)) {
        return;
    }
    wp_insert_term('Community Initiatives', 'category', [
        'slug' => TK_COMMUNITY_INITIATIVES_SLUG,
        'description' => 'Partner radio stations and community outreach initiatives shown on the Community page.',
    ]);
}

add_action('init', 'tk_ensure_community_initiatives_category', 20);

/* ---------- Shape meta as acf for Next.js mappers ---------- */

/** Some meta (report_files, categories, countries) may already come back from
 *  get_post_meta() as a native PHP array (WordPress auto-unserializes non-scalar
 *  meta), or — if something wrote it as a JSON string — as text. json_decode()
 *  throws/warns when given a non-string, so always check is_array() first. */
function tk_hub_decode_list_meta($raw) {
    if (is_array($raw)) {
        return $raw;
    }
    if (is_string($raw) && $raw !== '') {
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            return $decoded;
        }
    }
    return [];
}

function tk_parse_keywords_meta($value) {
    if (is_array($value)) {
        return array_values(array_filter(array_map('sanitize_text_field', $value)));
    }
    if (!$value) {
        return [];
    }
    $parts = array_map('trim', explode(',', (string) $value));
    return array_values(array_filter(array_map('sanitize_text_field', $parts)));
}

function tk_build_acf(WP_Post $post) {
    $id = $post->ID;
    switch ($post->post_type) {
        case 'tk_alert':
            $actions_raw = get_post_meta($id, 'actions', true);
            $actions = [];
            if ($actions_raw) {
                $decoded = json_decode($actions_raw, true);
                if (is_array($decoded)) {
                    $actions = $decoded;
                }
            }
            $files_raw = get_post_meta($id, 'advisory_files', true);
            $advisory_files = [];
            if ($files_raw) {
                $decoded = json_decode($files_raw, true);
                if (is_array($decoded)) {
                    $advisory_files = $decoded;
                }
            }
            return [
                'alert_level' => get_post_meta($id, 'alert_level', true) ?: 'yellow',
                'area' => get_post_meta($id, 'area', true) ?: '',
                'body' => get_post_meta($id, 'body', true) ?: $post->post_content,
                'source' => get_post_meta($id, 'source', true) ?: '',
                'issued_date' => get_post_meta($id, 'issued_date', true) ?: '',
                'valid_until' => get_post_meta($id, 'valid_until', true) ?: '',
                'actions' => $actions,
                'advisory_type' => get_post_meta($id, 'advisory_type', true) ?: '',
                'target_groups' => get_post_meta($id, 'target_groups', true) ?: '',
                'keywords' => tk_parse_keywords_meta(get_post_meta($id, 'keywords', true)),
                'latitude' => get_post_meta($id, 'latitude', true) ?: '',
                'longitude' => get_post_meta($id, 'longitude', true) ?: '',
                'location_label' => get_post_meta($id, 'location_label', true) ?: '',
                'advisory_files' => $advisory_files,
                'publish_on_map' => (bool) get_post_meta($id, 'publish_on_map', true),
            ];
        case 'tk_report':
            $report_files = tk_hub_decode_list_meta(get_post_meta($id, 'report_files', true));
            $categories = tk_hub_decode_list_meta(get_post_meta($id, 'categories', true));
            $countries = tk_hub_decode_list_meta(get_post_meta($id, 'countries', true));
            $tag = get_post_meta($id, 'tag', true) ?: '';
            $download_stats = function_exists('tk_report_get_download_stats')
                ? tk_report_get_download_stats($id)
                : [
                    'total' => (int) get_post_meta($id, 'download_count', true),
                    'versions' => [],
                ];
            return [
                'tag' => $tag,
                'categories' => $categories ?: ($tag ? [$tag] : []),
                'countries' => $countries,
                // Written directly to post meta (not via ACF) — see tk_pp_stamp_new_submission
                // in the partner-portal plugin. Preserve full rich HTML as-is.
                'description' => get_post_meta($id, 'description', true) ?: '',
                'partner_orgs' => get_post_meta($id, 'partner_orgs', true) ?: '',
                'file_url' => get_post_meta($id, 'file_url', true) ?: '',
                'file_size' => get_post_meta($id, 'file_size', true) ?: '',
                'publication_date' => get_post_meta($id, 'publication_date', true) ?: '',
                'organization_id' => get_post_meta($id, 'organization_id', true) ?: '',
                'keywords' => tk_parse_keywords_meta(get_post_meta($id, 'keywords', true)),
                'report_files' => $report_files,
                'is_new' => (bool) get_post_meta($id, 'is_new', true),
                'is_updated' => (bool) get_post_meta($id, 'is_updated', true),
                'download_count' => (int) ($download_stats['total'] ?? 0),
                'download_counts' => $download_stats['versions'] ?? [],
            ];
        case 'tk_initiative':
            return [
                'tag' => get_post_meta($id, 'tag', true) ?: '',
                'tag_color' => get_post_meta($id, 'tag_color', true) ?: '',
                'description' => get_post_meta($id, 'description', true) ?: '',
                'image_url' => get_post_meta($id, 'image_url', true) ?: '',
            ];
        case 'tk_organization':
            return [
                'abbreviation' => get_post_meta($id, 'abbreviation', true) ?: '',
                'org_type' => get_post_meta($id, 'org_type', true) ?: '',
                'country_flag' => get_post_meta($id, 'country_flag', true) ?: '',
                'portal_url' => get_post_meta($id, 'portal_url', true) ?: '',
                'contact_email' => get_post_meta($id, 'contact_email', true) ?: '',
                'contact_name' => get_post_meta($id, 'contact_name', true) ?: '',
                'contact_phone' => get_post_meta($id, 'contact_phone', true) ?: '',
                'description' => get_post_meta($id, 'description', true) ?: '',
                'verification_status' => get_post_meta($id, 'verification_status', true) ?: 'pending',
            ];
        case 'tk_programme':
            return [
                'emoji_icon' => get_post_meta($id, 'emoji_icon', true) ?: '',
                'description' => get_post_meta($id, 'description', true) ?: '',
                'languages' => get_post_meta($id, 'languages', true) ?: '',
                'color' => get_post_meta($id, 'color', true) ?: '',
                'image_url' => get_post_meta($id, 'image_url', true) ?: '',
                'link_url' => get_post_meta($id, 'link_url', true) ?: '',
            ];
        case 'tk_water_point':
            return [
                'point_type' => get_post_meta($id, 'point_type', true) ?: '',
                'status' => get_post_meta($id, 'status', true) ?: '',
                'description' => get_post_meta($id, 'description', true) ?: '',
                'region' => get_post_meta($id, 'region', true) ?: '',
                'location_label' => get_post_meta($id, 'location_label', true) ?: '',
                'latitude' => get_post_meta($id, 'latitude', true) ?: '',
                'longitude' => get_post_meta($id, 'longitude', true) ?: '',
                'last_updated' => get_post_meta($id, 'last_updated', true) ?: '',
            ];
        case 'tk_assistance_site':
            return [
                'site_type' => get_post_meta($id, 'site_type', true) ?: '',
                'agency' => get_post_meta($id, 'agency', true) ?: '',
                'description' => get_post_meta($id, 'description', true) ?: '',
                'region' => get_post_meta($id, 'region', true) ?: '',
                'location_label' => get_post_meta($id, 'location_label', true) ?: '',
                'latitude' => get_post_meta($id, 'latitude', true) ?: '',
                'longitude' => get_post_meta($id, 'longitude', true) ?: '',
                'schedule' => get_post_meta($id, 'schedule', true) ?: '',
                'contact' => get_post_meta($id, 'contact', true) ?: '',
            ];
        case 'tk_planting_advisory':
            return [
                'crop' => get_post_meta($id, 'crop', true) ?: '',
                'season' => get_post_meta($id, 'season', true) ?: '',
                'region' => get_post_meta($id, 'region', true) ?: '',
                'description' => get_post_meta($id, 'description', true) ?: '',
                'window_start' => get_post_meta($id, 'window_start', true) ?: '',
                'window_end' => get_post_meta($id, 'window_end', true) ?: '',
                'status' => get_post_meta($id, 'status', true) ?: '',
                'agro_dealer' => get_post_meta($id, 'agro_dealer', true) ?: '',
                'languages' => get_post_meta($id, 'languages', true) ?: '',
            ];
        case 'post':
            return [
                'radio_frequency' => get_post_meta($id, 'radio_frequency', true) ?: '',
                'radio_languages' => get_post_meta($id, 'radio_languages', true) ?: '',
                'broadcast_times' => get_post_meta($id, 'broadcast_times', true) ?: '',
                'post_files' => tk_hub_decode_list_meta(get_post_meta($id, 'post_files', true)),
            ];
        default:
            return [];
    }
}

add_filter('rest_prepare_tk_alert', 'tk_rest_add_acf', 10, 3);
add_filter('rest_prepare_tk_report', 'tk_rest_add_acf', 10, 3);
add_filter('rest_prepare_tk_initiative', 'tk_rest_add_acf', 10, 3);
add_filter('rest_prepare_tk_organization', 'tk_rest_add_acf', 10, 3);
add_filter('rest_prepare_tk_programme', 'tk_rest_add_acf', 10, 3);
add_filter('rest_prepare_tk_water_point', 'tk_rest_add_acf', 10, 3);
add_filter('rest_prepare_tk_assistance_site', 'tk_rest_add_acf', 10, 3);
add_filter('rest_prepare_tk_planting_advisory', 'tk_rest_add_acf', 10, 3);
add_filter('rest_prepare_post', 'tk_rest_add_acf', 10, 3);

function tk_rest_add_acf($response, $post, $request) {
    $data = $response->get_data();
    $data['acf'] = tk_build_acf($post);
    $response->set_data($data);
    return $response;
}

/* ---------- Persist acf payload from REST create/update ---------- */
add_action('rest_after_insert_tk_alert', 'tk_save_acf_meta', 10, 3);
add_action('rest_after_insert_tk_report', 'tk_save_acf_meta', 10, 3);
add_action('rest_after_insert_tk_initiative', 'tk_save_acf_meta', 10, 3);
add_action('rest_after_insert_tk_organization', 'tk_save_acf_meta', 10, 3);
add_action('rest_after_insert_tk_programme', 'tk_save_acf_meta', 10, 3);
add_action('rest_after_insert_tk_water_point', 'tk_save_acf_meta', 10, 3);
add_action('rest_after_insert_tk_assistance_site', 'tk_save_acf_meta', 10, 3);
add_action('rest_after_insert_tk_planting_advisory', 'tk_save_acf_meta', 10, 3);
add_action('rest_after_insert_post', 'tk_save_acf_meta', 10, 3);

function tk_save_acf_meta($post, $request, $creating) {
    $acf = $request->get_param('acf');
    if (!is_array($acf)) {
        return;
    }
    foreach ($acf as $key => $value) {
        if ($key === 'actions' && is_array($value)) {
            update_post_meta($post->ID, 'actions', wp_json_encode($value));
            continue;
        }
        if (in_array($key, ['report_files', 'advisory_files', 'post_files'], true) && is_array($value)) {
            update_post_meta($post->ID, $key, wp_json_encode(array_values($value)));
            if ($key === 'report_files' && !empty($value[0]['url'])) {
                $primary = $value[0];
                foreach ($value as $file) {
                    if (!empty($file['language']) && $file['language'] === 'en' && !empty($file['url'])) {
                        $primary = $file;
                        break;
                    }
                }
                update_post_meta($post->ID, 'file_url', esc_url_raw($primary['url']));
                update_post_meta($post->ID, 'file_size', sanitize_text_field($primary['size'] ?? ''));
            }
            continue;
        }
        if ($key === 'keywords' && is_array($value)) {
            $keywords = array_values(array_filter(array_map('sanitize_text_field', $value)));
            update_post_meta($post->ID, 'keywords', implode(', ', $keywords));
            continue;
        }
        update_post_meta($post->ID, $key, $value);
    }
}

/* ---------- One-time sample alert for local dev ---------- */
add_action('init', function () {
    if (!get_option('tk_hub_header')) {
        update_option('tk_hub_header', tk_hub_default_header());
    }
    if (!get_option('tk_hub_hero')) {
        update_option('tk_hub_hero', tk_hub_default_hero());
    }
    if (!get_option('tk_hub_alert_legend')) {
        update_option('tk_hub_alert_legend', tk_hub_default_alert_legend());
    }
    if (!get_option('tk_hub_community_page')) {
        update_option('tk_hub_community_page', tk_hub_default_community_page());
    }
}, 5);

add_action('init', function () {
    if (get_option('tk_hub_seeded') || wp_installing()) {
        return;
    }

    $alert_id = wp_insert_post([
        'post_type' => 'tk_alert',
        'post_status' => 'publish',
        'post_title' => 'Flash Flood Warning — Turkwel River',
    ]);
    if ($alert_id && !is_wp_error($alert_id)) {
        update_post_meta($alert_id, 'alert_level', 'red');
        update_post_meta($alert_id, 'area', 'Turkwel River basin (Turkana East)');
        update_post_meta($alert_id, 'body', 'Heavy rainfall expected. Evacuate low-lying areas.');
        update_post_meta($alert_id, 'source', 'KMD');
        update_post_meta($alert_id, 'issued_date', gmdate('Y-m-d'));
        update_post_meta($alert_id, 'valid_until', 'Active 48 hours');
        update_post_meta($alert_id, 'actions', wp_json_encode([
            ['action' => 'Evacuate low-lying communities'],
            ['action' => 'Move livestock to higher ground'],
        ]));
    }

    update_option('tk_hub_seeded', 1);

    if (!get_option('tk_hub_header')) {
        update_option('tk_hub_header', tk_hub_default_header());
    }
});

function tk_hub_insert_community_meta($post_id, array $fields) {
    foreach ($fields as $key => $value) {
        update_post_meta($post_id, $key, $value);
    }
}

add_action('init', function () {
    if (get_option('tk_hub_community_services_seeded') || wp_installing()) {
        return;
    }

    $programmes = [
        [
            'title' => 'Weather Advisories for Herders',
            'description' => 'Grazing area conditions, pasture status, water point availability, and movement guidance for pastoral communities.',
            'languages' => 'Turkana, Swahili, English',
            'color' => '#2E7BB4',
            'link_url' => '/early-warnings',
        ],
        [
            'title' => 'Water Point Status Map',
            'description' => 'Real-time status of boreholes, pans, dams and water trucking points across Turkana and Karamoja.',
            'languages' => 'Ngakarimojong, Swahili, English',
            'color' => '#2E7BB4',
            'link_url' => '/community/water-points',
        ],
        [
            'title' => 'Health & Nutrition Alerts',
            'description' => 'Acute malnutrition rates, disease outbreaks, health facility status, and vaccination campaigns in your area.',
            'languages' => 'All Languages',
            'color' => '#D63030',
            'link_url' => '/community/health',
        ],
        [
            'title' => 'Farming & Planting Calendar',
            'description' => 'Climate-smart agriculture advisories, seasonal planting guides, and agro-dealer locations for Turkana and Karamoja.',
            'languages' => 'Turkana, Swahili',
            'color' => '#2E8B57',
            'link_url' => '/community/planting-calendar',
        ],
        [
            'title' => 'Report an Emergency',
            'description' => 'Community members can report disasters, conflicts, disease outbreaks or unusual environmental events to responsible authorities.',
            'languages' => 'TOLL FREE: 1192',
            'color' => '#D63030',
            'link_url' => 'tel:1192',
        ],
        [
            'title' => 'Humanitarian Assistance Locator',
            'description' => 'Find food distribution points, NFI distribution, cash transfer locations and registration sites near you.',
            'languages' => 'WFP, UNHCR, UNICEF',
            'color' => '#E87010',
            'link_url' => '/community/assistance',
        ],
    ];

    foreach ($programmes as $programme) {
        $existing = get_posts([
            'post_type' => 'tk_programme',
            'title' => $programme['title'],
            'post_status' => 'any',
            'numberposts' => 1,
        ]);
        if ($existing) {
            continue;
        }
        $id = wp_insert_post([
            'post_type' => 'tk_programme',
            'post_status' => 'publish',
            'post_title' => $programme['title'],
        ]);
        if ($id && !is_wp_error($id)) {
            tk_hub_insert_community_meta($id, $programme);
        }
    }

    $water_points = [
        ['title' => 'Lodwar Central Borehole', 'point_type' => 'borehole', 'status' => 'functional', 'region' => 'Turkana Central', 'location_label' => 'Lodwar town', 'latitude' => '3.119', 'longitude' => '35.597', 'description' => 'Primary municipal borehole serving Lodwar town and surrounding pastoral camps.', 'last_updated' => '2026-03-28'],
        ['title' => 'Kakuma Pan', 'point_type' => 'pan', 'status' => 'partial', 'region' => 'Turkana West', 'location_label' => 'Kakuma', 'latitude' => '3.717', 'longitude' => '34.875', 'description' => 'Seasonal pan with reduced capacity after below-average rains.', 'last_updated' => '2026-03-25'],
        ['title' => 'Lokichogio Dam', 'point_type' => 'dam', 'status' => 'non_functional', 'region' => 'Turkana North', 'location_label' => 'Lokichogio', 'latitude' => '4.207', 'longitude' => '34.348', 'description' => 'Dam silted; emergency water trucking activated for 3 surrounding villages.', 'last_updated' => '2026-03-30'],
        ['title' => 'Kalobeyei Water Trucking Point', 'point_type' => 'water_trucking', 'status' => 'trucking', 'region' => 'Turkana West', 'location_label' => 'Kalobeyei', 'latitude' => '3.785', 'longitude' => '34.620', 'description' => 'UNICEF-supported water trucking hub — distribution Mon/Wed/Fri 08:00–14:00.', 'last_updated' => '2026-04-01'],
        ['title' => 'Moroto Town Borehole', 'point_type' => 'borehole', 'status' => 'functional', 'region' => 'Moroto', 'location_label' => 'Moroto town', 'latitude' => '2.534', 'longitude' => '34.667', 'description' => 'Functional borehole serving Moroto town and nearby agropastoral households.', 'last_updated' => '2026-03-27'],
        ['title' => 'Nakapiripirit Pan', 'point_type' => 'pan', 'status' => 'partial', 'region' => 'Napak', 'location_label' => 'Nakapiripirit', 'latitude' => '1.908', 'longitude' => '34.972', 'description' => 'Pan at 40% capacity; pastoralists advised to use Napak borehole as backup.', 'last_updated' => '2026-03-22'],
        ['title' => 'Kaabong Dam', 'point_type' => 'dam', 'status' => 'functional', 'region' => 'Kaabong', 'location_label' => 'Kaabong town', 'latitude' => '3.517', 'longitude' => '34.133', 'description' => 'Community dam with adequate water for livestock and domestic use this season.', 'last_updated' => '2026-03-29'],
        ['title' => 'Turkwel River Pump', 'point_type' => 'borehole', 'status' => 'functional', 'region' => 'Turkana East', 'location_label' => 'Turkwel corridor', 'latitude' => '3.119', 'longitude' => '35.850', 'description' => 'Solar-powered pump along Turkwel River serving pastoral migration corridor.', 'last_updated' => '2026-03-26'],
    ];

    foreach ($water_points as $point) {
        $title = $point['title'];
        unset($point['title']);
        $id = wp_insert_post([
            'post_type' => 'tk_water_point',
            'post_status' => 'publish',
            'post_title' => $title,
        ]);
        if ($id && !is_wp_error($id)) {
            tk_hub_insert_community_meta($id, $point);
        }
    }

    $assistance_sites = [
        ['title' => 'Lodwar Food Distribution Centre', 'site_type' => 'food_distribution', 'agency' => 'WFP', 'region' => 'Turkana Central', 'location_label' => 'Lodwar', 'latitude' => '3.125', 'longitude' => '35.605', 'description' => 'General food distribution for IPC Phase 3+ households.', 'schedule' => 'Tue & Fri 08:00–15:00', 'contact' => 'WFP Lodwar: +254 700 000 001'],
        ['title' => 'Kakuma NFI Distribution', 'site_type' => 'nfi', 'agency' => 'UNHCR', 'region' => 'Turkana West', 'location_label' => 'Kakuma', 'latitude' => '3.720', 'longitude' => '34.880', 'description' => 'Non-food items — shelter materials, blankets, kitchen sets.', 'schedule' => 'Mon–Thu 09:00–16:00', 'contact' => 'UNHCR Kakuma office'],
        ['title' => 'Moroto Cash Transfer Point', 'site_type' => 'cash_transfer', 'agency' => 'UNICEF', 'region' => 'Moroto', 'location_label' => 'Moroto town', 'latitude' => '2.538', 'longitude' => '34.670', 'description' => 'Mobile money cash transfer registration and disbursement.', 'schedule' => 'Wed 08:00–14:00', 'contact' => 'UNICEF Moroto: 0800 111 222'],
        ['title' => 'Napak Registration Hub', 'site_type' => 'registration', 'agency' => 'WFP', 'region' => 'Napak', 'location_label' => 'Napak sub-county', 'latitude' => '1.915', 'longitude' => '34.980', 'description' => 'Household registration for food assistance programmes.', 'schedule' => 'Mon–Fri 08:00–12:00', 'contact' => 'OPM Napak liaison'],
        ['title' => 'Kalobeyei Nutrition Support', 'site_type' => 'food_distribution', 'agency' => 'UNICEF', 'region' => 'Turkana West', 'location_label' => 'Kalobeyei', 'latitude' => '3.790', 'longitude' => '34.625', 'description' => 'Targeted nutrition support and therapeutic feeding supplies.', 'schedule' => 'Daily 08:00–13:00', 'contact' => 'Health facility in-charge'],
        ['title' => 'Kaabong NFI & Shelter', 'site_type' => 'nfi', 'agency' => 'NRC', 'region' => 'Kaabong', 'location_label' => 'Kaabong', 'latitude' => '3.520', 'longitude' => '34.140', 'description' => 'Shelter kits and essential household items for displaced families.', 'schedule' => 'Thu & Sat 09:00–15:00', 'contact' => 'NRC Kaabong field office'],
    ];

    foreach ($assistance_sites as $site) {
        $title = $site['title'];
        unset($site['title']);
        $id = wp_insert_post([
            'post_type' => 'tk_assistance_site',
            'post_status' => 'publish',
            'post_title' => $title,
        ]);
        if ($id && !is_wp_error($id)) {
            tk_hub_insert_community_meta($id, $site);
        }
    }

    $planting = [
        ['title' => 'Sorghum — Long Rains 2026', 'crop' => 'Sorghum', 'season' => 'Long Rains 2026', 'region' => 'Turkana South & Turkana East', 'window_start' => '2026-04-01', 'window_end' => '2026-04-30', 'status' => 'optimal', 'description' => 'Plant drought-tolerant varieties (Gadam, Serena). Expected below-normal rains — use zai pits and mulch.', 'agro_dealer' => 'Lodwar Agro-Dealers Association — Main Street', 'languages' => 'Turkana, Swahili'],
        ['title' => 'Cowpea — Long Rains 2026', 'crop' => 'Cowpea', 'season' => 'Long Rains 2026', 'region' => 'Karamoja (Moroto, Napak, Amudat)', 'window_start' => '2026-04-15', 'window_end' => '2026-05-15', 'status' => 'optimal', 'description' => 'Intercrop with sorghum for nitrogen fixation. Short-duration varieties recommended.', 'agro_dealer' => 'Moroto Farmers Cooperative input shop', 'languages' => 'Ngakarimojong, Swahili'],
        ['title' => 'Green Gram — Short Rains', 'crop' => 'Green Gram', 'season' => 'Short Rains 2026', 'region' => 'Turkana Central & West', 'window_start' => '2026-10-01', 'window_end' => '2026-10-31', 'status' => 'caution', 'description' => 'Prepare land early; monitor ICPAC short-rains forecast before final planting decision.', 'agro_dealer' => 'Kakuma Agro-Vet Supplies', 'languages' => 'Turkana, Swahili, English'],
        ['title' => 'Maize — Agropastoral Zones', 'crop' => 'Maize', 'season' => 'Long Rains 2026', 'region' => 'Moroto foothills & Napak', 'window_start' => '2026-04-01', 'window_end' => '2026-04-20', 'status' => 'caution', 'description' => 'Only in high-potential foothill zones with supplemental irrigation. Drought-tolerant OPV varieties only.', 'agro_dealer' => 'Napak County agro-dealer network', 'languages' => 'Ngakarimojong, English'],
    ];

    foreach ($planting as $row) {
        $title = $row['title'];
        unset($row['title']);
        $id = wp_insert_post([
            'post_type' => 'tk_planting_advisory',
            'post_status' => 'publish',
            'post_title' => $title,
        ]);
        if ($id && !is_wp_error($id)) {
            tk_hub_insert_community_meta($id, $row);
        }
    }

    update_option('tk_hub_community_services_seeded', 1);
}, 25);

/* ---------- About page (headless CMS) ---------- */
function tk_hub_default_about_content() {
    return '<h2>Our Mission</h2>
<p>Karamoja Climate Change Knowledge and Information is a joint Kenya-Uganda online climate change information and knowledge platform serving pastoral and agropastoral communities in the border areas of Kenya and Uganda. Developed through the Karamoja Strong (KSP) project, this platform utilizes digital technologies to improve climate adaptation awareness and sharing of early warning systems information for promoting climate-resilient communities.</p>
<p>Northern Kenya and the Karamoja region are arid areas inhabited by nomadic pastoralists, characterized by fragile ecosystems ravaged by climate change effects. The region is drought-prone, with depleted livestock, water, and pasture resources. These conditions create an increased need for mobility and better climate adaptation for the survival of pastoralist livelihoods.</p>
<p>Our mission is to strengthen climate resilience by ensuring timely, accurate, and accessible climate information reaches pastoral communities — empowering them to make informed decisions about their livelihoods, safety, and well-being. The platform serves as a bridge between humanitarian assistance and longer-term recovery and development strategies.</p>
<h2>Commissioned By</h2>
<p>This platform was commissioned by the <strong>Danish Refugee Council (DRC)</strong> through the <strong>Karamoja Strong (KSP) project</strong>. The project responds to climate change-affected communities by spearheading conflict prevention initiatives through peace and conflict mitigation, promotion of sustainable livelihoods for women and youth, community-based natural resource management, and better climate adaptation for increased productivity in the border areas of Kenya and Uganda.</p>
<h2>Geographic Coverage</h2>
<p><strong>Kenya</strong> — Turkana and North Pokot</p>
<p><strong>Uganda</strong> — Moroto, Amudat and Napak</p>
<h2>Key Features &amp; Services</h2>
<ul>
<li><strong>Early Warning Systems</strong> — Real-time flood, drought, locust, and disease outbreak alerts covering all sub-counties in Turkana and Karamoja.</li>
<li><strong>Climate Information</strong> — Seasonal forecasts, weather advisories, and climate outlooks from verified meteorological agencies.</li>
<li><strong>Community Services</strong> — Water point status, pasture conditions, livestock health, and humanitarian assistance information.</li>
<li><strong>Multi-Channel Access</strong> — Web platform, SMS alerts, community radio broadcasts, and toll-free hotline for universal access.</li>
<li><strong>Cross-Border Coordination</strong> — Joint Kenya-Uganda platform enabling coordinated response to climate risks across borders.</li>
<li><strong>Verified Information</strong> — All advisories published by authorized government agencies, UN bodies, and verified partners only.</li>
</ul>
<h2>How the Hub Works</h2>
<ol>
<li><strong>Data Collection</strong> — Meteorological agencies, government departments, and humanitarian organizations collect climate, weather, and humanitarian data.</li>
<li><strong>Verification &amp; Publishing</strong> — Only verified organizations can publish advisories through the platform. All content is reviewed before publication.</li>
<li><strong>Multi-Channel Dissemination</strong> — Information is distributed via web platform, SMS alerts, community radio broadcasts, and toll-free hotline.</li>
<li><strong>Community Action</strong> — Pastoral and agropastoral communities receive timely warnings and guidance to protect lives, livestock, and livelihoods.</li>
</ol>';
}

add_action('init', function () {
    if (get_option('tk_hub_about_page_created') || wp_installing()) {
        return;
    }

    $existing = get_page_by_path('about');
    if ($existing) {
        update_option('tk_hub_about_page_created', 1);
        return;
    }

    wp_insert_post([
        'post_type' => 'page',
        'post_status' => 'publish',
        'post_title' => 'About Karamoja',
        'post_name' => 'about',
        'post_excerpt' => 'Cross-border climate intelligence platform serving pastoral and agropastoral communities',
        'post_content' => tk_hub_default_about_content(),
    ]);

    update_option('tk_hub_about_page_created', 1);
}, 20);

add_action('init', function () {
    if (wp_installing()) {
        return;
    }
    $header = get_option('tk_hub_header');
    if (!is_array($header)) {
        return;
    }
    $nav = $header['nav_links'] ?? [];
    foreach ($nav as $link) {
        if (($link['href'] ?? '') === '/about') {
            return;
        }
    }
    array_splice($nav, 1, 0, [['label' => 'About the Hub', 'href' => '/about']]);
    $header['nav_links'] = $nav;
    update_option('tk_hub_header', $header);
}, 6);

add_action('init', function () {
    if (get_option('tk_hub_about_nav_added') || wp_installing()) {
        return;
    }

    $locations = get_nav_menu_locations();
    $menu_id = (int) ($locations['tk-main-nav'] ?? 0);
    if (!$menu_id) {
        update_option('tk_hub_about_nav_added', 1);
        return;
    }

    $items = wp_get_nav_menu_items($menu_id);
    if ($items && !is_wp_error($items)) {
        foreach ($items as $item) {
            if (tk_hub_menu_path($item->url) === '/about') {
                update_option('tk_hub_about_nav_added', 1);
                return;
            }
        }
    }

    wp_update_nav_menu_item($menu_id, 0, [
        'menu-item-title' => 'About the Hub',
        'menu-item-url' => '/about',
        'menu-item-status' => 'publish',
        'menu-item-type' => 'custom',
        'menu-item-position' => 2,
    ]);

    update_option('tk_hub_about_nav_added', 1);
}, 7);

/* ---------- Site header / nav for Next.js ---------- */
function tk_hub_default_header() {
    return [
        'branding' => [
            'title' => 'Karamoja',
            'tagline' => 'Climate Change Knowledge and Information',
            'logo_id' => 0,
            'logo_url' => '',
        ],
        'topbar' => [
            'status_text' => 'LIVE SYSTEM · Karamoja Climate Change Knowledge and Information',
            'links' => [
                ['label' => 'Login / Register', 'href' => '/partners-stakeholders'],
                ['label' => 'API Access', 'href' => '/help/technical#api-reference'],
                ['label' => 'Help', 'href' => '/help'],
            ],
        ],
        'nav_links' => [
            ['label' => 'Home', 'href' => '/'],
            ['label' => 'About Karamoja', 'href' => '/about'],
            ['label' => 'Early Warnings', 'href' => '/early-warnings'],
            ['label' => 'Community', 'href' => '/community'],
            ['label' => 'Reports', 'href' => '/reports'],
            ['label' => 'Organizations', 'href' => '/organizations'],
            ['label' => 'Partners & Stakeholders', 'href' => '/partners-stakeholders'],
        ],
        'cta' => [
            'label' => '🚨 Alerts',
            'href' => '/early-warnings',
        ],
    ];
}

function tk_hub_get_header() {
    $header = get_option('tk_hub_header');
    if (!is_array($header)) {
        $header = tk_hub_default_header();
    }

    $logo_id = (int) ($header['branding']['logo_id'] ?? 0);
    if (!$logo_id) {
        $logo_id = (int) get_theme_mod('custom_logo');
    }
    if ($logo_id) {
        $url = wp_get_attachment_image_url($logo_id, 'medium');
        if (!$url) {
            $url = wp_get_attachment_image_url($logo_id, 'full');
        }
        if ($url) {
            $header['branding']['logo_url'] = $url;
            $header['branding']['logo_id'] = $logo_id;
        }
    }

    $locations = get_nav_menu_locations();
    if (!empty($locations['tk-main-nav'])) {
        $items = wp_get_nav_menu_items($locations['tk-main-nav']);
        if ($items && !is_wp_error($items)) {
            $nav = [];
            foreach ($items as $item) {
                if ($item->menu_item_parent != '0') {
                    continue;
                }
                $nav[] = [
                    'label' => $item->title,
                    'href' => tk_hub_menu_path($item->url),
                ];
            }
            if ($nav) {
                $header['nav_links'] = $nav;
            }
        }
    }

    $header['site_title'] = get_bloginfo('name');
    $header['site_tagline'] = get_bloginfo('description');

    $header = tk_hub_resolve_topbar_links($header);

    return $header;
}

function tk_hub_resolve_topbar_links($header) {
    $defaults = tk_hub_default_header();
    $default_hrefs = [];
    foreach ($defaults['topbar']['links'] as $link) {
        $default_hrefs[$link['label']] = $link['href'];
    }

    if (empty($header['topbar']['links']) || !is_array($header['topbar']['links'])) {
        return $header;
    }

    foreach ($header['topbar']['links'] as &$link) {
        $href = $link['href'] ?? '';
        if (($href === '' || $href === '#') && !empty($default_hrefs[$link['label'] ?? ''])) {
            $link['href'] = $default_hrefs[$link['label']];
        }
    }
    unset($link);

    return $header;
}

function tk_hub_menu_path($url) {
    $path = wp_parse_url($url, PHP_URL_PATH);
    if (!$path) {
        return '/';
    }
    // Strip whatever subdirectory WordPress is actually installed in (site was
    // moved from /turkana-karamoja-hub to /karamoja-cluster), so this keeps
    // working if the folder is renamed again.
    $home_path = wp_parse_url(home_url(), PHP_URL_PATH);
    if ($home_path && trim($home_path, '/') !== '') {
        $path = preg_replace('#^' . preg_quote(rtrim($home_path, '/'), '#') . '#', '', $path);
    }
    return $path ?: '/';
}

add_action('after_setup_theme', function () {
    register_nav_menus([
        'tk-main-nav' => __('Main Navigation (Next.js)', 'turkana-headless'),
    ]);
    add_theme_support('custom-logo', [
        'height' => 120,
        'width' => 120,
        'flex-height' => true,
        'flex-width' => true,
    ]);
});

add_action('rest_api_init', function () {
    register_rest_route('tk/v1', '/site-header', [
        'methods' => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $request) {
            $lang = tk_hub_resolve_locale($request->get_param('lang'));
            return rest_ensure_response(tk_hub_get_header_for_locale($lang));
        },
    ]);
    register_rest_route('tk/v1', '/hero', [
        'methods' => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $request) {
            $lang = tk_hub_resolve_locale($request->get_param('lang'));
            return rest_ensure_response(tk_hub_get_hero_for_locale($lang));
        },
    ]);

    register_rest_route('tk/v1', '/home-sections', [
        'methods' => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $request) {
            $lang = tk_hub_resolve_locale($request->get_param('lang'));
            return rest_ensure_response(tk_hub_get_home_sections_for_locale($lang));
        },
    ]);

    register_rest_route('tk/v1', '/alert-legend', [
        'methods' => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function () {
            return rest_ensure_response(tk_hub_get_alert_legend());
        },
    ]);

    register_rest_route('tk/v1', '/community-page', [
        'methods' => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function () {
            return rest_ensure_response(tk_hub_get_community_page());
        },
    ]);

    register_rest_route('tk/v1', '/contact', [
        'methods' => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function () {
            return rest_ensure_response(tk_hub_get_contact());
        },
    ]);

    register_rest_route('tk/v1', '/contact-submit', [
        'methods' => 'POST',
        'permission_callback' => '__return_true',
        'callback' => 'tk_rest_contact_submit',
    ]);

    register_rest_route('tk/v1', '/register-organization', [
        'methods' => 'POST',
        'permission_callback' => '__return_true',
        'callback' => 'tk_rest_register_organization',
    ]);

    register_rest_route('tk/v1', '/organization-status', [
        'methods' => 'GET',
        'permission_callback' => '__return_true',
        'callback' => 'tk_rest_organization_status',
        'args' => [
            'email' => [
                'required' => true,
                'type' => 'string',
                'sanitize_callback' => 'sanitize_email',
            ],
        ],
    ]);

    register_rest_route('tk/v1', '/organizations/(?P<id>\d+)', [
        'methods' => 'GET',
        'permission_callback' => '__return_true',
        'callback' => 'tk_rest_organization_profile',
    ]);
});

function tk_rest_register_organization(WP_REST_Request $request) {
    $body = $request->get_json_params();
    if (!is_array($body)) {
        return new WP_Error('invalid_body', 'Invalid request body', ['status' => 400]);
    }

    $name = sanitize_text_field($body['name'] ?? '');
    $email = sanitize_email($body['contact_email'] ?? '');
    if (!$name || !$email) {
        return new WP_Error('missing_fields', 'Organization name and contact email are required', ['status' => 400]);
    }

    $existing = tk_find_organization_by_email($email);
    if ($existing) {
        $status = get_post_meta($existing->ID, 'verification_status', true) ?: 'pending';
        return rest_ensure_response([
            'id' => $existing->ID,
            'reference' => 'ORG-' . $existing->ID,
            'status' => $status,
            'name' => get_the_title($existing),
            'message' => 'An organization with this email is already registered.',
            'existing' => true,
        ]);
    }

    $post_id = wp_insert_post([
        'post_type' => 'tk_organization',
        'post_status' => 'draft',
        'post_title' => $name,
    ], true);

    if (is_wp_error($post_id)) {
        return $post_id;
    }

    $acf = [
        'abbreviation' => sanitize_text_field($body['abbreviation'] ?? ''),
        'org_type' => sanitize_text_field($body['org_type'] ?? 'Partner'),
        'country_flag' => sanitize_text_field($body['country'] ?? 'INT'),
        'contact_email' => $email,
        'contact_name' => sanitize_text_field($body['contact_name'] ?? ''),
        'contact_phone' => sanitize_text_field($body['contact_phone'] ?? ''),
        'description' => sanitize_textarea_field($body['description'] ?? ''),
        'verification_status' => 'pending',
    ];

    foreach ($acf as $key => $value) {
        update_post_meta($post_id, $key, $value);
    }

    return rest_ensure_response([
        'id' => $post_id,
        'reference' => 'ORG-' . $post_id,
        'status' => 'pending',
        'name' => $name,
        'message' => 'Registration received. An administrator will review your application.',
    ]);
}

function tk_find_organization_by_email($email) {
    if (!$email) {
        return null;
    }
    $posts = get_posts([
        'post_type' => 'tk_organization',
        'post_status' => ['draft', 'publish', 'pending'],
        'posts_per_page' => 1,
        'meta_key' => 'contact_email',
        'meta_value' => $email,
    ]);
    return $posts[0] ?? null;
}

function tk_rest_organization_status(WP_REST_Request $request) {
    $email = sanitize_email($request->get_param('email'));
    if (!$email) {
        return new WP_Error('missing_email', 'Email is required', ['status' => 400]);
    }

    $post = tk_find_organization_by_email($email);
    if (!$post) {
        return rest_ensure_response([
            'registered' => false,
            'status' => null,
            'name' => null,
        ]);
    }

    $status = get_post_meta($post->ID, 'verification_status', true) ?: 'pending';
    $approved = $status === 'approved' && $post->post_status === 'publish';
    $linked_user = tk_org_get_linked_user($post->ID);

    return rest_ensure_response([
        'registered' => true,
        'status' => $status,
        'approved' => $approved,
        'account_ready' => $approved && (bool) $linked_user,
        'name' => get_the_title($post),
        'reference' => 'ORG-' . $post->ID,
        'id' => $post->ID,
    ]);
}

/* ---------- Organization profile (WordPress admin + frontend) ---------- */
function tk_org_admin_profile_url($post_id) {
    return admin_url('admin.php?page=tk-org-profile&org_id=' . (int) $post_id);
}

function tk_org_next_profile_url($post_id) {
    return rtrim(TK_HUB_NEXT_URL, '/') . '/organizations/' . (int) $post_id;
}

function tk_org_match_terms(WP_Post $org_post) {
    $terms = [get_the_title($org_post)];
    $abbr = get_post_meta($org_post->ID, 'abbreviation', true);
    if ($abbr) {
        $terms[] = $abbr;
    }
    return array_values(array_filter($terms));
}

function tk_content_belongs_to_org($content_id, $content_type, $org_id, array $match_terms) {
    $linked = (int) get_post_meta($content_id, 'organization_id', true);
    if ($linked && $linked === (int) $org_id) {
        return true;
    }

    $field = $content_type === 'tk_report' ? 'partner_orgs' : 'source';
    $value = strtolower((string) get_post_meta($content_id, $field, true));
    if (!$value) {
        return false;
    }

    foreach ($match_terms as $term) {
        if ($term && stripos($value, $term) !== false) {
            return true;
        }
    }

    return false;
}

function tk_org_collect_profile_data($org_id, $args = []) {
    $args = wp_parse_args($args, [
        'content_statuses' => ['publish'],
    ]);

    $org_post = get_post($org_id);
    if (!$org_post || $org_post->post_type !== 'tk_organization') {
        return null;
    }

    $match_terms = tk_org_match_terms($org_post);
    $reports = [];
    $advisories = [];

    $report_posts = get_posts([
        'post_type' => 'tk_report',
        'post_status' => $args['content_statuses'],
        'posts_per_page' => 100,
        'orderby' => 'date',
        'order' => 'DESC',
    ]);
    foreach ($report_posts as $item) {
        if (tk_content_belongs_to_org($item->ID, 'tk_report', $org_id, $match_terms)) {
            $reports[] = [
                'id' => $item->ID,
                'title' => get_the_title($item),
                'status' => $item->post_status,
                'date' => $item->post_date,
                'edit_link' => get_edit_post_link($item->ID, 'raw'),
                'acf' => tk_build_acf($item),
            ];
        }
    }

    $alert_posts = get_posts([
        'post_type' => 'tk_alert',
        'post_status' => $args['content_statuses'],
        'posts_per_page' => 100,
        'orderby' => 'date',
        'order' => 'DESC',
    ]);
    foreach ($alert_posts as $item) {
        if (tk_content_belongs_to_org($item->ID, 'tk_alert', $org_id, $match_terms)) {
            $advisories[] = [
                'id' => $item->ID,
                'title' => get_the_title($item),
                'status' => $item->post_status,
                'date' => $item->post_date,
                'edit_link' => get_edit_post_link($item->ID, 'raw'),
                'acf' => tk_build_acf($item),
            ];
        }
    }

    return [
        'organization' => $org_post,
        'acf' => tk_build_acf($org_post),
        'status' => tk_org_get_status($org_id),
        'reports' => $reports,
        'advisories' => $advisories,
        'stats' => [
            'reports' => count($reports),
            'advisories' => count($advisories),
        ],
    ];
}

function tk_rest_organization_profile(WP_REST_Request $request) {
    $org_id = (int) $request['id'];
    $profile = tk_org_collect_profile_data($org_id, ['content_statuses' => ['publish']]);

    if (!$profile) {
        return new WP_Error('not_found', 'Organization not found', ['status' => 404]);
    }

    $org_post = $profile['organization'];
    $is_public = $org_post->post_status === 'publish' && $profile['status'] === 'approved';
    if (!$is_public) {
        return new WP_Error('not_found', 'Organization not available', ['status' => 404]);
    }

    return rest_ensure_response([
        'organization' => [
            'id' => $org_post->ID,
            'title' => ['rendered' => get_the_title($org_post)],
            'acf' => $profile['acf'],
        ],
        'reports' => array_map(function ($item) {
            return [
                'id' => $item['id'],
                'title' => ['rendered' => $item['title']],
                'date' => $item['date'],
                'acf' => $item['acf'],
            ];
        }, $profile['reports']),
        'advisories' => array_map(function ($item) {
            return [
                'id' => $item['id'],
                'title' => ['rendered' => $item['title']],
                'date' => $item['date'],
                'acf' => $item['acf'],
            ];
        }, $profile['advisories']),
        'stats' => $profile['stats'],
    ]);
}

add_filter('template_include', function ($template) {
    if (!is_singular('tk_organization')) {
        return $template;
    }

    $post = get_queried_object();
    if (!$post instanceof WP_Post) {
        return $template;
    }

    $profile = tk_org_collect_profile_data($post->ID, ['content_statuses' => ['publish']]);
    if (!$profile) {
        return $template;
    }

    $can_view = ($post->post_status === 'publish' && $profile['status'] === 'approved')
        || current_user_can('edit_post', $post->ID);

    if (!$can_view) {
        return $template;
    }

    global $tk_org_profile;
    $tk_org_profile = $profile;

    $custom = __DIR__ . '/templates/organization-single.php';
    return file_exists($custom) ? $custom : $template;
});

add_filter('preview_post_link', function ($link, $post) {
    if ($post->post_type === 'tk_organization') {
        return tk_org_admin_profile_url($post->ID);
    }
    return $link;
}, 10, 2);

function tk_admin_post_status_pill($status) {
    $map = [
        'publish' => ['class' => 'tk-pill-publish', 'label' => __('Published', 'turkana-headless')],
        'draft' => ['class' => 'tk-pill-draft', 'label' => __('Draft', 'turkana-headless')],
        'pending' => ['class' => 'tk-pill-pending', 'label' => __('Pending', 'turkana-headless')],
        'private' => ['class' => 'tk-pill-private', 'label' => __('Private', 'turkana-headless')],
    ];
    $info = $map[$status] ?? ['class' => 'tk-pill-draft', 'label' => ucfirst($status)];
    return '<span class="tk-pill ' . esc_attr($info['class']) . '">' . esc_html($info['label']) . '</span>';
}

function tk_admin_alert_level_pill($level) {
    $level = strtolower((string) $level);
    $classes = [
        'red' => 'tk-alert-red',
        'orange' => 'tk-alert-orange',
        'yellow' => 'tk-alert-yellow',
        'green' => 'tk-alert-green',
    ];
    $class = $classes[$level] ?? 'tk-alert-yellow';
    $label = strtoupper($level ?: '—');
    return '<span class="tk-pill ' . esc_attr($class) . '">' . esc_html($label) . '</span>';
}

function tk_org_profile_enqueue_assets() {
    $css = __DIR__ . '/assets/admin-org-profile.css';
    if (file_exists($css)) {
        wp_enqueue_style(
            'tk-admin-org-profile',
            plugin_dir_url(__FILE__) . 'assets/admin-org-profile.css',
            [],
            (string) filemtime($css)
        );
    }
}

function tk_render_admin_org_profile() {
    if (!current_user_can('edit_posts')) {
        wp_die(__('You do not have permission to view this page.', 'turkana-headless'));
    }

    tk_org_profile_enqueue_assets();

    $org_id = isset($_GET['org_id']) ? (int) $_GET['org_id'] : 0;
    if (!$org_id) {
        wp_die(__('Missing organization ID.', 'turkana-headless'));
    }

    $profile = tk_org_collect_profile_data($org_id, [
        'content_statuses' => ['publish', 'draft', 'pending', 'private'],
    ]);
    if (!$profile) {
        wp_die(__('Organization not found.', 'turkana-headless'));
    }

    $org = $profile['organization'];
    $acf = $profile['acf'];
    $abbr = !empty($acf['abbreviation']) ? $acf['abbreviation'] : strtoupper(substr(get_the_title($org), 0, 4));
    $countries = ['KE' => 'Kenya', 'UG' => 'Uganda', 'INT' => 'International'];
    $country = $countries[$acf['country_flag'] ?? ''] ?? ($acf['country_flag'] ?: '—');
    $is_public = $org->post_status === 'publish' && $profile['status'] === 'approved';
    $linked_user = tk_org_get_linked_user($org->ID);
    ?>
    <div class="wrap tk-org-profile-wrap">
        <a class="tk-back-link" href="<?php echo esc_url(admin_url('edit.php?post_type=tk_organization')); ?>">
            &larr; <?php esc_html_e('Back to Organizations', 'turkana-headless'); ?>
        </a>

        <div class="tk-org-hero">
            <div class="tk-org-hero-top">
                <div class="tk-org-hero-main">
                    <div class="tk-org-avatar"><?php echo esc_html($abbr); ?></div>
                    <div>
                        <h1><?php echo esc_html(get_the_title($org)); ?></h1>
                        <div class="tk-org-meta-row">
                            <?php echo tk_org_status_badge($profile['status']); ?>
                            <span class="tk-org-meta-tag"><?php echo esc_html($acf['org_type'] ?: 'Partner'); ?></span>
                            <span class="tk-org-meta-tag"><?php echo esc_html($country); ?></span>
                            <span class="tk-org-meta-ref">ORG-<?php echo (int) $org->ID; ?></span>
                        </div>
                    </div>
                </div>
                <div class="tk-org-actions">
                    <a href="<?php echo esc_url(get_edit_post_link($org->ID, 'raw')); ?>" class="button button-primary"><?php esc_html_e('Edit Organisation', 'turkana-headless'); ?></a>
                    <?php if ($is_public) : ?>
                        <a href="<?php echo esc_url(get_permalink($org->ID)); ?>" class="button button-secondary" target="_blank" rel="noopener"><?php esc_html_e('Public Page', 'turkana-headless'); ?></a>
                        <a href="<?php echo esc_url(tk_org_next_profile_url($org->ID)); ?>" class="button button-link" target="_blank" rel="noopener"><?php esc_html_e('Karamoja', 'turkana-headless'); ?></a>
                    <?php endif; ?>
                </div>
            </div>
            <?php if (!empty($acf['description'])) : ?>
                <div class="tk-org-desc"><?php echo esc_html($acf['description']); ?></div>
            <?php endif; ?>
        </div>

        <div class="tk-org-stat-grid">
            <div class="tk-org-stat">
                <div class="tk-org-stat-value advisories"><?php echo (int) $profile['stats']['advisories']; ?></div>
                <div class="tk-org-stat-label"><?php esc_html_e('Advisories', 'turkana-headless'); ?></div>
            </div>
            <div class="tk-org-stat">
                <div class="tk-org-stat-value reports"><?php echo (int) $profile['stats']['reports']; ?></div>
                <div class="tk-org-stat-label"><?php esc_html_e('Reports', 'turkana-headless'); ?></div>
            </div>
        </div>

        <div class="tk-org-grid">
            <aside class="tk-org-sidebar">
                <?php if (!empty($acf['contact_name']) || !empty($acf['contact_email']) || !empty($acf['contact_phone'])) : ?>
                    <div class="tk-org-card">
                        <div class="tk-org-card-head"><?php esc_html_e('Contact', 'turkana-headless'); ?></div>
                        <div class="tk-org-card-body">
                            <div class="tk-org-contact-row">
                                <?php if (!empty($acf['contact_name'])) : ?>
                                    <div class="tk-org-contact-item">
                                        <label><?php esc_html_e('Name', 'turkana-headless'); ?></label>
                                        <span><?php echo esc_html($acf['contact_name']); ?></span>
                                    </div>
                                <?php endif; ?>
                                <?php if (!empty($acf['contact_email'])) : ?>
                                    <div class="tk-org-contact-item">
                                        <label><?php esc_html_e('Email', 'turkana-headless'); ?></label>
                                        <a href="mailto:<?php echo esc_attr($acf['contact_email']); ?>"><?php echo esc_html($acf['contact_email']); ?></a>
                                    </div>
                                <?php endif; ?>
                                <?php if (!empty($acf['contact_phone'])) : ?>
                                    <div class="tk-org-contact-item">
                                        <label><?php esc_html_e('Phone', 'turkana-headless'); ?></label>
                                        <span><?php echo esc_html($acf['contact_phone']); ?></span>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                <?php endif; ?>

                <div class="tk-org-card">
                    <div class="tk-org-card-head"><?php esc_html_e('Registration', 'turkana-headless'); ?></div>
                    <div class="tk-org-card-body">
                        <div class="tk-org-contact-row">
                            <div class="tk-org-contact-item">
                                <label><?php esc_html_e('Reference', 'turkana-headless'); ?></label>
                                <span>ORG-<?php echo (int) $org->ID; ?></span>
                            </div>
                            <div class="tk-org-contact-item">
                                <label><?php esc_html_e('Verification', 'turkana-headless'); ?></label>
                                <span><?php echo tk_org_status_badge($profile['status']); ?></span>
                            </div>
                            <div class="tk-org-contact-item">
                                <label><?php esc_html_e('Registered', 'turkana-headless'); ?></label>
                                <span><?php echo esc_html(get_the_date(get_option('date_format'), $org)); ?></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="tk-org-card">
                    <div class="tk-org-card-head"><?php esc_html_e('Publisher Login', 'turkana-headless'); ?></div>
                    <div class="tk-org-card-body">
                        <?php if ($linked_user) : ?>
                            <div class="tk-org-contact-row">
                                <div class="tk-org-contact-item">
                                    <label><?php esc_html_e('Username', 'turkana-headless'); ?></label>
                                    <span><?php echo esc_html($linked_user->user_login); ?></span>
                                </div>
                                <div class="tk-org-contact-item">
                                    <label><?php esc_html_e('Email', 'turkana-headless'); ?></label>
                                    <span><?php echo esc_html($linked_user->user_email); ?></span>
                                </div>
                                <div class="tk-org-contact-item">
                                    <label><?php esc_html_e('Role', 'turkana-headless'); ?></label>
                                    <span><?php echo esc_html(implode(', ', $linked_user->roles)); ?></span>
                                </div>
                            </div>
                            <p style="margin:12px 0 0;font-size:12px;color:#646970;">
                                <?php esc_html_e('Partner signs in at the Karamoja partner portal using this email.', 'turkana-headless'); ?>
                            </p>
                        <?php elseif ($profile['status'] === 'approved') : ?>
                            <p style="margin:0 0 12px;font-size:13px;color:#646970;">
                                <?php esc_html_e('No editor account linked yet.', 'turkana-headless'); ?>
                            </p>
                            <a class="button button-primary" href="<?php echo esc_url(wp_nonce_url(admin_url('admin.php?action=tk_create_org_user&post=' . $org->ID), 'tk_org_action_' . $org->ID)); ?>">
                                <?php esc_html_e('Create Editor Account', 'turkana-headless'); ?>
                            </a>
                        <?php else : ?>
                            <p style="margin:0;font-size:13px;color:#646970;">
                                <?php esc_html_e('An editor account is created automatically when the organisation is approved.', 'turkana-headless'); ?>
                            </p>
                        <?php endif; ?>
                    </div>
                </div>
            </aside>

            <main class="tk-org-main">
                <div class="tk-org-section">
                    <div class="tk-org-section-head">
                        <h2><?php esc_html_e('Advisories', 'turkana-headless'); ?></h2>
                        <span class="tk-org-section-count"><?php echo count($profile['advisories']); ?></span>
                    </div>
                    <?php if (empty($profile['advisories'])) : ?>
                        <div class="tk-org-empty">
                            <div class="tk-org-empty-icon">&#9888;</div>
                            <p><?php esc_html_e('No advisories linked to this organisation yet.', 'turkana-headless'); ?></p>
                            <small><?php esc_html_e('Advisories appear here once submitted from the partner portal and linked to this org.', 'turkana-headless'); ?></small>
                        </div>
                    <?php else : ?>
                        <table class="tk-org-table">
                            <thead>
                                <tr>
                                    <th><?php esc_html_e('Title', 'turkana-headless'); ?></th>
                                    <th><?php esc_html_e('Level', 'turkana-headless'); ?></th>
                                    <th><?php esc_html_e('Area', 'turkana-headless'); ?></th>
                                    <th><?php esc_html_e('Status', 'turkana-headless'); ?></th>
                                    <th><?php esc_html_e('Date', 'turkana-headless'); ?></th>
                                </tr>
                            </thead>
                            <tbody>
                            <?php foreach ($profile['advisories'] as $item) : ?>
                                <tr>
                                    <td><a href="<?php echo esc_url($item['edit_link']); ?>"><?php echo esc_html($item['title']); ?></a></td>
                                    <td><?php echo tk_admin_alert_level_pill($item['acf']['alert_level'] ?? ''); ?></td>
                                    <td><?php echo esc_html($item['acf']['area'] ?? '—'); ?></td>
                                    <td><?php echo tk_admin_post_status_pill($item['status']); ?></td>
                                    <td><?php echo esc_html(get_date_from_gmt($item['date'], get_option('date_format'))); ?></td>
                                </tr>
                            <?php endforeach; ?>
                            </tbody>
                        </table>
                    <?php endif; ?>
                </div>

                <div class="tk-org-section">
                    <div class="tk-org-section-head">
                        <h2><?php esc_html_e('Reports', 'turkana-headless'); ?></h2>
                        <span class="tk-org-section-count"><?php echo count($profile['reports']); ?></span>
                    </div>
                    <?php if (empty($profile['reports'])) : ?>
                        <div class="tk-org-empty">
                            <div class="tk-org-empty-icon">&#128196;</div>
                            <p><?php esc_html_e('No reports linked to this organisation yet.', 'turkana-headless'); ?></p>
                            <small><?php esc_html_e('Reports appear here once uploaded from the partner portal.', 'turkana-headless'); ?></small>
                        </div>
                    <?php else : ?>
                        <table class="tk-org-table">
                            <thead>
                                <tr>
                                    <th><?php esc_html_e('Title', 'turkana-headless'); ?></th>
                                    <th><?php esc_html_e('Category', 'turkana-headless'); ?></th>
                                    <th><?php esc_html_e('Status', 'turkana-headless'); ?></th>
                                    <th><?php esc_html_e('Date', 'turkana-headless'); ?></th>
                                    <th><?php esc_html_e('File', 'turkana-headless'); ?></th>
                                </tr>
                            </thead>
                            <tbody>
                            <?php foreach ($profile['reports'] as $item) : ?>
                                <tr>
                                    <td><a href="<?php echo esc_url($item['edit_link']); ?>"><?php echo esc_html($item['title']); ?></a></td>
                                    <td><span class="tk-org-meta-tag" style="color:#2E7BB4;background:#E0EFF8;border-color:#b8d4ea;"><?php echo esc_html($item['acf']['tag'] ?? '—'); ?></span></td>
                                    <td><?php echo tk_admin_post_status_pill($item['status']); ?></td>
                                    <td><?php echo esc_html($item['acf']['publication_date'] ?? get_date_from_gmt($item['date'], get_option('date_format'))); ?></td>
                                    <td>
                                        <?php if (!empty($item['acf']['file_url'])) : ?>
                                            <a class="tk-download-btn" href="<?php echo esc_url($item['acf']['file_url']); ?>" target="_blank" rel="noopener"><?php esc_html_e('Download', 'turkana-headless'); ?></a>
                                        <?php else : ?>
                                            &mdash;
                                        <?php endif; ?>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                            </tbody>
                        </table>
                    <?php endif; ?>
                </div>
            </main>
        </div>
    </div>
    <?php
}

add_action('admin_menu', function () {
    add_submenu_page(
        null,
        __('Organization Profile', 'turkana-headless'),
        __('Organization Profile', 'turkana-headless'),
        'edit_posts',
        'tk-org-profile',
        'tk_render_admin_org_profile'
    );
}, 9);

/* ---------- Organization registration admin (review & approve) ---------- */
function tk_org_statuses() {
    return [
        'pending' => __('Pending Review', 'turkana-headless'),
        'approved' => __('Approved', 'turkana-headless'),
        'rejected' => __('Rejected', 'turkana-headless'),
    ];
}

function tk_org_get_status($post_id) {
    $status = get_post_meta($post_id, 'verification_status', true);
    return array_key_exists($status, tk_org_statuses()) ? $status : 'pending';
}

function tk_org_count_by_status($status) {
    $query = new WP_Query([
        'post_type' => 'tk_organization',
        'post_status' => ['draft', 'publish', 'pending', 'private'],
        'posts_per_page' => 1,
        'fields' => 'ids',
        'meta_key' => 'verification_status',
        'meta_value' => $status,
    ]);
    return (int) $query->found_posts;
}

function tk_org_suggest_username($email) {
    $local = sanitize_user(strstr($email, '@', true) ?: $email, true);
    if (strlen($local) < 3) {
        $local = 'partner';
    }
    $username = $local;
    $i = 1;
    while (username_exists($username)) {
        $username = $local . $i;
        $i++;
    }
    return $username;
}

function tk_org_provision_editor_account($org_id) {
    $email = sanitize_email(get_post_meta($org_id, 'contact_email', true));
    if (!$email) {
        return new WP_Error('no_email', __('No contact email on this organisation.', 'turkana-headless'));
    }

    $existing = get_user_by('email', $email);
    if ($existing) {
        $existing->add_role('editor');
        update_post_meta($org_id, 'wp_user_id', $existing->ID);
        return [
            'user_id' => $existing->ID,
            'created' => false,
            'email' => $email,
            'username' => $existing->user_login,
        ];
    }

    $username = tk_org_suggest_username($email);
    $password = wp_generate_password(20, true, true);
    $user_id = wp_create_user($username, $password, $email);
    if (is_wp_error($user_id)) {
        return $user_id;
    }

    $user = new WP_User($user_id);
    $user->set_role('editor');

    $name = get_post_meta($org_id, 'contact_name', true);
    if ($name) {
        wp_update_user(['ID' => $user_id, 'display_name' => $name]);
    }

    update_post_meta($org_id, 'wp_user_id', $user_id);

    $reset_key = get_password_reset_key(get_userdata($user_id));
    if (!is_wp_error($reset_key)) {
        $login_url = rtrim(TK_HUB_NEXT_URL, '/') . '/partners-stakeholders';
        $reset_url = network_site_url(
            'wp-login.php?action=rp&key=' . $reset_key . '&login=' . rawurlencode($username),
            'login'
        );
        wp_mail(
            $email,
            __('Karamoja — set your publisher password', 'turkana-headless'),
            sprintf(
                __("Hello,\n\nYour organisation \"%s\" has been approved on Karamoja.\n\n1. Set your password: %s\n2. Sign in at: %s\n\nUse your email (%s) or username (%s) to sign in.\n\n— Karamoja Team", 'turkana-headless'),
                get_the_title($org_id),
                $reset_url,
                $login_url,
                $email,
                $username
            )
        );
    }

    return [
        'user_id' => $user_id,
        'created' => true,
        'email' => $email,
        'username' => $username,
    ];
}

function tk_org_get_linked_user($org_id) {
    $user_id = (int) get_post_meta($org_id, 'wp_user_id', true);
    if ($user_id) {
        $user = get_userdata($user_id);
        if ($user) {
            return $user;
        }
    }
    $email = sanitize_email(get_post_meta($org_id, 'contact_email', true));
    if ($email) {
        return get_user_by('email', $email) ?: null;
    }
    return null;
}

function tk_org_set_status($post_id, $status, $user_id = null) {
    static $updating = false;
    if ($updating) {
        return true;
    }

    if (!array_key_exists($status, tk_org_statuses())) {
        return new WP_Error('invalid_status', 'Invalid verification status');
    }

    if (!current_user_can('edit_post', $post_id)) {
        return new WP_Error('forbidden', 'You cannot edit this organization');
    }

    $updating = true;

    update_post_meta($post_id, 'verification_status', $status);
    update_post_meta($post_id, 'reviewed_at', gmdate('Y-m-d H:i:s'));
    update_post_meta($post_id, 'reviewed_by', $user_id ?: get_current_user_id());

    if ($status === 'approved') {
        wp_update_post([
            'ID' => $post_id,
            'post_status' => 'publish',
        ]);
        update_post_meta($post_id, 'portal_url', get_permalink($post_id));
        tk_org_provision_editor_account($post_id);
    } else {
        wp_update_post([
            'ID' => $post_id,
            'post_status' => 'draft',
        ]);
    }

    $updating = false;

    return true;
}

function tk_org_status_badge($status) {
    $styles = [
        'pending' => 'background:#fff4ec;color:#b45309;border:1px solid #f59e0b;',
        'approved' => 'background:#ecfdf5;color:#047857;border:1px solid #10b981;',
        'rejected' => 'background:#fef2f2;color:#b91c1c;border:1px solid #ef4444;',
    ];
    $labels = tk_org_statuses();
    $style = $styles[$status] ?? $styles['pending'];
    $label = $labels[$status] ?? $status;
    return '<span style="display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;' . esc_attr($style) . '">' . esc_html($label) . '</span>';
}

add_filter('manage_tk_organization_posts_columns', function ($columns) {
    $new = [];
    foreach ($columns as $key => $label) {
        $new[$key] = $label;
        if ($key === 'title') {
            $new['tk_verification'] = __('Verification', 'turkana-headless');
            $new['tk_org_type'] = __('Type', 'turkana-headless');
            $new['tk_contact'] = __('Contact', 'turkana-headless');
            $new['tk_country'] = __('Country', 'turkana-headless');
        }
    }
    return $new;
});

add_action('manage_tk_organization_posts_custom_column', function ($column, $post_id) {
    switch ($column) {
        case 'tk_verification':
            if (function_exists('tk_hub_review_badge')) {
                echo tk_hub_review_badge(tk_org_get_status($post_id));
            } else {
                echo tk_org_status_badge(tk_org_get_status($post_id));
            }
            break;
        case 'tk_org_type':
            echo esc_html(get_post_meta($post_id, 'org_type', true) ?: '—');
            break;
        case 'tk_contact':
            $name = get_post_meta($post_id, 'contact_name', true);
            $email = get_post_meta($post_id, 'contact_email', true);
            if ($name) {
                echo esc_html($name);
            }
            if ($email) {
                echo $name ? '<br />' : '';
                echo '<a href="mailto:' . esc_attr($email) . '">' . esc_html($email) . '</a>';
            }
            if (!$name && !$email) {
                echo '—';
            }
            break;
        case 'tk_country':
            echo esc_html(get_post_meta($post_id, 'country_flag', true) ?: '—');
            break;
    }
}, 10, 2);

add_filter('manage_edit-tk_organization_sortable_columns', function ($columns) {
    $columns['tk_verification'] = 'tk_verification';
    return $columns;
});

add_filter('views_edit-tk_organization', function ($views) {
    $base = admin_url('edit.php?post_type=tk_organization');
    $current = isset($_GET['tk_verification']) ? sanitize_key($_GET['tk_verification']) : '';

    $counts = [];
    foreach (array_keys(tk_org_statuses()) as $status) {
        $counts[$status] = tk_org_count_by_status($status);
    }

    $views = [
        'all' => sprintf(
            '<a href="%s"%s>%s</a>',
            esc_url($base),
            $current === '' ? ' class="current"' : '',
            sprintf(__('All <span class="count">(%d)</span>', 'turkana-headless'), array_sum($counts))
        ),
    ];

    foreach (tk_org_statuses() as $status => $label) {
        $views[$status] = sprintf(
            '<a href="%s"%s>%s</a>',
            esc_url(add_query_arg('tk_verification', $status, $base)),
            $current === $status ? ' class="current"' : '',
            sprintf('%s <span class="count">(%d)</span>', esc_html($label), $counts[$status])
        );
    }

    return $views;
});

add_action('pre_get_posts', function ($query) {
    if (!is_admin() || !$query->is_main_query()) {
        return;
    }
    if ($query->get('post_type') !== 'tk_organization') {
        return;
    }

    $status = isset($_GET['tk_verification']) ? sanitize_key($_GET['tk_verification']) : '';
    if (!$status || !array_key_exists($status, tk_org_statuses())) {
        return;
    }

    $query->set('meta_key', 'verification_status');
    $query->set('meta_value', $status);
});

add_filter('post_row_actions', function ($actions, $post) {
    if ($post->post_type !== 'tk_organization' || !current_user_can('edit_post', $post->ID)) {
        return $actions;
    }

    if ($post->post_status === 'publish' && tk_org_get_status($post->ID) === 'approved') {
        $actions['view'] = sprintf(
            '<a href="%s" target="_blank" rel="noopener">%s</a>',
            esc_url(get_permalink($post->ID)),
            __('Public Page', 'turkana-headless')
        );
    }

    return $actions;
}, 10, 2);

add_filter('bulk_actions-edit-tk_organization', function ($actions) {
    $actions['tk_bulk_approve'] = __('Approve', 'turkana-headless');
    $actions['tk_bulk_reject'] = __('Reject', 'turkana-headless');
    return $actions;
});

add_filter('handle_bulk_actions-edit-tk_organization', function ($redirect, $action, $post_ids) {
    if (!in_array($action, ['tk_bulk_approve', 'tk_bulk_reject'], true)) {
        return $redirect;
    }

    $new_status = $action === 'tk_bulk_approve' ? 'approved' : 'rejected';
    $changed = 0;

    foreach ($post_ids as $post_id) {
        $result = tk_org_set_status((int) $post_id, $new_status);
        if (!is_wp_error($result)) {
            $changed++;
        }
    }

    return add_query_arg([
        'tk_org_bulk' => $new_status,
        'tk_org_changed' => $changed,
    ], $redirect);
}, 10, 3);

function tk_org_handle_admin_action($status) {
    if (!isset($_GET['post'])) {
        wp_die(__('Missing organization ID.', 'turkana-headless'));
    }

    $post_id = (int) $_GET['post'];
    check_admin_referer('tk_org_action_' . $post_id);

    $result = tk_org_set_status($post_id, $status);
    if (is_wp_error($result)) {
        wp_die(esc_html($result->get_error_message()));
    }

    wp_safe_redirect(add_query_arg([
        'post_type' => 'tk_organization',
        'tk_org_action' => $status,
        'tk_org_id' => $post_id,
    ], admin_url('edit.php')));
    exit;
}

add_action('admin_action_tk_approve_org', function () {
    tk_org_handle_admin_action('approved');
});

add_action('admin_action_tk_reject_org', function () {
    tk_org_handle_admin_action('rejected');
});

add_action('admin_action_tk_reject_org', function () {
    tk_org_handle_admin_action('rejected');
});

add_action('admin_action_tk_create_org_user', function () {
    if (!isset($_GET['post'])) {
        wp_die(__('Missing organization ID.', 'turkana-headless'));
    }
    $post_id = (int) $_GET['post'];
    check_admin_referer('tk_org_action_' . $post_id);

    if (!current_user_can('edit_post', $post_id)) {
        wp_die(__('Forbidden', 'turkana-headless'));
    }

    $result = tk_org_provision_editor_account($post_id);
    if (is_wp_error($result)) {
        wp_die(esc_html($result->get_error_message()));
    }

    wp_safe_redirect(add_query_arg([
        'page' => 'tk-org-profile',
        'org_id' => $post_id,
        'tk_user_created' => $result['created'] ? '1' : '0',
    ], admin_url('admin.php')));
    exit;
});

add_action('admin_notices', function () {
    if (isset($_GET['page'], $_GET['tk_user_created']) && $_GET['page'] === 'tk-org-profile') {
        $created = $_GET['tk_user_created'] === '1';
        echo '<div class="notice notice-success is-dismissible"><p>' .
            esc_html($created
                ? __('Editor account created. A password-setup email was sent to the contact address.', 'turkana-headless')
                : __('Existing user linked as editor for this organisation.', 'turkana-headless')) .
            '</p></div>';
    }

    $screen = get_current_screen();
    if (!$screen || $screen->post_type !== 'tk_organization') {
        return;
    }

    if (isset($_GET['tk_org_action'], $_GET['tk_org_id'])) {
        $status = sanitize_key($_GET['tk_org_action']);
        $post_id = (int) $_GET['tk_org_id'];
        $title = get_the_title($post_id);
        if ($status === 'approved') {
            $email = get_post_meta($post_id, 'contact_email', true);
            echo '<div class="notice notice-success is-dismissible"><p>' .
                esc_html(sprintf(__('"%s" has been approved and published.', 'turkana-headless'), $title));
            if ($email) {
                echo ' ' . esc_html(sprintf(__('An editor login invitation was sent to %s.', 'turkana-headless'), $email));
            }
            echo '</p></div>';
        } elseif ($status === 'rejected') {
            echo '<div class="notice notice-warning is-dismissible"><p>' .
                esc_html(sprintf(__('"%s" has been rejected.', 'turkana-headless'), $title)) .
                '</p></div>';
        }
    }

    if (isset($_GET['tk_org_bulk'], $_GET['tk_org_changed'])) {
        $count = (int) $_GET['tk_org_changed'];
        $status = sanitize_key($_GET['tk_org_bulk']);
        if ($count > 0) {
            $msg = $status === 'approved'
                ? sprintf(_n('%d organization approved.', '%d organizations approved.', $count, 'turkana-headless'), $count)
                : sprintf(_n('%d organization rejected.', '%d organizations rejected.', $count, 'turkana-headless'), $count);
            echo '<div class="notice notice-success is-dismissible"><p>' . esc_html($msg) . '</p></div>';
        }
    }

    if ($screen->base === 'edit' && tk_org_count_by_status('pending') > 0 && empty($_GET['tk_verification'])) {
        $pending = tk_org_count_by_status('pending');
        $url = add_query_arg('tk_verification', 'pending', admin_url('edit.php?post_type=tk_organization'));
        echo '<div class="notice notice-info"><p><strong>' .
            esc_html(sprintf(_n('%d registration awaiting review.', '%d registrations awaiting review.', $pending, 'turkana-headless'), $pending)) .
            '</strong> <a href="' . esc_url($url) . '">' . esc_html__('Review pending applications', 'turkana-headless') . '</a></p></div>';
    }
});

add_action('add_meta_boxes', function () {
    add_meta_box(
        'tk_org_registration',
        __('Registration & Verification', 'turkana-headless'),
        'tk_org_registration_metabox',
        'tk_organization',
        'normal',
        'high'
    );
    add_meta_box(
        'tk_org_review_actions',
        __('Review Actions', 'turkana-headless'),
        'tk_org_review_actions_metabox',
        'tk_organization',
        'side',
        'high'
    );
});

function tk_org_registration_metabox($post) {
    wp_nonce_field('tk_org_save_meta', 'tk_org_meta_nonce');

    $fields = [
        'abbreviation' => ['label' => 'Abbreviation', 'type' => 'text'],
        'org_type' => ['label' => 'Organisation Type', 'type' => 'text'],
        'country_flag' => ['label' => 'Country Code', 'type' => 'text', 'help' => 'KE, UG, or INT'],
        'contact_name' => ['label' => 'Contact Name', 'type' => 'text'],
        'contact_email' => ['label' => 'Contact Email', 'type' => 'email'],
        'contact_phone' => ['label' => 'Contact Phone', 'type' => 'text'],
        'portal_url' => ['label' => 'Portal URL', 'type' => 'url'],
        'description' => ['label' => 'Description', 'type' => 'textarea'],
    ];

    echo '<table class="form-table" role="presentation"><tbody>';
    foreach ($fields as $key => $field) {
        $value = get_post_meta($post->ID, $key, true);
        echo '<tr><th scope="row"><label for="tk_org_' . esc_attr($key) . '">' . esc_html($field['label']) . '</label></th><td>';
        if ($field['type'] === 'textarea') {
            echo '<textarea id="tk_org_' . esc_attr($key) . '" name="tk_org_' . esc_attr($key) . '" rows="4" class="large-text">' . esc_textarea($value) . '</textarea>';
        } else {
            echo '<input type="' . esc_attr($field['type']) . '" id="tk_org_' . esc_attr($key) . '" name="tk_org_' . esc_attr($key) . '" value="' . esc_attr($value) . '" class="regular-text" />';
        }
        if (!empty($field['help'])) {
            echo '<p class="description">' . esc_html($field['help']) . '</p>';
        }
        echo '</td></tr>';
    }

    $status = tk_org_get_status($post->ID);
    echo '<tr><th scope="row"><label for="tk_org_verification_status">' . esc_html__('Verification Status', 'turkana-headless') . '</label></th><td>';
    echo '<select id="tk_org_verification_status" name="tk_org_verification_status">';
    foreach (tk_org_statuses() as $value => $label) {
        echo '<option value="' . esc_attr($value) . '"' . selected($status, $value, false) . '>' . esc_html($label) . '</option>';
    }
    echo '</select>';
    echo '<p class="description">' . esc_html__('Approved organisations are published and can submit advisories and reports from the Next.js portal.', 'turkana-headless') . '</p>';
    echo '</td></tr></tbody></table>';

    $reviewed_at = get_post_meta($post->ID, 'reviewed_at', true);
    $reviewed_by = (int) get_post_meta($post->ID, 'reviewed_by', true);
    if ($reviewed_at) {
        $reviewer = $reviewed_by ? get_userdata($reviewed_by) : null;
        echo '<p><strong>' . esc_html__('Last reviewed:', 'turkana-headless') . '</strong> ' .
            esc_html(get_date_from_gmt($reviewed_at, get_option('date_format') . ' ' . get_option('time_format')));
        if ($reviewer) {
            echo ' ' . esc_html(sprintf(__('by %s', 'turkana-headless'), $reviewer->display_name));
        }
        echo '</p>';
    }
}

function tk_org_review_actions_metabox($post) {
    $status = tk_org_get_status($post->ID);
    echo '<p>' . tk_org_status_badge($status) . '</p>';
    echo '<p class="description">' . esc_html__('Use these shortcuts or change status above and click Update.', 'turkana-headless') . '</p>';
    echo '<p>';
    if ($status !== 'approved') {
        echo '<a class="button button-primary" style="width:100%;text-align:center;margin-bottom:8px;" href="' .
            esc_url(wp_nonce_url(admin_url('admin.php?action=tk_approve_org&post=' . $post->ID), 'tk_org_action_' . $post->ID)) .
            '">' . esc_html__('Approve & Publish', 'turkana-headless') . '</a>';
    }
    if ($status !== 'rejected') {
        echo '<a class="button" style="width:100%;text-align:center;color:#b91c1c;border-color:#fca5a5;" href="' .
            esc_url(wp_nonce_url(admin_url('admin.php?action=tk_reject_org&post=' . $post->ID), 'tk_org_action_' . $post->ID)) .
            '">' . esc_html__('Reject Application', 'turkana-headless') . '</a>';
    }
    echo '</p>';
    echo '<p><a class="button button-secondary" style="width:100%;text-align:center;margin-top:8px;" href="' .
        esc_url(tk_org_admin_profile_url($post->ID)) .
        '">' . esc_html__('View Profile & Activity', 'turkana-headless') . '</a></p>';
    if ($status === 'approved' && $post->post_status === 'publish') {
        echo '<p><a class="button button-secondary" style="width:100%;text-align:center;" href="' .
            esc_url(get_permalink($post->ID)) . '" target="_blank" rel="noopener">' .
            esc_html__('Public Page', 'turkana-headless') . '</a></p>';
        echo '<p><a class="button" style="width:100%;text-align:center;" href="' .
            esc_url(tk_org_next_profile_url($post->ID)) . '" target="_blank" rel="noopener">' .
            esc_html__('Karamoja (Next.js)', 'turkana-headless') . '</a></p>';
    }
    echo '<hr /><p><strong>' . esc_html__('Reference', 'turkana-headless') . ':</strong> ORG-' . (int) $post->ID . '</p>';
}

add_action('save_post_tk_organization', function ($post_id) {
    if (!isset($_POST['tk_org_meta_nonce']) || !wp_verify_nonce($_POST['tk_org_meta_nonce'], 'tk_org_save_meta')) {
        return;
    }
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    $text_fields = [
        'abbreviation', 'org_type', 'country_flag', 'contact_name',
        'contact_email', 'contact_phone', 'portal_url', 'description',
    ];
    foreach ($text_fields as $key) {
        $field = 'tk_org_' . $key;
        if (!isset($_POST[$field])) {
            continue;
        }
        $raw = wp_unslash($_POST[$field]);
        $value = $key === 'description'
            ? sanitize_textarea_field($raw)
            : sanitize_text_field($raw);
        update_post_meta($post_id, $key, $value);
    }

    if (isset($_POST['tk_org_verification_status'])) {
        $new_status = sanitize_key($_POST['tk_org_verification_status']);
        $old_status = tk_org_get_status($post_id);
        if ($new_status !== $old_status && array_key_exists($new_status, tk_org_statuses())) {
            tk_org_set_status($post_id, $new_status);
        }
    }
}, 10, 1);

add_action('admin_enqueue_scripts', function ($hook) {
    if ($hook === 'admin_page_tk-org-profile') {
        tk_org_profile_enqueue_assets();
        return;
    }

    if (!in_array($hook, ['edit.php', 'post.php', 'post-new.php'], true)) {
        return;
    }
    $screen = get_current_screen();
    if (!$screen || $screen->post_type !== 'tk_organization') {
        return;
    }
    wp_add_inline_style('wp-admin', '
        .post-type-tk_organization .column-tk_verification { width: 120px; }
        .post-type-tk_organization .column-tk_org_type { width: 110px; }
        .post-type-tk_organization .column-tk_country { width: 70px; }
        .post-type-tk_organization .column-tk_contact { width: 200px; }
    ');
});

add_action('admin_menu', function () {
    global $menu;
    $pending = tk_org_count_by_status('pending');
    if ($pending < 1) {
        return;
    }
    foreach ($menu as $key => $item) {
        if (isset($item[2]) && $item[2] === 'edit.php?post_type=tk_organization') {
            $menu[$key][0] .= ' <span class="awaiting-mod count-' . esc_attr($pending) . '"><span class="pending-count">' . esc_html((string) $pending) . '</span></span>';
            break;
        }
    }
}, 999);

add_action('admin_menu', function () {
    add_theme_page(
        __('Site Logo & Branding', 'turkana-headless'),
        __('Site Logo', 'turkana-headless'),
        'manage_options',
        'tk-hub-branding',
        'tk_hub_branding_settings_page'
    );
    add_theme_page(
        __('Karamoja Header', 'turkana-headless'),
        __('Karamoja Header', 'turkana-headless'),
        'manage_options',
        'tk-hub-header',
        'tk_hub_header_settings_page'
    );
    add_theme_page(
        __('Karamoja Hero', 'turkana-headless'),
        __('Karamoja Hero', 'turkana-headless'),
        'manage_options',
        'tk-hub-hero',
        'tk_hub_hero_settings_page'
    );
    add_theme_page(
        __('Karamoja Contact', 'turkana-headless'),
        __('Karamoja Contact', 'turkana-headless'),
        'manage_options',
        'tk-hub-contact',
        'tk_hub_contact_settings_page'
    );
});

add_action('admin_enqueue_scripts', function ($hook) {
    if ($hook !== 'appearance_page_tk-hub-branding') {
        return;
    }
    wp_enqueue_media();
    $base = plugin_dir_url(__FILE__);
    $css = __DIR__ . '/assets/admin-site-logo.css';
    $js = __DIR__ . '/assets/admin-site-logo.js';
    if (file_exists($css)) {
        wp_enqueue_style('tk-admin-site-logo', $base . 'assets/admin-site-logo.css', [], (string) filemtime($css));
    }
    if (file_exists($js)) {
        wp_enqueue_script('tk-admin-site-logo', $base . 'assets/admin-site-logo.js', ['jquery'], (string) filemtime($js), true);
    }
});

add_action('admin_head', function () {
    $screen = get_current_screen();
    if (!$screen || $screen->id !== 'appearance_page_tk-hub-branding') {
        return;
    }
    echo '<style>.tk-hub-branding-wrap > h1{display:none!important;}</style>';
});

add_action('admin_init', function () {
    register_setting('tk_hub_header_group', 'tk_hub_header', [
        'type' => 'array',
        'sanitize_callback' => 'tk_hub_sanitize_header',
        'default' => tk_hub_default_header(),
    ]);
});

function tk_hub_sanitize_header($input) {
    if (!is_array($input)) {
        return tk_hub_default_header();
    }
    $default = tk_hub_default_header();
    $existing = get_option('tk_hub_header', $default);
    if (!is_array($existing)) {
        $existing = $default;
    }
    $out = wp_parse_args($existing, $default);
    $out = wp_parse_args($input, $out);

    if (isset($input['branding']) && is_array($input['branding'])) {
        $out['branding'] = wp_parse_args($input['branding'], $out['branding']);
        $out['branding']['title'] = sanitize_text_field($out['branding']['title'] ?? '');
        $out['branding']['tagline'] = sanitize_textarea_field($out['branding']['tagline'] ?? '');
        $out['branding']['logo_id'] = absint($out['branding']['logo_id'] ?? 0);
    }
    unset($out['branding']['logo_url']);

    if (isset($input['topbar']) && is_array($input['topbar'])) {
        $out['topbar'] = wp_parse_args($input['topbar'], $out['topbar']);
        $out['topbar']['status_text'] = sanitize_text_field($out['topbar']['status_text'] ?? '');
    }

    if (isset($input['cta']) && is_array($input['cta'])) {
        $out['cta'] = wp_parse_args($input['cta'], $out['cta']);
        $out['cta']['label'] = sanitize_text_field($out['cta']['label'] ?? '');
        $out['cta']['href'] = sanitize_text_field($out['cta']['href'] ?? '');
    }

    return tk_hub_sanitize_header_translations($input, $out);
}

function tk_hub_branding_settings_page() {
    if (!current_user_can('manage_options')) {
        return;
    }
    $header = get_option('tk_hub_header', tk_hub_default_header());
    $branding = $header['branding'] ?? tk_hub_default_header()['branding'];
    $logo_id = (int) ($branding['logo_id'] ?? 0);
    $logo_url = $logo_id ? wp_get_attachment_image_url($logo_id, 'medium') : '';
    if ($logo_id && !$logo_url) {
        $logo_url = wp_get_attachment_image_url($logo_id, 'full');
    }
    $title = $branding['title'] ?? 'Karamoja';
    $tagline = $branding['tagline'] ?? 'Climate Change Knowledge and Information';
    $frontend_url = rtrim(TK_HUB_NEXT_URL, '/');
    ?>
    <div class="wrap tk-hub-branding-wrap">
        <div class="tk-hub-branding-hero">
            <div class="tk-hub-branding-hero-text">
                <h1><?php esc_html_e('Site Logo & Branding', 'turkana-headless'); ?></h1>
                <p><?php esc_html_e('Upload your logo and set the site name shown in the Karamoja navbar on the public website.', 'turkana-headless'); ?></p>
            </div>
            <div class="tk-hub-branding-hero-actions">
                <a class="button button-secondary" href="<?php echo esc_url($frontend_url); ?>" target="_blank" rel="noopener"><?php esc_html_e('View Karamoja', 'turkana-headless'); ?></a>
                <a class="button button-secondary" href="<?php echo esc_url(admin_url('themes.php?page=tk-hub-header')); ?>"><?php esc_html_e('Header settings', 'turkana-headless'); ?></a>
            </div>
        </div>

        <div class="tk-hub-branding-grid">
            <div class="tk-hub-branding-main">
                <form method="post" action="options.php" class="tk-hub-branding-form">
                    <?php settings_fields('tk_hub_header_group'); ?>

                    <div class="tk-hub-branding-card">
                        <div class="tk-hub-branding-card-head">
                            <h2><?php esc_html_e('Site logo', 'turkana-headless'); ?></h2>
                            <p><?php esc_html_e('Displayed in the top-left corner of every page on Karamoja.', 'turkana-headless'); ?></p>
                        </div>
                        <div class="tk-hub-branding-card-body">
                            <div class="tk-hub-logo-picker">
                                <div class="tk-hub-logo-preview-box" role="img" aria-label="<?php esc_attr_e('Logo preview', 'turkana-headless'); ?>">
                                    <img class="tk-hub-logo-preview" src="<?php echo esc_url($logo_url); ?>" alt="" <?php echo $logo_url ? '' : 'style="display:none"'; ?> />
                                    <span class="tk-hub-logo-placeholder" <?php echo $logo_url ? 'style="display:none"' : ''; ?>>
                                        <span class="dashicons dashicons-format-image"></span>
                                        <?php esc_html_e('No logo selected', 'turkana-headless'); ?>
                                    </span>
                                </div>
                                <div class="tk-hub-logo-meta">
                                    <input type="hidden" id="tk-hub-logo-id" name="tk_hub_header[branding][logo_id]" value="<?php echo esc_attr((string) $logo_id); ?>" />
                                    <div class="tk-hub-logo-actions">
                                        <button type="button" class="button button-primary tk-hub-logo-select">
                                            <span class="dashicons dashicons-upload"></span>
                                            <span class="tk-hub-logo-select-label"><?php echo $logo_id ? esc_html__('Change logo', 'turkana-headless') : esc_html__('Upload logo', 'turkana-headless'); ?></span>
                                        </button>
                                        <button type="button" class="button tk-hub-logo-remove" <?php disabled(!$logo_id); ?>>
                                            <?php esc_html_e('Remove', 'turkana-headless'); ?>
                                        </button>
                                    </div>
                                    <ul class="tk-hub-logo-tips">
                                        <li><?php esc_html_e('Square PNG, JPG, or SVG recommended', 'turkana-headless'); ?></li>
                                        <li><?php esc_html_e('Minimum 120 × 120 px · displayed at 42 × 42 px', 'turkana-headless'); ?></li>
                                        <li><?php esc_html_e('Use a transparent background for best results', 'turkana-headless'); ?></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="tk-hub-branding-card">
                        <div class="tk-hub-branding-card-head">
                            <h2><?php esc_html_e('Site name', 'turkana-headless'); ?></h2>
                            <p><?php esc_html_e('Title and tagline appear beside the logo in the navigation bar on every page.', 'turkana-headless'); ?></p>
                        </div>
                        <div class="tk-hub-branding-card-body tk-hub-branding-fields">
                            <label class="tk-hub-field" for="tk-hub-branding-title">
                                <span class="tk-hub-field-label"><?php esc_html_e('Site title', 'turkana-headless'); ?></span>
                                <input type="text" id="tk-hub-branding-title" name="tk_hub_header[branding][title]" value="<?php echo esc_attr($title); ?>" class="regular-text" placeholder="<?php esc_attr_e('Karamoja', 'turkana-headless'); ?>" maxlength="60" />
                                <span class="tk-hub-field-hint"><?php esc_html_e('Main heading next to the logo', 'turkana-headless'); ?></span>
                            </label>
                            <label class="tk-hub-field" for="tk-hub-branding-tagline">
                                <span class="tk-hub-field-label"><?php esc_html_e('Tagline (English)', 'turkana-headless'); ?></span>
                                <textarea
                                    id="tk-hub-branding-tagline"
                                    name="tk_hub_header[branding][tagline]"
                                    class="tk-hub-tagline-en"
                                    rows="3"
                                    maxlength="160"
                                    data-lang="en"
                                    data-preview-target="tagline"
                                    placeholder="<?php esc_attr_e('Climate Change Knowledge and Information', 'turkana-headless'); ?>"
                                ><?php echo esc_textarea($tagline); ?></textarea>
                                <span class="tk-hub-field-hint tk-char-count" data-for="tk-hub-branding-tagline"><?php echo esc_html(strlen($tagline) . ' / 160'); ?></span>
                                <span class="tk-hub-field-hint"><?php esc_html_e('Subtitle in accent colour below the title. Up to 160 characters — wraps to two lines on the live site.', 'turkana-headless'); ?></span>
                            </label>
                        </div>
                    </div>

                    <?php tk_hub_render_branding_tagline_translations($tagline); ?>

                    <div class="tk-hub-branding-submit">
                        <?php submit_button(__('Save branding', 'turkana-headless'), 'primary', 'submit', false); ?>
                        <p class="tk-hub-branding-save-note"><?php esc_html_e('Changes appear on the public site within about 2 minutes.', 'turkana-headless'); ?></p>
                    </div>
                </form>
            </div>

            <aside class="tk-hub-branding-sidebar">
                <div class="tk-hub-branding-card tk-hub-preview-card">
                    <div class="tk-hub-branding-card-head">
                        <h2><?php esc_html_e('Live preview', 'turkana-headless'); ?></h2>
                        <p><?php esc_html_e('Approximate navbar appearance on Karamoja.', 'turkana-headless'); ?></p>
                    </div>
                    <div class="tk-hub-branding-card-body">
                        <div class="tk-preview-lang-switch" role="group" aria-label="<?php esc_attr_e('Preview language', 'turkana-headless'); ?>">
                            <button type="button" class="tk-preview-lang is-active" data-preview-lang="en">English</button>
                            <?php foreach (tk_hub_branding_languages() as $code => $meta) : ?>
                                <button type="button" class="tk-preview-lang" data-preview-lang="<?php echo esc_attr($code); ?>"><?php echo esc_html($meta['label']); ?></button>
                            <?php endforeach; ?>
                        </div>
                        <div class="tk-navbar-mock">
                            <div class="tk-navbar-mock-topbar">
                                <span><?php echo esc_html($header['topbar']['status_text'] ?? 'LIVE SYSTEM · Karamoja Climate Change Knowledge and Information'); ?></span>
                            </div>
                            <div class="tk-navbar-mock-main">
                                <div class="tk-navbar-mock-brand">
                                    <span class="tk-navbar-mock-logo-wrap">
                                        <img class="tk-navbar-mock-logo" src="<?php echo esc_url($logo_url); ?>" alt="" <?php echo $logo_url ? '' : 'style="display:none"'; ?> />
                                        <span class="tk-navbar-mock-logo-fallback" <?php echo $logo_url ? 'style="display:none"' : ''; ?>>TK</span>
                                    </span>
                                    <span class="tk-navbar-mock-text">
                                        <strong class="tk-navbar-mock-title"><?php echo esc_html($title); ?></strong>
                                        <em class="tk-navbar-mock-tagline"><?php echo esc_html($tagline); ?></em>
                                    </span>
                                </div>
                                <span class="tk-navbar-mock-cta"><?php echo esc_html($header['cta']['label'] ?? '🚨 Alerts'); ?></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="tk-hub-branding-card tk-hub-links-card">
                    <div class="tk-hub-branding-card-head">
                        <h2><?php esc_html_e('Related settings', 'turkana-headless'); ?></h2>
                    </div>
                    <div class="tk-hub-branding-card-body">
                        <ul class="tk-hub-related-links">
                            <li><a href="<?php echo esc_url(admin_url('themes.php?page=tk-hub-header')); ?>"><?php esc_html_e('Karamoja Header', 'turkana-headless'); ?> <span><?php esc_html_e('Top bar & CTA', 'turkana-headless'); ?></span></a></li>
                            <li><a href="<?php echo esc_url(admin_url('themes.php?page=tk-hub-hero')); ?>"><?php esc_html_e('Karamoja Hero', 'turkana-headless'); ?> <span><?php esc_html_e('Home page banner', 'turkana-headless'); ?></span></a></li>
                            <li><a href="<?php echo esc_url(admin_url('nav-menus.php')); ?>"><?php esc_html_e('Menus', 'turkana-headless'); ?> <span><?php esc_html_e('Main Navigation (Next.js)', 'turkana-headless'); ?></span></a></li>
                        </ul>
                    </div>
                </div>

                <div class="tk-hub-branding-card tk-hub-api-card">
                    <div class="tk-hub-branding-card-head">
                        <h2><?php esc_html_e('API', 'turkana-headless'); ?></h2>
                    </div>
                    <div class="tk-hub-branding-card-body">
                        <code class="tk-hub-api-url"><?php echo esc_html(rest_url('tk/v1/site-header')); ?></code>
                        <p><?php esc_html_e('Next.js reads branding from this endpoint.', 'turkana-headless'); ?></p>
                    </div>
                </div>
            </aside>
        </div>
    </div>
    <?php
}

/* ---------- Home hero for Next.js ---------- */
function tk_hub_default_hero() {
    return [
        'eyebrow' => 'Kenya · Uganda · Live updates',
        'title' => 'Karamoja',
        'title_accent' => 'Climate Change Knowledge and Information',
        'subtitle' => 'Trusted weather warnings, food and water updates, and community guidance for pastoral families across Turkana and Karamoja — in one place, in clear language.',
        'background_image' => 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1600&q=80',
        'primary_cta' => [
            'label' => "See today's warnings",
            'href' => '/early-warnings',
        ],
        'secondary_cta' => [
            'label' => 'How this hub helps',
            'href' => '#about',
        ],
        'overview' => [
            'title' => "What's happening now",
            'subtitle' => 'A simple snapshot — no technical terms',
            'footer' => 'Rainy season (Apr–Jun): Rains may be lighter than usual. Plan water, pasture, and food early.',
            'metrics' => [
                ['val' => '38°C', 'label' => 'Hottest today', 'sub' => 'Lodwar area — stay hydrated', 'color' => '#D4A96A'],
                ['val' => '3', 'label' => 'Warnings active', 'sub' => '1 very serious · 2 need attention', 'color' => '#E87010'],
                ['val' => '2.4M', 'label' => 'People reached', 'sub' => 'Turkana (Kenya) & Karamoja (Uganda)', 'color' => '#D4A96A'],
                ['val' => 'High', 'label' => 'Hunger risk', 'sub' => 'Many families short of food this season', 'color' => '#D63030'],
            ],
        ],
    ];
}

function tk_hub_get_hero() {
    $hero = get_option('tk_hub_hero');
    if (!is_array($hero)) {
        $hero = tk_hub_default_hero();
    } else {
        $hero = wp_parse_args($hero, tk_hub_default_hero());
        $hero['overview'] = wp_parse_args($hero['overview'] ?? [], tk_hub_default_hero()['overview']);
        $hero['primary_cta'] = wp_parse_args($hero['primary_cta'] ?? [], tk_hub_default_hero()['primary_cta']);
        $hero['secondary_cta'] = wp_parse_args($hero['secondary_cta'] ?? [], tk_hub_default_hero()['secondary_cta']);
        if (empty($hero['overview']['metrics'])) {
            $hero['overview']['metrics'] = tk_hub_default_hero()['overview']['metrics'];
        }
    }
    unset($hero['quick_facts']);
    return $hero;
}

add_action('admin_init', function () {
    register_setting('tk_hub_hero_group', 'tk_hub_hero', [
        'type' => 'array',
        'sanitize_callback' => 'tk_hub_sanitize_hero',
        'default' => tk_hub_default_hero(),
    ]);
});

function tk_hub_sanitize_hero($input) {
    if (!is_array($input)) {
        return tk_hub_default_hero();
    }
    $existing = get_option('tk_hub_hero', tk_hub_default_hero());
    if (!is_array($existing)) {
        $existing = tk_hub_default_hero();
    }
    $out = wp_parse_args($input, wp_parse_args($existing, tk_hub_default_hero()));
    return tk_hub_sanitize_hero_translations($input, $out);
}

function tk_hub_hero_settings_page() {
    if (!current_user_can('manage_options')) {
        return;
    }
    $hero = get_option('tk_hub_hero', tk_hub_default_hero());
    $o = $hero['overview'] ?? [];
    ?>
    <div class="wrap">
        <h1>Karamoja Hero (Next.js home page)</h1>
        <p>Edits the main hero on <code>http://localhost:3000</code>. Restart or wait for revalidate (~2 min) to see changes on the Next site.</p>
        <form method="post" action="options.php">
            <?php settings_fields('tk_hub_hero_group'); ?>
            <table class="form-table">
                <tr><th colspan="2"><h2>Main headline</h2></th></tr>
                <tr>
                    <th>Eyebrow</th>
                    <td><input type="text" name="tk_hub_hero[eyebrow]" value="<?php echo esc_attr($hero['eyebrow'] ?? ''); ?>" class="large-text" /></td>
                </tr>
                <tr>
                    <th>Title line 1</th>
                    <td><input type="text" name="tk_hub_hero[title]" value="<?php echo esc_attr($hero['title'] ?? ''); ?>" class="regular-text" /></td>
                </tr>
                <tr>
                    <th>Title line 2 (accent)</th>
                    <td><input type="text" name="tk_hub_hero[title_accent]" value="<?php echo esc_attr($hero['title_accent'] ?? ''); ?>" class="regular-text" /></td>
                </tr>
                <tr>
                    <th>Subtitle</th>
                    <td><textarea name="tk_hub_hero[subtitle]" rows="3" class="large-text"><?php echo esc_textarea($hero['subtitle'] ?? ''); ?></textarea></td>
                </tr>
                <tr>
                    <th>Background image URL</th>
                    <td><input type="url" name="tk_hub_hero[background_image]" value="<?php echo esc_attr($hero['background_image'] ?? ''); ?>" class="large-text" /></td>
                </tr>
                <tr><th colspan="2"><h2>Buttons</h2></th></tr>
                <tr>
                    <th>Primary button</th>
                    <td>
                        <input type="text" name="tk_hub_hero[primary_cta][label]" placeholder="Label" value="<?php echo esc_attr($hero['primary_cta']['label'] ?? ''); ?>" />
                        <input type="text" name="tk_hub_hero[primary_cta][href]" placeholder="/path" value="<?php echo esc_attr($hero['primary_cta']['href'] ?? ''); ?>" class="regular-text" />
                    </td>
                </tr>
                <tr>
                    <th>Secondary button</th>
                    <td>
                        <input type="text" name="tk_hub_hero[secondary_cta][label]" placeholder="Label" value="<?php echo esc_attr($hero['secondary_cta']['label'] ?? ''); ?>" />
                        <input type="text" name="tk_hub_hero[secondary_cta][href]" placeholder="/path or #about" value="<?php echo esc_attr($hero['secondary_cta']['href'] ?? ''); ?>" class="regular-text" />
                    </td>
                </tr>
                <tr><th colspan="2"><h2>Situation overview panel</h2></th></tr>
                <tr>
                    <th>Panel title</th>
                    <td><input type="text" name="tk_hub_hero[overview][title]" value="<?php echo esc_attr($o['title'] ?? ''); ?>" class="regular-text" /></td>
                </tr>
                <tr>
                    <th>Panel subtitle</th>
                    <td><input type="text" name="tk_hub_hero[overview][subtitle]" value="<?php echo esc_attr($o['subtitle'] ?? ''); ?>" class="large-text" /></td>
                </tr>
                <tr>
                    <th>Panel footer note</th>
                    <td><textarea name="tk_hub_hero[overview][footer]" rows="2" class="large-text"><?php echo esc_textarea($o['footer'] ?? ''); ?></textarea></td>
                </tr>
            </table>
            <?php tk_hub_render_hero_swahili_fields($hero); ?>
            <?php submit_button(); ?>
        </form>
        <p>REST: <code><?php echo esc_html(rest_url('tk/v1/hero')); ?></code></p>
        <p><em>Overview metrics use defaults until extended in a future update.</em></p>
    </div>
    <?php
}

function tk_hub_header_settings_page() {
    if (!current_user_can('manage_options')) {
        return;
    }
    $header = get_option('tk_hub_header', tk_hub_default_header());
    ?>
    <div class="wrap">
        <h1><?php esc_html_e('Karamoja Header (Next.js)', 'turkana-headless'); ?></h1>
        <p><?php esc_html_e('Navigation and top bar settings for the Karamoja frontend. Set your logo under', 'turkana-headless'); ?> <a href="<?php echo esc_url(admin_url('themes.php?page=tk-hub-branding')); ?>"><?php esc_html_e('Appearance → Site Logo', 'turkana-headless'); ?></a>. <?php esc_html_e('Assign a menu at', 'turkana-headless'); ?> <strong><?php esc_html_e('Appearance → Menus', 'turkana-headless'); ?></strong> <?php esc_html_e('to location', 'turkana-headless'); ?> <em><?php esc_html_e('Main Navigation (Next.js)', 'turkana-headless'); ?></em> — <?php esc_html_e('use Custom Links like', 'turkana-headless'); ?> <code>/early-warnings</code>.</p>
        <form method="post" action="options.php">
            <?php settings_fields('tk_hub_header_group'); ?>
            <table class="form-table">
                <tr>
                    <th><?php esc_html_e('Top bar status', 'turkana-headless'); ?></th>
                    <td><input type="text" name="tk_hub_header[topbar][status_text]" value="<?php echo esc_attr($header['topbar']['status_text'] ?? ''); ?>" class="large-text" /></td>
                </tr>
                <tr>
                    <th><?php esc_html_e('CTA label', 'turkana-headless'); ?></th>
                    <td><input type="text" name="tk_hub_header[cta][label]" value="<?php echo esc_attr($header['cta']['label'] ?? ''); ?>" class="regular-text" /></td>
                </tr>
                <tr>
                    <th><?php esc_html_e('CTA link', 'turkana-headless'); ?></th>
                    <td><input type="text" name="tk_hub_header[cta][href]" value="<?php echo esc_attr($header['cta']['href'] ?? ''); ?>" class="regular-text" /></td>
                </tr>
            </table>
            <?php tk_hub_render_header_swahili_fields($header); ?>
            <?php submit_button(); ?>
        </form>
        <p>REST: <code><?php echo esc_html(rest_url('tk/v1/site-header')); ?></code></p>
    </div>
    <?php
}

/* ---------- Contact Us page for Next.js ---------- */
function tk_hub_default_contact() {
    return [
        'title' => 'Contact Us',
        'subtitle' => 'Reach regional offices, climate agencies, and partner organisations across Turkana and Karamoja.',
        'intro' => 'Use the form below for general enquiries, or contact a regional office or partner organisation directly.',
        'featured_image' => 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1400&q=70',
        'form_title' => 'Send us a message',
        'form_intro' => 'We route enquiries to the Karamoja coordination team. For emergencies, use the numbers listed under Regional Offices.',
        'form_recipient' => '',
        'offices' => [
            [
                'name' => 'Turkana Regional Office',
                'region' => 'Turkana, Kenya',
                'address' => 'Lodwar, Turkana County, Kenya',
                'phone' => '+254 (0)54 22 XXX',
                'email' => 'turkana@tkclimate.org',
                'hours' => 'Mon–Fri, 08:00–17:00 EAT',
            ],
            [
                'name' => 'North Pokot Coordination Desk',
                'region' => 'North Pokot, Kenya',
                'address' => 'Kapenguria, North Pokot, Kenya',
                'phone' => '+254 (0)53 XXX XXX',
                'email' => 'northpokot@tkclimate.org',
                'hours' => 'Mon–Fri, 08:00–17:00 EAT',
            ],
            [
                'name' => 'Moroto Regional Office',
                'region' => 'Moroto, Uganda',
                'address' => 'Moroto, Uganda',
                'phone' => '+256 XXX XXX XXX',
                'email' => 'moroto@tkclimate.org',
                'hours' => 'Mon–Fri, 08:00–17:00 EAT',
            ],
        ],
        'contacts' => [
            [
                'organization' => 'Directorate of Climate Change',
                'role' => 'National climate policy & coordination',
                'name' => '',
                'phone' => '',
                'email' => '',
                'country' => 'Kenya',
                'website' => '',
            ],
            [
                'organization' => 'Kenya Meteorological Department (MET)',
                'role' => 'Weather forecasts & climate outlooks',
                'name' => '',
                'phone' => '',
                'email' => '',
                'country' => 'Kenya',
                'website' => '',
            ],
            [
                'organization' => 'NDMA',
                'role' => 'Drought management & early warning',
                'name' => '',
                'phone' => '',
                'email' => '',
                'country' => 'Kenya',
                'website' => '',
            ],
            [
                'organization' => 'Danish Refugee Council (DRC)',
                'role' => 'Karamoja Strong (KSP) — platform commissioning partner',
                'name' => '',
                'phone' => '',
                'email' => '',
                'country' => 'Regional',
                'website' => '',
            ],
        ],
        'social' => [
            ['network' => 'Facebook', 'url' => '', 'label' => 'Karamoja on Facebook'],
            ['network' => 'LinkedIn', 'url' => '', 'label' => 'Karamoja on LinkedIn'],
            ['network' => 'Twitter/X', 'url' => '', 'label' => 'Karamoja on X'],
        ],
    ];
}

function tk_hub_sanitize_contact_rows($rows, $fields) {
    if (!is_array($rows)) {
        return [];
    }
    $clean = [];
    foreach ($rows as $row) {
        if (!is_array($row)) {
            continue;
        }
        $item = [];
        $has_value = false;
        foreach ($fields as $field) {
            $raw = isset($row[$field]) ? $row[$field] : '';
            if ($field === 'email') {
                $val = sanitize_email($raw);
            } elseif ($field === 'url' || $field === 'website') {
                $val = esc_url_raw($raw);
            } else {
                $val = sanitize_text_field($raw);
            }
            $item[$field] = $val;
            if ($val !== '') {
                $has_value = true;
            }
        }
        if ($has_value) {
            $clean[] = $item;
        }
    }
    return $clean;
}

function tk_hub_sanitize_contact($input) {
    $defaults = tk_hub_default_contact();
    if (!is_array($input)) {
        return $defaults;
    }

    $out = [
        'title' => sanitize_text_field($input['title'] ?? $defaults['title']),
        'subtitle' => sanitize_textarea_field($input['subtitle'] ?? $defaults['subtitle']),
        'intro' => sanitize_textarea_field($input['intro'] ?? $defaults['intro']),
        'featured_image' => esc_url_raw($input['featured_image'] ?? $defaults['featured_image']),
        'form_title' => sanitize_text_field($input['form_title'] ?? $defaults['form_title']),
        'form_intro' => sanitize_textarea_field($input['form_intro'] ?? $defaults['form_intro']),
        'form_recipient' => sanitize_email($input['form_recipient'] ?? ''),
        'offices' => tk_hub_sanitize_contact_rows($input['offices'] ?? [], ['name', 'region', 'address', 'phone', 'email', 'hours']),
        'contacts' => tk_hub_sanitize_contact_rows($input['contacts'] ?? [], ['organization', 'role', 'name', 'phone', 'email', 'country', 'website']),
        'social' => tk_hub_sanitize_contact_rows($input['social'] ?? [], ['network', 'url', 'label']),
    ];

    if (empty($out['offices'])) {
        $out['offices'] = $defaults['offices'];
    }
    if (empty($out['contacts'])) {
        $out['contacts'] = $defaults['contacts'];
    }
    if (empty($out['social'])) {
        $out['social'] = $defaults['social'];
    }

    return $out;
}

function tk_hub_get_contact() {
    $contact = get_option('tk_hub_contact');
    if (!is_array($contact)) {
        return tk_hub_default_contact();
    }
    $contact = wp_parse_args($contact, tk_hub_default_contact());
    if (empty($contact['offices']) || !is_array($contact['offices'])) {
        $contact['offices'] = tk_hub_default_contact()['offices'];
    }
    if (empty($contact['contacts']) || !is_array($contact['contacts'])) {
        $contact['contacts'] = tk_hub_default_contact()['contacts'];
    }
    if (empty($contact['social']) || !is_array($contact['social'])) {
        $contact['social'] = tk_hub_default_contact()['social'];
    }
    return $contact;
}

add_action('admin_init', function () {
    register_setting('tk_hub_contact_group', 'tk_hub_contact', [
        'type' => 'array',
        'sanitize_callback' => 'tk_hub_sanitize_contact',
        'default' => tk_hub_default_contact(),
    ]);
});

function tk_rest_contact_submit(WP_REST_Request $request) {
    $body = $request->get_json_params();
    if (!is_array($body)) {
        return new WP_Error('invalid_body', 'Invalid request body', ['status' => 400]);
    }

    $name = sanitize_text_field($body['name'] ?? '');
    $email = sanitize_email($body['email'] ?? '');
    $subject = sanitize_text_field($body['subject'] ?? 'Karamoja enquiry');
    $message = sanitize_textarea_field($body['message'] ?? '');
    $organization = sanitize_text_field($body['organization'] ?? '');
    $phone = sanitize_text_field($body['phone'] ?? '');

    if (!$name || !$email || !$message) {
        return new WP_Error('missing_fields', 'Name, email, and message are required', ['status' => 400]);
    }

    $contact = tk_hub_get_contact();
    $to = !empty($contact['form_recipient']) ? $contact['form_recipient'] : get_option('admin_email');

    $lines = [
        'Name: ' . $name,
        'Email: ' . $email,
        'Phone: ' . ($phone ?: '—'),
        'Organisation: ' . ($organization ?: '—'),
        '',
        $message,
    ];
    $body_text = implode("\n", $lines);
    $headers = ['Content-Type: text/plain; charset=UTF-8', 'Reply-To: ' . $name . ' <' . $email . '>'];

    $sent = wp_mail($to, '[Karamoja Contact] ' . $subject, $body_text, $headers);
    if (!$sent) {
        return new WP_Error('mail_failed', 'Unable to send your message right now. Please try again later.', ['status' => 500]);
    }

    return rest_ensure_response([
        'ok' => true,
        'message' => 'Thank you. Your message has been sent to the Karamoja team.',
    ]);
}

function tk_hub_contact_row_fields($prefix, $index, $row, $fields) {
    foreach ($fields as $field => $label) {
        $name = sprintf('%s[%d][%s]', $prefix, $index, $field);
        $value = esc_attr($row[$field] ?? '');
        $type = ($field === 'url' || $field === 'website') ? 'url' : (($field === 'email') ? 'email' : 'text');
        echo '<label style="display:block;margin:0 0 6px;"><span style="display:inline-block;min-width:110px;color:#50575e;">' . esc_html($label) . '</span>';
        echo '<input type="' . esc_attr($type) . '" name="' . esc_attr($name) . '" value="' . $value . '" class="regular-text" /></label>';
    }
}

function tk_hub_contact_settings_page() {
    if (!current_user_can('manage_options')) {
        return;
    }
    $contact = tk_hub_get_contact();
    $offices = $contact['offices'];
    $contacts = $contact['contacts'];
    $social = $contact['social'];
    // Ensure at least one empty slot for adding
    $offices[] = ['name' => '', 'region' => '', 'address' => '', 'phone' => '', 'email' => '', 'hours' => ''];
    $contacts[] = ['organization' => '', 'role' => '', 'name' => '', 'phone' => '', 'email' => '', 'country' => '', 'website' => ''];
    $social[] = ['network' => '', 'url' => '', 'label' => ''];
    ?>
    <div class="wrap">
        <h1><?php esc_html_e('Karamoja Contact (Next.js /contact)', 'turkana-headless'); ?></h1>
        <p><?php esc_html_e('Manage the Contact Us page: regional offices, partner contacts, social links, and the enquiry form recipient. Empty trailing rows are ignored on save — fill a new blank row to add an entry.', 'turkana-headless'); ?></p>
        <form method="post" action="options.php">
            <?php settings_fields('tk_hub_contact_group'); ?>

            <h2><?php esc_html_e('Page hero', 'turkana-headless'); ?></h2>
            <table class="form-table">
                <tr>
                    <th><?php esc_html_e('Title', 'turkana-headless'); ?></th>
                    <td><input type="text" name="tk_hub_contact[title]" value="<?php echo esc_attr($contact['title']); ?>" class="regular-text" /></td>
                </tr>
                <tr>
                    <th><?php esc_html_e('Subtitle', 'turkana-headless'); ?></th>
                    <td><textarea name="tk_hub_contact[subtitle]" rows="2" class="large-text"><?php echo esc_textarea($contact['subtitle']); ?></textarea></td>
                </tr>
                <tr>
                    <th><?php esc_html_e('Intro text', 'turkana-headless'); ?></th>
                    <td><textarea name="tk_hub_contact[intro]" rows="3" class="large-text"><?php echo esc_textarea($contact['intro']); ?></textarea></td>
                </tr>
                <tr>
                    <th><?php esc_html_e('Featured image URL', 'turkana-headless'); ?></th>
                    <td><input type="url" name="tk_hub_contact[featured_image]" value="<?php echo esc_attr($contact['featured_image']); ?>" class="large-text" /></td>
                </tr>
            </table>

            <h2><?php esc_html_e('Contact form', 'turkana-headless'); ?></h2>
            <table class="form-table">
                <tr>
                    <th><?php esc_html_e('Form title', 'turkana-headless'); ?></th>
                    <td><input type="text" name="tk_hub_contact[form_title]" value="<?php echo esc_attr($contact['form_title']); ?>" class="regular-text" /></td>
                </tr>
                <tr>
                    <th><?php esc_html_e('Form intro', 'turkana-headless'); ?></th>
                    <td><textarea name="tk_hub_contact[form_intro]" rows="2" class="large-text"><?php echo esc_textarea($contact['form_intro']); ?></textarea></td>
                </tr>
                <tr>
                    <th><?php esc_html_e('Recipient email', 'turkana-headless'); ?></th>
                    <td>
                        <input type="email" name="tk_hub_contact[form_recipient]" value="<?php echo esc_attr($contact['form_recipient']); ?>" class="regular-text" placeholder="<?php echo esc_attr(get_option('admin_email')); ?>" />
                        <p class="description"><?php esc_html_e('Leave blank to use the WordPress admin email.', 'turkana-headless'); ?></p>
                    </td>
                </tr>
            </table>

            <h2><?php esc_html_e('Regional offices', 'turkana-headless'); ?></h2>
            <p class="description"><?php esc_html_e('e.g. Turkana, North Pokot, Moroto, Amudat, Napak — add or clear rows as needed.', 'turkana-headless'); ?></p>
            <?php foreach ($offices as $i => $row) : ?>
                <div style="background:#fff;border:1px solid #c3c4c7;border-radius:4px;padding:12px 16px;margin:0 0 12px;max-width:760px;">
                    <strong><?php echo esc_html(sprintf(__('Office %d', 'turkana-headless'), $i + 1)); ?></strong>
                    <div style="margin-top:8px;">
                        <?php
                        tk_hub_contact_row_fields(
                            'tk_hub_contact[offices]',
                            $i,
                            $row,
                            [
                                'name' => __('Name', 'turkana-headless'),
                                'region' => __('Region', 'turkana-headless'),
                                'address' => __('Address', 'turkana-headless'),
                                'phone' => __('Phone', 'turkana-headless'),
                                'email' => __('Email', 'turkana-headless'),
                                'hours' => __('Hours', 'turkana-headless'),
                            ]
                        );
                        ?>
                    </div>
                </div>
            <?php endforeach; ?>

            <h2><?php esc_html_e('Key contacts & partners', 'turkana-headless'); ?></h2>
            <p class="description"><?php esc_html_e('Directorate of Climate Change, MET, NDMA, DRC, or any custom organisation — add as many as you need.', 'turkana-headless'); ?></p>
            <?php foreach ($contacts as $i => $row) : ?>
                <div style="background:#fff;border:1px solid #c3c4c7;border-radius:4px;padding:12px 16px;margin:0 0 12px;max-width:760px;">
                    <strong><?php echo esc_html(sprintf(__('Contact %d', 'turkana-headless'), $i + 1)); ?></strong>
                    <div style="margin-top:8px;">
                        <?php
                        tk_hub_contact_row_fields(
                            'tk_hub_contact[contacts]',
                            $i,
                            $row,
                            [
                                'organization' => __('Organisation', 'turkana-headless'),
                                'role' => __('Role / focus', 'turkana-headless'),
                                'name' => __('Contact person', 'turkana-headless'),
                                'phone' => __('Phone', 'turkana-headless'),
                                'email' => __('Email', 'turkana-headless'),
                                'country' => __('Country', 'turkana-headless'),
                                'website' => __('Website', 'turkana-headless'),
                            ]
                        );
                        ?>
                    </div>
                </div>
            <?php endforeach; ?>

            <h2><?php esc_html_e('Social media', 'turkana-headless'); ?></h2>
            <?php foreach ($social as $i => $row) : ?>
                <div style="background:#fff;border:1px solid #c3c4c7;border-radius:4px;padding:12px 16px;margin:0 0 12px;max-width:760px;">
                    <strong><?php echo esc_html(sprintf(__('Social %d', 'turkana-headless'), $i + 1)); ?></strong>
                    <div style="margin-top:8px;">
                        <?php
                        tk_hub_contact_row_fields(
                            'tk_hub_contact[social]',
                            $i,
                            $row,
                            [
                                'network' => __('Network', 'turkana-headless'),
                                'url' => __('URL', 'turkana-headless'),
                                'label' => __('Label', 'turkana-headless'),
                            ]
                        );
                        ?>
                    </div>
                </div>
            <?php endforeach; ?>

            <?php submit_button(__('Save Contact Page', 'turkana-headless')); ?>
        </form>
        <p>REST: <code><?php echo esc_html(rest_url('tk/v1/contact')); ?></code> · Submit: <code><?php echo esc_html(rest_url('tk/v1/contact-submit')); ?></code></p>
    </div>
    <?php
}

/* ---------- Alert colour guide for Next.js early warnings ---------- */
function tk_hub_alert_level_styles() {
    return [
        'red' => ['color' => '#D63030', 'bg' => '#FFF0F0'],
        'orange' => ['color' => '#E87010', 'bg' => '#FFF4EC'],
        'yellow' => ['color' => '#B8860B', 'bg' => '#FFFBEC'],
        'green' => ['color' => '#2E8B57', 'bg' => '#F0FFF6'],
    ];
}

function tk_hub_default_alert_legend() {
    return [
        'title' => 'Alert colour guide',
        'items' => [
            [
                'level' => 'red',
                'title' => 'Severe / Extreme',
                'description' => 'Immediate danger. Follow evacuation and emergency guidance without delay.',
            ],
            [
                'level' => 'orange',
                'title' => 'High',
                'description' => 'Serious risk developing. Prepare now and follow recommended actions closely.',
            ],
            [
                'level' => 'yellow',
                'title' => 'Moderate / Watch',
                'description' => 'Conditions need attention. Stay informed and ready to act if the situation worsens.',
            ],
            [
                'level' => 'green',
                'title' => 'Normal / Information',
                'description' => 'No acute threat. Routine updates and situational information only.',
            ],
        ],
    ];
}

function tk_hub_get_alert_legend() {
    $stored = get_option('tk_hub_alert_legend');
    $default = tk_hub_default_alert_legend();
    $styles = tk_hub_alert_level_styles();

    if (!is_array($stored)) {
        $stored = $default;
    } else {
        $stored = wp_parse_args($stored, $default);
        $stored['title'] = $stored['title'] ?? $default['title'];
    }

    $default_by_level = [];
    foreach ($default['items'] as $item) {
        $default_by_level[strtolower($item['level'])] = $item;
    }

    $items = [];
    $source_items = is_array($stored['items'] ?? null) ? $stored['items'] : $default['items'];
    foreach ($source_items as $item) {
        if (!is_array($item)) {
            continue;
        }
        $level = strtolower(sanitize_key($item['level'] ?? ''));
        if (!isset($default_by_level[$level])) {
            continue;
        }
        $fallback = $default_by_level[$level];
        $items[] = [
            'level' => strtoupper($level),
            'title' => sanitize_text_field($item['title'] ?? $fallback['title']),
            'description' => sanitize_textarea_field($item['description'] ?? $fallback['description']),
            'color' => $styles[$level]['color'],
            'bg' => $styles[$level]['bg'],
        ];
    }

    if (!$items) {
        foreach ($default['items'] as $item) {
            $level = strtolower($item['level']);
            $items[] = [
                'level' => strtoupper($level),
                'title' => $item['title'],
                'description' => $item['description'],
                'color' => $styles[$level]['color'],
                'bg' => $styles[$level]['bg'],
            ];
        }
    }

    return [
        'title' => sanitize_text_field($stored['title'] ?? $default['title']),
        'items' => $items,
    ];
}

function tk_hub_sanitize_alert_legend($input) {
    if (!is_array($input)) {
        return tk_hub_default_alert_legend();
    }

    $default = tk_hub_default_alert_legend();
    $default_by_level = [];
    foreach ($default['items'] as $item) {
        $default_by_level[strtolower($item['level'])] = $item;
    }

    $out = [
        'title' => sanitize_text_field($input['title'] ?? $default['title']),
        'items' => [],
    ];

    $rows = is_array($input['items'] ?? null) ? $input['items'] : [];
    foreach ($default['items'] as $fallback) {
        $level = strtolower($fallback['level']);
        $row = is_array($rows[$level] ?? null) ? $rows[$level] : [];
        $out['items'][] = [
            'level' => $level,
            'title' => sanitize_text_field($row['title'] ?? $fallback['title']),
            'description' => sanitize_textarea_field($row['description'] ?? $fallback['description']),
        ];
    }

    return $out;
}

add_action('admin_init', function () {
    register_setting('tk_hub_alert_legend_group', 'tk_hub_alert_legend', [
        'type' => 'array',
        'sanitize_callback' => 'tk_hub_sanitize_alert_legend',
        'default' => tk_hub_default_alert_legend(),
    ]);
});

add_action('admin_menu', function () {
    add_submenu_page(
        'edit.php?post_type=tk_alert',
        __('Alert Colour Guide', 'turkana-headless'),
        __('Colour Guide', 'turkana-headless'),
        'manage_options',
        'tk-alert-legend',
        'tk_hub_alert_legend_settings_page'
    );
}, 20);

function tk_hub_alert_legend_settings_page() {
    if (!current_user_can('manage_options')) {
        return;
    }

    $legend = get_option('tk_hub_alert_legend', tk_hub_default_alert_legend());
    if (!is_array($legend)) {
        $legend = tk_hub_default_alert_legend();
    }
    $legend = wp_parse_args($legend, tk_hub_default_alert_legend());
    $styles = tk_hub_alert_level_styles();
    $frontend_url = rtrim(TK_HUB_NEXT_URL, '/') . '/early-warnings';
    ?>
    <div class="wrap">
        <h1><?php esc_html_e('Alert Colour Guide', 'turkana-headless'); ?></h1>
        <p>
            <?php esc_html_e('Edit the colour legend shown on the Early Warnings page and on each advisory detail page. Colours stay fixed to match alert levels (RED, ORANGE, YELLOW, GREEN).', 'turkana-headless'); ?>
            <a href="<?php echo esc_url($frontend_url); ?>" target="_blank" rel="noopener"><?php esc_html_e('View on site', 'turkana-headless'); ?></a>
        </p>
        <form method="post" action="options.php">
            <?php settings_fields('tk_hub_alert_legend_group'); ?>
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="tk-alert-legend-title"><?php esc_html_e('Section title', 'turkana-headless'); ?></label></th>
                    <td>
                        <input type="text" id="tk-alert-legend-title" name="tk_hub_alert_legend[title]" value="<?php echo esc_attr($legend['title'] ?? ''); ?>" class="regular-text" />
                    </td>
                </tr>
            </table>

            <h2><?php esc_html_e('Alert levels', 'turkana-headless'); ?></h2>
            <p class="description"><?php esc_html_e('Update the short title and plain-language description for each alert colour.', 'turkana-headless'); ?></p>

            <?php foreach (($legend['items'] ?? []) as $item) :
                $level = strtolower($item['level'] ?? '');
                if (!isset($styles[$level])) {
                    continue;
                }
                $style = $styles[$level];
                ?>
                <div style="background:#fff;border:1px solid #c3c4c7;border-left:4px solid <?php echo esc_attr($style['color']); ?>;border-radius:4px;padding:16px 20px;margin:0 0 16px;max-width:820px;">
                    <h3 style="margin:0 0 12px;display:flex;align-items:center;gap:8px;">
                        <?php echo tk_admin_alert_level_pill($level); ?>
                    </h3>
                    <table class="form-table" style="margin:0;">
                        <tr>
                            <th scope="row" style="width:140px;padding-left:0;"><?php esc_html_e('Short title', 'turkana-headless'); ?></th>
                            <td style="padding-left:0;">
                                <input type="text" name="tk_hub_alert_legend[items][<?php echo esc_attr($level); ?>][title]" value="<?php echo esc_attr($item['title'] ?? ''); ?>" class="large-text" />
                            </td>
                        </tr>
                        <tr>
                            <th scope="row" style="padding-left:0;vertical-align:top;"><?php esc_html_e('Description', 'turkana-headless'); ?></th>
                            <td style="padding-left:0;">
                                <textarea name="tk_hub_alert_legend[items][<?php echo esc_attr($level); ?>][description]" rows="3" class="large-text"><?php echo esc_textarea($item['description'] ?? ''); ?></textarea>
                            </td>
                        </tr>
                    </table>
                </div>
            <?php endforeach; ?>

            <?php submit_button(__('Save Colour Guide', 'turkana-headless')); ?>
        </form>
        <p>REST: <code><?php echo esc_html(rest_url('tk/v1/alert-legend')); ?></code></p>
    </div>
    <?php
}

/* ---------- Community page (outreach strip + radio stations) ---------- */
function tk_hub_community_country_regions() {
    return [
        'Kenya' => ['Turkana', 'North Pokot'],
        'Uganda' => ['Moroto', 'Amudat', 'Napak'],
    ];
}

function tk_hub_default_community_page() {
    return [
        'outreach' => [
            'items' => [
                [
                    'country' => '',
                    'region' => '',
                    'label' => 'SMS Alerts',
                    'description' => 'Via Safaricom & MTN networks',
                ],
                [
                    'country' => '',
                    'region' => '',
                    'label' => 'Community Radio',
                    'description' => 'Daily advisories at 07:00 & 18:00 EAT',
                ],
                [
                    'country' => 'Kenya',
                    'region' => '',
                    'label' => 'Toll-Free Hotline',
                    'description' => 'Call 1192 (Kenya) free of charge',
                ],
            ],
        ],
        'radio' => [
            'title' => 'Partner Radio Stations',
            'regions' => [
                [
                    'country' => 'Kenya',
                    'region' => 'Turkana',
                    'stations' => [
                        [
                            'name' => 'Turkana FM',
                            'frequency' => '89.5 FM',
                            'languages' => 'Turkana / Swahili',
                            'times' => '07:00 & 18:00 EAT',
                        ],
                        [
                            'name' => 'Lodwar Community Radio',
                            'frequency' => '90.3 FM',
                            'languages' => 'Turkana / English',
                            'times' => '06:30 & 19:00 EAT',
                        ],
                    ],
                ],
                [
                    'country' => 'Kenya',
                    'region' => 'North Pokot',
                    'stations' => [],
                ],
                [
                    'country' => 'Uganda',
                    'region' => 'Moroto',
                    'stations' => [
                        [
                            'name' => 'Radio Karamoja',
                            'frequency' => '107.3 FM',
                            'languages' => 'Ngakarimojong / Swahili',
                            'times' => '07:00 & 18:00 EAT',
                        ],
                        [
                            'name' => 'Rhino Radio Uganda',
                            'frequency' => '102.0 FM',
                            'languages' => 'English / Swahili',
                            'times' => '08:00 & 17:00 EAT',
                        ],
                    ],
                ],
            ],
        ],
    ];
}

function tk_hub_sanitize_community_page_row($row, $fields) {
    $out = [];
    foreach ($fields as $field => $sanitize) {
        $out[$field] = call_user_func($sanitize, $row[$field] ?? '');
    }
    return $out;
}

function tk_hub_sanitize_community_station($row) {
    return tk_hub_sanitize_community_page_row($row, [
        'name' => 'sanitize_text_field',
        'frequency' => 'sanitize_text_field',
        'languages' => 'sanitize_text_field',
        'times' => 'sanitize_text_field',
    ]);
}

function tk_hub_normalize_community_radio_regions($radio) {
    if (!is_array($radio)) {
        return tk_hub_default_community_page()['radio']['regions'];
    }

    if (!empty($radio['regions']) && is_array($radio['regions'])) {
        return $radio['regions'];
    }

    $legacy = is_array($radio['stations'] ?? null) ? $radio['stations'] : [];
    if (!$legacy) {
        return tk_hub_default_community_page()['radio']['regions'];
    }

    return [
        [
            'country' => 'Kenya',
            'region' => 'Turkana',
            'stations' => $legacy,
        ],
    ];
}

function tk_hub_sanitize_community_page($input) {
    if (!is_array($input)) {
        return tk_hub_default_community_page();
    }

    $default = tk_hub_default_community_page();
    $allowed_countries = array_keys(tk_hub_community_country_regions());
    $out = [
        'outreach' => ['items' => []],
        'radio' => [
            'title' => sanitize_text_field($input['radio']['title'] ?? $default['radio']['title']),
            'regions' => [],
        ],
    ];

    $outreach_rows = is_array($input['outreach']['items'] ?? null) ? $input['outreach']['items'] : [];
    foreach ($outreach_rows as $row) {
        if (!is_array($row)) {
            continue;
        }
        $country = sanitize_text_field($row['country'] ?? '');
        if ($country && !in_array($country, $allowed_countries, true)) {
            $country = '';
        }
        $item = [
            'country' => $country,
            'region' => sanitize_text_field($row['region'] ?? ''),
            'label' => sanitize_text_field($row['label'] ?? ''),
            'description' => sanitize_textarea_field($row['description'] ?? ''),
        ];
        if ($item['label'] !== '' || $item['description'] !== '') {
            $out['outreach']['items'][] = $item;
        }
    }
    if (!$out['outreach']['items']) {
        $out['outreach']['items'] = $default['outreach']['items'];
    }

    $region_rows = tk_hub_normalize_community_radio_regions($input['radio'] ?? []);
    foreach ($region_rows as $group) {
        if (!is_array($group)) {
            continue;
        }
        $country = sanitize_text_field($group['country'] ?? '');
        $region = sanitize_text_field($group['region'] ?? '');
        if ($country && !in_array($country, $allowed_countries, true)) {
            continue;
        }
        if ($country === '' || $region === '') {
            continue;
        }

        $stations = [];
        $station_rows = is_array($group['stations'] ?? null) ? $group['stations'] : [];
        foreach ($station_rows as $station_row) {
            if (!is_array($station_row)) {
                continue;
            }
            $station = tk_hub_sanitize_community_station($station_row);
            if ($station['name'] !== '') {
                $stations[] = $station;
            }
        }

        if ($stations) {
            $out['radio']['regions'][] = [
                'country' => $country,
                'region' => $region,
                'stations' => $stations,
            ];
        }
    }
    if (!$out['radio']['regions']) {
        $out['radio']['regions'] = array_values(array_filter(
            $default['radio']['regions'],
            function ($group) {
                return !empty($group['stations']);
            }
        ));
    }

    return $out;
}

function tk_hub_get_community_page() {
    $stored = get_option('tk_hub_community_page');
    if (!is_array($stored)) {
        $stored = tk_hub_default_community_page();
    }

    $sanitized = tk_hub_sanitize_community_page($stored);
    return [
        'outreach' => [
            'items' => array_map(function ($item) {
                return [
                    'country' => $item['country'],
                    'region' => $item['region'],
                    'label' => $item['label'],
                    'description' => $item['description'],
                ];
            }, $sanitized['outreach']['items']),
        ],
        'radio' => [
            'title' => $sanitized['radio']['title'],
            'regions' => array_map(function ($group) {
                return [
                    'country' => $group['country'],
                    'region' => $group['region'],
                    'stations' => array_map(function ($station) {
                        return [
                            'name' => $station['name'],
                            'frequency' => $station['frequency'],
                            'languages' => $station['languages'],
                            'times' => $station['times'],
                        ];
                    }, $group['stations']),
                ];
            }, $sanitized['radio']['regions']),
        ],
    ];
}

function tk_hub_community_page_prepare_regions_for_admin($page) {
    $regions = tk_hub_normalize_community_radio_regions($page['radio'] ?? []);
    if (!$regions) {
        $regions = tk_hub_default_community_page()['radio']['regions'];
    }

    foreach ($regions as $index => $group) {
        if (empty($group['stations']) || !is_array($group['stations'])) {
            $regions[$index]['stations'] = [];
        }
        $regions[$index]['stations'][] = [
            'name' => '',
            'frequency' => '',
            'languages' => '',
            'times' => '',
        ];
    }

    $regions[] = [
        'country' => '',
        'region' => '',
        'stations' => [[
            'name' => '',
            'frequency' => '',
            'languages' => '',
            'times' => '',
        ]],
    ];

    return $regions;
}

function tk_hub_community_page_render_region_select($name, $country, $region) {
    $countries = tk_hub_community_country_regions();
    echo '<select name="' . esc_attr($name) . '[country]" class="regular-text" style="min-width:120px;margin-right:8px;">';
    echo '<option value="">' . esc_html__('— Country —', 'turkana-headless') . '</option>';
    foreach (array_keys($countries) as $option_country) {
        printf(
            '<option value="%1$s" %2$s>%1$s</option>',
            esc_attr($option_country),
            selected($country, $option_country, false)
        );
    }
    echo '</select>';
    echo '<input type="text" name="' . esc_attr($name) . '[region]" value="' . esc_attr($region) . '" class="regular-text" placeholder="' . esc_attr__('Region e.g. Turkana', 'turkana-headless') . '" list="tk-community-region-options" />';
}

add_action('admin_init', function () {
    register_setting('tk_hub_community_page_group', 'tk_hub_community_page', [
        'type' => 'array',
        'sanitize_callback' => 'tk_hub_sanitize_community_page',
        'default' => tk_hub_default_community_page(),
    ]);
});

add_action('admin_menu', function () {
    add_submenu_page(
        'edit.php?post_type=tk_programme',
        __('Community Page', 'turkana-headless'),
        __('Community Page', 'turkana-headless'),
        'manage_options',
        'tk-community-page',
        'tk_hub_community_page_settings_page'
    );
}, 20);

function tk_hub_community_page_settings_page() {
    if (!current_user_can('manage_options')) {
        return;
    }

    $page = get_option('tk_hub_community_page', tk_hub_default_community_page());
    if (!is_array($page)) {
        $page = tk_hub_default_community_page();
    }

    $outreach = $page['outreach']['items'] ?? tk_hub_default_community_page()['outreach']['items'];
    $outreach[] = ['country' => '', 'region' => '', 'label' => '', 'description' => ''];
    $regions = tk_hub_community_page_prepare_regions_for_admin($page);
    $country_regions = tk_hub_community_country_regions();
    $frontend_url = rtrim(TK_HUB_NEXT_URL, '/') . '/community';
    ?>
    <div class="wrap">
        <h1><?php esc_html_e('Community Page', 'turkana-headless'); ?></h1>
        <p>
            <?php esc_html_e('Manage outreach channels and partner radio stations grouped by country and region.', 'turkana-headless'); ?>
            <a href="<?php echo esc_url($frontend_url); ?>" target="_blank" rel="noopener"><?php esc_html_e('View on site', 'turkana-headless'); ?></a>
        </p>

        <datalist id="tk-community-region-options">
            <?php foreach ($country_regions as $country => $region_list) : ?>
                <?php foreach ($region_list as $region_name) : ?>
                    <option value="<?php echo esc_attr($region_name); ?>"><?php echo esc_html($country . ' — ' . $region_name); ?></option>
                <?php endforeach; ?>
            <?php endforeach; ?>
        </datalist>

        <form method="post" action="options.php">
            <?php settings_fields('tk_hub_community_page_group'); ?>

            <h2><?php esc_html_e('Outreach channels', 'turkana-headless'); ?></h2>
            <p class="description"><?php esc_html_e('Line items for the top of the Community page. Leave country blank for cluster-wide items. Empty trailing rows are ignored on save.', 'turkana-headless'); ?></p>
            <?php foreach ($outreach as $i => $item) : ?>
                <div style="background:#fff;border:1px solid #c3c4c7;border-radius:4px;padding:12px 16px;margin:0 0 12px;max-width:860px;">
                    <strong><?php echo esc_html(sprintf(__('Channel %d', 'turkana-headless'), $i + 1)); ?></strong>
                    <table class="form-table" style="margin:8px 0 0;">
                        <tr>
                            <th scope="row" style="width:140px;padding-left:0;"><?php esc_html_e('Country / Region', 'turkana-headless'); ?></th>
                            <td style="padding-left:0;">
                                <?php tk_hub_community_page_render_region_select('tk_hub_community_page[outreach][items][' . (int) $i . ']', $item['country'] ?? '', $item['region'] ?? ''); ?>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row" style="padding-left:0;"><?php esc_html_e('Label', 'turkana-headless'); ?></th>
                            <td style="padding-left:0;">
                                <input type="text" name="tk_hub_community_page[outreach][items][<?php echo (int) $i; ?>][label]" value="<?php echo esc_attr($item['label'] ?? ''); ?>" class="regular-text" placeholder="SMS Alerts" />
                            </td>
                        </tr>
                        <tr>
                            <th scope="row" style="padding-left:0;vertical-align:top;"><?php esc_html_e('Description', 'turkana-headless'); ?></th>
                            <td style="padding-left:0;">
                                <input type="text" name="tk_hub_community_page[outreach][items][<?php echo (int) $i; ?>][description]" value="<?php echo esc_attr($item['description'] ?? ''); ?>" class="large-text" placeholder="Via Safaricom & MTN networks" />
                            </td>
                        </tr>
                    </table>
                </div>
            <?php endforeach; ?>

            <h2><?php esc_html_e('Partner radio stations', 'turkana-headless'); ?></h2>
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="tk-community-radio-title"><?php esc_html_e('Section title', 'turkana-headless'); ?></label></th>
                    <td>
                        <input type="text" id="tk-community-radio-title" name="tk_hub_community_page[radio][title]" value="<?php echo esc_attr($page['radio']['title'] ?? ''); ?>" class="regular-text" />
                    </td>
                </tr>
            </table>
            <p class="description"><?php esc_html_e('Add a country + region group, then add one or more radio stations under it. Empty station rows and empty region groups are ignored on save.', 'turkana-headless'); ?></p>

            <?php foreach ($regions as $region_index => $group) : ?>
                <div style="background:#fff;border:1px solid #c3c4c7;border-left:4px solid #C1440E;border-radius:4px;padding:16px 20px;margin:0 0 16px;max-width:900px;">
                    <strong><?php echo esc_html(sprintf(__('Region group %d', 'turkana-headless'), $region_index + 1)); ?></strong>
                    <p style="margin:8px 0 12px;color:#50575e;">
                        <?php esc_html_e('Kenya: Turkana, North Pokot · Uganda: Moroto, Amudat, Napak', 'turkana-headless'); ?>
                    </p>
                    <p style="margin:0 0 12px;">
                        <?php tk_hub_community_page_render_region_select('tk_hub_community_page[radio][regions][' . (int) $region_index . ']', $group['country'] ?? '', $group['region'] ?? ''); ?>
                    </p>

                    <?php foreach (($group['stations'] ?? []) as $station_index => $station) : ?>
                        <div style="background:#3D2B1F;border-radius:4px;padding:14px 16px;margin:0 0 10px;color:#F0D9B0;">
                            <strong style="color:#D4A96A;"><?php echo esc_html(sprintf(__('Station %d', 'turkana-headless'), $station_index + 1)); ?></strong>
                            <table class="form-table" style="margin:8px 0 0;">
                                <tr>
                                    <th scope="row" style="width:140px;padding-left:0;color:#D4A96A;"><?php esc_html_e('Name', 'turkana-headless'); ?></th>
                                    <td style="padding-left:0;">
                                        <input type="text" name="tk_hub_community_page[radio][regions][<?php echo (int) $region_index; ?>][stations][<?php echo (int) $station_index; ?>][name]" value="<?php echo esc_attr($station['name'] ?? ''); ?>" class="regular-text" />
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row" style="padding-left:0;color:#D4A96A;"><?php esc_html_e('Frequency', 'turkana-headless'); ?></th>
                                    <td style="padding-left:0;">
                                        <input type="text" name="tk_hub_community_page[radio][regions][<?php echo (int) $region_index; ?>][stations][<?php echo (int) $station_index; ?>][frequency]" value="<?php echo esc_attr($station['frequency'] ?? ''); ?>" class="regular-text" placeholder="89.5 FM" />
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row" style="padding-left:0;color:#D4A96A;"><?php esc_html_e('Languages', 'turkana-headless'); ?></th>
                                    <td style="padding-left:0;">
                                        <input type="text" name="tk_hub_community_page[radio][regions][<?php echo (int) $region_index; ?>][stations][<?php echo (int) $station_index; ?>][languages]" value="<?php echo esc_attr($station['languages'] ?? ''); ?>" class="regular-text" placeholder="Turkana / Swahili" />
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row" style="padding-left:0;color:#D4A96A;"><?php esc_html_e('Broadcast times', 'turkana-headless'); ?></th>
                                    <td style="padding-left:0;">
                                        <input type="text" name="tk_hub_community_page[radio][regions][<?php echo (int) $region_index; ?>][stations][<?php echo (int) $station_index; ?>][times]" value="<?php echo esc_attr($station['times'] ?? ''); ?>" class="regular-text" placeholder="07:00 & 18:00 EAT" />
                                    </td>
                                </tr>
                            </table>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endforeach; ?>

            <?php submit_button(__('Save Community Page', 'turkana-headless')); ?>
        </form>
        <p>REST: <code><?php echo esc_html(rest_url('tk/v1/community-page')); ?></code></p>
    </div>
    <?php
}
