import { useEffect, useState } from 'react';
import { Box, Typography, List, ListItemButton, ListItemText, Divider, Paper } from '@mui/material';
import Link from 'next/link';
import Layout from './Layout';
import PageHero from './PageHero';
import DocImagePlaceholder from './DocImagePlaceholder';
import { helpNav } from '../lib/docs/nav';

function DocSidebar({ sections, activeSlug }) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid #E8E0D5',
        borderRadius: 2,
        p: 2,
        position: { md: 'sticky' },
        top: { md: 100 },
        maxHeight: { md: 'calc(100vh - 120px)' },
        overflowY: { md: 'auto' },
      }}
    >
      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#9A9A9A', letterSpacing: '0.08em', mb: 1.5, textTransform: 'uppercase' }}>
        Documentation
      </Typography>
      <List dense disablePadding sx={{ mb: 2 }}>
        {helpNav.map((item) => (
          <ListItemButton
            key={item.href}
            component={Link}
            href={item.href}
            selected={item.slug === activeSlug}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              '&.Mui-selected': { bgcolor: '#C1440E12', color: '#C1440E' },
            }}
          >
            <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }} />
          </ListItemButton>
        ))}
      </List>
      <Divider sx={{ my: 1.5 }} />
      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#9A9A9A', letterSpacing: '0.08em', mb: 1, textTransform: 'uppercase' }}>
        On this page
      </Typography>
      <List dense disablePadding>
        {sections.map((section) => (
          <ListItemButton
            key={section.id}
            component="a"
            href={`#${section.id}`}
            sx={{ borderRadius: 1, py: 0.5 }}
          >
            <ListItemText primary={section.title} primaryTypographyProps={{ fontSize: '0.8rem' }} />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
}

function DocSection({ section }) {
  return (
    <Box id={section.id} sx={{ mb: 5, scrollMarginTop: 100 }}>
      <Typography variant="h2" sx={{ fontSize: { xs: '1.3rem', md: '1.6rem' }, color: '#3D2B1F', mb: 2, fontWeight: 700 }}>
        {section.title}
      </Typography>
      {section.paragraphs?.map((p, i) => (
        <Typography key={i} sx={{ fontSize: '0.92rem', color: '#5A5A5A', lineHeight: 1.75, mb: 2 }}>
          {p}
        </Typography>
      ))}
      {section.steps?.length > 0 && (
        <Box component="ol" sx={{ pl: 2.5, mb: 2, '& li': { fontSize: '0.92rem', color: '#5A5A5A', lineHeight: 1.75, mb: 1 } }}>
          {section.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </Box>
      )}
      {section.bullets?.length > 0 && (
        <Box component="ul" sx={{ pl: 2.5, mb: 2, '& li': { fontSize: '0.92rem', color: '#5A5A5A', lineHeight: 1.75, mb: 0.75 } }}>
          {section.bullets.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </Box>
      )}
      {section.table?.length > 0 && (
        <Box sx={{ overflowX: 'auto', mb: 2 }}>
          <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <Box component="thead">
              <Box component="tr" sx={{ bgcolor: '#3D2B1F', color: 'white' }}>
                {section.table[0].map((cell, i) => (
                  <Box key={i} component="th" sx={{ p: 1.5, textAlign: 'left', fontWeight: 600 }}>
                    {cell}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {section.table.slice(1).map((row, ri) => (
                <Box key={ri} component="tr" sx={{ borderBottom: '1px solid #E8E0D5', '&:nth-of-type(even)': { bgcolor: '#FDF6EC' } }}>
                  {row.map((cell, ci) => (
                    <Box key={ci} component="td" sx={{ p: 1.5, color: '#5A5A5A', verticalAlign: 'top' }}>
                      {cell}
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}
      {section.code && (
        <Box
          component="pre"
          sx={{
            bgcolor: '#1e1e1e',
            color: '#d4d4d4',
            p: 2,
            borderRadius: 2,
            overflowX: 'auto',
            fontSize: '0.8rem',
            lineHeight: 1.6,
            mb: 2,
            fontFamily: 'Consolas, Monaco, monospace',
          }}
        >
          {section.code}
        </Box>
      )}
      {section.note && (
        <Box sx={{ bgcolor: '#FFF8E7', border: '1px solid #E8D5A0', borderRadius: 2, p: 2, mb: 2 }}>
          <Typography sx={{ fontSize: '0.85rem', color: '#5A5A5A', lineHeight: 1.7 }}>
            <strong>Note:</strong> {section.note}
          </Typography>
        </Box>
      )}
      {section.images?.map((image, i) => (
        <DocImagePlaceholder
          key={image.id || i}
          src={image.src}
          suggestedPath={image.suggestedPath}
          alt={image.alt}
          caption={image.caption}
          hint={image.hint}
          aspectRatio={image.aspectRatio}
          natural={image.natural}
        />
      ))}
    </Box>
  );
}

export default function DocLayout({ title, subtitle, activeSlug, sections, breadcrumbs = ['Help'] }) {
  const [hash, setHash] = useState('');

  useEffect(() => {
    setHash(window.location.hash);
    const onHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [hash, sections]);

  return (
    <Layout title={title}>
      <PageHero title={title} subtitle={subtitle} breadcrumbs={breadcrumbs} />
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '260px 1fr' }, gap: 4 }}>
          <DocSidebar sections={sections} activeSlug={activeSlug} />
          <Box>
            {sections.map((section) => (
              <DocSection key={section.id} section={section} />
            ))}
          </Box>
        </Box>
      </Box>
    </Layout>
  );
}
