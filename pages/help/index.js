import { Box, Typography, Card, CardContent, CardActionArea, Grid } from '@mui/material';
import Link from 'next/link';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import Layout from '../../components/Layout';
import PageHero from '../../components/PageHero';
import { helpNav } from '../../lib/docs/nav';
import { APP_NAME, APP_FULL_NAME } from '../../lib/branding';

const iconMap = {
  home: MenuBookOutlinedIcon,
  question: QuestionAnswerOutlinedIcon,
  public: PublicOutlinedIcon,
  admin: AdminPanelSettingsOutlinedIcon,
  code: CodeOutlinedIcon,
};

const cardColors = {
  hub: '#2E7BB4',
  faq: '#2E8B57',
  'user-guide': '#C1440E',
  'admin-guide': '#E87010',
  technical: '#3D2B1F',
};

export default function HelpHub() {
  const docCards = helpNav.filter((item) => item.slug !== 'hub');

  return (
    <Layout title="Help Center">
      <PageHero
        title="Help & Documentation Center"
        subtitle={`User guides, admin documentation, technical reference, and FAQs for ${APP_FULL_NAME}`}
        image="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&q=70"
        breadcrumbs={['Help']}
      />

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        <Typography sx={{ fontSize: '1rem', color: '#5A5A5A', lineHeight: 1.75, mb: 5, maxWidth: 800 }}>
          Welcome to the {APP_NAME} documentation center. Whether you are a community member browsing
          early warnings, an administrator managing content in WordPress, or a developer integrating
          with our APIs — find the guide you need below.
        </Typography>

        <Grid container spacing={3}>
          {docCards.map((item) => {
            const Icon = iconMap[item.icon] || MenuBookOutlinedIcon;
            const color = cardColors[item.slug] || '#2E7BB4';
            return (
              <Grid item xs={12} sm={6} md={4} key={item.href}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    border: '1px solid #E8E0D5',
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: color, boxShadow: `0 8px 24px ${color}20` },
                  }}
                >
                  <CardActionArea component={Link} href={item.href} sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: `${color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                        }}
                      >
                        <Icon sx={{ color, fontSize: 28 }} />
                      </Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#3D2B1F', mb: 1 }}>
                        {item.label}
                      </Typography>
                      <Typography sx={{ fontSize: '0.88rem', color: '#5A5A5A', lineHeight: 1.6 }}>
                        {item.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Box sx={{ mt: 6, p: 3, bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#3D2B1F', mb: 1 }}>
            Quick Links
          </Typography>
          <Box component="ul" sx={{ pl: 2.5, m: 0, '& li': { fontSize: '0.9rem', color: '#5A5A5A', mb: 0.75 } }}>
            <li><Link href="/early-warnings" style={{ color: '#C1440E' }}>View active early warnings</Link></li>
            <li><Link href="/partners-stakeholders" style={{ color: '#C1440E' }}>Partner portal — login or register</Link></li>
            <li><Link href="/contact" style={{ color: '#C1440E' }}>Contact the coordination team</Link></li>
            <li><Link href="/help/technical#api-reference" style={{ color: '#C1440E' }}>API reference for developers</Link></li>
          </Box>
        </Box>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '0.85rem', color: '#9A9A9A' }}>
            Emergency hotline (Kenya): <strong style={{ color: '#C1440E' }}>1192</strong> (toll-free, 24/7)
          </Typography>
        </Box>
      </Box>
    </Layout>
  );
}
