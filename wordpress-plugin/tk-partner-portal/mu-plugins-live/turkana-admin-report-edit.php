<?php
/**
 * Plugin Name: Turkana Admin Report Edit
 * Description: Classic field-based edit screen for reports (tk_report), matching the organisation review layout.
 * Version: 1.3.0
 */

if (!defined('ABSPATH')) {
    exit;
}

/** Suggested categories — mirrors lib/report-categories.js (SUGGESTED_REPORT_CATEGORIES)
 *  on the Next.js frontend. The frontend field is freeSolo (any custom value is allowed),
 *  so this admin field is a text input + datalist rather than a locked <select>, to avoid
 *  ever silently discarding a category a partner typed that isn't in this suggested list. */
function tk_report_categories() {
    return [
        'SITREP', 'Assessment', 'HAP', 'Monitoring', 'WASH', 'Livelihoods',
        'Food Security', 'Nutrition', 'Health', 'Early Warning', 'Climate', 'Displacement', 'Other',
    ];
}

/** Countries a report can apply to — mirrors lib/countries.js (HUB_COUNTRIES) on the
 *  Next.js frontend. Keep the codes in sync with that file. */
function tk_report_countries() {
    return [
        'KE' => __('Kenya', 'turkana-headless'),
        'UG' => __('Uganda', 'turkana-headless'),
        'CROSS' => __('Cross-border / Regional', 'turkana-headless'),
    ];
}

/** Approved/registered partner organisations, for the "Linked organisation" select. */
function tk_report_org_options() {
    return get_posts([
        'post_type' => 'tk_organization',
        'post_status' => 'any',
        'posts_per_page' => -1,
        'orderby' => 'title',
        'order' => 'ASC',
    ]);
}

/** Some meta (report_files, categories, countries) may come back from get_post_meta()
 *  as a native PHP array (the partner-portal plugin writes arrays directly, and
 *  WordPress auto-unserializes non-scalar meta) rather than a JSON string. Defer to the
 *  shared decoder in turkana-headless-hub.php when available so both admin screens and
 *  the public REST shape agree on how this is read; fall back defensively otherwise. */
function tk_report_decode_list($raw) {
    if (function_exists('tk_hub_decode_list_meta')) {
        return tk_hub_decode_list_meta($raw);
    }
    return is_array($raw) ? $raw : [];
}

function tk_report_get_meta($post_id) {
    $report_files = tk_report_decode_list(get_post_meta($post_id, 'report_files', true));
    $categories = tk_report_decode_list(get_post_meta($post_id, 'categories', true));
    $countries = tk_report_decode_list(get_post_meta($post_id, 'countries', true));
    $tag = get_post_meta($post_id, 'tag', true) ?: '';

    // `description` postmeta (written directly by the partner-portal plugin, full rich
    // HTML — see tk_pp_stamp_new_submission) is the real source of truth for what the
    // frontend displays. post_content/post_excerpt are only a legacy fallback for posts
    // that predate that meta key.
    $description = get_post_meta($post_id, 'description', true);
    if ($description === '' || $description === false) {
        $post = get_post($post_id);
        $description = $post ? ($post->post_content ?: $post->post_excerpt) : '';
    }

    return [
        'tag' => $tag,
        'categories' => $categories ?: ($tag ? [$tag] : []),
        'countries' => $countries,
        'partner_orgs' => get_post_meta($post_id, 'partner_orgs', true) ?: '',
        'description' => $description ?: '',
        'file_url' => get_post_meta($post_id, 'file_url', true) ?: '',
        'file_size' => get_post_meta($post_id, 'file_size', true) ?: '',
        'publication_date' => get_post_meta($post_id, 'publication_date', true) ?: '',
        'organization_id' => (int) get_post_meta($post_id, 'organization_id', true),
        'keywords' => tk_parse_keywords_meta(get_post_meta($post_id, 'keywords', true)),
        'is_new' => (bool) get_post_meta($post_id, 'is_new', true),
        'is_updated' => (bool) get_post_meta($post_id, 'is_updated', true),
        'review_status' => function_exists('tk_hub_get_review_status')
            ? tk_hub_get_review_status($post_id)
            : (get_post_status($post_id) === 'publish' ? 'approved' : 'pending'),
        'report_files' => $report_files,
    ];
}

