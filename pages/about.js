import { Box, Typography, Divider, Card, CardContent } from '@mui/material';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';

const partners = [
  { name: 'Kenya Meteorological Department', abbr: 'KMD', type: 'Met Agency' },
  { name: 'Uganda Meteorological Authority', abbr: 'UMA', type: 'Met Agency' },
  { name: 'National Drought Management Authority', abbr: 'NDMA', type: 'Government' },
  { name: 'Office of the Prime Minister - Uganda', abbr: 'OPM', type: 'Government' },
  { name: 'UN OCHA', abbr: 'OCHA', type: 'UN Agency' },
  { name: 'Food and Agriculture Organization', abbr: 'FAO', type: 'UN Agency' },
  { name: 'IGAD Climate Prediction Centre', abbr: 'ICPAC', type: 'Regional Body' },
  { name: 'UNICEF', abbr: 'UNICEF', type: 'UN Agency' },
  { name: 'World Food Programme', abbr: 'WFP', type: 'UN Agency' },
];

const keyFeatures = [
  {
    title: 'Early Warning Systems',
    description: 'Real-time flood, drought, locust, and disease outbreak alerts covering all sub-counties in Turkana and Karamoja.',
  },
  {
    title: 'Climate Information',
    description: 'Seasonal forecasts, weather advisories, and climate outlooks from verified meteorological agencies.',
  },
  {
    title: 'Community Services',
    description: 'Water point status, pasture conditions, livestock health, and humanitarian assistance information.',
  },
  {
    title: 'Multi-Channel Access',
    description: 'Web platform, SMS alerts, community radio broadcasts, and toll-free hotline for universal access.',
  },
  {
    title: 'Cross-Border Coordination',
    description: 'Joint Kenya-Uganda platform enabling coordinated response to climate risks across borders.',
  },
  {
    title: 'Verified Information',
    description: 'All advisories published by authorized government agencies, UN bodies, and verified partners only.',
  },
];

const coverage = [
  { region: 'Turkana County, Kenya', population: '1.2M', subCounties: 10 },
  { region: 'Karamoja Region, Uganda', population: '1.2M', districts: 7 },
];

