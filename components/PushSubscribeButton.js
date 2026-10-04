import { useEffect, useState } from 'react';
import { Box, Button, Snackbar, Alert } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import BlockIcon from '@mui/icons-material/Block';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import {
  isPushSupported,
  getNotificationPermission,
  getExistingSubscription,
  needsIosHomeScreenInstall,
  subscribeToPush,
  unsubscribeFromPush,
} from '../lib/push-client';

function permissionMessage(code) {
  switch (code) {
    case 'PERMISSION_BLOCKED':
      return 'Notifications are blocked for this site. Desktop: click the icon left of the address bar → Site settings → Notifications → Allow, then reload. Android Chrome: ⋮ → Settings → Site settings → Notifications → allow this site.';
    case 'PERMISSION_DENIED':
      return 'Please click Allow when your browser asks to send notifications.';
    case 'INSECURE':
      return 'Notifications need a secure connection. This page was opened over plain http (e.g. an IP address), so the browser blocks them automatically. Use the https:// site, or http://localhost:3000 when developing.';
    case 'IOS_INSTALL':
      return 'On iPhone/iPad, tap Share → Add to Home Screen, open Karamoja from your Home Screen, then turn on alerts there.';
    case 'UNSUPPORTED':
      return 'This browser does not support push notifications. Try Chrome, Edge or Firefox.';
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
    if (needsIosHomeScreenInstall()) {
      setMsg({ type: 'info', text: permissionMessage('IOS_INSTALL') });
      return;
    }
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setMsg({ type: 'warning', text: permissionMessage('INSECURE') });
      return;
    }
    if (!isPushSupported()) {
      setMsg({ type: 'warning', text: permissionMessage('UNSUPPORTED') });
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

  const insecure = permission === 'insecure';
  const blocked = permission === 'denied';
  const label = loading
    ? 'Please wait…'
    : subscribed
      ? 'Alerts enabled'
      : insecure
        ? 'Alerts need HTTPS'
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
            : insecure
              ? <LockOpenIcon />
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
        autoHideDuration={blocked || insecure ? 12000 : 6000}
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
