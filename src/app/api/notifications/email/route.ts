import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { order_number, first_name, last_name, total_xof, phone, city } = body;

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@eurekabeauty.com';
    const deliveryEmail = process.env.DELIVERY_NOTIFICATION_EMAIL || 'livraison@eurekabeauty.com';

    console.log(`[EMAIL ALERT] New Order Received #${order_number}`);
    console.log(`To Admin: ${adminEmail}`);
    console.log(`To Delivery: ${deliveryEmail}`);
    console.log(`Details: ${first_name} ${last_name} - ${total_xof} XOF - ${phone} (${city})`);

    // If Resend or SMTP API key is configured, send actual email
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const emailHtml = `
        <div style="font-family: sans-serif; padding: 20px; color: #141414;">
          <h2 style="color: #c5a059;">🚨 Nouvelle Commande Eureka Beauty !</h2>
          <p>Une nouvelle commande vient d'être créée sur le site :</p>
          <ul>
            <li><strong>Numéro de commande :</strong> #${order_number}</li>
            <li><strong>Client :</strong> ${first_name} ${last_name}</li>
            <li><strong>Montant Total :</strong> ${Number(total_xof).toLocaleString()} XOF</li>
            <li><strong>Téléphone :</strong> ${phone}</li>
            <li><strong>Ville :</strong> ${city}</li>
          </ul>
          <p><a href="https://eureka-beauty.vercel.app/admin/orders" style="background-color: #c5a059; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; font-weight: bold;">Voir la commande dans l'Admin</a></p>
        </div>
      `;

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Eureka Beauty <orders@eurekabeauty.com>',
          to: [adminEmail, deliveryEmail],
          subject: `🚨 Nouvelle Commande #${order_number} - ${first_name} ${last_name}`,
          html: emailHtml,
        }),
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Notification e-mail envoyée avec succès',
      recipients: [adminEmail, deliveryEmail]
    });

  } catch (error: any) {
    console.error('Error processing order email alert:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
