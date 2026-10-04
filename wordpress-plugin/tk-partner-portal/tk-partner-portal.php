<?php
/**
 * Plugin Name: TK Partner Portal
 * Description: Custom REST API endpoints and admin workflow that power the Turkana-Karamoja
 *              Karamoja partner portal in the Next.js frontend.
 *              Adds organisation registration + approval, and lets approved partners
 *              track, edit, withdraw and add documents to their own advisories/reports
 *              via /wp-json/tk/v1/*.
 * Version:     1.0.0
 * Author:      Karamoja Climate Change Knowledge and Information
 * Text Domain: tk-partner-portal
 *
 * INSTALL: copy this whole "tk-partner-portal" folder into wp-content/plugins/ on your
 * WordPress install, then activate "TK Partner Portal" under Plugins in wp-admin.
 *
 * REQUIRES (per planning/wordpress-setup-checklist.md, already expected on this site):
 *   - JWT Authentication for WP REST API  (so Authorization: Bearer <token> resolves the
 *     current user inside REST callbacks via is_user_logged_in() / get_current_user_id())
 *   - CORS configured to allow the Next.js origin, including the Authorization header
 *
 * This plugin does NOT require ACF or ACF-to-REST-API — it reads/writes the same meta
 * keys ACF would use, directly, so it works whether or not those plugins are present.
 */

if (!defined('ABSPATH')) {
    exit; // no direct access
}

define('TK_PP_VERSION', '1.0.0');

/* -----------------------------------------------------------------------
 * 1. Defensive CPT registration
 * ---------------------------------------------------------------------*/

/**
 * The frontend expects tk_organization, tk_alert and tk_report to exist
 * (normally registered via Custom Post Type UI, see wordpress-setup-checklist.md).
 * If a site hasn't set those up yet, register minimal versions here so the
 * portal still works out of the box. Registering only happens when the CPT
 * is missing, so this never conflicts with an existing CPT UI configuration.
 */
add_action('init', function () {
    if (!post_type_exists('tk_organization')) {
        register_post_type('tk_organization', [
            'label'        => 'Organizations',
            'public'       => true,
            'show_in_rest' => true,
            'supports'     => ['title'],
            'menu_icon'    => 'dashicons-groups',
            'capability_type' => 'post',
        ]);
    }
    if (!post_type_exists('tk_alert')) {
        register_post_type('tk_alert', [
            'label'        => 'Alerts',
            'public'       => true,
            'show_in_rest' => true,
            'supports'     => ['title', 'editor'],
            'menu_icon'    => 'dashicons-warning',
        ]);
    }
    if (!post_type_exists('tk_report')) {
        register_post_type('tk_report', [
            'label'        => 'Reports',
            'public'       => true,
            'show_in_rest' => true,
            'supports'     => ['title', 'editor', 'excerpt'],
            'menu_icon'    => 'dashicons-media-document',
        ]);
    }
}, 5);

/** tk_partner role: identical caps to subscriber, kept distinct for clarity/future use. */
register_activation_hook(__FILE__, function () {
    if (!get_role('tk_partner')) {
        add_role('tk_partner', 'Hub Partner', ['read' => true]);
    }
});

/* -----------------------------------------------------------------------
 * 2. Small helpers
 * ---------------------------------------------------------------------*/

function tk_pp_type_to_cpt($type) {
    return $type === 'advisory' ? 'tk_alert' : ($type === 'report' ? 'tk_report' : null);
}

function tk_pp_cpt_to_type($post_type) {
    if ($post_type === 'tk_alert') return 'advisory';
    if ($post_type === 'tk_report') return 'report';
    return null;
}

function tk_pp_reference($prefix, $id) {
    return sprintf('TK-%s-%06d', strtoupper($prefix), $id);
}

/** Find the tk_organization post linked to a WP user, backfilling the link if possible. */
function tk_pp_get_org_for_user($user_id) {
    $org_id = get_user_meta($user_id, '_tk_org_id', true);
    if ($org_id && get_post($org_id)) {
        return get_post($org_id);
    }

    $user = get_userdata($user_id);
    if (!$user || empty($user->user_email)) return null;

    $orgs = get_posts([
        'post_type'      => 'tk_organization',
        'post_status'    => 'any',
        'meta_key'       => 'contact_email',
        'meta_value'     => $user->user_email,
        'posts_per_page' => 1,
    ]);

    if ($orgs) {
        update_user_meta($user_id, '_tk_org_id', $orgs[0]->ID);
        return $orgs[0];
    }
    return null;
}

function tk_pp_org_status($org_id) {
    return get_post_meta($org_id, '_tk_org_status', true) ?: 'pending';
}

