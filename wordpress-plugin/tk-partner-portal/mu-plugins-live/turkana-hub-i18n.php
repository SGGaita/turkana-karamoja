<?php
/**
 * Locale helpers and Swahili translations for Karamoja Next.js (hero, header, home sections).
 */

if (!defined('ABSPATH')) {
    exit;
}

function tk_hub_supported_languages() {
    return ['en', 'sw', 'tu', 'pk', 'ng'];
}

function tk_hub_branding_languages() {
    return [
        'sw' => [
            'label' => 'Kiswahili',
            'name' => 'Swahili',
            'hint' => __('East African lingua franca across the cluster region.', 'turkana-headless'),
        ],
        'tu' => [
            'label' => "Ng'aturkana",
            'name' => 'Turkana',
            'hint' => __('Turkana-speaking communities in Kenya.', 'turkana-headless'),
        ],
        'ng' => [
            'label' => "Nga'Karamojong",
            'name' => 'Ngakarimojong',
            'hint' => __('Karamojong-speaking communities in Uganda.', 'turkana-headless'),
        ],
        'pk' => [
            'label' => 'Pokoot',
            'name' => 'Pokot',
            'hint' => __('Pokot-speaking communities in North Pokot.', 'turkana-headless'),
        ],
    ];
}

function tk_hub_resolve_locale($lang = null) {
    $lang = is_string($lang) ? strtolower(trim($lang)) : '';
    if (!$lang && isset($_GET['lang'])) {
        $lang = strtolower(sanitize_text_field(wp_unslash($_GET['lang'])));
    }
    if (!in_array($lang, tk_hub_supported_languages(), true)) {
        return 'en';
    }
    return $lang;
}

function tk_hub_pick_translation($value, $fallback = '') {
    if (is_string($value) && $value !== '') {
        return $value;
    }
    return $fallback;
}

function tk_hub_merge_scalar_fields($base, $overrides, $fields) {
    $out = $base;
    if (!is_array($overrides)) {
        return $out;
    }
    foreach ($fields as $field) {
        if (!empty($overrides[$field]) && is_string($overrides[$field])) {
            $out[$field] = $overrides[$field];
        }
    }
    return $out;
}

function tk_hub_merge_link_labels($base_links, $override_links) {
    if (!is_array($base_links)) {
        return [];
    }
    if (!is_array($override_links) || !$override_links) {
        return $base_links;
    }
    $override_by_href = [];
    foreach ($override_links as $link) {
        if (!is_array($link)) {
            continue;
        }
        $href = $link['href'] ?? '';
        if ($href !== '' && !empty($link['label'])) {
            $override_by_href[$href] = $link['label'];
        }
    }
    $merged = [];
    foreach ($base_links as $link) {
        if (!is_array($link)) {
            continue;
        }
        $href = $link['href'] ?? '';
        $merged[] = [
            'label' => $override_by_href[$href] ?? ($link['label'] ?? ''),
            'href' => $href,
        ];
    }
    return $merged;
}

function tk_hub_get_hero_for_locale($lang = 'en') {
    $hero = tk_hub_get_hero();
    $lang = tk_hub_resolve_locale($lang);
    if ($lang === 'en') {
        return $hero;
    }

    $stored = get_option('tk_hub_hero', []);
    $translations = is_array($stored['translations'] ?? null) ? $stored['translations'] : [];
    $sw = is_array($translations['sw'] ?? null) ? $translations['sw'] : [];

    $hero = tk_hub_merge_scalar_fields($hero, $sw, ['eyebrow', 'title', 'title_accent', 'subtitle']);

    if (!empty($sw['primary_cta']['label'])) {
        $hero['primary_cta']['label'] = $sw['primary_cta']['label'];
    }
    if (!empty($sw['secondary_cta']['label'])) {
        $hero['secondary_cta']['label'] = $sw['secondary_cta']['label'];
    }

    unset($hero['quick_facts']);
    return $hero;
}

function tk_hub_get_menu_sw_labels_by_href() {
    $locations = get_nav_menu_locations();
    if (empty($locations['tk-main-nav'])) {
        return [];
    }

    $items = wp_get_nav_menu_items((int) $locations['tk-main-nav']);
    if (!$items || is_wp_error($items)) {
        return [];
    }

    $labels = [];
    foreach ($items as $item) {
        if ((string) $item->menu_item_parent !== '0') {
            continue;
        }
        $sw = get_post_meta($item->ID, '_tk_label_sw', true);
        if (!is_string($sw) || $sw === '') {
            continue;
        }
        $labels[tk_hub_menu_path($item->url)] = $sw;
    }

    return $labels;
}

function tk_hub_get_header_for_locale($lang = 'en') {
    $header = tk_hub_get_header();
    $lang = tk_hub_resolve_locale($lang);
    if ($lang === 'en') {
        return $header;
    }

    $stored = get_option('tk_hub_header', []);
    $translations = is_array($stored['translations'] ?? null) ? $stored['translations'] : [];
    $locale = is_array($translations[$lang] ?? null) ? $translations[$lang] : [];

    if (!empty($locale['branding']['tagline'])) {
        $header['branding']['tagline'] = $locale['branding']['tagline'];
    }

    if ($lang !== 'sw') {
        return $header;
    }

    $sw = $locale;
    if (!empty($sw['topbar']['status_text'])) {
        $header['topbar']['status_text'] = $sw['topbar']['status_text'];
    }
    if (!empty($sw['cta']['label'])) {
        $header['cta']['label'] = $sw['cta']['label'];
    }

    $menu_sw_labels = tk_hub_get_menu_sw_labels_by_href();
    if ($menu_sw_labels) {
        $nav = [];
        foreach ($header['nav_links'] ?? [] as $link) {
            if (!is_array($link)) {
                continue;
            }
            $href = $link['href'] ?? '';
            $nav[] = [
                'label' => $menu_sw_labels[$href] ?? ($link['label'] ?? ''),
                'href' => $href,
            ];
        }
        if ($nav) {
            $header['nav_links'] = $nav;
        }
    } elseif (!empty($sw['nav_links']) && is_array($sw['nav_links'])) {
        $header['nav_links'] = tk_hub_merge_link_labels($header['nav_links'] ?? [], $sw['nav_links']);
    }
    if (!empty($sw['topbar']['links']) && is_array($sw['topbar']['links'])) {
        $header['topbar']['links'] = tk_hub_merge_link_labels($header['topbar']['links'] ?? [], $sw['topbar']['links']);
    }

    return $header;
}