function tk_report_edit_url($post_id) {
    return admin_url('post.php?post=' . (int) $post_id . '&action=edit');
}

function tk_report_list_url() {
    return admin_url('edit.php?post_type=tk_report');
}

add_filter('use_block_editor_for_post_type', function ($use, $post_type) {
    return $post_type === 'tk_report' ? false : $use;
}, 10, 2);

add_filter('gutenberg_can_edit_post_type', function ($can, $post_type) {
    return $post_type === 'tk_report' ? false : $can;
}, 10, 2);

add_action('init', function () {
    if (!post_type_exists('tk_report')) {
        return;
    }
    remove_post_type_support('tk_report', 'editor');
    remove_post_type_support('tk_report', 'excerpt');
    remove_post_type_support('tk_report', 'thumbnail');
}, 20);

add_filter('post_type_labels_tk_report', function ($labels) {
    $labels->edit_item = __('Review Report', 'turkana-headless');
    $labels->add_new_item = __('Add Report', 'turkana-headless');
    return $labels;
});

add_action('add_meta_boxes', function () {
    add_meta_box(
        'tk_report_details',
        __('Report Details', 'turkana-headless'),
        'tk_report_details_metabox',
        'tk_report',
        'normal',
        'high'
    );
    add_meta_box(
        'tk_report_review_actions',
        __('Review Actions', 'turkana-headless'),
        'tk_report_review_actions_metabox',
        'tk_report',
        'side',
        'high'
    );
    add_meta_box(
        'tk_report_files',
        __('Supporting Documents', 'turkana-headless'),
        'tk_report_files_metabox',
        'tk_report',
        'side',
        'default'
    );
    add_meta_box(
        'tk_report_downloads',
        __('Downloads', 'turkana-headless'),
        'tk_report_downloads_metabox',
        'tk_report',
        'side',
        'default'
    );

    remove_meta_box('postcustom', 'tk_report', 'normal');
    remove_meta_box('slugdiv', 'tk_report', 'normal');
    remove_meta_box('postimagediv', 'tk_report', 'side');
    remove_meta_box('postexcerpt', 'tk_report', 'normal');
}, 20);

add_filter('enter_title_here', function ($title, $post) {
    if ($post->post_type === 'tk_report') {
        return __('Report title', 'turkana-headless');
    }
    return $title;
}, 10, 2);

