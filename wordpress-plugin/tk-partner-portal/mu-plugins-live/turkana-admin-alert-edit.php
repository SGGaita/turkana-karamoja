<?php
/**
 * Plugin Name: Turkana Admin Alert Edit
 * Description: Themed edit screen for advisories & warnings (tk_alert).
 * Version: 1.2.1
 */

if (!defined('ABSPATH')) {
    exit;
}

function tk_alert_types() {
    return [
        'Weather Forecast',
        'Seasonal Climate Outlook',
        'Flood Warning',
        'Drought Advisory',
        'Locust Advisory',
        'Disease Outbreak Alert',
        'Situation Report (SITREP)',
        'Food Security Update',
        'Humanitarian Bulletin',
        'Other',
    ];
}

function tk_alert_levels() {
    return [
        'red' => __('RED — Severe / Extreme', 'turkana-headless'),
        'orange' => __('ORANGE — High', 'turkana-headless'),
        'yellow' => __('YELLOW — Moderate / Watch', 'turkana-headless'),
        'green' => __('GREEN — Normal / Information', 'turkana-headless'),
    ];
}

function tk_alert_parse_actions_raw($post_id) {
    $raw = get_post_meta($post_id, 'actions', true);
    if (!$raw) {
        return [];
    }
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        return [];
    }
    $actions = [];
    foreach ($decoded as $item) {
        if (is_string($item)) {
            $actions[] = $item;
        } elseif (is_array($item) && !empty($item['action'])) {
            $actions[] = $item['action'];
        } elseif (is_array($item) && !empty($item['text'])) {
            $actions[] = $item['text'];
        }
    }
    return array_values(array_filter(array_map('trim', $actions)));
}

function tk_alert_get_meta($post_id) {
    $post = get_post($post_id);
    $files_raw = get_post_meta($post_id, 'advisory_files', true);
    $advisory_files = [];
    if ($files_raw) {
        $decoded = json_decode($files_raw, true);
        if (is_array($decoded)) {
            $advisory_files = $decoded;
        }
    }
    $body = get_post_meta($post_id, 'body', true);
    if (!$body && $post) {
        $body = $post->post_content;
    }
    return [
        'alert_level' => get_post_meta($post_id, 'alert_level', true) ?: 'yellow',
        'advisory_type' => get_post_meta($post_id, 'advisory_type', true) ?: '',
        'area' => get_post_meta($post_id, 'area', true) ?: '',
        'body' => $body,
        'source' => get_post_meta($post_id, 'source', true) ?: '',
        'issued_date' => get_post_meta($post_id, 'issued_date', true) ?: '',
        'valid_until' => get_post_meta($post_id, 'valid_until', true) ?: '',
        'target_groups' => get_post_meta($post_id, 'target_groups', true) ?: '',
        'keywords' => tk_parse_keywords_meta(get_post_meta($post_id, 'keywords', true)),
        'latitude' => get_post_meta($post_id, 'latitude', true) ?: '',
        'longitude' => get_post_meta($post_id, 'longitude', true) ?: '',
        'location_label' => get_post_meta($post_id, 'location_label', true) ?: '',
        'publish_on_map' => (bool) get_post_meta($post_id, 'publish_on_map', true),
        'organization_id' => (int) get_post_meta($post_id, 'organization_id', true),
        'actions' => tk_alert_parse_actions_raw($post_id),
        'advisory_files' => $advisory_files,
        'review_status' => function_exists('tk_hub_get_review_status')
            ? tk_hub_get_review_status($post_id)
            : (get_post_status($post_id) === 'publish' ? 'approved' : 'pending'),
    ];
}

function tk_alert_edit_url($post_id) {
    return admin_url('post.php?post=' . (int) $post_id . '&action=edit');
}

function tk_alert_list_url() {
    return admin_url('edit.php?post_type=tk_alert');
}

add_filter('use_block_editor_for_post_type', function ($use, $post_type) {
    return $post_type === 'tk_alert' ? false : $use;
}, 10, 2);

