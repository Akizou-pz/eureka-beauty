import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from './db';

export const generateOrderSlipPDF = (order: Order, formatPrice: (amount: number) => string) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const goldColor: [number, number, number] = [197, 160, 89]; // #c5a059
  const darkColor: [number, number, number] = [20, 20, 20];   // #141414
  const grayColor: [number, number, number] = [90, 90, 90];
  const borderBg: [number, number, number] = [252, 250, 246]; // Luxury cream

  // Helper to format currency numbers cleanly for PDF
  const cleanPrice = (amount: number) => {
    return formatPrice(amount).replace(/\s+/g, ' ');
  };

  // 1. Header (Logo / Title)
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

  // 2. Document Title (Right-aligned)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...darkColor);
  doc.text('BORDEREAU DE COMMANDE', 196, 20, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...goldColor);
  doc.text('Bon de Livraison & Reçu', 196, 25, { align: 'right' });

  // Metadata block (Right side)
  doc.setFontSize(8.5);
  doc.setTextColor(...grayColor);
  doc.text(`N° Commande : `, 145, 31);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text(order.order_number, 196, 31, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text(`Date : ${new Date(order.created_at).toLocaleDateString('fr-FR', { dateStyle: 'long' })}`, 196, 36, { align: 'right' });

  // Divider Line
  doc.setDrawColor(...goldColor);
  doc.setLineWidth(0.4);
  doc.line(14, 41, 196, 41);

  // 3. Recipient and Delivery Box (2-column Boxes)
  const boxTop = 45;
  const boxHeight = 35;
  const colWidth = 88;

  // Box 1: Recipient details
  doc.setFillColor(...borderBg);
  doc.setDrawColor(226, 215, 197);
  doc.roundedRect(14, boxTop, colWidth, boxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkColor);
  doc.text('DESTINATAIRE :', 18, boxTop + 6);

  doc.setFontSize(9);
  doc.text(`${order.first_name} ${order.last_name}`, 18, boxTop + 12);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...grayColor);
  if (order.email) {
    doc.text(`Email : ${order.email}`, 18, boxTop + 18);
  }
  doc.text(`WhatsApp : ${order.whatsapp || order.phone}`, 18, boxTop + 24);
  if (order.payment_method) {
    const pMethodText = order.payment_method === 'COD' 
      ? 'Espèces à la Livraison (COD)' 
      : order.payment_method === 'WhatsApp' 
      ? 'Par WhatsApp' 
      : order.payment_method;
    doc.text(`Mode de paiement : ${pMethodText}`, 18, boxTop + 30);
  }

  // Box 2: Delivery address details
  doc.setFillColor(...borderBg);
  doc.roundedRect(108, boxTop, colWidth, boxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkColor);
  doc.text('ADRESSE DE LIVRAISON :', 112, boxTop + 6);

  doc.setFontSize(9);
  doc.text(`${order.address_line}`, 112, boxTop + 12);
  doc.text(`${order.city}, ${order.country}`, 112, boxTop + 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...grayColor);
  if (order.delivery_instructions) {
    const textLines = doc.splitTextToSize(`Instructions : ${order.delivery_instructions}`, colWidth - 8);
    doc.text(textLines, 112, boxTop + 23);
  } else {
    doc.text('Instructions : Aucune consigne spécifique.', 112, boxTop + 23);
  }

  // 4. Products table
  const tableData = order.items.map((item) => [
    item.product_name,
    item.sku || 'N/A',
    `x ${item.quantity}`,
    cleanPrice(item.unit_price_xof),
    cleanPrice(item.total_price_xof)
  ]);

  autoTable(doc, {
    startY: 85,
    head: [['Désignation de l\'article', 'Code/SKU', 'Qté', 'Prix Unitaire', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: goldColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
    },
    bodyStyles: {
      textColor: darkColor,
      fontSize: 8,
      cellPadding: 3.5,
    },
    columnStyles: {
      0: { cellWidth: 85, halign: 'left' },
      1: { cellWidth: 22, halign: 'center' },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 34, halign: 'right' },
      4: { cellWidth: 34, halign: 'right' },
    },
    tableLineWidth: 0.1,
    tableLineColor: [220, 220, 220],
    alternateRowStyles: {
      fillColor: [253, 251, 248],
    },
  });

  // 5. Totals Section
  const finalY = (doc as any).lastAutoTable?.finalY || 135;
  const totalsTop = finalY + 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...grayColor);

  doc.text('Sous-total articles :', 130, totalsTop);
  doc.setTextColor(...darkColor);
  doc.text(cleanPrice(order.subtotal_xof), 196, totalsTop, { align: 'right' });

  let currentY = totalsTop + 5;
  if (order.discount_xof > 0) {
    doc.setTextColor(...goldColor);
    doc.text('Remises appliquées :', 130, currentY);
    doc.text(`-${cleanPrice(order.discount_xof)}`, 196, currentY, { align: 'right' });
    currentY += 5;
  }

  doc.setTextColor(...grayColor);
  doc.text("Frais de livraison :", 130, currentY);
  doc.setTextColor(...darkColor);
  const shipCostText = order.shipping_cost_xof === 0 ? 'Gratuit' : cleanPrice(order.shipping_cost_xof);
  doc.text(shipCostText, 196, currentY, { align: 'right' });

  currentY += 4;
  doc.setDrawColor(...darkColor);
  doc.setLineWidth(0.4);
  doc.line(130, currentY, 196, currentY);

  currentY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...darkColor);
  doc.text('Montant Total à Payer :', 130, currentY);

  doc.setFontSize(10.5);
  doc.setTextColor(...goldColor);
  doc.text(cleanPrice(order.total_xof), 196, currentY, { align: 'right' });

  // 6. Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...grayColor);
  doc.text('Ce bordereau de commande sert uniquement à vous informer du récapitulatif de vos achats.', 105, pageHeight - 12, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...darkColor);
  doc.text('EUREKA BEAUTY — REVEAL YOUR NATURAL BEAUTY', 105, pageHeight - 8, { align: 'center' });

  // Save the PDF file
  doc.save(`Bordereau-Commande-${order.order_number}.pdf`);
};
