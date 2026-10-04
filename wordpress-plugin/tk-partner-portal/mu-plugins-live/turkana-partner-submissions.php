<?php
/**
 * Plugin Name: Turkana Partner Submissions
 * Description: REST API for partners to view, update, withdraw, and extend their submissions.
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

function tk_partner_get_org_for_user($user = null) {
    $user = $user ?: wp_get_current_user();
    if (!$user || !$user->ID) {
        return null;
    }

    $orgs = get_posts([
        'post_type' => 'tk_organization',
        'post_status' => ['draft', 'publish', 'pending', 'private'],
        'posts_per_page' => 1,
        'meta_key' => 'wp_user_id',
        'meta_value' => $user->ID,
    ]);
    if ($orgs) {
        return $orgs[0];
    }

    if (function_exists('tk_find_organization_by_email')) {
        return tk_find_organization_by_email($user->user_email);
    }

    return null;
}

function tk_partner_user_owns_post($post_id, $org_post = null) {
    $post = get_post($post_id);
    if (!$post || !in_array($post->post_type, ['tk_alert', 'tk_report'], true)) {
        return false;
    }

    $org_post = $org_post ?: tk_partner_get_org_for_user();
    if (!$org_post) {
        return false;
    }

    if ((int) $post->post_author === get_current_user_id()) {
        return true;
    }

    if (!function_exists('tk_content_belongs_to_org')) {
        return false;
    }

    return tk_content_belongs_to_org(
        $post_id,
        $post->post_type,
        $org_post->ID,
        tk_org_match_terms($org_post)
    );
}

function tk_partner_submission_review_status($post_id) {
    if (function_exists('tk_hub_get_review_status')) {
        return tk_hub_get_review_status($post_id);
    }
    $post = get_post($post_id);
    return ($post && $post->post_status === 'publish') ? 'approved' : 'pending';
}

function tk_partner_submission_editable($post_id) {
    $post = get_post($post_id);
    if (!$post || $post->post_status === 'trash') {
        return false;
    }
    $review = tk_partner_submission_review_status($post_id);
    return in_array($review, ['pending', 'rejected'], true);
}

function tk_partner_parse_report_files($post_id) {
    $raw = get_post_meta($post_id, 'report_files', true);
    if (!$raw) {
        $url = get_post_meta($post_id, 'file_url', true);
        if ($url) {
            return [[
                'url' => $url,
                'size' => get_post_meta($post_id, 'file_size', true) ?: '',
                'language' => 'en',
                'label' => 'English',
                'filename' => '',
            ]];
        }
        return [];
    }
    // report_files is written as a native PHP array by tk-partner-portal.php's create/
    // document endpoints (WordPress auto-serializes it), so get_post_meta() usually already
    // returns an array here — calling json_decode() on that unconditionally throws
    // "Uncaught TypeError: json_decode(): Argument #1 ($json) must be of type string, array
    // given". Guard for both shapes.
    if (is_array($raw)) {
        return $raw;
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function tk_partner_format_submission(WP_Post $post) {
    $type = $post->post_type === 'tk_alert' ? 'advisory' : 'report';
    $review = tk_partner_submission_review_status($post->ID);
    $editable = tk_partner_submission_editable($post->ID);
    $acf = function_exists('tk_build_acf') ? tk_build_acf($post) : [];

    $item = [
        'id' => $post->ID,
        'type' => $type,
        'reference' => ($type === 'advisory' ? 'ADV-' : 'RPT-') . $post->ID,
        'title' => get_the_title($post),
        'description' => $type === 'report'
            ? ($post->post_excerpt ?: $post->post_content)
            : ($acf['body'] ?? $post->post_content),
        'review_status' => $review,
        'wp_status' => $post->post_status,
        'submitted_at' => get_post_time('c', true, $post),
        'updated_at' => get_post_modified_time('c', true, $post),
        'can_edit' => $editable,
        'can_withdraw' => $editable && $post->post_status !== 'trash',
        'can_add_documents' => $type === 'report' && $editable,
    ];

    if ($type === 'report') {
        $item['category'] = get_post_meta($post->ID, 'tag', true) ?: '';
        $item['keywords'] = function_exists('tk_parse_keywords_meta')
            ? tk_parse_keywords_meta(get_post_meta($post->ID, 'keywords', true))
            : [];
        $item['files'] = tk_partner_parse_report_files($post->ID);
    } else {
        $item['level'] = get_post_meta($post->ID, 'alert_level', true) ?: 'yellow';
        $item['area'] = get_post_meta($post->ID, 'area', true) ?: '';
    }

    return $item;
}

function tk_partner_collect_submissions($org_post) {
    $items = [];
    $match_terms = tk_org_match_terms($org_post);
    $types = ['tk_alert' => 'advisory', 'tk_report' => 'report'];

    foreach ($types as $post_type => $label) {
        $posts = get_posts([
            'post_type' => $post_type,
            'post_status' => ['draft', 'publish', 'pending', 'private'],
            'posts_per_page' => 100,
            'orderby' => 'date',
            'order' => 'DESC',
        ]);
        foreach ($posts as $post) {
            if (!tk_content_belongs_to_org($post->ID, $post_type, $org_post->ID, $match_terms)
                && (int) $post->post_author !== get_current_user_id()) {
                continue;
            }
            if (get_post_meta($post->ID, 'review_status', true) === 'withdrawn') {
                continue;
            }
            $items[] = tk_partner_format_submission($post);
        }
    }

    usort($items, function ($a, $b) {
        return strcmp($b['submitted_at'], $a['submitted_at']);
    });

    return $items;
}

function tk_partner_rest_auth() {
    return is_user_logged_in();
}

function tk_partner_rest_get_submissions(WP_REST_Request $request) {
    $org = tk_partner_get_org_for_user();
    if (!$org) {
        return new WP_Error('no_org', __('No organisation linked to your account.', 'turkana-headless'), ['status' => 403]);
    }
    if (tk_org_get_status($org->ID) !== 'approved') {
        return new WP_Error('org_not_approved', __('Your organisation must be approved.', 'turkana-headless'), ['status' => 403]);
    }

    return rest_ensure_response([
        'organization' => [
            'id' => $org->ID,
            'name' => get_the_title($org),
            'reference' => 'ORG-' . $org->ID,
        ],
        'items' => tk_partner_collect_submissions($org),
    ]);
}

function tk_partner_rest_update_submission(WP_REST_Request $request) {
    $type = $request['type'];
    $post_id = (int) $request['id'];
    $post_type = $type === 'advisory' ? 'tk_alert' : 'tk_report';
    $post = get_post($post_id);

    if (!$post || $post->post_type !== $post_type) {
        return new WP_Error('not_found', __('Submission not found.', 'turkana-headless'), ['status' => 404]);
    }
    if (!tk_partner_user_owns_post($post_id)) {
        return new WP_Error('forbidden', __('You cannot edit this submission.', 'turkana-headless'), ['status' => 403]);
    }
    if (!tk_partner_submission_editable($post_id)) {
        return new WP_Error('locked', __('Approved submissions cannot be edited. Contact an administrator.', 'turkana-headless'), ['status' => 409]);
    }

    $body = $request->get_json_params();
    $update = ['ID' => $post_id];

    if (!empty($body['title'])) {
        $update['post_title'] = sanitize_text_field($body['title']);
    }
    if ($post_type === 'tk_report') {
        if (isset($body['description'])) {
            $desc = sanitize_textarea_field($body['description']);
            $update['post_content'] = $desc;
            $update['post_excerpt'] = $desc;
        }
        if (isset($body['keywords']) && is_array($body['keywords'])) {
            $keywords = function_exists('tk_parse_keywords_meta')
                ? tk_parse_keywords_meta($body['keywords'])
                : array_map('sanitize_text_field', $body['keywords']);
            update_post_meta($post_id, 'keywords', implode(', ', $keywords));
        }
    } else {
        if (isset($body['content'])) {
            $content = sanitize_textarea_field($body['content']);
            $update['post_content'] = $content;
            update_post_meta($post_id, 'body', $content);
        }
    }

    if (tk_partner_submission_review_status($post_id) === 'rejected') {
        update_post_meta($post_id, 'review_status', 'pending');
    }

    wp_update_post($update);

    return rest_ensure_response([
        'message' => __('Submission updated. It will be reviewed again.', 'turkana-headless'),
        'item' => tk_partner_format_submission(get_post($post_id)),
    ]);
}

function tk_partner_rest_withdraw_submission(WP_REST_Request $request) {
    $type = $request['type'];
    $post_id = (int) $request['id'];
    $post_type = $type === 'advisory' ? 'tk_alert' : 'tk_report';
    $post = get_post($post_id);

    if (!$post || $post->post_type !== $post_type) {
        return new WP_Error('not_found', __('Submission not found.', 'turkana-headless'), ['status' => 404]);
    }
    if (!tk_partner_user_owns_post($post_id)) {
        return new WP_Error('forbidden', __('You cannot withdraw this submission.', 'turkana-headless'), ['status' => 403]);
    }
    if (!tk_partner_submission_editable($post_id)) {
        return new WP_Error('locked', __('Published submissions cannot be withdrawn from the portal.', 'turkana-headless'), ['status' => 409]);
    }

    update_post_meta($post_id, 'review_status', 'withdrawn');
    update_post_meta($post_id, 'withdrawn_at', gmdate('Y-m-d H:i:s'));
    wp_update_post(['ID' => $post_id, 'post_status' => 'draft']);

    return rest_ensure_response([
        'message' => __('Submission withdrawn.', 'turkana-headless'),
    ]);
}

function tk_partner_rest_add_report_documents(WP_REST_Request $request) {
    $post_id = (int) $request['id'];
    $post = get_post($post_id);

    if (!$post || $post->post_type !== 'tk_report') {
        return new WP_Error('not_found', __('Report not found.', 'turkana-headless'), ['status' => 404]);
    }
    if (!tk_partner_user_owns_post($post_id)) {
        return new WP_Error('forbidden', __('You cannot edit this report.', 'turkana-headless'), ['status' => 403]);
    }
    if (!tk_partner_submission_editable($post_id)) {
        return new WP_Error('locked', __('Documents cannot be added to approved reports.', 'turkana-headless'), ['status' => 409]);
    }

    $body = $request->get_json_params();
    $new_docs = isset($body['documents']) && is_array($body['documents']) ? $body['documents'] : [];
    if (empty($new_docs)) {
        return new WP_Error('invalid', __('No documents provided.', 'turkana-headless'), ['status' => 400]);
    }

    $existing = tk_partner_parse_report_files($post_id);
    $merged = $existing;

    foreach ($new_docs as $doc) {
        if (empty($doc['url'])) {
            continue;
        }
        $merged[] = [
            'url' => esc_url_raw($doc['url']),
            'size' => sanitize_text_field($doc['size'] ?? ''),
            'language' => sanitize_key($doc['language'] ?? 'en'),
            'label' => sanitize_text_field($doc['label'] ?? ''),
            'filename' => sanitize_text_field($doc['filename'] ?? ''),
        ];
    }

    if (count($merged) > 8) {
        return new WP_Error('limit', __('Maximum 8 documents per report.', 'turkana-headless'), ['status' => 400]);
    }

    update_post_meta($post_id, 'report_files', wp_json_encode(array_values($merged)));
    $primary = $merged[0];
    foreach ($merged as $file) {
        if (!empty($file['language']) && $file['language'] === 'en') {
            $primary = $file;
            break;
        }
    }
    update_post_meta($post_id, 'file_url', esc_url_raw($primary['url']));
    update_post_meta($post_id, 'file_size', sanitize_text_field($primary['size'] ?? ''));

    if (tk_partner_submission_review_status($post_id) === 'rejected') {
        update_post_meta($post_id, 'review_status', 'pending');
    }

    return rest_ensure_response([
        'message' => __('Documents added.', 'turkana-headless'),
        'item' => tk_partner_format_submission(get_post($post_id)),
    ]);
}

// DISABLED — this mu-plugin registers the exact same routes as tk-partner-portal.php
// (wp-content/plugins/tk-partner-portal/), which is the actively-developed implementation
// matching the current frontend data model (categories/countries/organization_id arrays,
// array-shaped keywords, the `_tk_review_status` state machine with withdrawal_requested/
// withdrawn, and a DELETE documents endpoint). Because mu-plugins load — and therefore hook
// into `rest_api_init` — before regular plugins, THIS file's route registrations were always
// winning the route table and silently shadowing every fix made to tk-partner-portal.php's
// /tk/v1/my-submissions endpoints. Left the functions above intact for reference, but the
// registrations themselves are commented out so tk-partner-portal.php's routes are the ones
// that actually run.
//
// add_action('rest_api_init', function () {
//     register_rest_route('tk/v1', '/my-submissions', [
//         'methods' => 'GET',
//         'permission_callback' => 'tk_partner_rest_auth',
//         'callback' => 'tk_partner_rest_get_submissions',
//     ]);
//
//     register_rest_route('tk/v1', '/my-submissions/(?P<type>advisory|report)/(?P<id>\d+)', [
//         'methods' => 'PATCH',
//         'permission_callback' => 'tk_partner_rest_auth',
//         'callback' => 'tk_partner_rest_update_submission',
//     ]);
//
//     register_rest_route('tk/v1', '/my-submissions/(?P<type>advisory|report)/(?P<id>\d+)/withdraw', [
//         'methods' => 'POST',
//         'permission_callback' => 'tk_partner_rest_auth',
//         'callback' => 'tk_partner_rest_withdraw_submission',
//     ]);
//
//     register_rest_route('tk/v1', '/my-submissions/report/(?P<id>\d+)/documents', [
//         'methods' => 'POST',
//         'permission_callback' => 'tk_partner_rest_auth',
//         'callback' => 'tk_partner_rest_add_report_documents',
//     ]);
// });
