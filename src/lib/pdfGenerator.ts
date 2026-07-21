import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from './db';

export const generateInvoicePDF = (order: Order, formatPrice: (amount: number) => string) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const goldColor: [number, number, number] = [197, 160, 89]; // #c5a059
  const darkColor: [number, number, number] = [20, 20, 20];   // #141414
  const grayColor: [number, number, number] = [100, 100, 100];

  // 1. Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...darkColor);
  doc.text('EUREKA BEAUTY', 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...goldColor);
  doc.text('RÉVÉLEZ VOTRE BEAUTÉ NATURELLE', 14, 25);

  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  doc.text('Lomé, Togo • eurekasupplytg@gmail.com | +228 93 86 67 52', 14, 30);

  // 2. Invoice Meta (Right-aligned)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...darkColor);
  doc.text('FACTURE', 196, 20, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  doc.text(`N° Facture : `, 150, 26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text(order.order_number, 196, 26, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text(`Date : ${new Date(order.created_at).toLocaleDateString('fr-FR', { dateStyle: 'long' })}`, 196, 31, { align: 'right' });

  const statusText = order.payment_status === 'Paid' ? 'PAYÉ' : 'À PAYER À LA LIVRAISON (COD)';
  doc.text(`Statut : `, 145, 36);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...goldColor);
  doc.text(statusText, 196, 36, { align: 'right' });

  // Divider Line
  doc.setDrawColor(...goldColor);
  doc.setLineWidth(0.5);
  doc.line(14, 41, 196, 41);

  // 3. Customer & Shipping Info (2-column Boxes)
  const boxTop = 46;
  const boxHeight = 32;
  const colWidth = 88;

  // Facturé à
  doc.setFillColor(250, 247, 242);
  doc.setDrawColor(226, 215, 197);
  doc.roundedRect(14, boxTop, colWidth, boxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...darkColor);
  doc.text('FACTURÉ À :', 18, boxTop + 6);

  doc.setFontSize(9);
  doc.text(`${order.first_name} ${order.last_name}`, 18, boxTop + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...grayColor);
  doc.text(`Email : ${order.email}`, 18, boxTop + 17);
  doc.text(`Téléphone : ${order.phone}`, 18, boxTop + 22);
  if (order.whatsapp) {
    doc.text(`WhatsApp : ${order.whatsapp}`, 18, boxTop + 27);
  }

  // Adresse d'expédition
  doc.setFillColor(250, 247, 242);
  doc.roundedRect(108, boxTop, colWidth, boxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...darkColor);
  doc.text("ADRESSE D'EXPÉDITION :", 112, boxTop + 6);

  doc.setFontSize(9);
  doc.text(order.address_line, 112, boxTop + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...grayColor);
  doc.text(`${order.city}, ${order.country}`, 112, boxTop + 17);
  doc.text(`Paiement : ${order.payment_method}`, 112, boxTop + 22);
  if (order.delivery_instructions) {
    doc.text(`Note : ${order.delivery_instructions.substring(0, 38)}`, 112, boxTop + 27);
  }

  // 4. Products Table using autoTable
  const tableData = order.items.map((item) => [
    item.product_name,
    item.quantity.toString(),
    formatPrice(item.unit_price_xof),
    formatPrice(item.total_price_xof),
  ]);

  autoTable(doc, {
    startY: 84,
    head: [['Description du Produit', 'Qté', 'Prix Unitaire', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: goldColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
    },
    bodyStyles: {
      textColor: darkColor,
      fontSize: 8.5,
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { halign: 'center', cellWidth: 25 },
      2: { halign: 'right', cellWidth: 35 },
      3: { halign: 'right', cellWidth: 32 },
    },
    alternateRowStyles: {
      fillColor: [252, 250, 247],
    },
  });

  // 5. Totals Section
  const finalY = (doc as any).lastAutoTable?.finalY || 130;
  const totalsTop = finalY + 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...grayColor);

  doc.text('Sous-total articles :', 135, totalsTop);
  doc.setTextColor(...darkColor);
  doc.text(formatPrice(order.subtotal_xof), 196, totalsTop, { align: 'right' });

  let currentY = totalsTop + 5;
  if (order.discount_xof > 0) {
    doc.setTextColor(...goldColor);
    doc.text('Remises appliquées :', 135, currentY);
    doc.text(`-${formatPrice(order.discount_xof)}`, 196, currentY, { align: 'right' });
    currentY += 5;
  }

  doc.setTextColor(...grayColor);
  doc.text("Frais d'expédition :", 135, currentY);
  doc.setTextColor(...darkColor);
  doc.text(formatPrice(order.shipping_cost_xof), 196, currentY, { align: 'right' });

  currentY += 4;
  doc.setDrawColor(...darkColor);
  doc.setLineWidth(0.4);
  doc.line(135, currentY, 196, currentY);

  currentY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkColor);
  doc.text('Montant Net à Payer :', 135, currentY);

  doc.setFontSize(11);
  doc.setTextColor(...goldColor);
  doc.text(formatPrice(order.total_xof), 196, currentY, { align: 'right' });

  // 6. Footer Terms
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...grayColor);
  doc.text('Nous vous remercions de votre confiance. Pour tout renseignement, écrivez-nous à eurekasupplytg@gmail.com.', 105, pageHeight - 14, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...darkColor);
  doc.text('EUREKA BEAUTY — REVEAL YOUR NATURAL BEAUTY', 105, pageHeight - 9, { align: 'center' });

  // Save the PDF file
  doc.save(`Facture-${order.order_number}.pdf`);
};