function tk_hub_default_home_sections() {
    return [
        'about' => [
            'eyebrow' => 'About Karamoja',
            'title_line_1' => 'Karamoja',
            'title_line_2' => 'Climate Change Knowledge and Information',
            'description' => 'Karamoja Climate Change Knowledge and Information is a public-facing web platform that delivers early warnings, climate reports, community services, and partner information to pastoral and agropastoral communities across Turkana County (Lokiriama and Loima Sub-Counties) and West Pokot County (Pokot North Sub-County), Kenya; and Moroto, Amudat, and Napak Districts, Uganda. Spanning the border communities of Kenya and Uganda, the platform draws on national meteorological and government data sources to deliver clear, actionable climate intelligence to communities, county and national government directorates, and partner organizations — supporting better adaptation, resilience, and peaceful coexistence across the region.',
            'partner_count_label' => 'Partner Organisations',
            'cta_label' => 'More About Karamoja',
            'highlights' => [
                ['title' => 'Commissioned by', 'desc' => 'Danish Refugee Council — Karamoja Strong Project (KSP)'],
                ['title' => 'Early Warning Systems', 'desc' => 'Climate and hazard alerts to support community preparedness and cascade early warning information across the region.'],
                ['title' => 'Adaptation Strategies & Best Practices', 'desc' => 'Climate-smart agriculture, pastoralist mobility, and community-based natural resource management guides — supporting sustainable livelihoods and reducing resource-driven conflict.'],
            ],
        ],
        'get_involved' => [
            'eyebrow' => 'Get Involved',
            'heading' => 'Partner with Karamoja Strong Project',
            'body' => 'NGOs, UN agencies, government bodies and community organisations can register, submit climate advisories and reports, and contribute to cross-border resilience across the Karamoja Cluster.',
            'button_label' => 'Get Involved',
        ],
        'map' => [
            'eyebrow' => 'Geographic Coverage',
            'title' => 'Regional Coverage Map',
            'subtitle' => 'Interactive view of climate monitoring stations, published advisories, and key communities across Turkana County (Lokiriama and Loima Sub-Counties) and West Pokot County (Pokot North Sub-County), Kenya; and Moroto, Amudat, and Napak Districts, Uganda — pastoral communities linked across the Kenya–Uganda frontier. Click any marker for details.',
        ],
        'footer' => [
            'meta_description' => 'Climate change knowledge and information for pastoral communities in the Karamoja Cluster.',
            'column_karamoja' => 'Karamoja',
            'column_services' => 'Services',
            'column_regions' => 'Regions',
            'column_contact' => 'Contact',
            'contact_link' => 'Contact Us →',
            'links_karamoja' => ['About Karamoja', 'Our Partners', 'Data Sources', 'API Access', 'Methodology'],
            'links_services' => ['Early Warnings', 'Weather Forecasts', 'Community Bulletins', 'Submit Advisory', 'Donor Portal'],
        ],
        'translations' => ['sw' => []],
    ];
}

function tk_hub_sanitize_home_sections($input) {
    if (!is_array($input)) {
        return tk_hub_default_home_sections();
    }

    $default = tk_hub_default_home_sections();
    $existing = get_option('tk_hub_home_sections', $default);
    if (!is_array($existing)) {
        $existing = $default;
    }

    $out = $existing;
    $sw_in = is_array($input['translations']['sw'] ?? null) ? $input['translations']['sw'] : [];
    $sw = [];

    $text_fields = function ($arr, $keys) {
        $row = [];
        foreach ($keys as $key) {
            $row[$key] = sanitize_text_field($arr[$key] ?? '');
        }
        return $row;
    };

    if (isset($sw_in['about']) && is_array($sw_in['about'])) {
        $a = $sw_in['about'];
        $sw['about'] = $text_fields($a, ['eyebrow', 'title_line_1', 'title_line_2', 'partner_count_label', 'cta_label']);
        $sw['about']['description'] = sanitize_textarea_field($a['description'] ?? '');
        $sw['about']['highlights'] = [];
        if (isset($a['highlights']) && is_array($a['highlights'])) {
            foreach ($a['highlights'] as $h) {
                if (!is_array($h)) {
                    continue;
                }
                $sw['about']['highlights'][] = [
                    'title' => sanitize_text_field($h['title'] ?? ''),
                    'desc' => sanitize_textarea_field($h['desc'] ?? ''),
                ];
            }
        }
    }

    if (isset($sw_in['get_involved']) && is_array($sw_in['get_involved'])) {
        $g = $sw_in['get_involved'];
        $sw['get_involved'] = [
            'eyebrow' => sanitize_text_field($g['eyebrow'] ?? ''),
            'heading' => sanitize_text_field($g['heading'] ?? ''),
            'body' => sanitize_textarea_field($g['body'] ?? ''),
            'button_label' => sanitize_text_field($g['button_label'] ?? ''),
        ];
    }

    if (isset($sw_in['map']) && is_array($sw_in['map'])) {
        $m = $sw_in['map'];
        $sw['map'] = [
            'eyebrow' => sanitize_text_field($m['eyebrow'] ?? ''),
            'title' => sanitize_text_field($m['title'] ?? ''),
            'subtitle' => sanitize_textarea_field($m['subtitle'] ?? ''),
        ];
    }

    if (isset($sw_in['footer']) && is_array($sw_in['footer'])) {
        $f = $sw_in['footer'];
        $sw['footer'] = $text_fields($f, ['meta_description', 'column_karamoja', 'column_services', 'column_regions', 'column_contact', 'contact_link']);
        $sw['footer']['meta_description'] = sanitize_textarea_field($f['meta_description'] ?? '');
        foreach (['links_karamoja', 'links_services'] as $list_key) {
            $sw['footer'][$list_key] = [];
            if (isset($f[$list_key]) && is_array($f[$list_key])) {
                foreach ($f[$list_key] as $label) {
                    $label = sanitize_text_field($label);
                    if ($label !== '') {
                        $sw['footer'][$list_key][] = $label;
                    }
                }
            }
        }
    }

    $out['translations']['sw'] = $sw;
    return $out;
}

