import { APP_NAME, APP_FULL_NAME } from '../branding';
import { platformCoverageIntro } from '../regions';

export const faqCategories = [
  {
    category: 'General Information',
    color: '#2E7BB4',
    questions: [
      {
        question: `What is ${APP_FULL_NAME}?`,
        answer: `${platformCoverageIntro(APP_FULL_NAME)} It provides real-time weather warnings, food security updates, water point status, and humanitarian information to pastoral and agropastoral communities in East Africa's dryland regions.`,
      },
      {
        question: 'Who can use this platform?',
        answer: 'The platform is designed for everyone - pastoral communities, farmers, local government officials, humanitarian organizations, researchers, and anyone interested in climate information for the Turkana-Karamoja region. Information is available in multiple languages including Turkana, Ngakarimojong, Swahili, and English.',
      },
      {
        question: 'Is this service free?',
        answer: `Yes, ${APP_NAME} is completely free to use. You can access all early warnings, forecasts, reports, and community information at no cost. SMS alerts and the toll-free hotline (1192 in Kenya) are also free of charge.`,
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
        answer: 'Yes! You can report emergencies, disasters, disease outbreaks, or unusual environmental events through the Partner Dashboard\'s Submit Advisory section (for verified organizations) or by calling the toll-free emergency hotline at 1192 (Kenya). Community members can also report to their local sub-county offices.',
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
        answer: 'Climate advisories are broadcast daily on Turkana FM (89.5 FM), Lodwar Community Radio (90.3 FM), Radio Karamoja (107.3 FM), and Rhino Radio Uganda (102.0 FM). Broadcasts are at 07:00 and 18:00 EAT in local languages including Turkana, Ngakarimojong, Swahili, and English.',
      },
      {
        question: 'How do I find humanitarian assistance locations?',
        answer: 'The Community page includes a Humanitarian Assistance Locator showing food distribution points, non-food item (NFI) distribution, cash transfer locations, and registration sites. Information is provided by WFP, UNHCR, UNICEF, and other humanitarian partners.',
      },
      {
        question: 'What languages are available?',
        answer: 'The platform provides information in Turkana, Ngakarimojong, Swahili, and English. Community radio broadcasts and SMS alerts are sent in the primary language of each area. The web platform is currently in English with plans to add more languages.',
      },
    ],
  },
  {
    category: 'For Organizations',
    color: '#E87010',
    questions: [
      {
        question: 'How can my organization publish advisories?',
        answer: 'Register your organisation from the Partner Dashboard. After an administrator approves your application, you receive an email to set your password. Sign in on the Dashboard with that email, then use the Submit Advisory or Submit Report sections in the sidebar. All submissions are reviewed before publication.',
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
        answer: `Yes! ${APP_NAME} is fully mobile-responsive and works on all smartphones, tablets, and computers. For the best experience, use an updated web browser (Chrome, Firefox, Safari, or Edge). You can also add the site to your phone's home screen for quick access.`,
      },
      {
        question: 'I\'m not receiving SMS alerts. Why?',
        answer: 'Ensure your mobile number is registered for alerts with your local disaster management office. Check that your phone has network coverage and sufficient airtime/credit (though the service is free, your phone must be active). SMS alerts are only sent for RED and ORANGE level warnings in affected areas.',
      },
      {
        question: 'Who do I contact for support?',
        answer: 'For technical issues: contact the platform administrators through the Partner Dashboard. For emergency assistance: call the toll-free hotline at 1192 (Kenya). For general inquiries: visit your local sub-county disaster management office or contact partner organizations listed on the About page.',
      },
    ],
  },
];

export const contactInfo = [
  { label: 'Emergency Hotline (Kenya)', value: '1192 (Toll-Free)', description: '24/7 emergency reporting and assistance' },
  { label: 'Turkana Coordination Unit', value: '+254 (0)54 22 XXX', description: 'Lodwar, Turkana County, Kenya' },
  { label: 'Email Support', value: 'info@tkclimate.org', description: 'General inquiries and technical support' },
];
