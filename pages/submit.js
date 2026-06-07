import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Select, MenuItem,
  FormControl, InputLabel, Alert, Chip, Divider, Snackbar,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';
import { getJwtToken, submitAdvisory, getWpBaseUrl } from '../lib/wordpress';

const TOKEN_KEY = 'tk_hub_jwt';

const advisoryTypes = [
  'Weather Forecast', 'Seasonal Climate Outlook', 'Flood Warning', 'Drought Advisory',
  'Locust Advisory', 'Disease Outbreak Alert', 'Situation Report (SITREP)',
  'Food Security Update', 'Humanitarian Bulletin', 'Other',
];

const alertLevels = [
  { val: 'red', label: 'RED - Severe / Extreme', color: '#D63030' },
  { val: 'orange', label: 'ORANGE - High', color: '#E87010' },
  { val: 'yellow', label: 'YELLOW - Moderate / Watch', color: '#B8860B' },
  { val: 'green', label: 'GREEN - Normal / Information', color: '#2E8B57' },
];

const regions = [
  'Both - Turkana & Karamoja', 'Turkana County (Kenya)', 'Karamoja Region (Uganda)',
  'Turkana North Sub-County', 'Turkana Central Sub-County', 'Turkana East Sub-County',
  'Turkana South Sub-County', 'Loima Sub-County', 'Kibish Sub-County',
  'Kotido District', 'Moroto District', 'Kaabong District', 'Abim District', 'Napak District',
];