/* -----------------------------------------------------------------------
 * 3. REST routes
 * ---------------------------------------------------------------------*/

add_action('rest_api_init', function () {

    register_rest_route('tk/v1', '/register-organization', [
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => 'tk_pp_register_organization',
    ]);

    register_rest_route('tk/v1', '/organization-status', [
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => 'tk_pp_organization_status',
        'args'                => [
            'email' => ['required' => true],
        ],
    ]);

    register_rest_route('tk/v1', '/my-submissions', [
        'methods'             => 'GET',
        'permission_callback' => function () { return is_user_logged_in(); },
        'callback'            => 'tk_pp_my_submissions',
    ]);

    register_rest_route('tk/v1', '/my-submissions/(?P<type>advisory|report)/(?P<id>\d+)', [
        'methods'             => 'PATCH',
        'permission_callback' => function () { return is_user_logged_in(); },
        'callback'            => 'tk_pp_update_submission',
    ]);

    register_rest_route('tk/v1', '/my-submissions/(?P<type>advisory|report)/(?P<id>\d+)/withdraw', [
        'methods'             => 'POST',
        'permission_callback' => function () { return is_user_logged_in(); },
        'callback'            => 'tk_pp_withdraw_submission',
    ]);

    register_rest_route('tk/v1', '/my-submissions/report/(?P<id>\d+)/documents', [
        'methods'             => 'POST',
        'permission_callback' => function () { return is_user_logged_in(); },
        'callback'            => 'tk_pp_add_report_documents',
    ]);

    register_rest_route('tk/v1', '/my-submissions/report/(?P<id>\d+)/documents', [
        'methods'             => 'DELETE',
        'permission_callback' => function () { return is_user_logged_in(); },
        'callback'            => 'tk_pp_remove_report_document',
    ]);
});

/** POST /tk/v1/register-organization */
function tk_pp_register_organization(WP_REST_Request $req) {
    $body = $req->get_json_params() ?: [];

    $name  = sanitize_text_field($body['name'] ?? '');
    $email = sanitize_email($body['contact_email'] ?? '');
    $contactName = sanitize_text_field($body['contact_name'] ?? '');

    if (!$name || !$email || !is_email($email) || !$contactName) {
        return new WP_Error('tk_invalid', 'Organisation name, contact name and a valid contact email are required.', ['status' => 400]);
    }

    $existing = get_posts([
        'post_type'      => 'tk_organization',
        'post_status'    => 'any',
        'meta_key'       => 'contact_email',
        'meta_value'     => $email,
        'posts_per_page' => 1,
    ]);
    if ($existing) {
        $org = $existing[0];
        return [
            'message'   => 'This email is already registered. Check your inbox or sign in if already approved.',
            'reference' => get_post_meta($org->ID, '_tk_reference', true),
            'status'    => tk_pp_org_status($org->ID),
        ];
    }

    $post_id = wp_insert_post([
        'post_type'   => 'tk_organization',
        'post_title'  => $name,
        'post_status' => 'pending',
    ], true);

    if (is_wp_error($post_id)) {
        return new WP_Error('tk_insert_failed', $post_id->get_error_message(), ['status' => 500]);
    }

    update_post_meta($post_id, 'abbreviation', sanitize_text_field($body['abbreviation'] ?? ''));
    update_post_meta($post_id, 'org_type', sanitize_text_field($body['org_type'] ?? 'Partner'));
    update_post_meta($post_id, 'country', sanitize_text_field($body['country'] ?? 'INT'));
    update_post_meta($post_id, 'country_code', sanitize_text_field($body['country'] ?? 'INT'));
    update_post_meta($post_id, 'contact_email', $email);
    update_post_meta($post_id, 'contact_name', $contactName);
    update_post_meta($post_id, 'contact_phone', sanitize_text_field($body['contact_phone'] ?? ''));
    update_post_meta($post_id, 'description', sanitize_textarea_field($body['description'] ?? ''));
    update_post_meta($post_id, '_tk_org_status', 'pending');
    update_post_meta($post_id, 'verification_status', 'pending');

    $reference = tk_pp_reference('ORG', $post_id);
    update_post_meta($post_id, '_tk_reference', $reference);

    // Notify site admin so they know to review it.
    wp_mail(
        get_option('admin_email'),
        "New partner registration: {$name}",
        "A new organisation registered on Karamoja and is awaiting approval.\n\n"
        . "Name: {$name}\nContact: {$contactName} <{$email}>\nReference: {$reference}\n\n"
        . admin_url('edit.php?post_type=tk_organization')
    );

    return [
        'message'   => 'Registration received. An administrator will review your application shortly.',
        'reference' => $reference,
        'id'        => $post_id,
    ];
}

