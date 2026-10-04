import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Box, Typography, Button, Alert, Chip, Snackbar, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, ToggleButtonGroup, ToggleButton,
  FormControl, InputLabel, Select, MenuItem, CircularProgress,
} from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';
import DashboardShell from '../components/DashboardShell';
import PartnerSubmissionsPanel from '../components/PartnerSubmissionsPanel';
import AdvisorySubmissionForm from '../components/AdvisorySubmissionForm';
import ReportSubmissionForm from '../components/ReportSubmissionForm';
import OrgRegistrationForm from '../components/OrgRegistrationForm';
import { getJwtToken, getOrganizationStatus, getWpBaseUrl } from '../lib/wordpress';
import {
  saveOrgSession, loadOrgSession, clearOrgSession, isOrgApproved,
  TOKEN_KEY, USER_EMAIL_KEY,
} from '../lib/org-session';

const STAT_CARDS = [
  { key: 'total', label: 'Total submissions', color: '#3D2B1F' },
  { key: 'pending', label: 'Pending review', color: '#B45309' },
  { key: 'approved', label: 'Approved / live', color: '#047857' },
  { key: 'rejected', label: 'Rejected', color: '#B91C1C' },
];

const emptyStats = { total: 0, pending: 0, approved: 0, rejected: 0, withdrawn: 0, advisories: 0, reports: 0 };

