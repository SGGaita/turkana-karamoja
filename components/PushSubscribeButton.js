import { useEffect, useState } from 'react';
import { Box, Button, Snackbar, Alert } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import BlockIcon from '@mui/icons-material/Block';
import {
  isPushSupported,
  getNotificationPermission,
  getExistingSubscription,
  subscribeToPush,
  unsubscribeFromPush,
} from '../lib/push-client';

function permissionMessage(code) {
  switch (code) {
    case 'PERMISSION_BLOCKED':
      return 'Notifications are blocked for this site. Click the lock icon in your browser address bar, allow notifications, then try again.';
    case 'PERMISSION_DENIED':
      return 'Please click Allow when your browser asks to send notifications.';
    case 'INSECURE':
      return 'Notifications only work on HTTPS or localhost. Open the site via http://localhost:3000 instead of an IP address.';
    default:
      return 'Could not enable notifications.';
  }
}

const PLACEHOLDER_SX = (compact) => ({
  width: compact ? 148 : 188,
  height: compact ? 32 : 36,
  flexShrink: 0,
});

export default function PushSubscribeButton({ compact = false }) {
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [permission, setPermission] = useState('default');
  const [mounted, setMounted] = useState(false);
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    setMounted(true);
    setPermission(getNotificationPermission());

    if (!isPushSupported() || !vapidPublic) {
      return;
    }

    getExistingSubscription()
      .then((sub) => setSubscribed(Boolean(sub)))
      .catch(() => setSubscribed(false));
  }, [vapidPublic]);

  const handleSubscribe = async () => {
    if (!vapidPublic) {
      setMsg({ type: 'warning', text: 'Push notifications are not configured yet.' });
      return;
    }
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setMsg({ type: 'warning', text: permissionMessage('INSECURE') });
      return;
    }
    if (!isPushSupported()) {
      setMsg({ type: 'warning', text: 'Push is not supported in this browser.' });
      return;
    }

    const currentPermission = getNotificationPermission();
    setPermission(currentPermission);
    if (currentPermission === 'denied') {
      setMsg({ type: 'warning', text: permissionMessage('PERMISSION_BLOCKED') });
      return;
    }

    setLoading(true);
    try {
      await subscribeToPush(vapidPublic);
      setPermission('granted');
      setSubscribed(true);
      setMsg({ type: 'success', text: 'You will receive alerts when new warnings are published.' });
    } catch (e) {
      const code = e.message;
      setPermission(getNotificationPermission());
      setMsg({
        type: code === 'PERMISSION_DENIED' ? 'info' : 'warning',
        text: permissionMessage(code),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    try {
      await unsubscribeFromPush();
      setSubscribed(false);
      setMsg({ type: 'info', text: 'Alert notifications have been turned off.' });
    } catch (e) {
      setMsg({ type: 'error', text: e.message || 'Could not turn off notifications.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (subscribed) {
      handleUnsubscribe();
    } else {
      handleSubscribe();
    }
  };

  if (!mounted) {
    return <Box aria-hidden sx={PLACEHOLDER_SX(compact)} />;
  }

  const blocked = permission === 'denied';
  const label = loading
    ? 'Please wait…'
    : subscribed
      ? 'Alerts enabled'
      : blocked
        ? 'Notifications blocked'
        : 'Get alert notifications';

  return (
    <>
      <Button
        size={compact ? 'small' : 'medium'}
        variant={subscribed ? 'contained' : 'outlined'}
        startIcon={
          subscribed
            ? <NotificationsActiveIcon />
            : blocked
              ? <BlockIcon />
              : <NotificationsOffIcon />
        }
        onClick={handleClick}
        disabled={loading}
        sx={{
          borderColor: blocked ? '#9A9A9A' : '#C1440E',
          color: subscribed ? '#FFFFFF' : blocked ? '#9A9A9A' : '#C1440E',
          bgcolor: subscribed ? '#C1440E' : 'transparent',
          whiteSpace: { xs: 'normal', sm: 'nowrap' },
          textAlign: 'center',
          '&:hover': {
            bgcolor: subscribed ? '#A33800' : blocked ? 'transparent' : '#FFF0EC',
            borderColor: blocked ? '#9A9A9A' : '#C1440E',
          },
        }}
      >
        {label}
      </Button>
      <Snackbar
        open={Boolean(msg)}
        autoHideDuration={blocked ? 10000 : 6000}
        onClose={() => setMsg(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {msg && (
          <Alert severity={msg.type} onClose={() => setMsg(null)} sx={{ maxWidth: 420 }}>
            {msg.text}
          </Alert>
        )}
      </Snackbar>
    </>
  );
}