add_filter('gutenberg_can_edit_post_type', function ($can, $post_type) {
    return $post_type === 'tk_alert' ? false : $can;
}, 10, 2);

add_action('init', function () {
    if (!post_type_exists('tk_alert')) {
        return;
    }
    remove_post_type_support('tk_alert', 'editor');
    remove_post_type_support('tk_alert', 'excerpt');
    remove_post_type_support('tk_alert', 'thumbnail');
}, 20);

add_filter('post_type_labels_tk_alert', function ($labels) {
    $labels->edit_item = __('Review Advisory', 'turkana-headless');
    $labels->add_new_item = __('Add Advisory', 'turkana-headless');
    return $labels;
});

function tk_alert_editor_settings($textarea_name, $rows = 10) {
    return [
        'textarea_name' => $textarea_name,
        'textarea_rows' => $rows,
        'media_buttons' => false,
        'teeny' => false,
        'quicktags' => true,
        'tinymce' => [
            'toolbar1' => 'formatselect,bold,italic,bullist,numlist,link,unlink,undo,redo,removeformat',
            'toolbar2' => '',
            'block_formats' => 'Paragraph=p;Heading 3=h3',
        ],
    ];
}

function tk_alert_sanitize_editor_html($html) {
    return wp_kses(wp_unslash($html), wp_kses_allowed_html('post'));
}

function tk_alert_actions_array_to_html(array $actions) {
    if (empty($actions)) {
        return '';
    }
    $items = array_map(function ($text) {
        return '<li>' . esc_html($text) . '</li>';
    }, $actions);
    return '<ul>' . implode('', $items) . '</ul>';
}

function tk_alert_get_actions_html($post_id) {
    $stored = get_post_meta($post_id, 'actions_html', true);
    if (is_string($stored) && $stored !== '') {
        return $stored;
    }
    return tk_alert_actions_array_to_html(tk_alert_parse_actions_raw($post_id));
}

function tk_alert_actions_html_to_json($html) {
    $html = trim((string) $html);
    if ($html === '') {
        return wp_json_encode([]);
    }
    $actions = [];
    if (preg_match_all('/<li[^>]*>(.*?)<\/li>/is', $html, $matches)) {
        foreach ($matches[1] as $item) {
            $text = trim(wp_strip_all_tags($item));
            if ($text !== '') {
                $actions[] = ['action' => $text];
            }
        }
    }
    if (empty($actions)) {
        $plain = trim(wp_strip_all_tags($html));
        foreach (preg_split('/\r\n|\r|\n/', $plain) as $line) {
            $line = trim(preg_replace('/^[-•\d.)\s]+/u', '', $line));
            if ($line !== '') {
                $actions[] = ['action' => $line];
            }
        }
    }
    return wp_json_encode($actions);
}

add_action('add_meta_boxes', function () {
    add_meta_box(
        'tk_alert_situation',
        __('Situation', 'turkana-headless'),
        'tk_alert_situation_metabox',
        'tk_alert',
        'normal',
        'high'
    );
    add_meta_box(
        'tk_alert_details',
        __('Advisory Details', 'turkana-headless'),
        'tk_alert_details_metabox',
        'tk_alert',
        'normal',
        'default'
    );
    add_meta_box(
        'tk_alert_actions_box',
        __('Recommended Actions', 'turkana-headless'),
        'tk_alert_actions_metabox',
        'tk_alert',
        'normal',
        'default'
    );
    add_meta_box(
        'tk_alert_review_actions',
        __('Review Actions', 'turkana-headless'),
        'tk_alert_review_actions_metabox',
        'tk_alert',
        'side',
        'high'
    );
    add_meta_box(
        'tk_alert_map',
        __('Regional Map', 'turkana-headless'),
        'tk_alert_map_metabox',
        'tk_alert',
        'side',
        'default'
    );
    add_meta_box(
        'tk_alert_files',
        __('Supporting Documents', 'turkana-headless'),
        'tk_alert_files_metabox',
        'tk_alert',
        'side',
        'default'
    );

    remove_meta_box('postcustom', 'tk_alert', 'normal');
    remove_meta_box('slugdiv', 'tk_alert', 'normal');
    remove_meta_box('postimagediv', 'tk_alert', 'side');
    remove_meta_box('postexcerpt', 'tk_alert', 'normal');
}, 20);

