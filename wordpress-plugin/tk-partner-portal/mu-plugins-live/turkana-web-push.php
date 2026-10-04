<?php
/**
 * Plugin Name: Turkana Web Push
 * Description: Stores browser push subscriptions for the Next.js hub and triggers a web-push broadcast when an alert is published.
 * Version: 1.0.0
 *
 * Why this exists: the Next.js app runs on Vercel, whose filesystem is read-only/ephemeral,
 * so subscriptions can't live in a JSON file there. They live in WordPress instead.
 *
 * Flow:
 *   Browser → Next /api/push/subscribe → POST   /wp-json/tk/v1/push/subscriptions   (stored here)
 *   Alert published here → POST {TK_HUB_NEXT_URL}/api/push/broadcast (x-push-secret)
 *   Next broadcast       → GET  /wp-json/tk/v1/push/subscriptions  → sends with VAPID keys
 *                        → POST /wp-json/tk/v1/push/subscriptions/prune (expired endpoints)
 *
 * Every route requires the shared secret in the `X-Push-Secret` header
 * (TK_HUB_PUSH_SECRET here == PUSH_BROADCAST_SECRET in the Next.js env).
 */

if (!defined('ABSPATH')) {
    exit;
}

const TK_PUSH_DB_VERSION = '1';

function tk_push_table() {
    global $wpdb;
    return $wpdb->prefix . 'tk_push_subscriptions';
}

function tk_push_secret() {
    $env = getenv('TK_HUB_PUSH_SECRET');
    if ($env) {
        return $env;
    }
    return defined('TK_HUB_PUSH_SECRET') ? TK_HUB_PUSH_SECRET : '';
}

/** URL of the Next.js app that sends pushes. Override with TK_HUB_PUSH_NEXT_URL (e.g. your Vercel domain). */
function tk_push_next_url() {
    if (defined('TK_HUB_PUSH_NEXT_URL') && TK_HUB_PUSH_NEXT_URL) {
        return rtrim(TK_HUB_PUSH_NEXT_URL, '/');
    }
    $env = getenv('TK_HUB_PUSH_NEXT_URL');
    if ($env) {
        return rtrim($env, '/');
    }
    return defined('TK_HUB_NEXT_URL') ? rtrim(TK_HUB_NEXT_URL, '/') : '';
}

/* ---------- Table (created/upgraded automatically; mu-plugins have no activation hook) ---------- */
add_action('init', function () {
    if (get_option('tk_push_db_version') === TK_PUSH_DB_VERSION) {
        return;
    }
    global $wpdb;
    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    $table = tk_push_table();
    $charset = $wpdb->get_charset_collate();
    dbDelta("CREATE TABLE {$table} (
        id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
        endpoint_hash char(64) NOT NULL,
        endpoint text NOT NULL,
        p256dh varchar(255) NOT NULL,
        auth varchar(255) NOT NULL,
        user_agent varchar(255) NOT NULL DEFAULT '',
        created_at datetime NOT NULL,
        updated_at datetime NOT NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY endpoint_hash (endpoint_hash)
    ) {$charset};");
    update_option('tk_push_db_version', TK_PUSH_DB_VERSION, false);
});

/* ---------- REST routes ---------- */
function tk_push_check_secret(WP_REST_Request $request) {
    $secret = tk_push_secret();
    $given = (string) $request->get_header('x-push-secret');
    if (!$secret || !$given || !hash_equals($secret, $given)) {
        return new WP_Error('tk_push_forbidden', 'Invalid push secret.', ['status' => 401]);
    }
    return true;
}

function tk_push_valid_endpoint($endpoint) {
    return is_string($endpoint)
        && strlen($endpoint) <= 2048
        && strpos($endpoint, 'https://') === 0
        && filter_var($endpoint, FILTER_VALIDATE_URL);
}