function tk_hub_merge_home_section_group($base, $override, $scalar_fields) {
    if (!is_array($base)) {
        return [];
    }
    if (!is_array($override)) {
        return $base;
    }
    $out = $base;
    foreach ($scalar_fields as $field) {
        if (!empty($override[$field])) {
            $out[$field] = $override[$field];
        }
    }
    return $out;
}

function tk_hub_get_home_sections_for_locale($lang = 'en') {
    $stored = get_option('tk_hub_home_sections');
    $base = is_array($stored) ? wp_parse_args($stored, tk_hub_default_home_sections()) : tk_hub_default_home_sections();
    $lang = tk_hub_resolve_locale($lang);

    if ($lang === 'en') {
        unset($base['translations']);
        return $base;
    }

    $sw = is_array($base['translations']['sw'] ?? null) ? $base['translations']['sw'] : [];

    $about = $base['about'] ?? [];
    if (!empty($sw['about'])) {
        $about = tk_hub_merge_home_section_group($about, $sw['about'], ['eyebrow', 'title_line_1', 'title_line_2', 'description', 'partner_count_label', 'cta_label']);
        if (!empty($sw['about']['highlights']) && is_array($sw['about']['highlights'])) {
            $highlights = [];
            foreach (($about['highlights'] ?? []) as $i => $h) {
                $ov = $sw['about']['highlights'][$i] ?? [];
                $highlights[] = [
                    'title' => tk_hub_pick_translation($ov['title'] ?? '', $h['title'] ?? ''),
                    'desc' => tk_hub_pick_translation($ov['desc'] ?? '', $h['desc'] ?? ''),
                ];
            }
            $about['highlights'] = $highlights;
        }
    }

    $get_involved = tk_hub_merge_home_section_group(
        $base['get_involved'] ?? [],
        $sw['get_involved'] ?? [],
        ['eyebrow', 'heading', 'body', 'button_label']
    );

    $map = tk_hub_merge_home_section_group(
        $base['map'] ?? [],
        $sw['map'] ?? [],
        ['eyebrow', 'title', 'subtitle']
    );

    $footer = $base['footer'] ?? [];
    if (!empty($sw['footer'])) {
        $footer = tk_hub_merge_home_section_group($footer, $sw['footer'], [
            'meta_description', 'column_karamoja', 'column_services', 'column_regions', 'column_contact', 'contact_link',
        ]);
        foreach (['links_karamoja', 'links_services'] as $list_key) {
            if (!empty($sw['footer'][$list_key]) && is_array($sw['footer'][$list_key])) {
                $merged = [];
                foreach (($footer[$list_key] ?? []) as $i => $label) {
                    $merged[] = tk_hub_pick_translation($sw['footer'][$list_key][$i] ?? '', $label);
                }
                $footer[$list_key] = $merged;
            }
        }
    }

    return [
        'about' => $about,
        'get_involved' => $get_involved,
        'map' => $map,
        'footer' => $footer,
    ];
}