add_filter('enter_title_here', function ($title, $post) {
    if ($post->post_type === 'tk_alert') {
        return __('Advisory title', 'turkana-headless');
    }
    return $title;
}, 10, 2);

function tk_alert_situation_metabox($post) {
    $meta = tk_alert_get_meta($post->ID);
    ?>
    <p class="description" style="margin-top:0;"><?php esc_html_e('Describe the current situation, hazard, and who is affected. Shown on the early warnings page.', 'turkana-headless'); ?></p>
    <div class="tk-alert-wp-editor">
        <?php
        wp_editor(
            $meta['body'],
            'tk_alert_body',
            tk_alert_editor_settings('tk_alert_body', 8)
        );
        ?>
    </div>
    <?php
}

function tk_alert_details_metabox($post) {
    wp_nonce_field('tk_alert_save_meta', 'tk_alert_meta_nonce');
    $meta = tk_alert_get_meta($post->ID);
    ?>
    <table class="form-table tk-alert-form-table" role="presentation">
        <tbody>
            <tr>
                <th scope="row"><label for="tk_alert_level"><?php esc_html_e('Alert level', 'turkana-headless'); ?></label></th>
                <td>
                    <select id="tk_alert_level" name="tk_alert_level">
                        <?php foreach (tk_alert_levels() as $value => $label) : ?>
                            <option value="<?php echo esc_attr($value); ?>" <?php selected($meta['alert_level'], $value); ?>><?php echo esc_html($label); ?></option>
                        <?php endforeach; ?>
                    </select>
                </td>
            </tr>
            <tr>
                <th scope="row"><label for="tk_alert_type"><?php esc_html_e('Advisory type', 'turkana-headless'); ?></label></th>
                <td>
                    <select id="tk_alert_type" name="tk_alert_type">
                        <option value=""><?php esc_html_e('— Select —', 'turkana-headless'); ?></option>
                        <?php foreach (tk_alert_types() as $type) : ?>
                            <option value="<?php echo esc_attr($type); ?>" <?php selected($meta['advisory_type'], $type); ?>><?php echo esc_html($type); ?></option>
                        <?php endforeach; ?>
                    </select>
                </td>
            </tr>
            <tr>
                <th scope="row"><label for="tk_alert_source"><?php esc_html_e('Source / organisation', 'turkana-headless'); ?></label></th>
                <td>
                    <input type="text" id="tk_alert_source" name="tk_alert_source" value="<?php echo esc_attr($meta['source']); ?>" class="regular-text" />
                    <?php if ($meta['organization_id'] && function_exists('tk_org_admin_profile_url')) : ?>
                        <p class="description">
                            <?php esc_html_e('Linked organisation:', 'turkana-headless'); ?>
                            <a href="<?php echo esc_url(tk_org_admin_profile_url($meta['organization_id'])); ?>"><?php echo esc_html(get_the_title($meta['organization_id']) ?: ('ORG-' . $meta['organization_id'])); ?></a>
                        </p>
                    <?php endif; ?>
                </td>
            </tr>
            <tr>
                <th scope="row"><label for="tk_alert_area"><?php esc_html_e('Administrative area', 'turkana-headless'); ?></label></th>
                <td>
                    <input type="text" id="tk_alert_area" name="tk_alert_area" value="<?php echo esc_attr($meta['area']); ?>" class="large-text" />
                </td>
            </tr>
            <tr>
                <th scope="row"><label for="tk_alert_location_label"><?php esc_html_e('Location label', 'turkana-headless'); ?></label></th>
                <td>
                    <input type="text" id="tk_alert_location_label" name="tk_alert_location_label" value="<?php echo esc_attr($meta['location_label']); ?>" class="regular-text" placeholder="<?php esc_attr_e('e.g. Lodwar town', 'turkana-headless'); ?>" />
                </td>
            </tr>
            <tr>
                <th scope="row"><?php esc_html_e('Map coordinates', 'turkana-headless'); ?></th>
                <td>
                    <label for="tk_alert_latitude" class="screen-reader-text"><?php esc_html_e('Latitude', 'turkana-headless'); ?></label>
                    <input type="text" id="tk_alert_latitude" name="tk_alert_latitude" value="<?php echo esc_attr($meta['latitude']); ?>" class="small-text" placeholder="<?php esc_attr_e('Latitude', 'turkana-headless'); ?>" />
                    <label for="tk_alert_longitude" class="screen-reader-text"><?php esc_html_e('Longitude', 'turkana-headless'); ?></label>
                    <input type="text" id="tk_alert_longitude" name="tk_alert_longitude" value="<?php echo esc_attr($meta['longitude']); ?>" class="small-text" placeholder="<?php esc_attr_e('Longitude', 'turkana-headless'); ?>" />
                    <p class="description"><?php esc_html_e('Required for the home page map. Partners pin locations on submit.', 'turkana-headless'); ?></p>
                </td>
            </tr>
            <tr>
                <th scope="row"><label for="tk_alert_issued_date"><?php esc_html_e('Issued date', 'turkana-headless'); ?></label></th>
                <td>
                    <input type="date" id="tk_alert_issued_date" name="tk_alert_issued_date" value="<?php echo esc_attr($meta['issued_date']); ?>" />
                </td>
            </tr>
            <tr>
                <th scope="row"><label for="tk_alert_valid_until"><?php esc_html_e('Valid until / period', 'turkana-headless'); ?></label></th>
                <td>
                    <input type="text" id="tk_alert_valid_until" name="tk_alert_valid_until" value="<?php echo esc_attr($meta['valid_until']); ?>" class="large-text" placeholder="<?php esc_attr_e('e.g. Until 15 Jun 2026 or Next 48 hours', 'turkana-headless'); ?>" />
                </td>
            </tr>
            <tr>
                <th scope="row"><label for="tk_alert_target_groups"><?php esc_html_e('Target groups', 'turkana-headless'); ?></label></th>
                <td>
                    <textarea id="tk_alert_target_groups" name="tk_alert_target_groups" rows="3" class="large-text"><?php echo esc_textarea($meta['target_groups']); ?></textarea>
                    <p class="description"><?php esc_html_e('Comma-separated list of who should act on this advisory.', 'turkana-headless'); ?></p>
                </td>
            </tr>
            <tr>
                <th scope="row"><label for="tk_alert_keywords"><?php esc_html_e('Keywords', 'turkana-headless'); ?></label></th>
                <td>
                    <input type="text" id="tk_alert_keywords" name="tk_alert_keywords" value="<?php echo esc_attr(implode(', ', $meta['keywords'])); ?>" class="large-text" placeholder="<?php esc_attr_e('drought, flood, Turkana', 'turkana-headless'); ?>" />
                </td>
            </tr>
            <tr>
                <th scope="row"><label for="tk_alert_review_status"><?php esc_html_e('Review status', 'turkana-headless'); ?></label></th>
                <td>
                    <select id="tk_alert_review_status" name="tk_alert_review_status">
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
                </td>
            </tr>
        </tbody>
    </table>
    <?php
}