function tk_report_details_metabox($post) {
    wp_nonce_field('tk_report_save_meta', 'tk_report_meta_nonce');
    $meta = tk_report_get_meta($post->ID);
    ?>
    <table class="form-table tk-report-form-table" role="presentation">
        <tbody>
            <tr>
                <th scope="row"><label for="tk_report_tag"><?php esc_html_e('Category', 'turkana-headless'); ?></label></th>
                <td>
                    <input type="text" id="tk_report_tag" name="tk_report_tag" list="tk_report_category_list" value="<?php echo esc_attr($meta['tag']); ?>" class="regular-text" placeholder="<?php esc_attr_e('e.g. SITREP', 'turkana-headless'); ?>" />
                    <datalist id="tk_report_category_list">
                        <?php foreach (tk_report_categories() as $cat) : ?>
                            <option value="<?php echo esc_attr($cat); ?>"></option>
                        <?php endforeach; ?>
                    </datalist>
                    <p class="description"><?php esc_html_e('Single category, matches the frontend field — pick a suggestion or type a custom one.', 'turkana-headless'); ?></p>
                </td>
            </tr>
            <tr>
                <th scope="row"><label for="tk_report_organization_id"><?php esc_html_e('Linked organisation', 'turkana-headless'); ?></label></th>
                <td>
                    <select id="tk_report_organization_id" name="tk_report_organization_id">
                        <option value="0"><?php esc_html_e('— None / not linked —', 'turkana-headless'); ?></option>
                        <?php foreach (tk_report_org_options() as $org) : ?>
                            <option value="<?php echo esc_attr($org->ID); ?>" <?php selected($meta['organization_id'], $org->ID); ?>><?php echo esc_html(get_the_title($org)); ?></option>
                        <?php endforeach; ?>
                    </select>
                    <p class="description"><?php esc_html_e('Drives the "View organisation profile" link on the report. Set automatically when a partner submits via the portal.', 'turkana-headless'); ?></p>
                </td>
            </tr>
            <tr>
                <th scope="row"><label for="tk_report_partner_orgs"><?php esc_html_e('Displayed organisation name(s)', 'turkana-headless'); ?></label></th>
                <td>
                    <input type="text" id="tk_report_partner_orgs" name="tk_report_partner_orgs" value="<?php echo esc_attr($meta['partner_orgs']); ?>" class="regular-text" placeholder="<?php esc_attr_e('e.g. OCHA, County Government', 'turkana-headless'); ?>" />
                    <p class="description"><?php esc_html_e('Comma-separated name(s) shown as credit chips on the report card — usually matches the linked organisation above.', 'turkana-headless'); ?></p>
                </td>
            </tr>
            <tr>
                <th scope="row"><label for="tk_report_description"><?php esc_html_e('Summary / description', 'turkana-headless'); ?></label></th>
                <td>
                    <?php
                    wp_editor($meta['description'], 'tk_report_description', [
                        'textarea_name' => 'tk_report_description',
                        'textarea_rows' => 8,
                        'media_buttons' => false,
                        'teeny' => true,
                        'quicktags' => true,
                    ]);
                    ?>
                    <p class="description"><?php esc_html_e('Full rich-text description shown on the report detail page (and stripped for the library card blurb).', 'turkana-headless'); ?></p>
                </td>
            </tr>
            <tr>
                <th scope="row"><label for="tk_report_keywords"><?php esc_html_e('Keywords / tags', 'turkana-headless'); ?></label></th>
                <td>
                    <input type="text" id="tk_report_keywords" name="tk_report_keywords" value="<?php echo esc_attr(implode(', ', $meta['keywords'])); ?>" class="large-text" placeholder="<?php esc_attr_e('e.g. drought, food security, Turkana', 'turkana-headless'); ?>" />
                    <p class="description"><?php esc_html_e('Comma-separated topics that help users find this report in the library.', 'turkana-headless'); ?></p>
                </td>
            </tr>
            <tr>
                <th scope="row"><?php esc_html_e('Countries', 'turkana-headless'); ?></th>
                <td>
                    <?php foreach (tk_report_countries() as $code => $label) : ?>
                        <label style="margin-right: 16px;">
                            <input type="checkbox" name="tk_report_countries[]" value="<?php echo esc_attr($code); ?>" <?php checked(in_array($code, $meta['countries'], true)); ?> />
                            <?php echo esc_html($label); ?>
                        </label>
                    <?php endforeach; ?>
                    <p class="description"><?php esc_html_e('Which country/countries this report applies to.', 'turkana-headless'); ?></p>
                </td>
            </tr>
            <tr>
                <th scope="row"><label for="tk_report_publication_date"><?php esc_html_e('Publication date', 'turkana-headless'); ?></label></th>
                <td>
                    <input type="date" id="tk_report_publication_date" name="tk_report_publication_date" value="<?php echo esc_attr($meta['publication_date']); ?>" />
                </td>
            </tr>
            <tr>
                <th scope="row"><label for="tk_report_file_url"><?php esc_html_e('Primary file URL', 'turkana-headless'); ?></label></th>
                <td>
                    <input type="url" id="tk_report_file_url" name="tk_report_file_url" value="<?php echo esc_attr($meta['file_url']); ?>" class="large-text" placeholder="https://..." />
                    <p class="description"><?php esc_html_e('Fallback only — used if no per-language document below is marked English. Prefer managing files via Supporting Documents / the submit portal.', 'turkana-headless'); ?></p>
                </td>
            </tr>
            <tr>
                <th scope="row"><label for="tk_report_file_size"><?php esc_html_e('Primary file size', 'turkana-headless'); ?></label></th>
                <td>
                    <input type="text" id="tk_report_file_size" name="tk_report_file_size" value="<?php echo esc_attr($meta['file_size']); ?>" class="regular-text" placeholder="2.4 MB" />
                </td>
            </tr>
            <tr>
                <th scope="row"><label for="tk_report_review_status"><?php esc_html_e('Review status', 'turkana-headless'); ?></label></th>
                <td>
                    <select id="tk_report_review_status" name="tk_report_review_status">
                        <?php
                        $statuses = function_exists('tk_hub_review_statuses') ? tk_hub_review_statuses() : [
                            'pending' => __('Pending', 'turkana-headless'),
                            'approved' => __('Approved', 'turkana-headless'),
                            'rejected' => __('Rejected', 'turkana-headless'),
                        ];
                        foreach ($statuses as $value => $label) :
                            ?>
                            <option value="<?php echo esc_attr($value); ?>" <?php selected($meta['review_status'], $value); ?>><?php echo esc_html($label); ?></option>
                        <?php endforeach; ?>
                    </select>
                    <p class="description"><?php esc_html_e('Approved reports are published on Karamoja. Rejected reports stay as drafts. "Withdrawal requested" / "Withdrawn" reflect a partner-initiated withdrawal — use the row action links on the reports list to approve/decline those instead of changing this directly.', 'turkana-headless'); ?></p>
                </td>
            </tr>
            <tr>
                <th scope="row"><?php esc_html_e('Display flags', 'turkana-headless'); ?></th>
                <td>
                    <label><input type="checkbox" name="tk_report_is_new" value="1" <?php checked($meta['is_new']); ?> /> <?php esc_html_e('Mark as NEW on the reports library', 'turkana-headless'); ?></label><br />
                    <label><input type="checkbox" name="tk_report_is_updated" value="1" <?php checked($meta['is_updated']); ?> /> <?php esc_html_e('Mark as UPDATED on the reports library', 'turkana-headless'); ?></label>
                </td>
            </tr>
        </tbody>
    </table>
    <?php
}