/** GET /tk/v1/organization-status?email=... */
function tk_pp_organization_status(WP_REST_Request $req) {
    $email = sanitize_email($req->get_param('email'));
    if (!$email) {
        return new WP_Error('tk_invalid', 'email is required', ['status' => 400]);
    }

    $orgs = get_posts([
        'post_type'      => 'tk_organization',
        'post_status'    => 'any',
        'meta_key'       => 'contact_email',
        'meta_value'     => $email,
        'posts_per_page' => 1,
    ]);

    if (!$orgs) {
        return ['registered' => false];
    }

    $org = $orgs[0];
    $status = tk_pp_org_status($org->ID);

    return [
        'registered' => true,
        'id'         => $org->ID,
        'reference'  => get_post_meta($org->ID, '_tk_reference', true),
        'name'       => $org->post_title,
        'status'     => $status,
        'approved'   => $status === 'approved',
    ];
}

/** Build one item in the /my-submissions shape the frontend (PartnerSubmissionsPanel) expects. */
function tk_pp_build_submission_item($post) {
    $type = tk_pp_cpt_to_type($post->post_type);
    $review_status = get_post_meta($post->ID, '_tk_review_status', true) ?: 'pending';

    $files = [];
    if ($type === 'report') {
        $raw = get_post_meta($post->ID, 'report_files', true);
        $files = is_array($raw) ? $raw : [];
    } elseif ($type === 'advisory') {
        $raw = get_post_meta($post->ID, 'advisory_files', true);
        $files = is_array($raw) ? $raw : [];
    }

    $keywords = get_post_meta($post->ID, 'keywords', true);
    if (!is_array($keywords)) $keywords = [];

    $categories = get_post_meta($post->ID, 'categories', true);
    if (!is_array($categories)) $categories = [];

    $countries = get_post_meta($post->ID, 'countries', true);
    if (!is_array($countries)) $countries = [];

    // For reports, prefer the `description` meta (written directly by this plugin on
    // create/update — see tk_pp_stamp_new_submission / tk_pp_update_submission — since it
    // doesn't depend on ACF or the tk_report CPT having "Excerpt"/"Editor" support enabled)
    // and fall back to the native excerpt/content either way.
    $report_description = get_post_meta($post->ID, 'description', true);

    // Reports stay editable after approval (partners can correct a live report without
    // pulling it out of publication); advisories keep the tighter pending/rejected-only rule.
    $editable_statuses = $type === 'report' ? ['pending', 'rejected', 'approved'] : ['pending', 'rejected'];

    return [
        'type'              => $type,
        'id'                => $post->ID,
        'reference'         => get_post_meta($post->ID, '_tk_reference', true) ?: tk_pp_reference($type === 'advisory' ? 'ALT' : 'RPT', $post->ID),
        'title'             => get_the_title($post),
        'description'       => $type === 'report' ? ($report_description ?: ($post->post_excerpt ?: $post->post_content)) : $post->post_content,
        'categories'        => $categories,
        'countries'         => $countries,
        'review_status'     => $review_status,
        'submitted_at'      => get_post_meta($post->ID, '_tk_submitted_at', true) ?: $post->post_date,
        'files'             => $files,
        'keywords'          => $keywords,
        'can_edit'          => in_array($review_status, $editable_statuses, true),
        'can_add_documents' => $type === 'report' && !in_array($review_status, ['withdrawn', 'withdrawal_requested'], true),
        'can_withdraw'      => in_array($review_status, ['pending', 'approved'], true),
    ];
}

/** GET /tk/v1/my-submissions */
function tk_pp_my_submissions(WP_REST_Request $req) {
    $org = tk_pp_get_org_for_user(get_current_user_id());
    if (!$org) {
        return ['items' => [], 'message' => 'No organisation is linked to this account yet.'];
    }

    $posts = get_posts([
        'post_type'      => ['tk_alert', 'tk_report'],
        'post_status'    => ['publish', 'pending', 'draft'],
        'meta_key'       => 'organization_id',
        'meta_value'     => (string) $org->ID,
        'posts_per_page' => -1,
        'orderby'        => 'date',
        'order'          => 'DESC',
    ]);

    return ['items' => array_map('tk_pp_build_submission_item', $posts)];
}

/** Shared ownership + editability check used by PATCH / withdraw / add-documents. */
function tk_pp_authorize_submission($type, $id) {
    $cpt = tk_pp_type_to_cpt($type);
    $post = $cpt ? get_post($id) : null;
    if (!$post || $post->post_type !== $cpt) {
        return new WP_Error('tk_not_found', 'Submission not found.', ['status' => 404]);
    }

    $org = tk_pp_get_org_for_user(get_current_user_id());
    if (!$org || (string) get_post_meta($id, 'organization_id', true) !== (string) $org->ID) {
        return new WP_Error('tk_forbidden', 'You do not have access to this submission.', ['status' => 403]);
    }

    return $post;
}