function tk_alert_actions_metabox($post) {
    ?>
    <p class="description" style="margin-top:0;"><?php esc_html_e('Use a bullet list for each action. Shown to communities on the early warnings page.', 'turkana-headless'); ?></p>
    <div class="tk-alert-wp-editor">
        <?php
        wp_editor(
            tk_alert_get_actions_html($post->ID),
            'tk_alert_actions',
            tk_alert_editor_settings('tk_alert_actions', 10)
        );
        ?>
    </div>
    <?php
}

function tk_alert_map_metabox($post) {
    $meta = tk_alert_get_meta($post->ID);
    $published = $post->post_status === 'publish';
    $has_coords = $meta['latitude'] !== '' && $meta['longitude'] !== '';

    if ($meta['review_status'] !== 'approved' || !$published) {
        echo '<p class="description">' . esc_html__('Approve and publish before showing on the front-page map.', 'turkana-headless') . '</p>';
    }

    if ($has_coords) {
        $maps_link = 'https://www.openstreetmap.org/?mlat=' . rawurlencode($meta['latitude']) . '&mlon=' . rawurlencode($meta['longitude']) . '#map=9/' . rawurlencode($meta['latitude']) . '/' . rawurlencode($meta['longitude']);
        echo '<p style="margin:0 0 10px;font-size:12px;">';
        echo esc_html($meta['location_label'] ?: $meta['area'] ?: __('Pinned location', 'turkana-headless'));
        echo '<br><code>' . esc_html($meta['latitude'] . ', ' . $meta['longitude']) . '</code><br>';
        echo '<a href="' . esc_url($maps_link) . '" target="_blank" rel="noopener">' . esc_html__('View on OpenStreetMap', 'turkana-headless') . '</a></p>';
    } else {
        echo '<p class="description" style="color:#b45309;">' . esc_html__('No coordinates — add lat/lng in Advisory Details or ask the partner to resubmit with a map pin.', 'turkana-headless') . '</p>';
    }

    $disabled = !$published || $meta['review_status'] !== 'approved' || !$has_coords;
    ?>
    <label style="display:flex;align-items:flex-start;gap:8px;<?php echo $disabled ? 'opacity:0.55;' : ''; ?>">
        <input type="checkbox" name="tk_publish_on_map" value="1" <?php checked($meta['publish_on_map']); ?> <?php disabled($disabled); ?> />
        <span>
            <strong><?php esc_html_e('Highlight on home map', 'turkana-headless'); ?></strong><br>
            <span class="description"><?php esc_html_e('Published advisories with coordinates appear on the map. Check to emphasise this item.', 'turkana-headless'); ?></span>
        </span>
    </label>
    <?php
}