export default function About() {
  return (
    <Layout title="About the Hub">
      <PageHero 
        title="About the Climate Hub" 
        subtitle="Cross-border climate intelligence platform serving pastoral and agropastoral communities"
        image="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1400&q=70" 
        breadcrumbs={['About']} 
      />

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        
        {/* Mission & Vision */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.8rem', md: '2.2rem' }, color: '#3D2B1F', mb: 3 }}>
            Our Mission
          </Typography>
          <Typography sx={{ fontSize: '1rem', color: '#5A5A5A', lineHeight: 1.75, mb: 3 }}>
            The Turkana-Karamoja Climate Hub is a joint Kenya-Uganda online climate change information and knowledge 
            platform serving pastoral and agropastoral communities in the border areas of Kenya and Uganda. Developed 
            through the Karamoja Strong (KSP) project, this platform utilizes digital technologies to improve climate 
            adaptation awareness and sharing of early warning systems information for promoting climate-resilient communities.
          </Typography>
          <Typography sx={{ fontSize: '1rem', color: '#5A5A5A', lineHeight: 1.75, mb: 3 }}>
            Northern Kenya and the Karamoja region are arid areas inhabited by nomadic pastoralists, characterized by 
            fragile ecosystems ravaged by climate change effects. The region is drought-prone, with depleted livestock, 
            water, and pasture resources. These conditions create an increased need for mobility and better climate 
            adaptation for the survival of pastoralist livelihoods.
          </Typography>
          <Typography sx={{ fontSize: '1rem', color: '#5A5A5A', lineHeight: 1.75 }}>
            Our mission is to strengthen climate resilience by ensuring timely, accurate, and accessible climate 
            information reaches pastoral communities - empowering them to make informed decisions about their livelihoods, 
            safety, and well-being. The platform serves as a bridge between humanitarian assistance and longer-term 
            recovery and development strategies.
          </Typography>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Geographic Coverage */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.6rem', md: '2rem' }, color: '#3D2B1F', mb: 3 }}>
            Geographic Coverage
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {coverage.map((area) => (
              <Card key={area.region} sx={{ flex: '1 1 calc(50% - 12px)', minWidth: { xs: '100%', sm: 'calc(50% - 12px)' }, border: '1px solid #E8E0D5' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#C1440E', mb: 1.5 }}>
                    {area.region}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: '0.85rem', color: '#5A5A5A' }}>Population:</Typography>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#3D2B1F' }}>{area.population}</Typography>
                    </Box>
                    {area.subCounties && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: '0.85rem', color: '#5A5A5A' }}>Sub-Counties:</Typography>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#3D2B1F' }}>{area.subCounties}</Typography>
                      </Box>
                    )}
                    {area.districts && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: '0.85rem', color: '#5A5A5A' }}>Districts:</Typography>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#3D2B1F' }}>{area.districts}</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Key Features */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.6rem', md: '2rem' }, color: '#3D2B1F', mb: 3 }}>
            Key Features & Services
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5 }}>
            {keyFeatures.map((feature) => (
              <Box 
                key={feature.title} 
                sx={{ 
                  flex: '1 1 calc(33.333% - 14px)', 
                  minWidth: { xs: '100%', sm: 'calc(50% - 10px)', md: 'calc(33.333% - 14px)' },
                  bgcolor: 'white',
                  border: '1px solid #E8E0D5',
                  borderRadius: 2,
                  p: 2.5,
                }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#3D2B1F', mb: 1 }}>
                  {feature.title}
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', color: '#5A5A5A', lineHeight: 1.6 }}>
                  {feature.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* How It Works */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.6rem', md: '2rem' }, color: '#3D2B1F', mb: 3 }}>
            How the Hub Works
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[
              {
                step: '1',
                title: 'Data Collection',
                description: 'Meteorological agencies, government departments, and humanitarian organizations collect climate, weather, and humanitarian data.',
              },
              {
                step: '2',
                title: 'Verification & Publishing',
                description: 'Only verified organizations can publish advisories through the platform. All content is reviewed before publication.',
              },
              {
                step: '3',
                title: 'Multi-Channel Dissemination',
                description: 'Information is distributed via web platform, SMS alerts, community radio broadcasts (Turkana FM 89.5, Radio Karamoja 107.3), and toll-free hotline.',
              },
              {
                step: '4',
                title: 'Community Action',
                description: 'Pastoral and agropastoral communities receive timely warnings and guidance to protect lives, livestock, and livelihoods.',
              },
            ].map((item) => (
              <Box key={item.step} sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                <Box 
                  sx={{ 
                    width: 48, 
                    height: 48, 
                    bgcolor: '#C1440E', 
                    color: 'white', 
                    borderRadius: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.2rem',
                    flexShrink: 0,
                  }}
                >
                  {item.step}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#3D2B1F', mb: 0.5 }}>
                    {item.title}
                  </Typography>
                  <Typography sx={{ fontSize: '0.88rem', color: '#5A5A5A', lineHeight: 1.65 }}>
                    {item.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Partner Organizations */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.6rem', md: '2rem' }, color: '#3D2B1F', mb: 3 }}>
            Partner Organizations
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', color: '#5A5A5A', lineHeight: 1.7, mb: 3 }}>
            The Climate Hub is powered by collaboration between government agencies, UN bodies, regional organizations, 
            and NGOs committed to climate resilience in the Turkana-Karamoja region.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {partners.map((partner) => (
              <Box 
                key={partner.abbr}
                sx={{ 
                  flex: '1 1 calc(33.333% - 11px)',
                  minWidth: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' },
                  bgcolor: '#FDF6EC',
                  border: '1px solid #E8E0D5',
                  borderRadius: 2,
                  p: 2,
                }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#C1440E', mb: 0.3 }}>
                  {partner.abbr}
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#3D2B1F', mb: 0.5 }}>
                  {partner.name}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#9A9A9A' }}>
                  {partner.type}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Commissioned By */}
        <Box sx={{ bgcolor: '#3D2B1F', borderRadius: 3, p: 4 }}>
          <Typography sx={{ color: '#D4A96A', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2, textAlign: 'center' }}>
            Commissioned By
          </Typography>
          <Typography sx={{ color: 'white', fontSize: '1.6rem', fontWeight: 700, mb: 3, textAlign: 'center' }}>
            Danish Refugee Council (DRC)
          </Typography>
          <Typography sx={{ color: '#E8E0D5', fontSize: '0.9rem', lineHeight: 1.75, mb: 3 }}>
            This platform was commissioned by the Danish Refugee Council based in Kenya through the <strong>Karamoja Strong (KSP) project</strong>. 
            The project responds to climate change-affected communities by spearheading conflict prevention initiatives through peace and 
            conflict mitigation, promotion of sustainable livelihoods for women and youth, community-based natural resource management, 
            and better climate adaptation for increased productivity in the border areas of Kenya and Uganda.
          </Typography>
          <Typography sx={{ color: '#E8E0D5', fontSize: '0.9rem', lineHeight: 1.75, mb: 3 }}>
            DRC's program is designed to serve as a bridge between humanitarian assistance and longer-term recovery and development 
            strategies by identifying entry points to assistance for households at different vulnerability stages: addressing basic needs 
            and reducing reliance on negative coping strategies for extremely vulnerable households, and job creation and income generation 
            for vulnerable households for sustainable livelihoods.
          </Typography>
          <Typography sx={{ color: '#E8E0D5', fontSize: '0.9rem', lineHeight: 1.75 }}>
            In response to the emerging climate crisis and to improve resilience within the context of climate-induced migration, conflicts, 
            and displacement, DRC explores opportunities to make use of digital technologies for better climate adaptation awareness and 
            sharing of early warning systems information for promoting climate-resilient communities in Turkana and Pokot counties of Kenya 
            and Moroto district of Uganda.
          </Typography>
        </Box>

      </Box>
    </Layout>
  );
}
