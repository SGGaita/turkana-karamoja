import { useState } from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Chip, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';

const faqCategories = [
  {
    category: 'General Information',
    color: '#2E7BB4',
    questions: [
      {
        question: 'What is the Turkana-Karamoja Climate Hub?',
        answer: 'The Turkana-Karamoja Climate Hub is a joint Kenya-Uganda early warning and climate information platform serving pastoral and agropastoral communities across Turkana County (Kenya) and Karamoja Region (Uganda). It provides real-time weather warnings, food security updates, water point status, and humanitarian information to 2.4 million people in East Africa\'s dryland regions.',
      },
      {
        question: 'Who can use this platform?',
        answer: 'The platform is designed for everyone - pastoral communities, farmers, local government officials, humanitarian organizations, researchers, and anyone interested in climate information for the Turkana-Karamoja region. Information is available in multiple languages including Turkana, Ngakarimojong, Swahili, and English.',
      },
      {
        question: 'Is this service free?',
        answer: 'Yes, the Climate Hub is completely free to use. You can access all early warnings, forecasts, reports, and community information at no cost. SMS alerts and the toll-free hotline (1192 in Kenya) are also free of charge.',
      },
      {
        question: 'How often is information updated?',
        answer: 'Information is updated continuously as new advisories are published by verified sources. Weather forecasts are updated daily, early warnings are issued as events develop, and situation reports are published monthly or as needed. The platform operates 24/7 with real-time updates.',
      },
    ],
  },
  {
    category: 'Early Warnings & Alerts',
    color: '#D63030',
    questions: [
      {
        question: 'What types of warnings are issued?',
        answer: 'The platform issues warnings for floods, droughts, extreme temperatures, sandstorms, wildfires, livestock diseases, desert locust outbreaks, and food security crises. Warnings are color-coded: RED (severe/extreme), ORANGE (high), YELLOW (moderate/watch), and GREEN (normal/information).',
      },
      {
        question: 'How do I receive SMS alerts?',
        answer: 'SMS alerts are automatically sent to registered mobile numbers in affected areas when RED or ORANGE level warnings are issued. To register for SMS alerts, contact your local sub-county disaster management office or call the toll-free hotline at 1192 (Kenya) or the equivalent number in Uganda.',
      },
      {
        question: 'What should I do when I receive a warning?',
        answer: 'Each warning includes specific recommended actions. For flood warnings: move to higher ground and secure livestock. For drought alerts: conserve water and consider destocking. For disease outbreaks: follow quarantine guidelines and contact veterinary services. Always follow the guidance provided in the warning message.',
      },
      {
        question: 'Can I report an emergency or unusual event?',
        answer: 'Yes! You can report emergencies, disasters, disease outbreaks, or unusual environmental events through the Submit Advisory page (for verified organizations) or by calling the toll-free emergency hotline at 1192 (Kenya). Community members can also report to their local sub-county offices.',
      },
    ],
  },
  {
    category: 'Community Services',
    color: '#2E8B57',
    questions: [
      {
        question: 'How can I find water point locations?',
        answer: 'Visit the Community page to access the Water Point Status Map, which shows real-time status of boreholes, pans, dams, and water trucking points across Turkana and Karamoja. The map is updated regularly with functionality status and GPS coordinates.',
      },
      {
        question: 'Where can I access community radio broadcasts?',
        answer: 'Climate advisories are broadcast daily on Turkana FM (89.5 FM), Lodwar Community Radio (90.3 FM), Radio Karamoja (107.3 FM), and Rhino Radio Uganda (102.0 FM). Broadcasts are at 07:00 and 18:00 EAT in local languages including Turkana, Ngakarimojong, Ateso, Swahili, and English.',
      },
      {
        question: 'How do I find humanitarian assistance locations?',
        answer: 'The Community page includes a Humanitarian Assistance Locator showing food distribution points, non-food item (NFI) distribution, cash transfer locations, and registration sites. Information is provided by WFP, UNHCR, UNICEF, and other humanitarian partners.',
      },
      {
        question: 'What languages are available?',
        answer: 'The platform provides information in Turkana, Ngakarimojong, Ateso, Swahili, and English. Community radio broadcasts and SMS alerts are sent in the primary language of each area. The web platform is currently in English with plans to add more languages.',
      },
    ],
  },
  {
    category: 'For Organizations',
    color: '#E87010',
    questions: [
      {
        question: 'How can my organization publish advisories?',
        answer: 'Verified government agencies, UN bodies, NGOs, and research institutions can apply to become authorized publishers. Visit the Submit Advisory page and click "Editor login" to access the submission form. New organizations should contact the platform administrators to request verification and publishing credentials.',
      },
      {
        question: 'What types of content can be published?',
        answer: 'Authorized organizations can publish weather forecasts, seasonal climate outlooks, flood/drought warnings, disease outbreak alerts, situation reports (SITREPs), food security updates, humanitarian bulletins, and other verified climate and humanitarian information relevant to the Turkana-Karamoja region.',
      },
      {
        question: 'Is content reviewed before publication?',
        answer: 'Yes, all submitted advisories are reviewed by platform administrators before publication to ensure accuracy, relevance, and adherence to quality standards. Emergency RED-level alerts may be fast-tracked for immediate publication with post-publication review.',
      },
      {
        question: 'Can I attach documents or maps to advisories?',
        answer: 'Yes, you can attach supporting documents including PDFs, Word files, Excel spreadsheets, and images (maps, photos) when submitting advisories. Files should be under 10MB and relevant to the advisory content.',
      },
    ],
  },
  {
    category: 'Technical Support',
    color: '#9A9A9A',
    questions: [
      {
        question: 'The website is not loading. What should I do?',
        answer: 'First, check your internet connection. The platform works on slow connections but requires basic connectivity. If you\'re offline, the platform will show cached content where available. Try refreshing the page or clearing your browser cache. For persistent issues, contact technical support.',
      },
      {
        question: 'Can I use this platform on my mobile phone?',
        answer: 'Yes! The Climate Hub is fully mobile-responsive and works on all smartphones, tablets, and computers. For the best experience, use an updated web browser (Chrome, Firefox, Safari, or Edge). You can also add the site to your phone\'s home screen for quick access.',
      },
      {
        question: 'I\'m not receiving SMS alerts. Why?',
        answer: 'Ensure your mobile number is registered for alerts with your local disaster management office. Check that your phone has network coverage and sufficient airtime/credit (though the service is free, your phone must be active). SMS alerts are only sent for RED and ORANGE level warnings in affected areas.',
      },
      {
        question: 'Who do I contact for support?',
        answer: 'For technical issues: contact the platform administrators through the Submit Advisory page. For emergency assistance: call the toll-free hotline at 1192 (Kenya). For general inquiries: visit your local sub-county disaster management office or contact partner organizations listed on the About page.',
      },
    ],
  },
];