function tk_alert_files_metabox($post) {
    $meta = tk_alert_get_meta($post->ID);
    $files = $meta['advisory_files'];
    if (empty($files)) {
        echo '<p class="description">' . esc_html__('No supporting documents attached.', 'turkana-headless') . '</p>';
        return;
    }
    echo '<ul class="tk-alert-files-list">';
    foreach ($files as $file) {
        echo '<li class="tk-alert-file-item">';
        echo '<strong>' . esc_html($file['label'] ?? $file['language'] ?? __('Document', 'turkana-headless')) . '</strong>';
        if (!empty($file['size'])) {
            echo ' <span class="tk-alert-file-meta">· ' . esc_html($file['size']) . '</span>';
        }
        if (!empty($file['filename'])) {
            echo '<br><span class="tk-alert-file-meta">' . esc_html($file['filename']) . '</span>';
        }
        if (!empty($file['url'])) {
            echo '<br><a href="' . esc_url($file['url']) . '" target="_blank" rel="noopener">' . esc_html__('Open file', 'turkana-headless') . '</a>';
        }
        echo '</li>';
    }
    echo '</ul>';
}

function tk_alert_review_actions_metabox($post) {
    $meta = tk_alert_get_meta($post->ID);
    $urls = tk_hub_content_edit_urls($post->ID);
    $frontend = defined('TK_HUB_NEXT_URL') ? rtrim(TK_HUB_NEXT_URL, '/') . '/early-warnings' : '#';
    $map_url = defined('TK_HUB_NEXT_URL') ? rtrim(TK_HUB_NEXT_URL, '/') . '/' : '#';
    $level_badge = function_exists('tk_hub_alert_level_badge') ? tk_hub_alert_level_badge($meta['alert_level']) : '';

    echo '<p>' . (function_exists('tk_hub_review_badge') ? tk_hub_review_badge($meta['review_status']) : esc_html($meta['review_status'])) . '</p>';
    if ($level_badge) {
        echo '<p>' . $level_badge . '</p>';
    }
    echo '<p class="description">' . esc_html__('Use these shortcuts or change status in Advisory Details, then click Update.', 'turkana-headless') . '</p>';
    echo '<div class="tk-alert-review-actions">';

    if ($meta['review_status'] !== 'approved' && current_user_can('edit_post', $post->ID)) {
        echo '<a class="button button-primary tk-alert-review-btn" href="' . esc_url($urls['approve']) . '">' . esc_html__('Approve & Publish', 'turkana-headless') . '</a>';
    }
    if ($meta['review_status'] !== 'rejected' && current_user_can('edit_post', $post->ID)) {
        echo '<a class="button tk-alert-review-btn tk-alert-btn-reject" href="' . esc_url($urls['reject']) . '">' . esc_html__('Reject Advisory', 'turkana-headless') . '</a>';
    }
    if ($meta['review_status'] === 'approved' && $post->post_status === 'publish') {
        echo '<a class="button button-secondary tk-alert-review-btn" href="' . esc_url($frontend) . '" target="_blank" rel="noopener">' . esc_html__('Early warnings (Next.js)', 'turkana-headless') . '</a>';
        echo '<a class="button button-secondary tk-alert-review-btn" href="' . esc_url($map_url) . '" target="_blank" rel="noopener">' . esc_html__('Home map', 'turkana-headless') . '</a>';
    }
    if ($meta['organization_id'] && function_exists('tk_org_admin_profile_url')) {
        echo '<a class="button button-secondary tk-alert-review-btn" href="' . esc_url(tk_org_admin_profile_url($meta['organization_id'])) . '">' . esc_html__('View organisation', 'turkana-headless') . '</a>';
    }

    echo '</div>';
    echo '<hr /><p><strong>' . esc_html__('Reference', 'turkana-headless') . ':</strong> ADV-' . (int) $post->ID . '</p>';
    echo '<p><strong>' . esc_html__('Submitted', 'turkana-headless') . ':</strong><br />' . esc_html(get_the_date(get_option('date_format') . ' ' . get_option('time_format'), $post)) . '</p>';
    if ($meta['source']) {
        echo '<p><strong>' . esc_html__('Source', 'turkana-headless') . ':</strong><br />' . esc_html($meta['source']) . '</p>';
    }
    if (!empty($meta['actions'])) {
        echo '<p><strong>' . esc_html__('Recommended actions', 'turkana-headless') . ':</strong> ' . (int) count($meta['actions']) . '</p>';
    }
}