function tk_report_files_metabox($post) {
    $meta = tk_report_get_meta($post->ID);
    $files = $meta['report_files'];
    $stats_lookup = function_exists('tk_report_get_download_stats')
        ? (tk_report_get_download_stats($post->ID)['versions'] ?? [])
        : [];
    if (empty($files) && $meta['file_url']) {
        $files = [[
            'url' => $meta['file_url'],
            'size' => $meta['file_size'],
            'language' => 'en',
            'label' => 'English',
        ]];
    }
    if (empty($files)) {
        echo '<p class="description">' . esc_html__('No documents attached. Partners upload via the submit portal.', 'turkana-headless') . '</p>';
        return;
    }
    echo '<ul class="tk-report-files-list">';
    foreach ($files as $file) {
        echo '<li class="tk-report-file-item">';
        echo '<strong>' . esc_html($file['label'] ?? $file['language'] ?? __('Document', 'turkana-headless')) . '</strong>';
        if (!empty($file['size'])) {
            echo ' <span class="tk-report-file-meta">· ' . esc_html($file['size']) . '</span>';
        }
        if (!empty($file['filename'])) {
            echo '<br><span class="tk-report-file-meta">' . esc_html($file['filename']) . '</span>';
        }
        if (!empty($file['url'])) {
            echo '<br><a href="' . esc_url($file['url']) . '" target="_blank" rel="noopener">' . esc_html__('Open file', 'turkana-headless') . '</a>';
        }
        if (function_exists('tk_report_get_download_stats')) {
            $key = tk_report_download_version_key($file);
            $count = 0;
            foreach ($stats_lookup as $version) {
                if (($version['key'] ?? '') === $key) {
                    $count = (int) $version['count'];
                    break;
                }
            }
            echo '<br><span class="tk-report-file-meta">' . esc_html(sprintf(
                _n('%s download', '%s downloads', $count, 'turkana-headless'),
                number_format_i18n($count)
            )) . '</span>';
        }
        echo '</li>';
    }
    echo '</ul>';
    echo '<p class="description">' . esc_html__('Documents are added/removed by the partner via the submit portal dashboard ("Manage documents").', 'turkana-headless') . '</p>';
}

