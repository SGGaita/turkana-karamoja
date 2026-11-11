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
import { useT } from '../contexts/LanguageContext';

const MESSAGE_KEYS = {
  PERMISSION_BLOCKED: 'push.msg_blocked',
  PERMISSION_DENIED: 'push.msg_denied',
  INSECURE: 'push.msg_insecure',
  SW_TIMEOUT: 'push.msg_sw_timeout',
  IOS_INSTALL: 'push.msg_ios',
  UNSUPPORTED: 'push.msg_unsupported',
};

function permissionMessage(code, t) {
  return t(MESSAGE_KEYS[code] || 'push.msg_failed');
}

const PLACEHOLDER_SX = (compact) => ({
  width: compact ? 148 : 188,
  height: compact ? 32 : 36,
  flexShrink: 0,
});

export default function PushSubscribeButton({ compact = false }) {
  const t = useT();
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
      setMsg({ type: 'warning', text: t('push.msg_not_configured') });
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
      setMsg({ type: 'warning', text: permissionMessage('PERMISSION_BLOCKED', t) });
      return;
    }

    setLoading(true);
    try {
      await subscribeToPush(vapidPublic);
      setPermission('granted');
      setSubscribed(true);
      setMsg({ type: 'success', text: t('push.msg_on') });
    } catch (e) {
      const code = e.message;
      setPermission(getNotificationPermission());
      setMsg({
        type: code === 'PERMISSION_DENIED' ? 'info' : 'warning',
        text: permissionMessage(code, t),
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
      setMsg({ type: 'info', text: t('push.msg_off') });
    } catch (e) {
      setMsg({ type: 'error', text: t('push.msg_off_failed') });
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
    ? t('push.wait')
    : subscribed
      ? t('push.enabled')
      : insecure
        ? t('push.needs_https')
        : blocked
          ? t('push.blocked')
          : t('push.subscribe');

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
