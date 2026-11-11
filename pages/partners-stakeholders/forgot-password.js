import { useEffect, useState } from 'react';
import { Container, Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import Layout from '../../components/Layout';
import PageHero from '../../components/PageHero';
import Turnstile, { captchaEnabled } from '../../components/Turnstile';
import { coreAuthAvailable, requestPasswordReset, wpLostPasswordUrl } from '../../lib/partner-auth';
import HelpStepLink from '../../components/HelpStepLink';

export default function ForgotPassword() {
  const [ready, setReady] = useState(null); // null = checking, true = Core, false = fallback
  const [email, setEmail] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [resetKey, setResetKey] = useState(0);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    coreAuthAvailable().then(setReady);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      const res = await requestPasswordReset(email.trim(), captcha);
      setDone(res.message || 'If that email belongs to a partner account, we have sent a link. Check your inbox and spam folder.');
    } catch (err) {
      setError(err.message);
      setCaptcha('');
      setResetKey((k) => k + 1);
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout title="Forgot your password?">
      <PageHero
        title="Forgot your password?"
        subtitle="We'll email you a link to choose a new one."
        breadcrumbs={['Partners & Stakeholders', 'Forgot password']}
      />
      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
        <Box sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: { xs: 2.5, md: 3.5 } }}>
          {ready === null && <Box sx={{ textAlign: 'center', py: 3 }}><CircularProgress size={24} sx={{ color: '#C1440E' }} /></Box>}
          {ready === false && (
            <>
              <Typography sx={{ fontSize: '0.9rem', color: '#5A5A5A', mb: 2 }}>
                Password resets are handled on the partner sign-in server for now.
              </Typography>
              <Button href={wpLostPasswordUrl()} variant="contained" sx={{ bgcolor: '#C1440E', '&:hover': { bgcolor: '#E8622A' } }}>
                Reset my password
              </Button>
              <HelpStepLink article="partner-forgot-password" sx={{ display: 'flex', mt: 2 }} />
            </>
          )}
          {ready && done && <Alert severity="success">{done}</Alert>}
          {ready && !done && (
            <Box component="form" onSubmit={submit}>
              <Typography sx={{ fontSize: '0.9rem', color: '#5A5A5A', mb: 2 }}>
                Enter the email address your organisation registered with. The link works once and expires after an hour.
              </Typography>
              <HelpStepLink article="partner-forgot-password" sx={{ mb: 2 }} />
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <TextField label="Email" type="email" autoComplete="email" fullWidth required size="small" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Turnstile onToken={setCaptcha} resetKey={resetKey} />
              <Button type="submit" variant="contained" disabled={sending || (captchaEnabled && !captcha)} sx={{ mt: 2, bgcolor: '#C1440E', '&:hover': { bgcolor: '#E8622A' } }}>
                {sending ? 'Sending…' : 'Send me a link'}
              </Button>
            </Box>
          )}
        </Box>
      </Container>
    </Layout>
  );
}