function tk_report_downloads_metabox($post) {
    if (!function_exists('tk_report_get_download_stats')) {
        echo '<p class="description">' . esc_html__('Download tracking is not available.', 'turkana-headless') . '</p>';
        return;
    }
    $stats = tk_report_get_download_stats($post->ID);
    echo '<p style="margin:0 0 10px;font-size:22px;font-weight:700;color:#3D2B1F;line-height:1.2;">'
        . esc_html(number_format_i18n($stats['total']))
        . '</p>';
    echo '<p class="description" style="margin-top:0;">' . esc_html__('Total downloads from the public reports library.', 'turkana-headless') . '</p>';

    if (!empty($stats['versions'])) {
        echo '<table class="widefat striped" style="margin-top:8px;"><thead><tr>';
        echo '<th>' . esc_html__('Version', 'turkana-headless') . '</th>';
        echo '<th style="text-align:right;">' . esc_html__('Downloads', 'turkana-headless') . '</th>';
        echo '</tr></thead><tbody>';
        foreach ($stats['versions'] as $version) {
            $label = $version['label'] ?: strtoupper((string) ($version['language'] ?: $version['key']));
            echo '<tr><td>' . esc_html($label);
            if (!empty($version['language']) && strtolower($version['label']) !== strtolower($version['language'])) {
                echo ' <span class="description">(' . esc_html(strtoupper($version['language'])) . ')</span>';
            }
            echo '</td><td style="text-align:right;font-weight:600;">' . esc_html(number_format_i18n($version['count'])) . '</td></tr>';
        }
        echo '</tbody></table>';
    }

    if (!empty($stats['last_downloaded_at'])) {
        echo '<p class="description" style="margin-top:10px;">'
            . esc_html__('Last download:', 'turkana-headless') . ' '
            . esc_html(mysql2date(get_option('date_format') . ' ' . get_option('time_format'), $stats['last_downloaded_at']))
            . '</p>';
    }
}

function tk_report_review_actions_metabox($post) {
    $meta = tk_report_get_meta($post->ID);
    $urls = tk_hub_content_edit_urls($post->ID);
    $frontend = defined('TK_HUB_NEXT_URL') ? rtrim(TK_HUB_NEXT_URL, '/') . '/reports' : '#';

    echo '<p>' . (function_exists('tk_hub_review_badge') ? tk_hub_review_badge($meta['review_status']) : esc_html($meta['review_status'])) . '</p>';
    if ($meta['tag']) {
        echo '<p>' . tk_hub_category_tag_html($meta['tag'], 'tk-hub-tag-blue') . '</p>';
    }
    echo '<p class="description">' . esc_html__('Use these shortcuts or change status in Report Details, then click Update.', 'turkana-headless') . '</p>';
    echo '<div class="tk-report-review-actions">';

    if ($meta['review_status'] !== 'approved' && current_user_can('edit_post', $post->ID)) {
        echo '<a class="button button-primary tk-report-review-btn" href="' . esc_url($urls['approve']) . '">' . esc_html__('Approve & Publish', 'turkana-headless') . '</a>';
    }
    if ($meta['review_status'] !== 'rejected' && current_user_can('edit_post', $post->ID)) {
        echo '<a class="button tk-report-review-btn tk-report-btn-reject" href="' . esc_url($urls['reject']) . '">' . esc_html__('Reject Report', 'turkana-headless') . '</a>';
    }
    if ($meta['file_url']) {
        echo '<a class="button button-secondary tk-report-review-btn" href="' . esc_url($meta['file_url']) . '" target="_blank" rel="noopener">' . esc_html__('Download file', 'turkana-headless') . '</a>';
    }
    if ($meta['review_status'] === 'approved' && $post->post_status === 'publish') {
        echo '<a class="button button-secondary tk-report-review-btn" href="' . esc_url($frontend) . '" target="_blank" rel="noopener">' . esc_html__('Reports library (Next.js)', 'turkana-headless') . '</a>';
    }
    if ($meta['organization_id'] && function_exists('tk_org_admin_profile_url')) {
        echo '<a class="button button-secondary tk-report-review-btn" href="' . esc_url(tk_org_admin_profile_url($meta['organization_id'])) . '">' . esc_html__('View organisation', 'turkana-headless') . '</a>';
    }

    echo '</div>';
    echo '<hr /><p><strong>' . esc_html__('Reference', 'turkana-headless') . ':</strong> RPT-' . (int) $post->ID . '</p>';
    echo '<p><strong>' . esc_html__('Submitted', 'turkana-headless') . ':</strong><br />' . esc_html(get_the_date(get_option('date_format') . ' ' . get_option('time_format'), $post)) . '</p>';
    if ($meta['partner_orgs']) {
        echo '<p><strong>' . esc_html__('Source', 'turkana-headless') . ':</strong><br />' . esc_html($meta['partner_orgs']) . '</p>';
    }
}

