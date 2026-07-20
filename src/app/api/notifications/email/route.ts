import { NextResponse } from 'next/server';
import { supabase, HAS_SUPABASE_CREDS } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { order_number, first_name, last_name, total_xof, phone, city } = body;

    let recipientEmails: string[] = [];

    // 1. Fetch dynamic admin and delivery emails from Supabase customers table
    if (HAS_SUPABASE_CREDS) {
      const { data: staffMembers } = await supabase
        .from('customers')
        .select('email, role')
        .in('role', ['admin', 'delivery']);

      if (staffMembers && staffMembers.length > 0) {
        recipientEmails = staffMembers.map((s: any) => s.email).filter(Boolean);
      }
    }

    // 2. Fallback / supplementary emails from environment or defaults
    if (recipientEmails.length === 0) {
      const fallbackAdmin = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@eurekabeauty.com';
      const fallbackDelivery = process.env.DELIVERY_NOTIFICATION_EMAIL || 'livraison@eurekabeauty.com';
      recipientEmails = [fallbackAdmin, fallbackDelivery];
    }

    // Deduplicate emails
    recipientEmails = Array.from(new Set(recipientEmails.map((e) => e.toLowerCase().trim())));

    console.log(`[EMAIL NOTIFICATION] New Order #${order_number}`);
    console.log(`Dynamic Recipient List (${recipientEmails.length}):`, recipientEmails);

    const resendApiKey = process.env.RESEND_API_KEY;
    let resendStatus = 'not_configured';
    let resendResponse = null;

    if (resendApiKey) {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'Eureka Beauty <onboarding@resend.dev>';
      
      const emailHtml = `
        <div style="font-family: sans-serif; padding: 24px; color: #141414; background-color: #faf7f2; border-radius: 12px; border: 1px solid #e2d7c5;">
          <h2 style="color: #c5a059; font-size: 22px; margin-bottom: 8px;">🚨 Nouvelle Commande Eureka Beauty !</h2>
          <p style="font-size: 14px; color: #555;">Une nouvelle commande vient d'être enregistrée sur la boutique :</p>
          <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; border: 1px solid #e0e0e0; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>• Numéro de Commande :</strong> #${order_number}</p>
            <p style="margin: 4px 0;"><strong>• Client :</strong> ${first_name} ${last_name}</p>
            <p style="margin: 4px 0;"><strong>• Montant Total :</strong> <span style="color: #c5a059; font-weight: bold;">${Number(total_xof).toLocaleString()} XOF</span></p>
            <p style="margin: 4px 0;"><strong>• Téléphone :</strong> ${phone}</p>
            <p style="margin: 4px 0;"><strong>• Ville de livraison :</strong> ${city}</p>
          </div>
          <p><a href="https://eureka-beauty.vercel.app/admin/orders" style="display: inline-block; background-color: #c5a059; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px;">Gérer les commandes dans l'Admin</a></p>
        </div>
      `;

      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey.trim()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: recipientEmails,
            subject: `🚨 Nouvelle Commande #${order_number} - ${first_name} ${last_name}`,
            html: emailHtml,
          }),
        });

        resendResponse = await res.json();
        resendStatus = res.ok ? 'sent' : 'error';
        console.log(`[RESEND API RESPONSE] Status: ${res.status}`, resendResponse);
      } catch (err: any) {
        resendStatus = 'exception';
        resendResponse = { error: err.message };
        console.error('Resend fetch exception:', err);
      }
    }

    return NextResponse.json({ 
      success: resendStatus === 'sent' || resendStatus === 'not_configured', 
      resendStatus,
      resendResponse,
      recipients: recipientEmails
    });

  } catch (error: any) {
    console.error('Email notification dispatch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    hasResendKey: !!process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL || 'Eureka Beauty <onboarding@resend.dev>',
    adminEmailEnv: process.env.ADMIN_NOTIFICATION_EMAIL || 'Non défini',
  });
}
