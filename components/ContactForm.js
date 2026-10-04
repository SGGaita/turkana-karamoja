import { useState } from 'react';
import { Box, Typography, TextField, Button, Alert } from '@mui/material';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import { getWpBaseUrl, submitContactForm } from '../lib/wordpress';

const inputSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: 'white',
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D4A96A' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#C1440E' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#C1440E' },
};

export default function ContactForm({ title, intro }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const wpConfigured = Boolean(getWpBaseUrl());

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    if (!wpConfigured) {
      setTimeout(() => {
        setStatus({
          severity: 'success',
          message: 'Thank you. Your message was recorded locally (demo mode — configure WordPress to send email).',
        });
        setForm({ name: '', email: '', phone: '', organization: '', subject: '', message: '' });
        setSubmitting(false);
      }, 800);
      return;
    }

    try {
      const result = await submitContactForm(form);
      setStatus({
        severity: 'success',
        message: result.message || 'Thank you. Your message has been sent.',
      });
      setForm({ name: '', email: '', phone: '', organization: '', subject: '', message: '' });
    } catch (err) {
      setStatus({
        severity: 'error',
        message: err.message || 'Unable to send your message. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        bgcolor: 'white',
        border: '1px solid #E8E0D5',
        borderRadius: 3,
        p: { xs: 2.5, md: 3.5 },
        boxShadow: '0 8px 28px rgba(61,43,31,0.06)',
      }}
    >
      <Typography
        sx={{
          fontFamily: '"Montserrat", sans-serif',
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#3D2B1F',
          mb: 1,
        }}
      >
        {title || 'Send us a message'}
      </Typography>
      {intro && (
        <Typography sx={{ fontSize: '0.9rem', color: '#5A5A5A', mb: 3, lineHeight: 1.7 }}>
          {intro}
        </Typography>
      )}

      {status && (
        <Alert severity={status.severity} sx={{ mb: 2.5 }} onClose={() => setStatus(null)}>
          {status.message}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <TextField
          label="Full name *"
          required
          value={form.name}
          onChange={handleChange('name')}
          sx={{ ...inputSx, flex: '1 1 200px' }}
          size="small"
        />
        <TextField
          label="Email *"
          type="email"
          required
          value={form.email}
          onChange={handleChange('email')}
          sx={{ ...inputSx, flex: '1 1 200px' }}
          size="small"
        />
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <TextField
          label="Phone"
          value={form.phone}
          onChange={handleChange('phone')}
          sx={{ ...inputSx, flex: '1 1 160px' }}
          size="small"
        />
        <TextField
          label="Organisation"
          value={form.organization}
          onChange={handleChange('organization')}
          sx={{ ...inputSx, flex: '1 1 200px' }}
          size="small"
        />
      </Box>

      <TextField
        label="Subject"
        value={form.subject}
        onChange={handleChange('subject')}
        sx={{ ...inputSx, width: '100%', mb: 2 }}
        size="small"
        placeholder="e.g. Partnership enquiry, data request"
      />

      <TextField
        label="Message *"
        required
        multiline
        minRows={5}
        value={form.message}
        onChange={handleChange('message')}
        sx={{ ...inputSx, width: '100%', mb: 2.5 }}
      />

      <Button
        type="submit"
        variant="contained"
        disabled={submitting}
        endIcon={<SendOutlinedIcon />}
        sx={{
          bgcolor: '#C1440E',
          color: 'white',
          textTransform: 'none',
          fontFamily: '"Montserrat", sans-serif',
          fontWeight: 600,
          px: 3,
          py: 1.1,
          borderRadius: 2,
          boxShadow: 'none',
          '&:hover': { bgcolor: '#A3380C', boxShadow: 'none' },
        }}
      >
        {submitting ? 'Sending…' : 'Send message'}
      </Button>
    </Box>
  );
}