function tk_report_save_meta($post_id) {
    if (!isset($_POST['tk_report_meta_nonce']) || !wp_verify_nonce($_POST['tk_report_meta_nonce'], 'tk_report_save_meta')) {
        return;
    }
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    // Description: full rich HTML, written to the same postmeta key (and native
    // post_content) that the partner-submission flow uses (tk_pp_stamp_new_submission /
    // buildReportPayload on the frontend), so both write paths agree on where it lives.
    if (isset($_POST['tk_report_description'])) {
        $desc = wp_kses_post(wp_unslash($_POST['tk_report_description']));
        update_post_meta($post_id, 'description', $desc);
        wp_update_post([
            'ID' => $post_id,
            'post_content' => $desc,
            'post_excerpt' => wp_trim_words(wp_strip_all_tags($desc), 30),
        ]);
    }

    // Category: single value, stored under both the legacy `tag` key (fixed colour
    // coding on the reports list) and the `categories` array the frontend actually reads.
    if (isset($_POST['tk_report_tag'])) {
        $tag = sanitize_text_field(wp_unslash($_POST['tk_report_tag']));
        update_post_meta($post_id, 'tag', $tag);
        update_post_meta($post_id, 'categories', $tag ? [$tag] : []);
    }

    if (isset($_POST['tk_report_organization_id'])) {
        $org_id = (int) $_POST['tk_report_organization_id'];
        if ($org_id > 0 && get_post_type($org_id) === 'tk_organization') {
            update_post_meta($post_id, 'organization_id', (string) $org_id);
        } else {
            update_post_meta($post_id, 'organization_id', '');
        }
    }
    if (isset($_POST['tk_report_partner_orgs'])) {
        update_post_meta($post_id, 'partner_orgs', sanitize_text_field(wp_unslash($_POST['tk_report_partner_orgs'])));
    }

    if (isset($_POST['tk_report_keywords'])) {
        // Stored as an array (not an imploded string) — matches the shape the
        // partner-portal plugin writes on create/update.
        update_post_meta($post_id, 'keywords', tk_parse_keywords_meta(wp_unslash($_POST['tk_report_keywords'])));
    }

    $countries = [];
    if (isset($_POST['tk_report_countries']) && is_array($_POST['tk_report_countries'])) {
        $valid = array_keys(tk_report_countries());
        foreach ($_POST['tk_report_countries'] as $code) {
            $code = sanitize_text_field($code);
            if (in_array($code, $valid, true)) {
                $countries[] = $code;
            }
        }
    }
    update_post_meta($post_id, 'countries', $countries);

    if (isset($_POST['tk_report_publication_date'])) {
        update_post_meta($post_id, 'publication_date', sanitize_text_field(wp_unslash($_POST['tk_report_publication_date'])));
    }
    if (isset($_POST['tk_report_file_url'])) {
        update_post_meta($post_id, 'file_url', esc_url_raw(wp_unslash($_POST['tk_report_file_url'])));
    }
    if (isset($_POST['tk_report_file_size'])) {
        update_post_meta($post_id, 'file_size', sanitize_text_field(wp_unslash($_POST['tk_report_file_size'])));
    }

    update_post_meta($post_id, 'is_new', !empty($_POST['tk_report_is_new']));
    update_post_meta($post_id, 'is_updated', !empty($_POST['tk_report_is_updated']));

    if (isset($_POST['tk_report_review_status'])) {
        $new_status = sanitize_key($_POST['tk_report_review_status']);
        $statuses = function_exists('tk_hub_review_statuses') ? tk_hub_review_statuses() : ['pending' => 1, 'approved' => 1, 'rejected' => 1];
        if (array_key_exists($new_status, $statuses)) {
            $old_status = tk_report_get_meta($post_id)['review_status'];
            if ($new_status !== $old_status) {
                if ($new_status === 'approved' && function_exists('tk_hub_content_approve')) {
                    tk_hub_content_approve($post_id);
                } elseif ($new_status === 'rejected' && function_exists('tk_hub_content_reject')) {
                    tk_hub_content_reject($post_id);
                } elseif ($new_status === 'pending') {
                    wp_update_post(['ID' => $post_id, 'post_status' => 'draft']);
                    update_post_meta($post_id, 'review_status', 'pending');
                    update_post_meta($post_id, '_tk_review_status', 'pending');
                } elseif ($new_status === 'withdrawn') {
                    wp_update_post(['ID' => $post_id, 'post_status' => 'draft']);
                    update_post_meta($post_id, '_tk_review_status', 'withdrawn');
                } elseif ($new_status === 'withdrawal_requested') {
                    update_post_meta($post_id, '_tk_review_status', 'withdrawal_requested');
                }
            }
        }
    }
}