function tk_alert_save_meta($post_id) {
    if (!isset($_POST['tk_alert_meta_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['tk_alert_meta_nonce'])), 'tk_alert_save_meta')) {
        return;
    }
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    $fields = [
        'tk_alert_level' => 'alert_level',
        'tk_alert_type' => 'advisory_type',
        'tk_alert_source' => 'source',
        'tk_alert_area' => 'area',
        'tk_alert_location_label' => 'location_label',
        'tk_alert_latitude' => 'latitude',
        'tk_alert_longitude' => 'longitude',
        'tk_alert_issued_date' => 'issued_date',
        'tk_alert_valid_until' => 'valid_until',
    ];
    foreach ($fields as $post_key => $meta_key) {
        if (isset($_POST[$post_key])) {
            update_post_meta($post_id, $meta_key, sanitize_text_field(wp_unslash($_POST[$post_key])));
        }
    }

    if (isset($_POST['tk_alert_target_groups'])) {
        update_post_meta($post_id, 'target_groups', sanitize_textarea_field(wp_unslash($_POST['tk_alert_target_groups'])));
    }
    if (isset($_POST['tk_alert_keywords'])) {
        update_post_meta($post_id, 'keywords', implode(', ', tk_parse_keywords_meta(wp_unslash($_POST['tk_alert_keywords']))));
    }
    if (isset($_POST['tk_alert_actions'])) {
        $actions_html = tk_alert_sanitize_editor_html($_POST['tk_alert_actions']);
        update_post_meta($post_id, 'actions_html', $actions_html);
        update_post_meta($post_id, 'actions', tk_alert_actions_html_to_json($actions_html));
    }
    if (isset($_POST['tk_alert_body'])) {
        $body = tk_alert_sanitize_editor_html($_POST['tk_alert_body']);
        wp_update_post([
            'ID' => $post_id,
            'post_content' => $body,
        ]);
        update_post_meta($post_id, 'body', $body);
    }

    $publish = !empty($_POST['tk_publish_on_map']);
    $lat = get_post_meta($post_id, 'latitude', true);
    $lng = get_post_meta($post_id, 'longitude', true);
    if ($publish && ($lat === '' || $lng === '')) {
        $publish = false;
    }
    update_post_meta($post_id, 'publish_on_map', $publish ? '1' : '0');

    if (isset($_POST['tk_alert_review_status'])) {
        $new_status = sanitize_key($_POST['tk_alert_review_status']);
        $statuses = function_exists('tk_hub_review_statuses') ? tk_hub_review_statuses() : ['pending' => 1, 'approved' => 1, 'rejected' => 1];
        if (array_key_exists($new_status, $statuses)) {
            $old_status = tk_alert_get_meta($post_id)['review_status'];
            update_post_meta($post_id, 'review_status', $new_status);
            if ($new_status !== $old_status) {
                if ($new_status === 'approved' && function_exists('tk_hub_content_approve')) {
                    tk_hub_content_approve($post_id);
                } elseif ($new_status === 'rejected' && function_exists('tk_hub_content_reject')) {
                    tk_hub_content_reject($post_id);
                } elseif ($new_status === 'pending') {
                    wp_update_post(['ID' => $post_id, 'post_status' => 'draft']);
                }
            }
        }
    }
}

add_action('save_post_tk_alert', 'tk_alert_save_meta', 10, 1);

add_action('admin_notices', function () {
    if (!isset($_GET['tk_content_action'], $_GET['tk_content_id'])) {
        return;
    }
    $screen = get_current_screen();
    if (!$screen || $screen->post_type !== 'tk_alert') {
        return;
    }
    $action = sanitize_key($_GET['tk_content_action']);
    if ($action === 'approve') {
        echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__('Advisory approved and published.', 'turkana-headless') . '</p></div>';
    } elseif ($action === 'reject') {
        echo '<div class="notice notice-warning is-dismissible"><p>' . esc_html__('Advisory rejected and moved to draft.', 'turkana-headless') . '</p></div>';
    }
});

add_action('admin_enqueue_scripts', function ($hook) {
    if (!in_array($hook, ['post.php', 'post-new.php'], true)) {
        return;
    }
    $screen = get_current_screen();
    if (!$screen || $screen->post_type !== 'tk_alert') {
        return;
    }
    if (function_exists('wp_enqueue_editor')) {
        wp_enqueue_editor();
    }
    foreach (['admin-content-edit-shared', 'admin-alert-edit'] as $sheet) {
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
    if (!$screen || $screen->post_type !== 'tk_alert' || !in_array($screen->base, ['post'], true)) {
        return;
    }
    echo '<style>
        .post-type-tk_alert #postdivrich,
        .post-type-tk_alert #postexcerpt,
        .post-type-tk_alert .block-editor,
        .post-type-tk_alert .edit-post-layout { display: none !important; }
        .post-type-tk_alert #titlediv { margin-bottom: 12px; }
    </style>';
});
