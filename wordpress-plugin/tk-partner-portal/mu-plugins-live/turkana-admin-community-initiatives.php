<?php
/**
 * Plugin Name: Turkana Admin Community Initiatives
 * Description: Admin UI for Community Initiatives posts (partner radio stations on the Community page).
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

function tk_ci_get_category_id() {
    $slug = defined('TK_COMMUNITY_INITIATIVES_SLUG') ? TK_COMMUNITY_INITIATIVES_SLUG : 'community-initiatives';
    $cat = get_category_by_slug($slug);
    return $cat ? (int) $cat->term_id : 0;
}

function tk_ci_is_list_screen() {
    global $pagenow;
    if ($pagenow !== 'edit.php' || empty($_GET['post_type']) || $_GET['post_type'] !== 'post') {
        return !empty($_GET['tk_community_initiatives']);
    }
    return !empty($_GET['tk_community_initiatives']) || ((int) ($_GET['cat'] ?? 0) === tk_ci_get_category_id() && tk_ci_get_category_id() > 0);
}

function tk_ci_post_has_category($post_id) {
    $cat_id = tk_ci_get_category_id();
    if (!$cat_id) {
        return false;
    }
    return has_category($cat_id, $post_id);
}

function tk_ci_should_show_meta_box($post) {
    if (!$post || $post->post_type !== 'post') {
        return false;
    }
    if (!empty($_GET['tk_community_initiative'])) {
        return true;
    }
    if ($post->ID && tk_ci_post_has_category($post->ID)) {
        return true;
    }
    return false;
}

add_action('admin_menu', function () {
    add_submenu_page(
        'edit.php',
        __('Community Initiatives', 'turkana-headless'),
        __('Community Initiatives', 'turkana-headless'),
        'edit_posts',
        'tk-community-initiatives',
        'tk_ci_render_list_redirect'
    );
}, 20);

function tk_ci_render_list_redirect() {
    $cat_id = tk_ci_get_category_id();
    $url = admin_url('edit.php?post_type=post&tk_community_initiatives=1');
    if ($cat_id) {
        $url = add_query_arg('cat', $cat_id, $url);
    }
    wp_safe_redirect($url);
    exit;
}

add_action('admin_head-edit.php', function () {
    if (!tk_ci_is_list_screen()) {
        return;
    }
    echo '<style>.subsubsub .tk-ci-hidden-filter { display: none !important; }</style>';
});

add_filter('views_edit-post', function ($views) {
    if (!tk_ci_is_list_screen()) {
        return $views;
    }

    $add_url = admin_url('post-new.php?post_type=post&tk_community_initiative=1');
    echo '<a href="' . esc_url($add_url) . '" class="page-title-action">' . esc_html__('Add Radio Station', 'turkana-headless') . '</a>';
    echo '<p class="description" style="margin:8px 0 12px;">' . esc_html__('These entries appear in the Community Initiatives section on the Community page. Fill in the radio fields below only for partner radio station cards.', 'turkana-headless') . '</p>';

    return $views;
});

add_action('load-post-new.php', function () {
    if (empty($_GET['tk_community_initiative'])) {
        return;
    }

    add_action('admin_footer', function () {
        $cat_id = tk_ci_get_category_id();
        if (!$cat_id) {
            return;
        }
        ?>
        <script>
        jQuery(function($) {
            var $checkbox = $('#in-category-' + <?php echo (int) $cat_id; ?>);
            if ($checkbox.length) {
                $checkbox.prop('checked', true);
            }
            $('#taxonomy-category input[value="<?php echo (int) $cat_id; ?>"]').prop('checked', true);
        });
        </script>
        <?php
    });
});

add_action('add_meta_boxes', function () {
    add_meta_box(
        'tk_community_initiative_details',
        __('Radio Station Details', 'turkana-headless'),
        'tk_ci_render_meta_box',
        'post',
        'normal',
        'high'
    );
    add_meta_box(
        'tk_post_attached_files',
        __('Attached Documents', 'turkana-headless'),
        'tk_ci_render_files_meta_box',
        'post',
        'normal',
        'default'
    );
});

function tk_ci_render_meta_box($post) {
    if (!tk_ci_should_show_meta_box($post)) {
        echo '<p class="description">' . esc_html__('Assign the "Community Initiatives" category to manage radio station fields for the Community page.', 'turkana-headless') . '</p>';
        return;
    }

    wp_nonce_field('tk_ci_save_meta', 'tk_ci_meta_nonce');

    $frequency = get_post_meta($post->ID, 'radio_frequency', true);
    $languages = get_post_meta($post->ID, 'radio_languages', true);
    $times = get_post_meta($post->ID, 'broadcast_times', true);
    ?>
    <p class="description" style="margin-top:0;">
        <?php esc_html_e('Use the post title, excerpt, featured image and tags for the Community Initiatives card. Radio fields below are optional — only filled entries also appear under Partner Radio Stations.', 'turkana-headless'); ?>
    </p>
    <table class="form-table tk-hub-form-table" role="presentation">
        <tr>
            <th scope="row"><label for="tk_radio_frequency"><?php esc_html_e('Frequency', 'turkana-headless'); ?></label></th>
            <td>
                <input type="text" class="regular-text" id="tk_radio_frequency" name="tk_radio_frequency" value="<?php echo esc_attr($frequency); ?>" placeholder="89.5 FM" />
            </td>
        </tr>
        <tr>
            <th scope="row"><label for="tk_radio_languages"><?php esc_html_e('Languages', 'turkana-headless'); ?></label></th>
            <td>
                <input type="text" class="regular-text" id="tk_radio_languages" name="tk_radio_languages" value="<?php echo esc_attr($languages); ?>" placeholder="Turkana / Swahili" />
            </td>
        </tr>
        <tr>
            <th scope="row"><label for="tk_broadcast_times"><?php esc_html_e('Broadcast Times', 'turkana-headless'); ?></label></th>
            <td>
                <input type="text" class="regular-text" id="tk_broadcast_times" name="tk_broadcast_times" value="<?php echo esc_attr($times); ?>" placeholder="07:00 & 18:00 EAT" />
            </td>
        </tr>
    </table>
    <?php
}

function tk_ci_get_post_files($post_id) {
    $raw = get_post_meta($post_id, 'post_files', true);
    if (function_exists('tk_hub_decode_list_meta')) {
        return tk_hub_decode_list_meta($raw);
    }
    return is_array($raw) ? $raw : [];
}

function tk_ci_sanitize_post_files($raw) {
    if (!is_string($raw) || $raw === '') {
        return [];
    }
    $decoded = json_decode(wp_unslash($raw), true);
    if (!is_array($decoded)) {
        return [];
    }

    $files = [];
    foreach ($decoded as $file) {
        if (!is_array($file) || empty($file['url'])) {
            continue;
        }
        $files[] = [
            'url' => esc_url_raw($file['url']),
            'size' => sanitize_text_field($file['size'] ?? ''),
            'language' => sanitize_text_field($file['language'] ?? 'en'),
            'label' => sanitize_text_field($file['label'] ?? ''),
            'filename' => sanitize_text_field($file['filename'] ?? ''),
        ];
    }

    return $files;
}

function tk_ci_render_files_meta_box($post) {
    wp_nonce_field('tk_ci_save_files', 'tk_ci_files_nonce');

    $files = tk_ci_get_post_files($post->ID);
    $json = wp_json_encode(array_values($files));
    ?>
    <div class="tk-post-files-wrap">
        <p class="description" style="margin-top:0;">
            <?php esc_html_e('Upload PDFs, Word, Excel, or images. They appear in a Downloads section on the Community article page (Next.js).', 'turkana-headless'); ?>
        </p>
        <ul class="tk-post-files-list"></ul>
        <input type="hidden" class="tk-post-files-data" name="tk_post_files" value="<?php echo esc_attr($json); ?>" />
        <p>
            <button type="button" class="button tk-post-files-add"><?php esc_html_e('Add files', 'turkana-headless'); ?></button>
        </p>
    </div>
    <?php
}

add_action('save_post_post', function ($post_id) {
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    if (!isset($_POST['tk_ci_meta_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['tk_ci_meta_nonce'])), 'tk_ci_save_meta')) {
        return;
    }
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    $fields = [
        'tk_radio_frequency' => 'radio_frequency',
        'tk_radio_languages' => 'radio_languages',
        'tk_broadcast_times' => 'broadcast_times',
    ];

    foreach ($fields as $input_key => $meta_key) {
        if (!isset($_POST[$input_key])) {
            continue;
        }
        update_post_meta(
            $post_id,
            $meta_key,
            sanitize_text_field(wp_unslash($_POST[$input_key]))
        );
    }
}, 10, 1);

add_action('save_post_post', function ($post_id) {
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    if (!isset($_POST['tk_ci_files_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['tk_ci_files_nonce'])), 'tk_ci_save_files')) {
        return;
    }
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }
    if (!isset($_POST['tk_post_files'])) {
        return;
    }

    $files = tk_ci_sanitize_post_files(wp_unslash($_POST['tk_post_files']));
    update_post_meta($post_id, 'post_files', wp_json_encode(array_values($files)));
}, 11, 1);

add_filter('manage_post_posts_columns', function ($columns) {
    if (!tk_ci_is_list_screen()) {
        return $columns;
    }

    $new = [];
    foreach ($columns as $key => $label) {
        $new[$key] = $label;
        if ($key === 'title') {
            $new['tk_ci_frequency'] = __('Frequency', 'turkana-headless');
            $new['tk_ci_languages'] = __('Languages', 'turkana-headless');
            $new['tk_ci_times'] = __('Broadcast Times', 'turkana-headless');
        }
    }

    return $new;
});

add_action('manage_post_posts_custom_column', function ($column, $post_id) {
    if (!tk_ci_is_list_screen()) {
        return;
    }

    switch ($column) {
        case 'tk_ci_frequency':
            echo esc_html(get_post_meta($post_id, 'radio_frequency', true) ?: '—');
            break;
        case 'tk_ci_languages':
            echo esc_html(get_post_meta($post_id, 'radio_languages', true) ?: '—');
            break;
        case 'tk_ci_times':
            echo esc_html(get_post_meta($post_id, 'broadcast_times', true) ?: '—');
            break;
    }
}, 10, 2);

add_action('pre_get_posts', function ($query) {
    if (!is_admin() || !$query->is_main_query()) {
        return;
    }
    if (empty($_GET['tk_community_initiatives'])) {
        return;
    }

    $cat_id = tk_ci_get_category_id();
    if ($cat_id) {
        $query->set('cat', $cat_id);
    }
});

add_action('admin_enqueue_scripts', function ($hook) {
    if (!in_array($hook, ['post.php', 'post-new.php'], true)) {
        return;
    }
    $screen = get_current_screen();
    if (!$screen || $screen->post_type !== 'post') {
        return;
    }

    wp_enqueue_media();
    $base = plugin_dir_url(__FILE__);
    $js = __DIR__ . '/assets/admin-post-files.js';
    if (!file_exists($js)) {
        return;
    }

    wp_enqueue_script(
        'tk-admin-post-files',
        $base . 'assets/admin-post-files.js',
        ['jquery'],
        (string) filemtime($js),
        true
    );
    wp_localize_script('tk-admin-post-files', 'tkPostFiles', [
        'pickerTitle' => __('Select files to attach', 'turkana-headless'),
        'pickerButton' => __('Attach files', 'turkana-headless'),
        'emptyLabel' => __('No files attached.', 'turkana-headless'),
        'openLabel' => __('Open file', 'turkana-headless'),
        'removeLabel' => __('Remove', 'turkana-headless'),
    ]);

    wp_add_inline_style('wp-admin', '
        .tk-post-files-list { margin: 0 0 12px; padding: 0; list-style: none; }
        .tk-post-files-item { padding: 10px 12px; margin-bottom: 8px; background: #f6f7f7; border: 1px solid #dcdcde; border-radius: 4px; }
        .tk-post-files-meta { color: #646970; font-size: 12px; }
        .tk-post-files-empty { color: #646970; font-style: italic; margin: 0 0 12px; }
        .tk-post-files-remove { color: #b32d2e; margin-left: 8px; }
    ');
});
