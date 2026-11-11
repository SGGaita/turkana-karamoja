import { useEffect, useState } from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Chip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpLayout, { HelpUnavailable, helpRichTextSx } from '../../components/HelpLayout';
import { useLanguage } from '../../contexts/LanguageContext';
import { pickLocale } from '../../lib/cms-alerts';
import { inAllLocales } from '../../lib/cms';
import { GUIDES, faqFromCms, getHelpFaq, helpCopy, helpPageAllLocales, helpStaticProps, topicsAllLocales } from '../../lib/cms-help';

export default function HelpFaq({ unavailable, faqByLocale, topicsByLocale, pageByLocale }) {
  const { locale, t } = useLanguage();
  const copy = helpCopy(pageByLocale, locale);
  const categories = pickLocale(faqByLocale, locale) || [];
  const topics = pickLocale(topicsByLocale, locale) || { guides: {} };
  const [expanded, setExpanded] = useState(false);

  // A link to /help/faq#<question> opens that question.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id && categories.some((c) => c.items.some((i) => i.slug === id))) {
      setExpanded(id);
      // After the answer has opened and the page has settled.
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }), 300);
    }
  }, [faqByLocale]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <HelpLayout
      title={copy.faq.title}
      subtitle={copy.faq.subtitle}
      image={copy.hero.image}
      breadcrumbs={['Help', copy.faq.title]}
      guides={GUIDES.map((g) => topics.guides[g]).filter(Boolean)}
      active="faq"
      faqLabel={copy.faq.title}
      contact={copy.contact}
    >
      {unavailable && <HelpUnavailable />}
      {categories.map((category) => (
        <Box component="section" key={category.slug} sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Chip component="h2" label={category.name} sx={{ bgcolor: category.color, color: 'white', fontWeight: 700, fontSize: '0.85rem', px: 1 }} />
            <Typography sx={{ fontSize: '0.75rem', color: '#9A9A9A' }}>{t('help.questions', { n: category.items.length })}</Typography>
          </Box>
          {category.items.map((faq) => (
            <Accordion
              key={faq.slug}
              id={faq.slug}
              expanded={expanded === faq.slug}
              onChange={(e, open) => setExpanded(open ? faq.slug : false)}
              sx={{
                mb: 1.5,
                scrollMarginTop: 170,
                border: '1px solid #E8E0D5',
                borderRadius: '8px !important',
                '&:before': { display: 'none' },
                boxShadow: 'none',
                '&.Mui-expanded': { borderColor: category.color, boxShadow: `0 4px 12px ${category.color}20` },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: category.color }} />} sx={{ borderRadius: '8px', '&:hover': { bgcolor: `${category.color}08` } }}>
                <Typography component="h3" sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#3D2B1F' }}>{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 1, pb: 2.5 }}>
                <Box sx={{ ...helpRichTextSx, fontSize: '0.9rem', '& p:last-child': { mb: 0 } }} dangerouslySetInnerHTML={{ __html: faq.answer }} />
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ))}
    </HelpLayout>
  );
}

export async function getStaticProps() {
  return helpStaticProps(async () => {
    const [faqByLocale, topicsByLocale, pageByLocale] = await Promise.all([
      inAllLocales((l) => getHelpFaq(l).then(faqFromCms)),
      topicsAllLocales(),
      helpPageAllLocales(),
    ]);
    return { faqByLocale, topicsByLocale, pageByLocale };
  });
}