/** PATCH /tk/v1/my-submissions/{type}/{id} */
function tk_pp_update_submission(WP_REST_Request $req) {
    $type = $req->get_param('type');
    $id   = (int) $req->get_param('id');
    $post = tk_pp_authorize_submission($type, $id);
    if (is_wp_error($post)) return $post;

    $review_status = get_post_meta($id, '_tk_review_status', true) ?: 'pending';

    // Reports stay editable after approval; advisories keep the tighter pending/rejected-only rule.
    $editable_statuses = $type === 'report' ? ['pending', 'rejected', 'approved'] : ['pending', 'rejected'];
    if (!in_array($review_status, $editable_statuses, true)) {
        $label = $type === 'report' ? 'pending, rejected or approved' : 'pending or rejected';
        return new WP_Error('tk_locked', "Only {$label} submissions can be edited.", ['status' => 409]);
    }

    $body = $req->get_json_params() ?: [];
    $update = ['ID' => $id];
    if (isset($body['title'])) {
        $update['post_title'] = sanitize_text_field($body['title']);
    }

    if ($type === 'report') {
        if (isset($body['description'])) {
            $update['post_content'] = wp_kses_post($body['description']);
            $update['post_excerpt'] = sanitize_textarea_field($body['description']);
            // Keep the meta key in sync too — tk_pp_build_submission_item() and the
            // frontend's mapReport() both read this key first (see the "description not
            // captured" fix earlier in the project), so post_content/post_excerpt alone
            // isn't enough for the edit to actually show up.
            update_post_meta($id, 'description', wp_kses_post($body['description']));
        }
        if (isset($body['keywords']) && is_array($body['keywords'])) {
            update_post_meta($id, 'keywords', array_map('sanitize_text_field', $body['keywords']));
        }
        if (isset($body['categories']) && is_array($body['categories'])) {
            update_post_meta($id, 'categories', array_map('sanitize_text_field', $body['categories']));
        }
        if (isset($body['countries']) && is_array($body['countries'])) {
            update_post_meta($id, 'countries', array_map('sanitize_text_field', $body['countries']));
        }
    } else {
        if (isset($body['content'])) {
            $update['post_content'] = wp_kses_post($body['content']);
            update_post_meta($id, 'body', wp_kses_post($body['content']));
        }
    }

    $was_rejected = $review_status === 'rejected';
    if ($was_rejected) {
        // Editing a rejected item resubmits it for another round of review.
        $update['post_status'] = 'pending';
    }

    wp_update_post($update);

    if ($was_rejected) {
        update_post_meta($id, '_tk_review_status', 'pending');
        delete_post_meta($id, '_tk_rejection_note');
    }

    return [
        'message' => $was_rejected ? 'Updated and resubmitted for review.' : 'Submission updated.',
        'item'    => tk_pp_build_submission_item(get_post($id)),
    ];
}

/** POST /tk/v1/my-submissions/{type}/{id}/withdraw */
function tk_pp_withdraw_submission(WP_REST_Request $req) {
    $type = $req->get_param('type');
    $id   = (int) $req->get_param('id');
    $post = tk_pp_authorize_submission($type, $id);
    if (is_wp_error($post)) return $post;

    $review_status = get_post_meta($id, '_tk_review_status', true) ?: 'pending';
    if (!in_array($review_status, ['pending', 'approved'], true)) {
        return new WP_Error('tk_locked', 'This submission cannot be withdrawn.', ['status' => 409]);
    }

    // A live, already-approved report can't be pulled unilaterally by the partner — it stays
    // published and just gets flagged for an administrator to approve or decline in wp-admin.
    // Pending items (never public) and advisories keep the old immediate-withdraw behaviour.
    if ($type === 'report' && $review_status === 'approved') {
        update_post_meta($id, '_tk_review_status', 'withdrawal_requested');
        update_post_meta($id, '_tk_withdrawal_requested_at', current_time('mysql'));

        $admin_email = get_option('admin_email');
        if ($admin_email) {
            $title = get_the_title($post);
            wp_mail(
                $admin_email,
                "Withdrawal requested: {$title}",
                "A partner organisation has requested to withdraw a live report from the "
                . "Karamoja Climate Change Knowledge and Information.\n\nTitle: {$title}\nReport ID: {$id}\n\n"
                . "Open it in wp-admin and use the \"Approve withdrawal\" / \"Decline withdrawal\" row "
                . "actions to decide.\n"
            );
        }

        return ['message' => 'Withdrawal requested. The report stays live until an administrator approves the request.'];
    }

    wp_update_post(['ID' => $id, 'post_status' => 'draft']);
    update_post_meta($id, '_tk_review_status', 'withdrawn');

    return ['message' => 'Submission withdrawn.'];
}