function tk_hub_sanitize_hero_translations($input, $existing) {
    if (!is_array($input)) {
        return $existing;
    }
    $out = is_array($existing) ? $existing : tk_hub_default_hero();

    $out['eyebrow'] = sanitize_text_field($input['eyebrow'] ?? $out['eyebrow'] ?? '');
    $out['title'] = sanitize_text_field($input['title'] ?? $out['title'] ?? '');
    $out['title_accent'] = sanitize_text_field($input['title_accent'] ?? $out['title_accent'] ?? '');
    $out['subtitle'] = sanitize_textarea_field($input['subtitle'] ?? $out['subtitle'] ?? '');
    $out['background_image'] = esc_url_raw($input['background_image'] ?? $out['background_image'] ?? '');

    if (isset($input['primary_cta']) && is_array($input['primary_cta'])) {
        $out['primary_cta']['label'] = sanitize_text_field($input['primary_cta']['label'] ?? $out['primary_cta']['label'] ?? '');
        $out['primary_cta']['href'] = sanitize_text_field($input['primary_cta']['href'] ?? $out['primary_cta']['href'] ?? '');
    }
    if (isset($input['secondary_cta']) && is_array($input['secondary_cta'])) {
        $out['secondary_cta']['label'] = sanitize_text_field($input['secondary_cta']['label'] ?? $out['secondary_cta']['label'] ?? '');
        $out['secondary_cta']['href'] = sanitize_text_field($input['secondary_cta']['href'] ?? $out['secondary_cta']['href'] ?? '');
    }
    if (isset($input['overview']) && is_array($input['overview'])) {
        $out['overview']['title'] = sanitize_text_field($input['overview']['title'] ?? $out['overview']['title'] ?? '');
        $out['overview']['subtitle'] = sanitize_text_field($input['overview']['subtitle'] ?? $out['overview']['subtitle'] ?? '');
        $out['overview']['footer'] = sanitize_textarea_field($input['overview']['footer'] ?? $out['overview']['footer'] ?? '');
    }

    if (isset($input['translations']['sw']) && is_array($input['translations']['sw'])) {
        $sw = $input['translations']['sw'];
        $out['translations']['sw'] = [
            'eyebrow' => sanitize_text_field($sw['eyebrow'] ?? ''),
            'title' => sanitize_text_field($sw['title'] ?? ''),
            'title_accent' => sanitize_text_field($sw['title_accent'] ?? ''),
            'subtitle' => sanitize_textarea_field($sw['subtitle'] ?? ''),
            'primary_cta' => [
                'label' => sanitize_text_field($sw['primary_cta']['label'] ?? ''),
            ],
            'secondary_cta' => [
                'label' => sanitize_text_field($sw['secondary_cta']['label'] ?? ''),
            ],
        ];
    }

    unset($out['quick_facts']);
    if (isset($out['translations']['sw'])) {
        unset($out['translations']['sw']['quick_facts']);
    }

    return $out;
}

function tk_hub_sanitize_header_translations($input, $out) {
    $existing = is_array($out['translations'] ?? null) ? $out['translations'] : [];

    if (isset($input['translations']) && is_array($input['translations'])) {
        foreach (tk_hub_branding_languages() as $code => $meta) {
            if (!isset($input['translations'][$code]['branding']['tagline'])) {
                continue;
            }
            if (!isset($existing[$code]) || !is_array($existing[$code])) {
                $existing[$code] = [];
            }
            if (!isset($existing[$code]['branding']) || !is_array($existing[$code]['branding'])) {
                $existing[$code]['branding'] = [];
            }
            $tagline = sanitize_textarea_field($input['translations'][$code]['branding']['tagline'] ?? '');
            if ($tagline === '') {
                unset($existing[$code]['branding']['tagline']);
            } else {
                $existing[$code]['branding']['tagline'] = $tagline;
            }
        }
    }

    if (!isset($input['translations']['sw']) || !is_array($input['translations']['sw'])) {
        $out['translations'] = $existing;
        return $out;
    }

    $sw = $input['translations']['sw'];
    if (!isset($existing['sw']) || !is_array($existing['sw'])) {
        $existing['sw'] = [];
    }

    if (isset($sw['topbar']['status_text'])) {
        if (!isset($existing['sw']['topbar']) || !is_array($existing['sw']['topbar'])) {
            $existing['sw']['topbar'] = ['links' => []];
        }
        $existing['sw']['topbar']['status_text'] = sanitize_text_field($sw['topbar']['status_text']);
    }

    if (isset($sw['cta']['label'])) {
        $existing['sw']['cta'] = [
            'label' => sanitize_text_field($sw['cta']['label']),
        ];
    }

    if (isset($sw['topbar']['links']) && is_array($sw['topbar']['links'])) {
        if (!isset($existing['sw']['topbar']) || !is_array($existing['sw']['topbar'])) {
            $existing['sw']['topbar'] = ['status_text' => ''];
        }
        $existing['sw']['topbar']['links'] = [];
        foreach ($sw['topbar']['links'] as $link) {
            if (!is_array($link)) {
                continue;
            }
            $existing['sw']['topbar']['links'][] = [
                'href' => sanitize_text_field($link['href'] ?? ''),
                'label' => sanitize_text_field($link['label'] ?? ''),
            ];
        }
    }

    if (isset($sw['nav_links']) && is_array($sw['nav_links'])) {
        $existing['sw']['nav_links'] = [];
        foreach ($sw['nav_links'] as $link) {
            if (!is_array($link)) {
                continue;
            }
            $existing['sw']['nav_links'][] = [
                'href' => sanitize_text_field($link['href'] ?? ''),
                'label' => sanitize_text_field($link['label'] ?? ''),
            ];
        }
    }

    $out['translations'] = $existing;
    return $out;
}

function tk_hub_get_header_tagline_translations() {
    $header = get_option('tk_hub_header', tk_hub_default_header());
    $translations = is_array($header['translations'] ?? null) ? $header['translations'] : [];
    $out = [];
    foreach (tk_hub_branding_languages() as $code => $meta) {
        $out[$code] = $translations[$code]['branding']['tagline'] ?? '';
    }
    return $out;
}

