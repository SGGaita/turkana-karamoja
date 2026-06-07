import { useState } from 'react';
import { Button, Snackbar, Alert } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export default function PushSubscribeButton({ compact = false }) {
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  const subscribe = async () => {
    if (!vapidPublic) {
      setMsg({ type: 'warning', text: 'Push notifications are not configured yet.' });
      return;
    }
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setMsg({ type: 'warning', text: 'Push is not supported in this browser.' });
      return;
    }

    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setMsg({ type: 'info', text: 'Notification permission was not granted.' });
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublic),
        });
      }

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      });

      if (!res.ok) throw new Error('Failed to save subscription');
      setMsg({ type: 'success', text: 'You will receive alerts when new warnings are published.' });
    } catch (e) {
      setMsg({ type: 'error', text: e.message || 'Could not enable notifications.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        size={compact ? 'small' : 'medium'}
        variant="outlined"
        startIcon={<NotificationsActiveIcon />}
        onClick={subscribe}
        disabled={loading}
        sx={{
          borderColor: '#C1440E',
          color: '#C1440E',
          '&:hover': { bgcolor: '#FFF0EC' },
        }}
      >
        {loading ? 'Enabling…' : 'Get alert notifications'}
      </Button>
      <Snackbar open={Boolean(msg)} autoHideDuration={5000} onClose={() => setMsg(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {msg && (
          <Alert severity={msg.type} onClose={() => setMsg(null)}>
            {msg.text}
          </Alert>
        )}
      </Snackbar>
    </>
  );
}