function OrgHeaderCard({ org, onSectionChange }) {
  return (
    <Box
      sx={{
        bgcolor: '#3D2B1F',
        borderRadius: 2,
        p: { xs: 2.5, md: 3.5 },
        mb: 3,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box>
        <Typography sx={{ color: '#9A9A9A', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', mb: 0.5 }}>
          Partner organisation
        </Typography>
        <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700, fontSize: '1.3rem', color: 'white' }}>
          {org.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
          <Chip
            label="Verified partner"
            size="small"
            sx={{ bgcolor: '#ecfdf5', color: '#047857', fontWeight: 700, fontSize: '0.65rem' }}
          />
          <Typography sx={{ color: '#D4A96A', fontSize: '0.75rem' }}>{org.reference}</Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Button onClick={() => onSectionChange('advisory')} variant="contained" startIcon={<CampaignOutlinedIcon />} sx={{ bgcolor: '#C1440E', '&:hover': { bgcolor: '#E8622A' } }}>
          New advisory
        </Button>
        <Button onClick={() => onSectionChange('report')} variant="contained" startIcon={<DescriptionOutlinedIcon />} sx={{ bgcolor: '#2E7BB4', '&:hover': { bgcolor: '#2569a0' } }}>
          New report
        </Button>
      </Box>
    </Box>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [orgRecord, setOrgRecord] = useState(null);
  const [checking, setChecking] = useState(true);
  const [stats, setStats] = useState(emptyStats);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [section, setSection] = useState('overview');
  const [editingReport, setEditingReport] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const [snackSeverity, setSnackSeverity] = useState('success');
  const wpConfigured = Boolean(getWpBaseUrl());

  const showSnack = (msg, severity = 'success') => {
    setSnackMsg(msg);
    setSnackSeverity(severity);
    setSnackOpen(true);
  };

  const refreshOrgStatus = useCallback(async (email) => {
    if (!email) return;
    if (!wpConfigured) {
      const cached = loadOrgSession();
      if (cached?.contactEmail === email) setOrgRecord(cached);
      return;
    }
    try {
      const status = await getOrganizationStatus(email);
      if (status.registered) {
        const record = {
          id: status.id,
          reference: status.reference,
          name: status.name,
          status: status.status,
          approved: status.approved,
          contactEmail: email,
        };
        setOrgRecord(record);
        saveOrgSession(record);
      }
    } catch {
      const cached = loadOrgSession();
      if (cached?.contactEmail === email) setOrgRecord(cached);
    }
  }, [wpConfigured]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = sessionStorage.getItem(TOKEN_KEY);
    const email = sessionStorage.getItem(USER_EMAIL_KEY);
    setToken(t);
    if (email) {
      setUserEmail(email);
      refreshOrgStatus(email).finally(() => setChecking(false));
    } else {
      // No known email for this session — never fall back to whatever organisation
      // happens to be cached (e.g. from a previous visitor or an earlier registration
      // on this device). The dashboard must stay organisation-agnostic until someone
      // actually signs in or registers.
      setChecking(false);
    }
  }, [refreshOrgStatus]);

  useEffect(() => {
    const q = router.query.section;
    if (typeof q === 'string') setSection(q);
  }, [router.query.section]);

  const changeSection = (key) => {
    // Any nav-triggered section change (sidebar link, "New report" button, etc.) is a
    // fresh entry into that section — only handleEditReport should land on a pre-filled form.
    setEditingReport(null);
    setSection(key);
    router.replace({ pathname: '/partners-stakeholders', query: { section: key } }, undefined, { shallow: true });
  };

  // Editing a report reuses the same full-page "Submit Report" form instead of a modal —
  // just pre-filled and pointed at the update endpoint instead of create.
  const handleEditReport = (item) => {
    setEditingReport(item);
    setSection('report');
    router.replace({ pathname: '/partners-stakeholders', query: { section: 'report' } }, undefined, { shallow: true });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (loginForm.username === 'your-email@domian.com' && loginForm.password === 'admin123') {
      const demoToken = 'DEMO_JWT_TOKEN_' + Date.now();
      sessionStorage.setItem(TOKEN_KEY, demoToken);
      sessionStorage.setItem(USER_EMAIL_KEY, loginForm.username);
      setToken(demoToken);
      setUserEmail(loginForm.username);
      setLoginOpen(false);
      setLoginForm({ username: '', password: '' });
      await refreshOrgStatus(loginForm.username);
      showSnack('Demo login successful!');
      return;
    }

    try {
      const { token: jwt, email } = await getJwtToken(loginForm.username, loginForm.password);
      sessionStorage.setItem(TOKEN_KEY, jwt);
      sessionStorage.setItem(USER_EMAIL_KEY, email || loginForm.username);
      setToken(jwt);
      setUserEmail(email || loginForm.username);
      setLoginOpen(false);
      setLoginForm({ username: '', password: '' });
      await refreshOrgStatus(email || loginForm.username);
    } catch (err) {
      setLoginError(err.message || 'Login failed. For demo, use your-email@domian.com / admin123');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_EMAIL_KEY);
    clearOrgSession();
    setToken(null);
    setUserEmail('');
    setOrgRecord(null);
  };

  const handleRegistered = async (email) => {
    sessionStorage.setItem(USER_EMAIL_KEY, email);
    setUserEmail(email);
    setRegistering(false);
    await refreshOrgStatus(email);
  };

  const approved = isOrgApproved(orgRecord);
  const inDashboard = !checking && !registering && token && orgRecord && approved;

  const loginDialog = (
    <Dialog open={loginOpen} onClose={() => setLoginOpen(false)} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Montserrat", sans-serif' }}>Partner Sign In</DialogTitle>
      <Box component="form" onSubmit={handleLogin}>
        <DialogContent>
          <Typography sx={{ fontSize: '0.85rem', color: '#5A5A5A', mb: 2 }}>
            Sign in with the email address from your organisation registration.
          </Typography>
          <Alert severity="info" sx={{ mb: 2, fontSize: '0.75rem' }}>
            <strong>Demo:</strong> your-email@domian.com / admin123
          </Alert>
          {loginError && <Alert severity="error" sx={{ mb: 2 }}>{loginError}</Alert>}
          <TextField label="Email" fullWidth required value={loginForm.username} onChange={(e) => setLoginForm((f) => ({ ...f, username: e.target.value }))} sx={{ mb: 2 }} size="small" />
          <TextField label="Password" type="password" fullWidth required value={loginForm.password} onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))} size="small" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setLoginOpen(false)}>Cancel</Button>
          <Button type="submit" variant="contained" sx={{ bgcolor: '#C1440E' }}>Sign in</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );

  const snackbar = (
    <Snackbar open={snackOpen} autoHideDuration={6000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <Alert severity={snackSeverity} onClose={() => setSnackOpen(false)}>{snackMsg}</Alert>
    </Snackbar>
  );

  if (inDashboard) {
    return (
      <>
        <DashboardShell
          title="Partner Dashboard"
          orgRecord={orgRecord}
          userEmail={userEmail}
          section={section}
          onSectionChange={changeSection}
          onLogout={handleLogout}
        >
          {!wpConfigured && (
            <Alert severity="info" sx={{ mb: 3 }}>
              CMS URL not set — configure <code>NEXT_PUBLIC_WP_BASE_URL</code> for live data. Demo login does not sync submissions.
            </Alert>
          )}

          {section === 'advisory' ? (
            <AdvisorySubmissionForm
              token={token}
              orgRecord={orgRecord}
              onNotify={(msg, severity = 'success') => showSnack(msg, severity)}
              onSubmitted={() => changeSection('overview')}
            />
          ) : section === 'report' ? (
            <ReportSubmissionForm
              key={editingReport?.id || 'create'}
              token={token}
              orgRecord={orgRecord}
              onNotify={(msg, severity = 'success') => showSnack(msg, severity)}
              onSubmitted={() => changeSection('overview')}
              {...(editingReport ? {
                mode: 'edit',
                submissionId: editingReport.id,
                initialValues: {
                  title: editingReport.title,
                  description: editingReport.description,
                  keywords: editingReport.keywords,
                  categories: editingReport.categories,
                  countries: editingReport.countries,
                },
              } : {})}
            />
          ) : (
            <>
              <OrgHeaderCard org={orgRecord} onSectionChange={changeSection} />

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                {STAT_CARDS.map((c) => (
                  <Box
                    key={c.key}
                    sx={{ flex: '1 1 140px', bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 2.5, textAlign: 'center' }}
                  >
                    <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700, fontSize: '1.8rem', color: c.color }}>
                      {stats[c.key]}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#5A5A5A', mt: 0.5 }}>{c.label}</Typography>
                  </Box>
                ))}
                <Box sx={{ flex: '1 1 140px', bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 2.5, textAlign: 'center' }}>
                  <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700, fontSize: '1.8rem', color: '#2E7BB4' }}>
                    {stats.advisories}<Typography component="span" sx={{ fontSize: '1rem', color: '#9A9A9A' }}>/{stats.reports}</Typography>
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#5A5A5A', mt: 0.5 }}>Advisories / Reports</Typography>
                </Box>
              </Box>

              <Box sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: { xs: 2.5, md: 3.5 } }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={filterType}
                    onChange={(_, v) => v && setFilterType(v)}
                    sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontSize: '0.75rem', px: 1.5 }, '& .Mui-selected': { bgcolor: '#FFF4EC !important', color: '#C1440E !important' } }}
                  >
                    <ToggleButton value="all">All</ToggleButton>
                    <ToggleButton value="advisory">Advisories</ToggleButton>
                    <ToggleButton value="report">Reports</ToggleButton>
                  </ToggleButtonGroup>

                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel>Status</InputLabel>
                    <Select value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value)}>
                      <MenuItem value="all">All statuses</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                      <MenuItem value="withdrawal_requested">Withdrawal requested</MenuItem>
                      <MenuItem value="withdrawn">Withdrawn</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <PartnerSubmissionsPanel
                  token={token}
                  orgRecord={orgRecord}
                  filterType={filterType}
                  filterStatus={filterStatus}
                  onStats={setStats}
                  onNotify={(msg, severity = 'success') => showSnack(msg, severity)}
                  onEditReport={handleEditReport}
                />
              </Box>
            </>
          )}
        </DashboardShell>

        {loginDialog}
        {snackbar}
      </>
    );
  }

  return (
    <Layout title="Partner Dashboard">
      <PageHero
        title="Partner Dashboard"
        subtitle="Register your organisation, then manage the advisories and reports it submits"
        image="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&q=70"
        breadcrumbs={['Dashboard']}
      />

      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        {!wpConfigured && (
          <Alert severity="info" sx={{ mb: 3 }}>
            CMS URL not set — configure <code>NEXT_PUBLIC_WP_BASE_URL</code> for live data. Demo login does not sync submissions.
          </Alert>
        )}

        {checking ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#C1440E' }} />
          </Box>
        ) : registering ? (
          <Box>
            <OrgRegistrationForm
              defaultEmail={userEmail}
              title={orgRecord?.status === 'rejected' ? 'Re-apply for Registration' : 'Organisation Registration'}
              onRegistered={handleRegistered}
              onNotify={showSnack}
            />
            <Button onClick={() => setRegistering(false)} sx={{ mt: 2, color: '#5A5A5A' }}>
              Cancel
            </Button>
          </Box>
        ) : !orgRecord ? (
          !token ? (
            <Box sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: { xs: 3, md: 5 }, textAlign: 'center' }}>
              <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700, fontSize: '1.2rem', mb: 1 }}>
                Sign in to view your dashboard
              </Typography>
              <Typography sx={{ color: '#5A5A5A', fontSize: '0.9rem', mb: 3 }}>
                Use the email address your organisation registered with. Not registered yet? Apply below.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button variant="contained" size="large" onClick={() => setLoginOpen(true)} sx={{ bgcolor: '#C1440E', px: 4 }}>
                  Sign in
                </Button>
                <Button variant="outlined" size="large" onClick={() => setRegistering(true)} sx={{ borderColor: '#2E7BB4', color: '#2E7BB4', px: 4 }}>
                  Register your organisation
                </Button>
              </Box>
            </Box>
          ) : (
            <Alert
              severity="warning"
              sx={{ bgcolor: '#FFF4EC', border: '1px solid #E87010' }}
              action={<Button size="small" onClick={() => setRegistering(true)} sx={{ color: '#E87010', fontWeight: 700 }}>Register</Button>}
            >
              We couldn&apos;t find an organisation registered to {userEmail}.
            </Alert>
          )
        ) : !approved ? (
          <Alert
            severity={orgRecord.status === 'rejected' ? 'error' : 'info'}
            sx={{ mb: 2 }}
            action={orgRecord.status === 'rejected' ? (
              <Button size="small" onClick={() => setRegistering(true)} sx={{ fontWeight: 700 }}>Re-apply</Button>
            ) : undefined}
          >
            {orgRecord.status === 'rejected' ? (
              <>Registration for <strong>{orgRecord.name}</strong> was not approved.</>
            ) : (
              <>Organisation <strong>{orgRecord.name}</strong> ({orgRecord.reference}) is pending verification. Your dashboard unlocks once an administrator approves it.</>
            )}
          </Alert>
        ) : (
          <Box sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: { xs: 3, md: 5 }, textAlign: 'center' }}>
            <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700, fontSize: '1.2rem', mb: 1 }}>
              Sign in to view your dashboard
            </Typography>
            <Typography sx={{ color: '#5A5A5A', fontSize: '0.9rem', mb: 3 }}>
              Organisation <strong>{orgRecord.name}</strong> is verified — sign in with your editor email to continue.
            </Typography>
            <Button variant="contained" size="large" onClick={() => setLoginOpen(true)} sx={{ bgcolor: '#C1440E', px: 4 }}>
              Sign in
            </Button>
          </Box>
        )}
      </Box>

      {loginDialog}
      {snackbar}
    </Layout>
  );
}