function tk_hub_render_branding_tagline_translations($english_tagline) {
    $translations = tk_hub_get_header_tagline_translations();
    $languages = tk_hub_branding_languages();
    ?>
    <div class="tk-hub-branding-card tk-hub-translations-card">
        <div class="tk-hub-branding-card-head">
            <h2><?php esc_html_e('Tagline translations', 'turkana-headless'); ?></h2>
            <p><?php esc_html_e('Optional translations shown when visitors choose a language on the public site. Empty fields fall back to English.', 'turkana-headless'); ?></p>
        </div>
        <div class="tk-hub-branding-card-body">
            <div class="tk-lang-tabs" role="tablist" aria-label="<?php esc_attr_e('Tagline languages', 'turkana-headless'); ?>">
                <?php foreach ($languages as $code => $meta) : ?>
                    <button
                        type="button"
                        class="tk-lang-tab<?php echo $code === 'sw' ? ' is-active' : ''; ?>"
                        role="tab"
                        aria-selected="<?php echo $code === 'sw' ? 'true' : 'false'; ?>"
                        data-lang="<?php echo esc_attr($code); ?>"
                    >
                        <span class="tk-lang-tab-label"><?php echo esc_html($meta['label']); ?></span>
                        <span class="tk-lang-tab-name"><?php echo esc_html($meta['name']); ?></span>
                    </button>
                <?php endforeach; ?>
            </div>

            <?php foreach ($languages as $code => $meta) : ?>
                <div
                    class="tk-lang-panel<?php echo $code === 'sw' ? ' is-active' : ''; ?>"
                    role="tabpanel"
                    data-lang-panel="<?php echo esc_attr($code); ?>"
                    <?php echo $code === 'sw' ? '' : 'hidden'; ?>
                >
                    <div class="tk-lang-panel-head">
                        <strong><?php echo esc_html($meta['label']); ?></strong>
                        <span><?php echo esc_html($meta['hint']); ?></span>
                    </div>
                    <label class="tk-hub-field" for="tk-hub-tagline-<?php echo esc_attr($code); ?>">
                        <span class="tk-hub-field-label">
                            <?php
                            printf(
                                /* translators: %s: language name */
                                esc_html__('Tagline in %s', 'turkana-headless'),
                                esc_html($meta['label'])
                            );
                            ?>
                        </span>
                        <textarea
                            id="tk-hub-tagline-<?php echo esc_attr($code); ?>"
                            class="tk-hub-tagline-translation"
                            name="tk_hub_header[translations][<?php echo esc_attr($code); ?>][branding][tagline]"
                            rows="3"
                            maxlength="160"
                            data-lang="<?php echo esc_attr($code); ?>"
                            data-preview-target="tagline"
                            placeholder="<?php esc_attr_e('Enter translated tagline…', 'turkana-headless'); ?>"
                        ><?php echo esc_textarea($translations[$code] ?? ''); ?></textarea>
                        <span class="tk-hub-field-hint tk-char-count" data-for="tk-hub-tagline-<?php echo esc_attr($code); ?>">
                            <?php echo esc_html(strlen($translations[$code] ?? '') . ' / 160'); ?>
                        </span>
                    </label>
                    <div class="tk-lang-reference">
                        <span class="tk-lang-reference-label"><?php esc_html_e('English reference', 'turkana-headless'); ?></span>
                        <p class="tk-lang-reference-text"><?php echo esc_html($english_tagline); ?></p>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
    <?php
}

add_action('init', function () {
    if (!get_option('tk_hub_home_sections')) {
        update_option('tk_hub_home_sections', tk_hub_default_home_sections());
    }

    if (get_option('tk_hub_map_coverage_copy_v2')) {
        return;
    }

    $sections = get_option('tk_hub_home_sections');
    if (is_array($sections)) {
        $old = 'across Turkana and North Pokot (Kenya) and Moroto, Amudat and Napak (Uganda)';
        $new = 'across Turkana County (Lokiriama and Loima Sub-Counties) and West Pokot County (Pokot North Sub-County), Kenya; and Moroto, Amudat, and Napak Districts, Uganda';
        $changed = false;

        if (!empty($sections['map']['subtitle']) && str_contains((string) $sections['map']['subtitle'], $old)) {
            $sections['map']['subtitle'] = str_replace($old, $new, $sections['map']['subtitle']);
            $changed = true;
        }

        if (!empty($sections['translations']['sw']['map']['subtitle']) && str_contains((string) $sections['translations']['sw']['map']['subtitle'], $old)) {
            $sections['translations']['sw']['map']['subtitle'] = str_replace($old, $new, $sections['translations']['sw']['map']['subtitle']);
            $changed = true;
        }

        if ($changed) {
            update_option('tk_hub_home_sections', $sections);
        }
    }

    update_option('tk_hub_map_coverage_copy_v2', 1);
}, 6);

add_action('init', function () {
    if (get_option('tk_hub_about_coverage_copy_v3')) {
        return;
    }

    $sections = get_option('tk_hub_home_sections');
    if (is_array($sections)) {
        $old = 'across Turkana and North Pokot in Kenya and Moroto, Amudat and Napak in Uganda';
        $new = 'across Turkana County (Lokiriama and Loima Sub-Counties) and West Pokot County (Pokot North Sub-County), Kenya; and Moroto, Amudat, and Napak Districts, Uganda';
        $changed = false;

        if (!empty($sections['about']['description']) && str_contains((string) $sections['about']['description'], $old)) {
            $sections['about']['description'] = str_replace($old, $new, $sections['about']['description']);
            $changed = true;
        }

        if (!empty($sections['translations']['sw']['about']['description']) && str_contains((string) $sections['translations']['sw']['about']['description'], $old)) {
            $sections['translations']['sw']['about']['description'] = str_replace($old, $new, $sections['translations']['sw']['about']['description']);
            $changed = true;
        }

        if ($changed) {
            update_option('tk_hub_home_sections', $sections);
        }
    }

    update_option('tk_hub_about_coverage_copy_v3', 1);
}, 7);