/** Reports can't have documents touched once withdrawn or mid-withdrawal-request. */
function tk_pp_assert_documents_editable($review_status) {
    if (in_array($review_status, ['withdrawn', 'withdrawal_requested'], true)) {
        return new WP_Error('tk_locked', 'Cannot change documents on this report right now.', ['status' => 409]);
    }
    return true;
}

/** POST /tk/v1/my-submissions/report/{id}/documents */
function tk_pp_add_report_documents(WP_REST_Request $req) {
    $id   = (int) $req->get_param('id');
    $post = tk_pp_authorize_submission('report', $id);
    if (is_wp_error($post)) return $post;

    $review_status = get_post_meta($id, '_tk_review_status', true) ?: 'pending';
    $editable = tk_pp_assert_documents_editable($review_status);
    if (is_wp_error($editable)) return $editable;

    $body = $req->get_json_params() ?: [];
    $incoming = tk_pp_sanitize_files($body['documents'] ?? []);
    if (!$incoming) {
        return new WP_Error('tk_invalid', 'documents array is required.', ['status' => 400]);
    }

    $existing = get_post_meta($id, 'report_files', true);
    $existing = is_array($existing) ? $existing : [];
    $merged = array_merge($existing, $incoming);

    update_post_meta($id, 'report_files', $merged);

    return ['message' => 'Document added.', 'files' => $merged];
}

/** DELETE /tk/v1/my-submissions/report/{id}/documents  body: { url } */
function tk_pp_remove_report_document(WP_REST_Request $req) {
    $id   = (int) $req->get_param('id');
    $post = tk_pp_authorize_submission('report', $id);
    if (is_wp_error($post)) return $post;

    $review_status = get_post_meta($id, '_tk_review_status', true) ?: 'pending';
    $editable = tk_pp_assert_documents_editable($review_status);
    if (is_wp_error($editable)) return $editable;

    $body = $req->get_json_params() ?: [];
    $url = esc_url_raw($body['url'] ?? '');
    if (!$url) {
        return new WP_Error('tk_invalid', 'A document url is required.', ['status' => 400]);
    }

    $existing = get_post_meta($id, 'report_files', true);
    $existing = is_array($existing) ? $existing : [];
    $remaining = array_values(array_filter($existing, function ($f) use ($url) {
        return ($f['url'] ?? '') !== $url;
    }));

    if (count($remaining) === count($existing)) {
        return new WP_Error('tk_not_found', 'Document not found on this report.', ['status' => 404]);
    }
    if (!$remaining) {
        return new WP_Error('tk_invalid', 'A report must keep at least one document — add a replacement before removing the last one.', ['status' => 409]);
    }

    update_post_meta($id, 'report_files', $remaining);

    return ['message' => 'Document removed.', 'files' => $remaining];
}

/* -----------------------------------------------------------------------
 * 4. Force new advisory/report submissions into the admin review queue
 * ---------------------------------------------------------------------*/

foreach (['tk_alert', 'tk_report'] as $cpt) {
    add_filter("rest_pre_insert_{$cpt}", function ($prepared_post, $request) {
        // Whatever status the client sent, new partner submissions always start pending.
        if (empty($prepared_post->ID)) {
            $prepared_post->post_status = 'pending';
        }
        return $prepared_post;
    }, 10, 2);
}

add_action('rest_after_insert_tk_alert', 'tk_pp_stamp_new_submission', 10, 2);
add_action('rest_after_insert_tk_report', 'tk_pp_stamp_new_submission', 10, 2);

/** Sanitize a report_files-shaped array (used on create and by the documents endpoints). */
function tk_pp_sanitize_files($raw) {
    $out = [];
    foreach ((array) $raw as $doc) {
        if (!is_array($doc) || empty($doc['url'])) continue;
        $out[] = [
            'url'      => esc_url_raw($doc['url']),
            'size'     => sanitize_text_field($doc['size'] ?? ''),
            'language' => sanitize_text_field($doc['language'] ?? 'en'),
            'label'    => sanitize_text_field($doc['label'] ?? ''),
            'filename' => sanitize_text_field($doc['filename'] ?? ''),
        ];
    }
    return $out;
}