add_action('rest_api_init', function () {
    register_rest_route('tk/v1', '/push/subscriptions', [
        [
            'methods' => 'GET',
            'permission_callback' => 'tk_push_check_secret',
            'callback' => function (WP_REST_Request $request) {
                global $wpdb;
                $table = tk_push_table();
                $page = max(1, (int) $request->get_param('page'));
                $per_page = min(1000, max(1, (int) ($request->get_param('per_page') ?: 500)));
                $offset = ($page - 1) * $per_page;
                $total = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$table}");
                $rows = $wpdb->get_results($wpdb->prepare(
                    "SELECT endpoint, p256dh, auth FROM {$table} ORDER BY id ASC LIMIT %d OFFSET %d",
                    $per_page,
                    $offset
                ), ARRAY_A);
                $subs = array_map(function ($r) {
                    return [
                        'endpoint' => $r['endpoint'],
                        'keys' => ['p256dh' => $r['p256dh'], 'auth' => $r['auth']],
                    ];
                }, $rows ?: []);
                return rest_ensure_response([
                    'total' => $total,
                    'page' => $page,
                    'per_page' => $per_page,
                    'subscriptions' => $subs,
                ]);
            },
        ],
        [
            'methods' => 'POST',
            'permission_callback' => 'tk_push_check_secret',
            'callback' => function (WP_REST_Request $request) {
                global $wpdb;
                $body = $request->get_json_params();
                $endpoint = $body['endpoint'] ?? '';
                $p256dh = $body['keys']['p256dh'] ?? '';
                $auth = $body['keys']['auth'] ?? '';
                if (!tk_push_valid_endpoint($endpoint) || !$p256dh || !$auth) {
                    return new WP_Error('tk_push_invalid', 'Invalid subscription.', ['status' => 400]);
                }
                $now = current_time('mysql', true);
                $table = tk_push_table();
                $ua = substr(sanitize_text_field($body['userAgent'] ?? ''), 0, 255);
                // Upsert by endpoint hash (keys can rotate for the same endpoint).
                $wpdb->query($wpdb->prepare(
                    "INSERT INTO {$table} (endpoint_hash, endpoint, p256dh, auth, user_agent, created_at, updated_at)
                     VALUES (%s, %s, %s, %s, %s, %s, %s)
                     ON DUPLICATE KEY UPDATE p256dh = VALUES(p256dh), auth = VALUES(auth), user_agent = VALUES(user_agent), updated_at = VALUES(updated_at)",
                    hash('sha256', $endpoint),
                    $endpoint,
                    sanitize_text_field($p256dh),
                    sanitize_text_field($auth),
                    $ua,
                    $now,
                    $now
                ));
                $count = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$table}");
                return new WP_REST_Response(['ok' => true, 'count' => $count], 201);
            },
        ],
        [
            'methods' => 'DELETE',
            'permission_callback' => 'tk_push_check_secret',
            'callback' => function (WP_REST_Request $request) {
                global $wpdb;
                $body = $request->get_json_params();
                $endpoint = $body['endpoint'] ?? $request->get_param('endpoint');
                if (!is_string($endpoint) || $endpoint === '') {
                    return new WP_Error('tk_push_invalid', 'endpoint is required.', ['status' => 400]);
                }
                $deleted = $wpdb->delete(tk_push_table(), ['endpoint_hash' => hash('sha256', $endpoint)]);
                return rest_ensure_response(['ok' => true, 'deleted' => (int) $deleted]);
            },
        ],
    ]);

    register_rest_route('tk/v1', '/push/subscriptions/prune', [
        'methods' => 'POST',
        'permission_callback' => 'tk_push_check_secret',
        'callback' => function (WP_REST_Request $request) {
            global $wpdb;
            $endpoints = $request->get_json_params()['endpoints'] ?? [];
            if (!is_array($endpoints)) {
                $endpoints = [];
            }
            $deleted = 0;
            foreach (array_slice($endpoints, 0, 5000) as $endpoint) {
                if (is_string($endpoint) && $endpoint !== '') {
                    $deleted += (int) $wpdb->delete(tk_push_table(), ['endpoint_hash' => hash('sha256', $endpoint)]);
                }
            }
            return rest_ensure_response(['ok' => true, 'deleted' => $deleted]);
        },
    ]);
});

/* ---------- Trigger a web-push broadcast when an alert is first published ---------- */
add_action('transition_post_status', function ($new_status, $old_status, $post) {
    if (!$post || $post->post_type !== 'tk_alert' || $new_status !== 'publish' || $old_status === 'publish') {
        return;
    }
    // Defer until meta (alert_level, area) has been saved by the editor/REST request.
    if (!wp_next_scheduled('tk_push_alert_published', [$post->ID])) {
        wp_schedule_single_event(time(), 'tk_push_alert_published', [$post->ID]);
    }
    add_action('shutdown', function () use ($post) {
        tk_push_send_alert($post->ID);
    });
}, 10, 3);

add_action('tk_push_alert_published', 'tk_push_send_alert');

function tk_push_send_alert($post_id) {
    $post_id = (int) $post_id;
    // Only send once per alert, whichever of shutdown / cron runs first.
    if (get_post_meta($post_id, '_tk_push_sent_at', true)) {
        return;
    }
    $next = tk_push_next_url();
    $secret = tk_push_secret();
    if (!$next || !$secret || get_post_status($post_id) !== 'publish') {
        return;
    }
    update_post_meta($post_id, '_tk_push_sent_at', time());
    wp_clear_scheduled_hook('tk_push_alert_published', [$post_id]);

    $level = strtolower((string) get_post_meta($post_id, 'alert_level', true)) ?: 'yellow';
    $area = (string) get_post_meta($post_id, 'area', true);
    $labels = ['red' => '🔴 RED ALERT', 'orange' => '🟠 ORANGE ALERT', 'yellow' => '🟡 Advisory', 'green' => '🟢 Update'];
    $prefix = $labels[$level] ?? 'New climate alert';
    $title = $prefix . ' – ' . wp_strip_all_tags(get_the_title($post_id));
    $body = $area ? 'Area: ' . $area : 'A new advisory has been published.';
    $slug = get_post_field('post_name', $post_id);

    $response = wp_remote_post($next . '/api/push/broadcast', [
        'timeout' => 20,
        'headers' => [
            'Content-Type' => 'application/json',
            'x-push-secret' => $secret,
        ],
        'body' => wp_json_encode([
            'title' => mb_substr($title, 0, 120),
            'body' => mb_substr($body, 0, 240),
            'url' => $slug ? '/early-warnings/' . $slug : '/early-warnings',
        ]),
    ]);

    $result = is_wp_error($response)
        ? 'error: ' . $response->get_error_message()
        : wp_remote_retrieve_response_code($response) . ' ' . substr(wp_remote_retrieve_body($response), 0, 300);
    update_post_meta($post_id, '_tk_push_result', $result);
    if (defined('WP_DEBUG_LOG') && WP_DEBUG_LOG) {
        error_log('[tk-web-push] alert ' . $post_id . ' → ' . $result);
    }
}