add_action('init', function () {
    if (get_option('tk_hub_cluster_copy_v5')) {
        return;
    }

    $sections = get_option('tk_hub_home_sections');
    if (is_array($sections)) {
        $changed = false;
        $old_involved = 'across Turkana and Karamoja';
        $new_involved = 'across the Karamoja Cluster';
        $old_footer = 'in Turkana and North Pokot (Kenya) and Moroto, Amudat and Napak (Uganda)';
        $new_footer = 'in the Karamoja Cluster';

        if (!empty($sections['get_involved']['body']) && str_contains((string) $sections['get_involved']['body'], $old_involved)) {
            $sections['get_involved']['body'] = str_replace($old_involved, $new_involved, $sections['get_involved']['body']);
            $changed = true;
        }

        if (!empty($sections['footer']['meta_description']) && str_contains((string) $sections['footer']['meta_description'], $old_footer)) {
            $sections['footer']['meta_description'] = str_replace($old_footer, $new_footer, $sections['footer']['meta_description']);
            $changed = true;
        }

        if (!empty($sections['translations']['sw']['get_involved']['body']) && str_contains((string) $sections['translations']['sw']['get_involved']['body'], $old_involved)) {
            $sections['translations']['sw']['get_involved']['body'] = str_replace($old_involved, $new_involved, $sections['translations']['sw']['get_involved']['body']);
            $changed = true;
        }

        if (!empty($sections['translations']['sw']['footer']['meta_description']) && str_contains((string) $sections['translations']['sw']['footer']['meta_description'], $old_footer)) {
            $sections['translations']['sw']['footer']['meta_description'] = str_replace($old_footer, $new_footer, $sections['translations']['sw']['footer']['meta_description']);
            $changed = true;
        }

        if ($changed) {
            update_option('tk_hub_home_sections', $sections);
        }
    }

    update_option('tk_hub_cluster_copy_v5', 1);
}, 8);

add_action('admin_init', function () {
    register_setting('tk_hub_home_sections_group', 'tk_hub_home_sections', [
        'type' => 'array',
        'sanitize_callback' => 'tk_hub_sanitize_home_sections',
        'default' => tk_hub_default_home_sections(),
    ]);
});

add_action('admin_menu', function () {
    add_theme_page(
        __('Karamoja Home (Translations)', 'turkana-headless'),
        __('Karamoja Home (Translations)', 'turkana-headless'),
        'manage_options',
        'tk-hub-home-sections',
        'tk_hub_home_sections_settings_page'
    );
}, 21);

