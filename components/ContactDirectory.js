import { Box, Typography, Link as MuiLink } from '@mui/material';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import { APP_NAME } from '../lib/branding';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import XIcon from '@mui/icons-material/X';

const sectionTitleSx = {
  fontFamily: '"Montserrat", sans-serif',
  fontSize: { xs: '1.35rem', md: '1.6rem' },
  fontWeight: 700,
  color: '#3D2B1F',
  mb: 1,
};

const sectionIntroSx = {
  fontSize: '0.95rem',
  color: '#5A5A5A',
  mb: 3,
  maxWidth: 720,
  lineHeight: 1.7,
};

function DetailLine({ icon: Icon, children, href }) {
  if (!children) return null;
  const content = href ? (
    <MuiLink href={href} underline="hover" sx={{ color: 'inherit' }}>
      {children}
    </MuiLink>
  ) : (
    children
  );
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.75 }}>
      <Icon sx={{ fontSize: 18, color: '#C1440E', mt: '2px', flexShrink: 0 }} />
      <Typography sx={{ fontSize: '0.85rem', color: '#5A5A5A', lineHeight: 1.5 }}>{content}</Typography>
    </Box>
  );
}

function socialIcon(network) {
  const key = (network || '').toLowerCase();
  if (key.includes('facebook')) return FacebookIcon;
  if (key.includes('linkedin')) return LinkedInIcon;
  if (key.includes('twitter') || key.includes('x')) return XIcon;
  return LanguageOutlinedIcon;
}

export function RegionalOffices({ offices = [] }) {
  if (!offices.length) return null;

  return (
    <Box sx={{ mb: { xs: 5, md: 7 } }}>
      <Typography sx={sectionTitleSx}>Regional Offices</Typography>
      <Typography sx={sectionIntroSx}>
        Coordination desks across Turkana, North Pokot, Moroto, Amudat and Napak serving pastoral and agropastoral communities.
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5 }}>
        {offices.map((office) => (
          <Box
            key={`${office.name}-${office.region}`}
            sx={{
              flex: '1 1 280px',
              bgcolor: '#FDF6EC',
              border: '1px solid #E8E0D5',
              borderRadius: 3,
              p: 3,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                bgcolor: '#C1440E',
              },
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 700,
                fontSize: '1.05rem',
                color: '#3D2B1F',
                mb: 0.5,
              }}
            >
              {office.name}
            </Typography>
            {office.region && (
              <Typography sx={{ fontSize: '0.78rem', color: '#C1440E', fontWeight: 600, mb: 2 }}>
                {office.region}
              </Typography>
            )}
            <DetailLine icon={PlaceOutlinedIcon}>{office.address}</DetailLine>
            <DetailLine icon={PhoneOutlinedIcon} href={office.phone ? `tel:${office.phone.replace(/\s/g, '')}` : undefined}>
              {office.phone}
            </DetailLine>
            <DetailLine icon={EmailOutlinedIcon} href={office.email ? `mailto:${office.email}` : undefined}>
              {office.email}
            </DetailLine>
            <DetailLine icon={ScheduleOutlinedIcon}>{office.hours}</DetailLine>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export function KeyContacts({ contacts = [] }) {
  if (!contacts.length) return null;

  return (
    <Box sx={{ mb: { xs: 5, md: 7 } }}>
      <Typography sx={sectionTitleSx}>Key Contacts & Partners</Typography>
      <Typography sx={sectionIntroSx}>
        Priority offices and organisations supporting climate information, early warning, and resilience across the cluster.
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {contacts.map((contact) => (
          <Box
            key={`${contact.organization}-${contact.email || contact.phone || contact.role}`}
            sx={{
              flex: '1 1 calc(50% - 8px)',
              minWidth: { xs: '100%', md: 'calc(50% - 8px)' },
              bgcolor: 'white',
              border: '1px solid #E8E0D5',
              borderRadius: 3,
              p: 2.5,
              display: 'flex',
              gap: 2,
              transition: 'box-shadow 0.2s ease, transform 0.2s ease',
              '&:hover': {
                boxShadow: '0 12px 28px rgba(61,43,31,0.08)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: '#3D2B1F',
                color: '#D4A96A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <BusinessOutlinedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontWeight: 700,
                  fontSize: '0.98rem',
                  color: '#3D2B1F',
                  mb: 0.35,
                }}
              >
                {contact.organization}
              </Typography>
              {contact.role && (
                <Typography sx={{ fontSize: '0.8rem', color: '#6B4226', mb: 1.25, lineHeight: 1.45 }}>
                  {contact.role}
                </Typography>
              )}
              {contact.country && (
                <Typography sx={{ fontSize: '0.72rem', color: '#9A9A9A', mb: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {contact.country}
                </Typography>
              )}
              {contact.name && (
                <Typography sx={{ fontSize: '0.85rem', color: '#3D2B1F', mb: 0.5 }}>{contact.name}</Typography>
              )}
              <DetailLine icon={PhoneOutlinedIcon} href={contact.phone ? `tel:${contact.phone.replace(/\s/g, '')}` : undefined}>
                {contact.phone}
              </DetailLine>
              <DetailLine icon={EmailOutlinedIcon} href={contact.email ? `mailto:${contact.email}` : undefined}>
                {contact.email}
              </DetailLine>
              <DetailLine icon={LanguageOutlinedIcon} href={contact.website || undefined}>
                {contact.website}
              </DetailLine>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export function SocialLinks({ social = [] }) {
  const items = social.filter((s) => s.network);
  if (!items.length) return null;

  return (
    <Box>
      <Typography sx={sectionTitleSx}>Social Media</Typography>
      <Typography sx={sectionIntroSx}>
        Follow {APP_NAME} updates and partner announcements on our official channels.
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
        {items.map((item) => {
          const Icon = socialIcon(item.network);
          const hasUrl = Boolean(item.url);
          return (
            <Box
              key={`${item.network}-${item.url || item.label}`}
              component={hasUrl ? 'a' : 'div'}
              href={hasUrl ? item.url : undefined}
              target={hasUrl ? '_blank' : undefined}
              rel={hasUrl ? 'noopener noreferrer' : undefined}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.25,
                px: 2,
                py: 1.25,
                borderRadius: 2,
                bgcolor: hasUrl ? '#3D2B1F' : '#E8E0D5',
                color: hasUrl ? '#F0D9B0' : '#6B4226',
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: 600,
                fontFamily: '"Montserrat", sans-serif',
                transition: 'background-color 0.2s ease, transform 0.2s ease',
                cursor: hasUrl ? 'pointer' : 'default',
                '&:hover': hasUrl
                  ? { bgcolor: '#C1440E', color: 'white', transform: 'translateY(-2px)' }
                  : undefined,
              }}
            >
              <Icon sx={{ fontSize: 20 }} />
              {item.label || item.network}
              {!hasUrl && (
                <Typography component="span" sx={{ fontSize: '0.72rem', fontWeight: 500, opacity: 0.75 }}>
                  (URL pending)
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