const contactInfo = [
  { label: 'Emergency Hotline (Kenya)', value: '1192 (Toll-Free)', description: '24/7 emergency reporting and assistance' },
  { label: 'Turkana Coordination Unit', value: '+254 (0)54 22 XXX', description: 'Lodwar, Turkana County, Kenya' },
  { label: 'Email Support', value: 'info@tkclimate.org', description: 'General inquiries and technical support' },
];

export default function Help() {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Layout title="Help & FAQ">
      <PageHero 
        title="Help & Frequently Asked Questions" 
        subtitle="Find answers to common questions about the Climate Hub"
        image="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&q=70" 
        breadcrumbs={['Help']} 
      />

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        
        {/* Introduction */}
        <Box sx={{ mb: 5 }}>
          <Typography sx={{ fontSize: '1rem', color: '#5A5A5A', lineHeight: 1.75, mb: 3 }}>
            Welcome to the Turkana-Karamoja Climate Hub Help Center. Browse our frequently asked questions below, 
            organized by category. If you can't find the answer you're looking for, please contact our support team 
            using the contact information at the bottom of this page.
          </Typography>
        </Box>

        {/* FAQ Categories */}
        {faqCategories.map((category, catIndex) => (
          <Box key={category.category} sx={{ mb: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Chip 
                label={category.category} 
                sx={{ 
                  bgcolor: category.color, 
                  color: 'white', 
                  fontWeight: 700, 
                  fontSize: '0.85rem',
                  px: 1,
                }} 
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
                    '&.Mui-expanded': {
                      borderColor: category.color,
                      boxShadow: `0 4px 12px ${category.color}20`,
                    },
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

        {/* Contact Information */}
        <Box>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.6rem', md: '2rem' }, color: '#3D2B1F', mb: 3 }}>
            Still Need Help?
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', color: '#5A5A5A', lineHeight: 1.7, mb: 4 }}>
            If you couldn't find the answer to your question, please reach out to our support team. 
            We're here to help you access the climate information and services you need.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {contactInfo.map((contact) => (
              <Box 
                key={contact.label}
                sx={{ 
                  bgcolor: 'white', 
                  border: '1px solid #E8E0D5', 
                  borderRadius: 2, 
                  p: 3,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  alignItems: { xs: 'flex-start', sm: 'center' },
                }}
              >
                <Box sx={{ flex: 1 }}>
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
              </Box>
            ))}
          </Box>
        </Box>

      </Box>
    </Layout>
  );
}