function tk_pp_stamp_new_submission(WP_Post $post, WP_REST_Request $request) {
    $already_stamped = (bool) get_post_meta($post->ID, '_tk_review_status', true);
    $type = tk_pp_cpt_to_type($post->post_type);

    if (!$already_stamped) {
        update_post_meta($post->ID, '_tk_review_status', 'pending');
        update_post_meta($post->ID, '_tk_submitted_at', current_time('mysql'));
        update_post_meta($post->ID, '_tk_reference', tk_pp_reference($type === 'advisory' ? 'ALT' : 'RPT', $post->ID));
    }

    // This plugin is designed to NOT require ACF or ACF-to-REST-API (see file header), but the
    // frontend still POSTs its custom fields nested under `acf` (matching the shape ACF's REST
    // integration would normally expect). Nothing was actually reading that `acf` object on
    // create, so those fields silently depended on ACF being installed and its field group
    // exactly matching — which is why description/categories/etc weren't persisting. Read and
    // write them directly here instead, every time (not just on first stamp), so edits made via
    // a second POST to the same id also stick.
    $body = $request->get_json_params() ?: [];
    $acf  = is_array($body['acf'] ?? null) ? $body['acf'] : [];

    if ($type === 'report') {
        if (isset($acf['description'])) {
            update_post_meta($post->ID, 'description', wp_kses_post($acf['description']));
        }
        if (isset($acf['categories']) && is_array($acf['categories'])) {
            update_post_meta($post->ID, 'categories', array_map('sanitize_text_field', $acf['categories']));
        }
        if (isset($acf['tag'])) {
            update_post_meta($post->ID, 'tag', sanitize_text_field($acf['tag']));
        }
        if (isset($acf['keywords']) && is_array($acf['keywords'])) {
            update_post_meta($post->ID, 'keywords', array_map('sanitize_text_field', $acf['keywords']));
        }
        if (isset($acf['countries']) && is_array($acf['countries'])) {
            update_post_meta($post->ID, 'countries', array_map('sanitize_text_field', $acf['countries']));
        }
        if (isset($acf['report_files']) && is_array($acf['report_files'])) {
            update_post_meta($post->ID, 'report_files', tk_pp_sanitize_files($acf['report_files']));
        }
        if (isset($acf['file_url'])) {
            update_post_meta($post->ID, 'file_url', esc_url_raw($acf['file_url']));
        }
        if (isset($acf['file_size'])) {
            update_post_meta($post->ID, 'file_size', sanitize_text_field($acf['file_size']));
        }
        if (isset($acf['publication_date'])) {
            update_post_meta($post->ID, 'publication_date', sanitize_text_field($acf['publication_date']));
        }
        if (isset($acf['partner_orgs'])) {
            update_post_meta($post->ID, 'partner_orgs', sanitize_text_field($acf['partner_orgs']));
        }
    }

    // Make sure organization_id actually belongs to the authenticated user — never trust the client blindly.
    $org = tk_pp_get_org_for_user(get_current_user_id());
    if ($org) {
        update_post_meta($post->ID, 'organization_id', (string) $org->ID);
    }
}

/** Keep _tk_review_status in sync when an admin publishes or unpublishes from wp-admin. */
add_action('transition_post_status', function ($new_status, $old_status, $post) {
    if (!in_array($post->post_type, ['tk_alert', 'tk_report'], true)) return;
    if ($new_status === 'publish' && $old_status !== 'publish') {
        update_post_meta($post->ID, '_tk_review_status', 'approved');
    }
}, 10, 3);

/* -----------------------------------------------------------------------
 * 5. wp-admin: organisation approve/reject + submission reject row actions
 * ---------------------------------------------------------------------*/

add_filter('manage_tk_organization_posts_columns', function ($columns) {
    $columns['tk_status'] = 'Status';
    return $columns;
});

add_action('manage_tk_organization_posts_custom_column', function ($column, $post_id) {
    if ($column !== 'tk_status') return;
    $status = tk_pp_org_status($post_id);
    $labels = ['pending' => '#B45309', 'approved' => '#047857', 'rejected' => '#B91C1C'];
    $color = $labels[$status] ?? '#5A5A5A';
    echo '<strong style="color:' . esc_attr($color) . '">' . esc_html(strtoupper($status)) . '</strong>';
}, 10, 2);

// Same idea for advisories/reports, so a pending "withdrawal_requested" item (still live,
// awaiting an admin decision) is visible at a glance in the posts list.
foreach (['tk_alert', 'tk_report'] as $tk_pp_submission_cpt) {
    add_filter("manage_{$tk_pp_submission_cpt}_posts_columns", function ($columns) {
        $columns['tk_review_status'] = 'Review Status';
        return $columns;
    });
    add_action("manage_{$tk_pp_submission_cpt}_posts_custom_column", function ($column, $post_id) {
        if ($column !== 'tk_review_status') return;
        $status = get_post_meta($post_id, '_tk_review_status', true) ?: 'pending';
        $labels = [
            'pending'               => '#B45309',
            'approved'              => '#047857',
            'rejected'              => '#B91C1C',
            'withdrawn'             => '#5A5A5A',
            'withdrawal_requested'  => '#7C3AED',
        ];
        $color = $labels[$status] ?? '#5A5A5A';
        echo '<strong style="color:' . esc_attr($color) . '">' . esc_html(strtoupper(str_replace('_', ' ', $status))) . '</strong>';
    }, 10, 2);
}