add_action('save_post_tk_report', 'tk_report_save_meta', 10, 1);

add_action('admin_notices', function () {
    if (!isset($_GET['tk_content_action'], $_GET['tk_content_id'])) {
        return;
    }
    $screen = get_current_screen();
    if (!$screen || $screen->post_type !== 'tk_report') {
        return;
    }
    $action = sanitize_key($_GET['tk_content_action']);
    if ($action === 'approve') {
        echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__('Report approved and published.', 'turkana-headless') . '</p></div>';
    } elseif ($action === 'reject') {
        echo '<div class="notice notice-warning is-dismissible"><p>' . esc_html__('Report rejected and moved to draft.', 'turkana-headless') . '</p></div>';
    }
});

add_action('admin_enqueue_scripts', function ($hook) {
    if (!in_array($hook, ['post.php', 'post-new.php'], true)) {
        return;
    }
    $screen = get_current_screen();
    if (!$screen || $screen->post_type !== 'tk_report') {
        return;
    }
    foreach (['admin-content-edit-shared', 'admin-report-edit'] as $sheet) {
        $css = __DIR__ . '/assets/' . $sheet . '.css';
        if (file_exists($css)) {
            wp_enqueue_style(
                'tk-' . $sheet,
                plugin_dir_url(__FILE__) . 'assets/' . $sheet . '.css',
                [],
                (string) filemtime($css)
            );
        }
    }
});

add_action('admin_head', function () {
    $screen = get_current_screen();
    if (!$screen || $screen->post_type !== 'tk_report' || !in_array($screen->base, ['post'], true)) {
        return;
    }
    echo '<style>
        .post-type-tk_report #postdivrich,
        .post-type-tk_report #postexcerpt,
        .post-type-tk_report .block-editor,
        .post-type-tk_report .edit-post-layout { display: none !important; }
        .post-type-tk_report #titlediv { margin-bottom: 12px; }
    </style>';
});