function tk_hub_home_sections_settings_page() {
    if (!current_user_can('manage_options')) {
        return;
    }

    $sections = get_option('tk_hub_home_sections', tk_hub_default_home_sections());
    if (!is_array($sections)) {
        $sections = tk_hub_default_home_sections();
    }
    $en = tk_hub_default_home_sections();
    $sw = is_array($sections['translations']['sw'] ?? null) ? $sections['translations']['sw'] : [];
    $sw_about = wp_parse_args($sw['about'] ?? [], ['highlights' => []]);
    $sw_get = wp_parse_args($sw['get_involved'] ?? [], []);
    $sw_map = wp_parse_args($sw['map'] ?? [], []);
    $sw_footer = wp_parse_args($sw['footer'] ?? [], ['links_karamoja' => [], 'links_services' => []]);
    ?>
    <div class="wrap">
        <h1><?php esc_html_e('Karamoja Home — Swahili translations', 'turkana-headless'); ?></h1>
        <p><?php esc_html_e('English text is shown for reference. Enter Kiswahili translations below. Empty fields fall back to English on the site.', 'turkana-headless'); ?></p>
        <form method="post" action="options.php">
            <?php settings_fields('tk_hub_home_sections_group'); ?>

            <h2><?php esc_html_e('About section', 'turkana-headless'); ?></h2>
            <table class="form-table">
                <?php
                tk_hub_i18n_render_field('[about][eyebrow]', __('Eyebrow (Sw)', 'turkana-headless'), $sw_about['eyebrow'] ?? '', $en['about']['eyebrow']);
                tk_hub_i18n_render_field('[about][title_line_1]', __('Title line 1 (Sw)', 'turkana-headless'), $sw_about['title_line_1'] ?? '', $en['about']['title_line_1']);
                tk_hub_i18n_render_field('[about][title_line_2]', __('Title line 2 (Sw)', 'turkana-headless'), $sw_about['title_line_2'] ?? '', $en['about']['title_line_2']);
                tk_hub_i18n_render_textarea('[about][description]', __('Description (Sw)', 'turkana-headless'), $sw_about['description'] ?? '', $en['about']['description']);
                tk_hub_i18n_render_field('[about][partner_count_label]', __('Partner count label (Sw)', 'turkana-headless'), $sw_about['partner_count_label'] ?? '', $en['about']['partner_count_label']);
                tk_hub_i18n_render_field('[about][cta_label]', __('CTA button (Sw)', 'turkana-headless'), $sw_about['cta_label'] ?? '', $en['about']['cta_label']);
                ?>
            </table>
            <?php foreach ($en['about']['highlights'] as $i => $highlight) : ?>
                <h3><?php echo esc_html(sprintf(__('Highlight %d', 'turkana-headless'), $i + 1)); ?></h3>
                <p class="description"><?php echo esc_html($highlight['title'] . ' — ' . $highlight['desc']); ?></p>
                <table class="form-table">
                    <tr>
                        <th><?php esc_html_e('Title (Sw)', 'turkana-headless'); ?></th>
                        <td><input type="text" class="large-text" name="tk_hub_home_sections[translations][sw][about][highlights][<?php echo (int) $i; ?>][title]" value="<?php echo esc_attr($sw_about['highlights'][$i]['title'] ?? ''); ?>" /></td>
                    </tr>
                    <tr>
                        <th><?php esc_html_e('Description (Sw)', 'turkana-headless'); ?></th>
                        <td><textarea class="large-text" rows="2" name="tk_hub_home_sections[translations][sw][about][highlights][<?php echo (int) $i; ?>][desc]"><?php echo esc_textarea($sw_about['highlights'][$i]['desc'] ?? ''); ?></textarea></td>
                    </tr>
                </table>
            <?php endforeach; ?>

            <h2><?php esc_html_e('Get Involved section', 'turkana-headless'); ?></h2>
            <table class="form-table">
                <?php
                tk_hub_i18n_render_field('[get_involved][eyebrow]', __('Eyebrow (Sw)', 'turkana-headless'), $sw_get['eyebrow'] ?? '', $en['get_involved']['eyebrow']);
                tk_hub_i18n_render_field('[get_involved][heading]', __('Heading (Sw)', 'turkana-headless'), $sw_get['heading'] ?? '', $en['get_involved']['heading']);
                tk_hub_i18n_render_textarea('[get_involved][body]', __('Body (Sw)', 'turkana-headless'), $sw_get['body'] ?? '', $en['get_involved']['body']);
                tk_hub_i18n_render_field('[get_involved][button_label]', __('Button (Sw)', 'turkana-headless'), $sw_get['button_label'] ?? '', $en['get_involved']['button_label']);
                ?>
            </table>

            <h2><?php esc_html_e('Map section', 'turkana-headless'); ?></h2>
            <table class="form-table">
                <?php
                tk_hub_i18n_render_field('[map][eyebrow]', __('Eyebrow (Sw)', 'turkana-headless'), $sw_map['eyebrow'] ?? '', $en['map']['eyebrow']);
                tk_hub_i18n_render_field('[map][title]', __('Title (Sw)', 'turkana-headless'), $sw_map['title'] ?? '', $en['map']['title']);
                tk_hub_i18n_render_textarea('[map][subtitle]', __('Subtitle (Sw)', 'turkana-headless'), $sw_map['subtitle'] ?? '', $en['map']['subtitle']);
                ?>
            </table>

            <h2><?php esc_html_e('Footer', 'turkana-headless'); ?></h2>
            <table class="form-table">
                <?php
                tk_hub_i18n_render_textarea('[footer][meta_description]', __('Meta blurb (Sw)', 'turkana-headless'), $sw_footer['meta_description'] ?? '', $en['footer']['meta_description']);
                tk_hub_i18n_render_field('[footer][column_karamoja]', __('Column: Karamoja (Sw)', 'turkana-headless'), $sw_footer['column_karamoja'] ?? '', $en['footer']['column_karamoja']);
                tk_hub_i18n_render_field('[footer][column_services]', __('Column: Services (Sw)', 'turkana-headless'), $sw_footer['column_services'] ?? '', $en['footer']['column_services']);
                tk_hub_i18n_render_field('[footer][column_regions]', __('Column: Regions (Sw)', 'turkana-headless'), $sw_footer['column_regions'] ?? '', $en['footer']['column_regions']);
                tk_hub_i18n_render_field('[footer][column_contact]', __('Column: Contact (Sw)', 'turkana-headless'), $sw_footer['column_contact'] ?? '', $en['footer']['column_contact']);
                tk_hub_i18n_render_field('[footer][contact_link]', __('Contact link (Sw)', 'turkana-headless'), $sw_footer['contact_link'] ?? '', $en['footer']['contact_link']);
                ?>
            </table>
            <?php foreach ($en['footer']['links_karamoja'] as $i => $label) : ?>
                <p><strong><?php echo esc_html($label); ?></strong></p>
                <input type="text" class="regular-text" name="tk_hub_home_sections[translations][sw][footer][links_karamoja][<?php echo (int) $i; ?>]" value="<?php echo esc_attr($sw_footer['links_karamoja'][$i] ?? ''); ?>" placeholder="Kiswahili label" />
            <?php endforeach; ?>
            <h3><?php esc_html_e('Services links', 'turkana-headless'); ?></h3>
            <?php foreach ($en['footer']['links_services'] as $i => $label) : ?>
                <p><strong><?php echo esc_html($label); ?></strong></p>
                <input type="text" class="regular-text" name="tk_hub_home_sections[translations][sw][footer][links_services][<?php echo (int) $i; ?>]" value="<?php echo esc_attr($sw_footer['links_services'][$i] ?? ''); ?>" placeholder="Kiswahili label" />
            <?php endforeach; ?>

            <?php submit_button(__('Save Swahili translations', 'turkana-headless')); ?>
        </form>
        <p>REST: <code><?php echo esc_html(rest_url('tk/v1/home-sections')); ?>?lang=sw</code></p>
    </div>
    <?php
}

function tk_hub_i18n_render_field($name, $label, $value, $en_reference) {
    $field = 'tk_hub_home_sections[translations][sw]' . $name;
    ?>
    <tr>
        <th scope="row"><?php echo esc_html($label); ?></th>
        <td>
            <input type="text" class="large-text" name="<?php echo esc_attr($field); ?>" value="<?php echo esc_attr($value); ?>" />
            <p class="description"><?php esc_html_e('English:', 'turkana-headless'); ?> <?php echo esc_html($en_reference); ?></p>
        </td>
    </tr>
    <?php
}

function tk_hub_i18n_render_textarea($name, $label, $value, $en_reference) {
    $field = 'tk_hub_home_sections[translations][sw]' . $name;
    ?>
    <tr>
        <th scope="row"><?php echo esc_html($label); ?></th>
        <td>
            <textarea class="large-text" rows="3" name="<?php echo esc_attr($field); ?>"><?php echo esc_textarea($value); ?></textarea>
            <p class="description"><?php esc_html_e('English:', 'turkana-headless'); ?> <?php echo esc_html(wp_trim_words($en_reference, 24)); ?></p>
        </td>
    </tr>
    <?php
}