add_filter('post_row_actions', function ($actions, $post) {
    if ($post->post_type === 'tk_organization' && tk_pp_org_status($post->ID) !== 'approved') {
        $approve_url = wp_nonce_url(admin_url("admin-post.php?action=tk_approve_org&post={$post->ID}"), 'tk_org_action_' . $post->ID);
        $reject_url  = wp_nonce_url(admin_url("admin-post.php?action=tk_reject_org&post={$post->ID}"), 'tk_org_action_' . $post->ID);
        $actions['tk_approve'] = "<a href='" . esc_url($approve_url) . "'>Approve</a>";
        $actions['tk_reject']  = "<a href='" . esc_url($reject_url) . "' style='color:#B91C1C'>Reject</a>";
    }

    if (in_array($post->post_type, ['tk_alert', 'tk_report'], true)) {
        $review_status = get_post_meta($post->ID, '_tk_review_status', true) ?: 'pending';
        if ($review_status === 'pending') {
            $reject_url = wp_nonce_url(admin_url("admin-post.php?action=tk_reject_submission&post={$post->ID}"), 'tk_submission_action_' . $post->ID);
            $actions['tk_reject'] = "<a href='" . esc_url($reject_url) . "' style='color:#B91C1C'>Reject submission</a>";
        }
        if ($review_status === 'withdrawal_requested') {
            $approve_url = wp_nonce_url(admin_url("admin-post.php?action=tk_approve_withdrawal&post={$post->ID}"), 'tk_submission_action_' . $post->ID);
            $decline_url = wp_nonce_url(admin_url("admin-post.php?action=tk_decline_withdrawal&post={$post->ID}"), 'tk_submission_action_' . $post->ID);
            $actions['tk_approve_withdrawal'] = "<a href='" . esc_url($approve_url) . "' style='color:#B45309;font-weight:600'>Approve withdrawal</a>";
            $actions['tk_decline_withdrawal'] = "<a href='" . esc_url($decline_url) . "'>Decline withdrawal</a>";
        }
    }

    return $actions;
}, 10, 2);

add_action('admin_post_tk_approve_org', function () {
    tk_pp_handle_org_decision('approved');
});
add_action('admin_post_tk_reject_org', function () {
    tk_pp_handle_org_decision('rejected');
});

function tk_pp_handle_org_decision($decision) {
    $post_id = isset($_GET['post']) ? (int) $_GET['post'] : 0;
    if (!$post_id || !current_user_can('edit_post', $post_id) || !check_admin_referer('tk_org_action_' . $post_id)) {
        wp_die('Not allowed.');
    }

    $org = get_post($post_id);
    if (!$org || $org->post_type !== 'tk_organization') {
        wp_die('Organisation not found.');
    }

    update_post_meta($post_id, '_tk_org_status', $decision);
    update_post_meta($post_id, 'verification_status', $decision);
    // Publish the profile once approved so it shows on the public /organizations page.
    wp_update_post(['ID' => $post_id, 'post_status' => $decision === 'approved' ? 'publish' : 'draft']);

    $email = get_post_meta($post_id, 'contact_email', true);
    $name  = get_post_meta($post_id, 'contact_name', true);

    if ($decision === 'approved' && $email) {
        $user = get_user_by('email', $email);
        if (!$user) {
            $username = sanitize_user(current(explode('@', $email)) . '-' . $post_id, true);
            $user_id = wp_insert_user([
                'user_login' => $username,
                'user_email' => $email,
                'user_pass'  => wp_generate_password(20),
                'display_name' => $name ?: $org->post_title,
                'role'       => 'tk_partner',
            ]);
            if (!is_wp_error($user_id)) {
                update_user_meta($user_id, '_tk_org_id', $post_id);
                update_post_meta($post_id, '_tk_org_user_id', $user_id);
                wp_new_user_notification($user_id, null, 'user'); // sends the "set your password" email
            }
        } else {
            update_user_meta($user->ID, '_tk_org_id', $post_id);
            update_post_meta($post_id, '_tk_org_user_id', $user->ID);
            wp_mail($email, 'Your organisation has been approved', "Hi {$name},\n\n{$org->post_title} has been approved on Karamoja. Sign in on the partner portal with your existing password.\n");
        }
    } elseif ($decision === 'rejected' && $email) {
        wp_mail($email, 'Update on your Karamoja registration', "Hi {$name},\n\nYour registration for {$org->post_title} was not approved. Contact the platform administrators for details or re-apply with updated information.\n");
    }

    wp_safe_redirect(add_query_arg(['post_type' => 'tk_organization', 'tk_notice' => $decision], admin_url('edit.php')));
    exit;
}

