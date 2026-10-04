<?php
/**
 * Shared helpers for tk_alert / tk_report admin edit screens.
 */

if (!defined('ABSPATH')) {
    exit;
}

function tk_hub_content_edit_urls($post_id) {
    $edit_url = admin_url('post.php?post=' . (int) $post_id . '&action=edit');
    $nonce = 'tk_content_action_' . (int) $post_id;
    return [
        'edit' => $edit_url,
        'approve' => wp_nonce_url(
            add_query_arg('redirect_to', rawurlencode($edit_url), admin_url('admin.php?action=tk_approve_content&post=' . (int) $post_id)),
            $nonce
        ),
        'reject' => wp_nonce_url(
            add_query_arg('redirect_to', rawurlencode($edit_url), admin_url('admin.php?action=tk_reject_content&post=' . (int) $post_id)),
            $nonce
        ),
    ];
}

function tk_hub_render_review_sidebar($post, array $args) {
    $review_status = $args['review_status'] ?? 'pending';
    $reference = $args['reference'] ?? '';
    $source = $args['source'] ?? '';
    $extra_badges = $args['extra_badges'] ?? '';
    $urls = tk_hub_content_edit_urls($post->ID);

    echo '<div class="tk-hub-review-panel">';
    echo '<div class="tk-hub-review-badges">';
    echo function_exists('tk_hub_review_badge') ? tk_hub_review_badge($review_status) : esc_html($review_status);
    echo $extra_badges;
    echo '</div>';

    if (current_user_can('edit_post', $post->ID)) {
        echo '<div class="tk-hub-review-actions">';
        if ($review_status !== 'approved') {
            echo '<a class="button button-primary button-large" href="' . esc_url($urls['approve']) . '">' . esc_html__('Approve & Publish', 'turkana-headless') . '</a>';
        }
        if ($review_status !== 'rejected') {
            echo '<a class="button tk-hub-review-reject" href="' . esc_url($urls['reject']) . '">' . esc_html__('Reject', 'turkana-headless') . '</a>';
        }
        echo '</div>';
    }

    echo '<p class="description">' . esc_html($args['hint'] ?? __('Change review status in the details panel below, then click Update.', 'turkana-headless')) . '</p>';
    if ($reference) {
        echo '<p><strong>' . esc_html__('Reference', 'turkana-headless') . ':</strong> ' . esc_html($reference) . '</p>';
    }
    echo '<p><strong>' . esc_html__('Submitted', 'turkana-headless') . ':</strong><br />' . esc_html(get_the_date(get_option('date_format') . ' ' . get_option('time_format'), $post)) . '</p>';
    if ($source) {
        echo '<p><strong>' . esc_html__('Source', 'turkana-headless') . ':</strong><br />' . esc_html($source) . '</p>';
    }
    if (!empty($args['footer_lines'])) {
        foreach ($args['footer_lines'] as $line) {
            echo '<p>' . wp_kses_post($line) . '</p>';
        }
    }
    echo '</div>';
}

function tk_hub_category_tag_html($label, $class = 'tk-hub-tag-blue') {
    if (!$label) {
        return '';
    }
    return '<span class="tk-hub-inline-tag ' . esc_attr($class) . '">' . esc_html($label) . '</span>';
}

function tk_hub_should_show_edit_hero($post) {
    return !function_exists('use_block_editor_for_post') || !use_block_editor_for_post($post);
}
