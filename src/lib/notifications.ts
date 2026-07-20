'use client';

// Sound Notification synthesized via Web Audio API (no external asset needed)
export const playNotificationSound = () => {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // First chime note
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.3);

    // Second higher chime note
    setTimeout(() => {
      try {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
        gain2.gain.setValueAtTime(0.4, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.4);
      } catch (e) {}
    }, 150);

  } catch (e) {
    console.error('Notification audio playback error:', e);
  }
};

// Request Browser Push Notification Permission
export const requestNotificationPermission = async () => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (e) {}
    }
  }
};

// Trigger Local/Browser Push Notification
export const notifyNewOrder = (orderNumber: string, customerName: string, totalXof: number) => {
  playNotificationSound();

  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const notif = new Notification(`🚨 Nouvelle Commande ! #${orderNumber}`, {
        body: `Client: ${customerName}\nMontant: ${totalXof.toLocaleString()} XOF`,
        icon: '/favicon.ico',
        tag: `order-${orderNumber}`,
      });

      notif.onclick = () => {
        window.focus();
        if (window.location.pathname.startsWith('/dashboard')) {
          window.location.href = '/dashboard';
        } else {
          window.location.href = '/admin/orders';
        }
      };
    } catch (e) {
      console.error('Push notification trigger error:', e);
    }
  }
};

// Send Order Email Alert via Next.js API route
export const sendOrderEmailAlert = async (order: {
  order_number: string;
  first_name: string;
  last_name: string;
  total_xof: number;
  phone: string;
  city: string;
}) => {
  try {
    const res = await fetch('/api/notifications/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return { success: false, error: errorText || `HTTP ${res.status}` };
    }

    const data = await res.json();
    return data;
  } catch (e: any) {
    console.error('Email alert dispatch error:', e);
    return { success: false, error: e.message };
  }
};
