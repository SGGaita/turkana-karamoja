import { useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, TextField, Button, Alert, LinearProgress } from '@mui/material';
import { passwordHint, setPassword, resetPassword } from '../lib/partner-auth';
import HelpStepLink from './HelpStepLink';

/**
 * Choose a password from an emailed link: kind 'setup' (after approval) or 'reset'.
 * The link carries ?uid=…&token=…; the CMS checks it, so nothing here is trusted.
 */
export default function PasswordSetForm({ kind }) {
  const router = useRouter();
  const { uid, token } = router.query;
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [error, setError] = useState('');
  const [linkBad, setLinkBad] = useState(false);
  const [saving, setSaving] = useState(false);
  const hint = passwordHint(pw);

  if (router.isReady && (!uid || !token)) {
    return <LinkProblem kind={kind} />;
  }
  if (linkBad) {
    return <LinkProblem kind={kind} message={error} />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (pw !== pw2) {
      setError('The two passwords are not the same.');
      return;
    }
    setSaving(true);
    try {
      await (kind === 'setup' ? setPassword : resetPassword)(String(uid), String(token), pw);
      router.replace('/partners-stakeholders?password=updated');
    } catch (err) {
      setError(err.message);
      if (err.code === 'karamoja_link_invalid' || err.code === 'karamoja_link_expired') setLinkBad(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={submit} sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: { xs: 2.5, md: 3.5 } }}>
      <Typography sx={{ fontSize: '0.9rem', color: '#5A5A5A', mb: 2 }}>
        Use at least 10 characters. A few unrelated words with a number or symbol work well. Don&apos;t use your
        email, name or organisation name.
      </Typography>
      <HelpStepLink article={kind === 'setup' ? 'partner-set-password' : 'partner-forgot-password'} sx={{ mb: 2 }} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        label="New password" type="password" autoComplete="new-password" fullWidth required size="small"
        value={pw} onChange={(e) => setPw(e.target.value)} inputProps={{ minLength: 10 }}
      />
      {pw && (
        <Box sx={{ mt: 1, mb: 1 }}>
          <LinearProgress
            variant="determinate" value={(hint.score / 3) * 100}
            sx={{ height: 6, borderRadius: 3, bgcolor: '#F0EBE3', '& .MuiLinearProgress-bar': { bgcolor: hint.color } }}
          />
          <Typography sx={{ fontSize: '0.75rem', color: hint.color, mt: 0.5 }}>{hint.label}</Typography>
        </Box>
      )}
      <TextField
        label="Type it again" type="password" autoComplete="new-password" fullWidth required size="small" sx={{ mt: 2 }}
        value={pw2} onChange={(e) => setPw2(e.target.value)}
      />
      <Button type="submit" variant="contained" disabled={saving || hint.score < 1} sx={{ mt: 3, bgcolor: '#C1440E', '&:hover': { bgcolor: '#E8622A' } }}>
        {saving ? 'Saving…' : 'Save password'}
      </Button>
    </Box>
  );
}

function LinkProblem({ kind, message }) {
  return (
    <Box sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: { xs: 2.5, md: 3.5 } }}>
      <Alert severity="warning" sx={{ mb: 2 }}>
        {message || 'This link is incomplete. Open it again from the email, or ask for a new one.'}
      </Alert>
      <Button href="/partners-stakeholders/forgot-password" variant="contained" sx={{ bgcolor: '#C1440E', '&:hover': { bgcolor: '#E8622A' } }}>
        {kind === 'setup' ? 'Send me a new link' : 'Ask for a new reset link'}
      </Button>
      <HelpStepLink article="partner-link-expired" sx={{ display: 'flex', mt: 2 }} />
    </Box>
  );
}