add_action('admin_post_tk_reject_submission', function () {
    $post_id = isset($_GET['post']) ? (int) $_GET['post'] : 0;
    if (!$post_id || !current_user_can('edit_post', $post_id) || !check_admin_referer('tk_submission_action_' . $post_id)) {
        wp_die('Not allowed.');
    }
    $post = get_post($post_id);
    if (!$post || !in_array($post->post_type, ['tk_alert', 'tk_report'], true)) {
        wp_die('Submission not found.');
    }

    wp_update_post(['ID' => $post_id, 'post_status' => 'draft']);
    update_post_meta($post_id, '_tk_review_status', 'rejected');

    wp_safe_redirect(add_query_arg(['post_type' => $post->post_type, 'tk_notice' => 'rejected'], admin_url('edit.php')));
    exit;
});

add_action('admin_post_tk_approve_withdrawal', function () {
    tk_pp_handle_withdrawal_decision('approved');
});
add_action('admin_post_tk_decline_withdrawal', function () {
    tk_pp_handle_withdrawal_decision('declined');
});

/** Admin decision on a partner's withdrawal request for an already-live report. */
function tk_pp_handle_withdrawal_decision($decision) {
    $post_id = isset($_GET['post']) ? (int) $_GET['post'] : 0;
    if (!$post_id || !current_user_can('edit_post', $post_id) || !check_admin_referer('tk_submission_action_' . $post_id)) {
        wp_die('Not allowed.');
    }

    $post = get_post($post_id);
    if (!$post || !in_array($post->post_type, ['tk_alert', 'tk_report'], true)) {
        wp_die('Submission not found.');
    }

    $review_status = get_post_meta($post_id, '_tk_review_status', true);
    if ($review_status !== 'withdrawal_requested') {
        wp_die('This item has no pending withdrawal request.');
    }

    $title = get_the_title($post);
    $org_id = get_post_meta($post_id, 'organization_id', true);
    $org_email = $org_id ? get_post_meta($org_id, 'contact_email', true) : '';
    $org_name  = $org_id ? get_post_meta($org_id, 'contact_name', true) : '';

    if ($decision === 'approved') {
        wp_update_post(['ID' => $post_id, 'post_status' => 'draft']);
        update_post_meta($post_id, '_tk_review_status', 'withdrawn');
        delete_post_meta($post_id, '_tk_withdrawal_requested_at');
        $notice = 'withdrawal_approved';
        $subject = "Withdrawal approved: {$title}";
        $body = "Hi" . ($org_name ? " {$org_name}" : '') . ",\n\nYour request to withdraw \"{$title}\" has been approved. "
            . "It is no longer published on Karamoja.\n";
    } else {
        // Declined — the report was never unpublished, so just revert the status flag.
        update_post_meta($post_id, '_tk_review_status', 'approved');
        delete_post_meta($post_id, '_tk_withdrawal_requested_at');
        $notice = 'withdrawal_declined';
        $subject = "Withdrawal request declined: {$title}";
        $body = "Hi" . ($org_name ? " {$org_name}" : '') . ",\n\nYour request to withdraw \"{$title}\" was declined by an "
            . "administrator. It remains published on Karamoja. Contact the platform "
            . "administrators if you have questions.\n";
    }

    if ($org_email) {
        wp_mail($org_email, $subject, $body);
    }

    wp_safe_redirect(add_query_arg(['post_type' => $post->post_type, 'tk_notice' => $notice], admin_url('edit.php')));
    exit;
}

add_action('admin_notices', function () {
    if (empty($_GET['tk_notice'])) return;
    $notice = sanitize_text_field($_GET['tk_notice']);
    $map = [
        'approved'             => ['success', 'Approved.'],
        'rejected'             => ['warning', 'Rejected.'],
        'withdrawal_approved'  => ['success', 'Withdrawal approved — the report has been unpublished.'],
        'withdrawal_declined'  => ['info', 'Withdrawal request declined — the report remains published.'],
    ];
    if (!isset($map[$notice])) return;
    [$type, $msg] = $map[$notice];
    printf('<div class="notice notice-%s is-dismissible"><p>%s</p></div>', esc_attr($type), esc_html($msg));
});
