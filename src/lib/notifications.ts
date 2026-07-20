'use client';

import { supabase, HAS_SUPABASE_CREDS } from './supabaseClient';

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

// Send Order Email Alert directly via Resend API
export const sendOrderEmailAlert = async (
  order: {
    order_number: string;
    first_name: string;
    last_name: string;
    total_xof: number;
    phone: string;
    city: string;
  },
  overrideApiKey?: string
) => {
  try {
    const resendApiKey =
      overrideApiKey ||
      process.env.NEXT_PUBLIC_RESEND_API_KEY ||
      process.env.RESEND_API_KEY ||
      (typeof window !== 'undefined' ? localStorage.getItem('eb_resend_key') : null);

    if (!resendApiKey) {
      console.log('💡 Resend API Key is not set.');
      return { success: false, resendStatus: 'not_configured', message: 'Clé Resend absente' };
    }

    let recipientEmails: string[] = [];

    if (HAS_SUPABASE_CREDS) {
      const { data: staffMembers } = await supabase
        .from('customers')
        .select('email, role')
        .in('role', ['admin', 'delivery']);

      if (staffMembers && staffMembers.length > 0) {
        recipientEmails = staffMembers.map((s: any) => s.email).filter(Boolean);
      }
    }

    if (recipientEmails.length === 0) {
      recipientEmails = ['admin@eurekabeauty.com'];
    }

    recipientEmails = Array.from(new Set(recipientEmails.map((e) => e.toLowerCase().trim())));

    const fromEmail = process.env.NEXT_PUBLIC_RESEND_FROM_EMAIL || 'Eureka Beauty <onboarding@resend.dev>';

    const emailHtml = `
      <div style="font-family: sans-serif; padding: 24px; color: #141414; background-color: #faf7f2; border-radius: 12px; border: 1px solid #e2d7c5;">
        <h2 style="color: #c5a059; font-size: 22px; margin-bottom: 8px;">🚨 Nouvelle Commande Eureka Beauty !</h2>
        <p style="font-size: 14px; color: #555;">Une nouvelle commande vient d'être enregistrée sur la boutique :</p>
        <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; border: 1px solid #e0e0e0; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>• Numéro de Commande :</strong> #${order.order_number}</p>
          <p style="margin: 4px 0;"><strong>• Client :</strong> ${order.first_name} ${order.last_name}</p>
          <p style="margin: 4px 0;"><strong>• Montant Total :</strong> <span style="color: #c5a059; font-weight: bold;">${Number(order.total_xof).toLocaleString()} XOF</span></p>
          <p style="margin: 4px 0;"><strong>• Téléphone :</strong> ${order.phone}</p>
          <p style="margin: 4px 0;"><strong>• Ville de livraison :</strong> ${order.city}</p>
        </div>
        <p><a href="https://eureka-beauty.vercel.app/admin/orders" style="display: inline-block; background-color: #c5a059; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px;">Gérer les commandes dans l'Admin</a></p>
      </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: recipientEmails,
        subject: `🚨 Nouvelle Commande #${order.order_number} - ${order.first_name} ${order.last_name}`,
        html: emailHtml,
      }),
    });

    const resendResponse = await res.json();
    console.log('[RESEND DIRECT RESPONSE]', res.status, resendResponse);

    return {
      success: res.ok,
      resendStatus: res.ok ? 'sent' : 'error',
      resendResponse,
      recipients: recipientEmails,
    };
  } catch (e: any) {
    console.error('Email alert dispatch error:', e);
    return { success: false, resendStatus: 'exception', error: e.message };
  }
};