function tk_hub_render_hero_swahili_fields($hero) {
    $sw = is_array($hero['translations']['sw'] ?? null) ? $hero['translations']['sw'] : [];
    ?>
    <h2><?php esc_html_e('Swahili (Kiswahili)', 'turkana-headless'); ?></h2>
    <table class="form-table">
        <tr><th>Eyebrow</th><td><input type="text" class="large-text" name="tk_hub_hero[translations][sw][eyebrow]" value="<?php echo esc_attr($sw['eyebrow'] ?? ''); ?>" /></td></tr>
        <tr><th>Title line 1</th><td><input type="text" class="regular-text" name="tk_hub_hero[translations][sw][title]" value="<?php echo esc_attr($sw['title'] ?? ''); ?>" /></td></tr>
        <tr><th>Title line 2 (accent)</th><td><input type="text" class="regular-text" name="tk_hub_hero[translations][sw][title_accent]" value="<?php echo esc_attr($sw['title_accent'] ?? ''); ?>" /></td></tr>
        <tr><th>Subtitle</th><td><textarea class="large-text" rows="3" name="tk_hub_hero[translations][sw][subtitle]"><?php echo esc_textarea($sw['subtitle'] ?? ''); ?></textarea></td></tr>
        <tr><th>Primary button</th><td><input type="text" name="tk_hub_hero[translations][sw][primary_cta][label]" value="<?php echo esc_attr($sw['primary_cta']['label'] ?? ''); ?>" class="regular-text" /></td></tr>
        <tr><th>Secondary button</th><td><input type="text" name="tk_hub_hero[translations][sw][secondary_cta][label]" value="<?php echo esc_attr($sw['secondary_cta']['label'] ?? ''); ?>" class="regular-text" /></td></tr>
    </table>
    <?php
}

function tk_hub_render_header_swahili_fields($header) {
    $header = tk_hub_get_header();
    $sw = is_array(get_option('tk_hub_header', [])['translations']['sw'] ?? null)
        ? get_option('tk_hub_header', [])['translations']['sw']
        : [];
    if (!is_array($sw)) {
        $sw = [];
    }
    ?>
    <h2><?php esc_html_e('Swahili (Kiswahili)', 'turkana-headless'); ?></h2>
    <p class="description"><?php esc_html_e('Tagline translations are managed under Appearance → Site Logo.', 'turkana-headless'); ?></p>
    <table class="form-table">
        <tr>
            <th><?php esc_html_e('Top bar status', 'turkana-headless'); ?></th>
            <td><input type="text" class="large-text" name="tk_hub_header[translations][sw][topbar][status_text]" value="<?php echo esc_attr($sw['topbar']['status_text'] ?? ''); ?>" /></td>
        </tr>
        <tr>
            <th><?php esc_html_e('CTA label', 'turkana-headless'); ?></th>
            <td><input type="text" class="regular-text" name="tk_hub_header[translations][sw][cta][label]" value="<?php echo esc_attr($sw['cta']['label'] ?? ''); ?>" /></td>
        </tr>
    </table>
    <p class="description">
        <?php esc_html_e('Navigation link translations are managed on each menu item under Appearance → Menus (field: Swahili label).', 'turkana-headless'); ?>
    </p>
    <h3><?php esc_html_e('Top bar links (Swahili)', 'turkana-headless'); ?></h3>
    <?php foreach (($header['topbar']['links'] ?? []) as $i => $link) : ?>
        <p>
            <strong><?php echo esc_html($link['label']); ?></strong>
            <code><?php echo esc_html($link['href']); ?></code><br />
            <input type="hidden" name="tk_hub_header[translations][sw][topbar][links][<?php echo (int) $i; ?>][href]" value="<?php echo esc_attr($link['href']); ?>" />
            <input type="text" class="regular-text" name="tk_hub_header[translations][sw][topbar][links][<?php echo (int) $i; ?>][label]" value="<?php echo esc_attr($sw['topbar']['links'][$i]['label'] ?? ''); ?>" placeholder="Kiswahili label" />
        </p>
    <?php endforeach;
}

add_action('wp_nav_menu_item_custom_fields', function ($item_id, $item, $depth, $args) {
    if ($depth > 0) {
        return;
    }
    $value = get_post_meta($item_id, '_tk_label_sw', true);
    ?>
    <p class="field-sw-label description description-wide">
        <label for="edit-menu-item-sw-label-<?php echo (int) $item_id; ?>">
            <?php esc_html_e('Swahili label (Kiswahili)', 'turkana-headless'); ?><br />
            <input
                type="text"
                id="edit-menu-item-sw-label-<?php echo (int) $item_id; ?>"
                class="widefat edit-menu-item-sw-label"
                name="menu-item-sw-label[<?php echo (int) $item_id; ?>]"
                value="<?php echo esc_attr($value); ?>"
                placeholder="<?php esc_attr_e('Leave blank to use English navigation label', 'turkana-headless'); ?>"
            />
        </label>
        <span class="description"><?php esc_html_e('Shown when visitors choose Kiswahili on the Karamoja site.', 'turkana-headless'); ?></span>
    </p>
    <?php
}, 10, 4);

add_action('wp_update_nav_menu_item', function ($menu_id, $menu_item_db_id) {
    if (!current_user_can('edit_theme_options')) {
        return;
    }
    if (!isset($_POST['menu-item-sw-label'][$menu_item_db_id])) {
        return;
    }
    $label = sanitize_text_field(wp_unslash($_POST['menu-item-sw-label'][$menu_item_db_id]));
    if ($label === '') {
        delete_post_meta($menu_item_db_id, '_tk_label_sw');
        return;
    }
    update_post_meta($menu_item_db_id, '_tk_label_sw', $label);
}, 10, 2);
