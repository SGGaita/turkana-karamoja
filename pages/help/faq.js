import { useState } from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Chip, Divider, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import Layout from '../../components/Layout';
import PageHero from '../../components/PageHero';
import { faqCategories, contactInfo } from '../../lib/docs/faq-data';
import { APP_NAME } from '../../lib/branding';

export default function HelpFaq() {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Layout title="FAQ">
      <PageHero
        title="Frequently Asked Questions"
        subtitle={`Find answers to common questions about ${APP_NAME}`}
        image="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&q=70"
        breadcrumbs={['Help', 'FAQ']}
      />

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        <Button
          component={Link}
          href="/help"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 3, color: '#5A5A5A', textTransform: 'none' }}
        >
          Back to Help Center
        </Button>

        <Box sx={{ mb: 5 }}>
          <Typography sx={{ fontSize: '1rem', color: '#5A5A5A', lineHeight: 1.75, mb: 3 }}>
            Browse frequently asked questions organized by category. For detailed walkthroughs, see the{' '}
            <Link href="/help/user-guide" style={{ color: '#C1440E' }}>Frontend User Guide</Link> or{' '}
            <Link href="/help/admin-guide" style={{ color: '#C1440E' }}>Backend & Admin Guide</Link>.
          </Typography>
        </Box>

        {faqCategories.map((category, catIndex) => (
          <Box key={category.category} sx={{ mb: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Chip
                label={category.category}
                sx={{ bgcolor: category.color, color: 'white', fontWeight: 700, fontSize: '0.85rem', px: 1 }}
              />
              <Typography sx={{ fontSize: '0.75rem', color: '#9A9A9A' }}>
                {category.questions.length} questions
              </Typography>
            </Box>

            {category.questions.map((faq, qIndex) => {
              const panelId = `panel-${catIndex}-${qIndex}`;
              return (
                <Accordion
                  key={panelId}
                  expanded={expanded === panelId}
                  onChange={handleChange(panelId)}
                  sx={{
                    mb: 1.5,
                    border: '1px solid #E8E0D5',
                    borderRadius: '8px !important',
                    '&:before': { display: 'none' },
                    boxShadow: 'none',
                    '&.Mui-expanded': { borderColor: category.color, boxShadow: `0 4px 12px ${category.color}20` },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: category.color }} />}
                    sx={{
                      bgcolor: expanded === panelId ? `${category.color}08` : 'white',
                      '&:hover': { bgcolor: `${category.color}08` },
                      borderRadius: '8px',
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#3D2B1F' }}>
                      {faq.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ bgcolor: 'white', pt: 2, pb: 3 }}>
                    <Typography sx={{ fontSize: '0.88rem', color: '#5A5A5A', lineHeight: 1.7 }}>
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        ))}

        <Divider sx={{ my: 6 }} />

        <Box>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.6rem', md: '2rem' }, color: '#3D2B1F', mb: 3 }}>
            Still Need Help?
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', color: '#5A5A5A', lineHeight: 1.7, mb: 4 }}>
            If you could not find the answer, reach out to our support team or consult the full documentation.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 4 }}>
            {contactInfo.map((contact) => (
              <Box
                key={contact.label}
                sx={{
                  bgcolor: 'white',
                  border: '1px solid #E8E0D5',
                  borderRadius: 2,
                  p: 3,
                }}
              >
                <Typography sx={{ fontSize: '0.75rem', color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
                  {contact.label}
                </Typography>
                <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#C1440E', mb: 0.3 }}>
                  {contact.value}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#5A5A5A' }}>
                  {contact.description}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button component={Link} href="/help/user-guide" variant="outlined" sx={{ borderColor: '#C1440E', color: '#C1440E' }}>
              Frontend User Guide
            </Button>
            <Button component={Link} href="/help/technical" variant="outlined" sx={{ borderColor: '#3D2B1F', color: '#3D2B1F' }}>
              Technical Documentation
            </Button>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
}