export default function Submit() {
  const [form, setForm] = useState({
    org: '', contact: '', type: '', level: '', region: '', validPeriod: '', title: '', content: '', attachment: null,
  });
  const [dragActive, setDragActive] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const [snackSeverity, setSnackSeverity] = useState('success');
  const [refNum, setRefNum] = useState('');
  const [token, setToken] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const wpConfigured = Boolean(getWpBaseUrl());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(sessionStorage.getItem(TOKEN_KEY));
    }
  }, []);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    // Demo authentication
    if (loginForm.username === 'your-email@domian.com' && loginForm.password === 'admin123') {
      const demoToken = 'DEMO_JWT_TOKEN_' + Date.now();
      sessionStorage.setItem(TOKEN_KEY, demoToken);
      setToken(demoToken);
      setLoginOpen(false);
      setLoginForm({ username: '', password: '' });
      setSnackSeverity('success');
      setSnackMsg('Demo login successful! You can now submit advisories.');
      setSnackOpen(true);
      return;
    }
    
    try {
      const jwt = await getJwtToken(loginForm.username, loginForm.password);
      sessionStorage.setItem(TOKEN_KEY, jwt);
      setToken(jwt);
      setLoginOpen(false);
      setLoginForm({ username: '', password: '' });
    } catch (err) {
      setLoginError(err.message || 'Login failed. For demo, use your-email@domian.com / admin123');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    setForm((f) => ({ ...f, attachment: file }));
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setForm((f) => ({ ...f, attachment: null }));
    setFilePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setLoginOpen(true);
      return;
    }

    setSubmitting(true);
    
    // Demo submission
    if (token.startsWith('DEMO_JWT_TOKEN')) {
      setTimeout(() => {
        const ref = `DEMO-${Date.now().toString().slice(-6)}`;
        setRefNum(ref);
        setSnackSeverity('success');
        setSnackMsg(`Advisory submitted successfully! Reference: ${ref}. Your advisory will be verified by administrators before publishing to the Climate Hub.`);
        setSnackOpen(true);
        setForm({ org: '', contact: '', type: '', level: '', region: '', validPeriod: '', title: '', content: '', attachment: null });
        setSubmitting(false);
      }, 1500);
      return;
    }
    
    if (!wpConfigured) {
      setSnackSeverity('warning');
      setSnackMsg('WordPress is not configured. Set NEXT_PUBLIC_WP_BASE_URL in .env.local.');
      setSnackOpen(true);
      setSubmitting(false);
      return;
    }

    try {
      const result = await submitAdvisory(form, token);
      const ref = `WP-${result.id}`;
      setRefNum(ref);
      setSnackSeverity('success');
      setSnackMsg(`Advisory submitted successfully! Reference: ${ref}. Your advisory will be verified by administrators before publishing to the Climate Hub.`);
      setSnackOpen(true);
      setForm({ org: '', contact: '', type: '', level: '', region: '', validPeriod: '', title: '', content: '', attachment: null });
    } catch (err) {
      setSnackSeverity('error');
      setSnackMsg(err.message || 'Submission failed');
      setSnackOpen(true);
      if (err.message?.toLowerCase().includes('token') || err.message?.includes('401')) {
        sessionStorage.removeItem(TOKEN_KEY);
        setToken(null);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: 'white',
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D4A96A' },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7BB4' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#2E7BB4' },
  };

  return (
    <Layout title="Submit Advisory">
      <PageHero title="Submit an Advisory or Forecast" subtitle="For verified organisations only - reviewed before publication" image="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&q=70" breadcrumbs={['Submit Advisory']} />

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'flex-start' }}>
          <Box sx={{ flex: '2 1 560px' }}>
            {!wpConfigured && (
              <Alert severity="info" sx={{ mb: 3 }}>
                CMS URL not set - configure <code>NEXT_PUBLIC_WP_BASE_URL</code> to enable live submissions.
              </Alert>
            )}

            <Alert severity="warning" sx={{ mb: 3, bgcolor: '#FFF4EC', border: '1px solid #E87010' }}>
              <strong>Verified organisations only.</strong> Log in with your WordPress editor account before submitting.
              {token ? (
                <Button size="small" onClick={handleLogout} sx={{ ml: 2, color: '#E87010' }}>Sign out</Button>
              ) : (
                <Button size="small" onClick={() => setLoginOpen(true)} sx={{ ml: 2, color: '#E87010' }}>
                  Editor login
                </Button>
              )}
            </Alert>

            <Box component="form" onSubmit={handleSubmit} sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: { xs: 2.5, md: 3.5 } }}>
              <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '1.15rem', fontWeight: 700, color: '#3D2B1F', mb: 3 }}>Advisory Submission Form</Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
                <TextField label="Organisation Name *" value={form.org} onChange={handleChange('org')} required disabled={!token} sx={{ ...inputSx, flex: '1 1 240px' }} size="small" />
                <TextField label="Contact Name *" value={form.contact} onChange={handleChange('contact')} required disabled={!token} sx={{ ...inputSx, flex: '1 1 240px' }} size="small" />
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
                <FormControl sx={{ flex: '1 1 240px', ...inputSx }} size="small" required disabled={!token}>
                  <InputLabel>Advisory Type *</InputLabel>
                  <Select value={form.type} onChange={handleChange('type')} label="Advisory Type *" sx={{ bgcolor: 'white' }}>
                    {advisoryTypes.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl sx={{ flex: '1 1 240px', ...inputSx }} size="small" disabled={!token}>
                  <InputLabel>Alert Level</InputLabel>
                  <Select value={form.level} onChange={handleChange('level')} label="Alert Level" sx={{ bgcolor: 'white' }}>
                    {alertLevels.map((l) => (
                      <MenuItem key={l.val} value={l.val}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: l.color }} />
                          {l.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
                <FormControl sx={{ flex: '1 1 240px', ...inputSx }} size="small" required disabled={!token}>
                  <InputLabel>Region / Area Covered *</InputLabel>
                  <Select value={form.region} onChange={handleChange('region')} label="Region / Area Covered *" sx={{ bgcolor: 'white' }}>
                    {regions.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField label="Valid Period" value={form.validPeriod} onChange={handleChange('validPeriod')} disabled={!token} sx={{ ...inputSx, flex: '1 1 240px' }} size="small" />
              </Box>

              <TextField label="Advisory Title *" fullWidth required disabled={!token} value={form.title} onChange={handleChange('title')} sx={{ ...inputSx, mb: 2.5 }} size="small" />
              <TextField label="Advisory Content *" fullWidth multiline rows={6} required disabled={!token} value={form.content} onChange={handleChange('content')} sx={{ ...inputSx, mb: 2.5 }} />

              <Box 
                onDragEnter={token ? handleDrag : undefined}
                onDragLeave={token ? handleDrag : undefined}
                onDragOver={token ? handleDrag : undefined}
                onDrop={token ? handleDrop : undefined}
                sx={{ 
                  border: dragActive ? '2px dashed #C1440E' : '2px dashed #E8E0D5', 
                  borderRadius: 2, 
                  p: 3, 
                  bgcolor: dragActive ? '#FFF0EC' : '#FDF6EC', 
                  mb: 3,
                  transition: 'all 0.2s',
                  opacity: !token ? 0.6 : 1,
                }}
              >
                <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', mb: 1 }}>Attach Supporting Document</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#9A9A9A', mb: 2 }}>
                  {token ? 'Drag & drop or click to upload PDF, Word, Excel, or image files (max 10MB)' : 'Sign in to enable file upload'}
                </Typography>
                
                {token && !form.attachment && (
                  <Button
                    variant="outlined"
                    component="label"
                    sx={{ borderColor: '#C1440E', color: '#C1440E', '&:hover': { bgcolor: '#FFF0EC', borderColor: '#C1440E' } }}
                  >
                    Choose File
                    <input type="file" hidden accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" onChange={handleFileChange} />
                  </Button>
                )}
                
                {form.attachment && (
                  <Box sx={{ mt: 2 }}>
                    {filePreview && (
                      <Box sx={{ mb: 2, textAlign: 'center' }}>
                        <Box
                          component="img"
                          src={filePreview}
                          alt="Preview"
                          sx={{ maxWidth: '100%', maxHeight: 200, borderRadius: 1, border: '1px solid #E8E0D5' }}
                        />
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <Chip 
                        label={form.attachment.name} 
                        onDelete={removeFile} 
                        sx={{ bgcolor: '#C1440E', color: 'white' }} 
                      />
                      <Typography sx={{ fontSize: '0.7rem', color: '#9A9A9A' }}>({(form.attachment.size / 1024).toFixed(1)} KB)</Typography>
                      <Button
                        variant="text"
                        component="label"
                        size="small"
                        sx={{ color: '#2E7BB4', fontSize: '0.7rem' }}
                      >
                        Change
                        <input type="file" hidden accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" onChange={handleFileChange} />
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>

              <Button 
                type={token ? "submit" : "button"}
                variant="contained" 
                size="large" 
                fullWidth 
                disabled={submitting} 
                onClick={!token ? () => setLoginOpen(true) : undefined}
                sx={{ bgcolor: '#C1440E', py: 1.5 }}
              >
                {submitting ? 'Submitting…' : token ? 'Submit Advisory for Review' : 'Sign in to Submit'}
              </Button>
            </Box>
          </Box>

          <Box sx={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ bgcolor: '#3D2B1F', borderRadius: 2, p: 3 }}>
              <Typography sx={{ color: '#D4A96A', fontWeight: 700, mb: 2 }}>Emergency Publication</Typography>
              <Typography sx={{ color: '#E8E0D5', fontSize: '0.8rem', lineHeight: 1.65 }}>For RED-level alerts requiring immediate publication, contact the duty officer directly.</Typography>
            </Box>
            <Box sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 2.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', mb: 2 }}>Alert Level Guide</Typography>
              {alertLevels.map((l) => (
                <Box key={l.val} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: l.color }} />
                  <Typography sx={{ fontSize: '0.78rem', color: '#5A5A5A' }}>{l.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      <Dialog open={loginOpen} onClose={() => setLoginOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Montserrat", sans-serif' }}>Editor Login</DialogTitle>
        <Box component="form" onSubmit={handleLogin}>
          <DialogContent>
            <Typography sx={{ fontSize: '0.85rem', color: '#5A5A5A', mb: 2 }}>Sign in with your WordPress editor account (JWT).</Typography>
            <Alert severity="info" sx={{ mb: 2, fontSize: '0.75rem' }}>
              <strong>Demo credentials:</strong><br />
              Email: your-email@domian.com<br />
              Password: admin123
            </Alert>
            {loginError && <Alert severity="error" sx={{ mb: 2 }}>{loginError}</Alert>}
            <TextField label="Email" fullWidth required value={loginForm.username} onChange={(e) => setLoginForm((f) => ({ ...f, username: e.target.value }))} sx={{ mb: 2 }} size="small" placeholder="your-email@domian.com" />
            <TextField label="Password" type="password" fullWidth required value={loginForm.password} onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))} size="small" placeholder="admin123" />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setLoginOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#C1440E' }}>Sign in</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Snackbar open={snackOpen} autoHideDuration={8000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackSeverity} onClose={() => setSnackOpen(false)}>
          {snackMsg || (refNum && `Advisory submitted! Reference: ${refNum}`)}
        </Alert>
      </Snackbar>
    </Layout>
  );
}
