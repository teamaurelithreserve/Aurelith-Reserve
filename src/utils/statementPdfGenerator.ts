import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StatementPreparationResult, BankTransaction } from '../types/banking';

export function generateStatementPdf(data: StatementPreparationResult): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Mask account number for security (show only last 4 digits)
  const fullAccNum = data.account.accountNumber || '';
  const maskedAccNum =
    fullAccNum.length > 4
      ? `${fullAccNum.slice(0, 2)}••••${fullAccNum.slice(-4)}`
      : fullAccNum;

  // 1. TOP BRAND LETTERHEAD
  // Navy background top bar accent
  doc.setFillColor(28, 43, 76); // #1C2B4C
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Red accent line
  doc.setFillColor(200, 16, 46); // #C8102E
  doc.rect(0, 5, pageWidth, 1.2, 'F');

  // Emblem (drawn geometrically)
  doc.setFillColor(200, 16, 46);
  doc.triangle(margin, 12, margin + 5, 12, margin + 2.5, 23, 'F');
  doc.setFillColor(28, 43, 76);
  doc.triangle(margin + 3, 12, margin + 8, 12, margin + 5.5, 23, 'F');

  // Bank Title
  doc.setTextColor(28, 43, 76);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('AURELITH RESERVE', margin + 11, 16);

  doc.setTextColor(200, 16, 46);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('WEALTH MANAGEMENT & BANKING SERVICES', margin + 11, 20);

  // Bank Coordinates (Right aligned)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(90, 100, 115);
  doc.text('400 Pine Street, Headquarters', pageWidth - margin, 13, { align: 'right' });
  doc.text('Dallas, Texas 75201', pageWidth - margin, 17, { align: 'right' });
  doc.text('Routing / Transit: 111301122  •  SWIFT: AURUS33D', pageWidth - margin, 21, { align: 'right' });
  doc.text('Member FDIC  •  Equal Housing Lender', pageWidth - margin, 25, { align: 'right' });

  // Divider
  doc.setDrawColor(220, 226, 235);
  doc.setLineWidth(0.4);
  doc.line(margin, 28, pageWidth - margin, 28);

  // 2. DOCUMENT TITLE & AUDIT REFERENCE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(28, 43, 76);
  doc.text('OFFICIAL ACCOUNT STATEMENT', margin, 35);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 110, 125);
  doc.text(`Category: ${data.category}`, margin, 39.5);
  doc.text(`Statement Period: ${data.startDate} to ${data.endDate}`, margin, 44);

  // Right Side: Generation Timestamp & Audit Reference
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(28, 43, 76);
  doc.text(`Audit Ref: ${data.auditReference}`, pageWidth - margin, 35, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 110, 125);
  doc.text(`Generated: ${data.serverTimeFormatted}`, pageWidth - margin, 39.5, { align: 'right' });
  doc.text(`Timezone: ${data.serverTimezone}`, pageWidth - margin, 44, { align: 'right' });

  // 3. CUSTOMER & ACCOUNT DETAILS BOXES
  const boxTop = 47;
  const boxHeight = 27;
  const colWidth = (pageWidth - margin * 2 - 4) / 2;

  // Customer Box (Left)
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, boxTop, colWidth, boxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(200, 16, 46);
  doc.text('ACCOUNT HOLDER', margin + 3.5, boxTop + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(28, 43, 76);
  doc.text(data.user.fullName, margin + 3.5, boxTop + 9.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(70, 80, 95);
  doc.text(data.user.address, margin + 3.5, boxTop + 14, { maxWidth: colWidth - 7 });
  doc.text(`Email: ${data.user.email}  •  Phone: ${data.user.phone}`, margin + 3.5, boxTop + 23);

  // Account Coordinates Box (Right)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin + colWidth + 4, boxTop, colWidth, boxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(200, 16, 46);
  doc.text('ACCOUNT COORDINATES', margin + colWidth + 7.5, boxTop + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(28, 43, 76);
  doc.text(data.account.name, margin + colWidth + 7.5, boxTop + 9.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(70, 80, 95);
  doc.text(`Account Number: ${maskedAccNum}`, margin + colWidth + 7.5, boxTop + 14);
  doc.text(`Account Type: ${data.account.type.toUpperCase()}  •  Currency: ${data.account.currency}`, margin + colWidth + 7.5, boxTop + 18.5);
  doc.text(`Routing Transit: ${data.account.routingNumber}  •  SWIFT: ${data.account.swiftCode || 'AURUS33D'}`, margin + colWidth + 7.5, boxTop + 23);

  // 4. FINANCIAL SUMMARY STRIP
  const sumTop = boxTop + boxHeight + 4;
  doc.setFillColor(28, 43, 76);
  doc.roundedRect(margin, sumTop, pageWidth - margin * 2, 14, 1.5, 1.5, 'F');

  const sumColW = (pageWidth - margin * 2) / 5;
  const sumItems = [
    { label: 'OPENING BALANCE', value: `$${data.summary.openingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: `TOTAL DEBITS (${data.summary.debitCount})`, value: `-$${data.summary.totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: `TOTAL CREDITS (${data.summary.creditCount})`, value: `+$${data.summary.totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: 'NET CHANGE', value: `${data.summary.netChange >= 0 ? '+' : '-'}$${Math.abs(data.summary.netChange).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: 'CLOSING BALANCE', value: `$${data.summary.closingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
  ];

  sumItems.forEach((item, idx) => {
    const x = margin + idx * sumColW + sumColW / 2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(190, 205, 225);
    doc.text(item.label, x, sumTop + 4.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(item.value, x, sumTop + 10.5, { align: 'center' });
  });

  // 5. ITEMIZED LEDGER TRANSACTION TABLE
  const tableData = data.transactions.map((tx: BankTransaction) => {
    const txDate = new Date(tx.timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
    const debit = tx.direction === 'debit' ? `-$${tx.amount.toFixed(2)}` : '';
    const credit = tx.direction === 'credit' ? `+$${tx.amount.toFixed(2)}` : '';
    const bal = tx.balanceAfter !== undefined ? `$${tx.balanceAfter.toFixed(2)}` : '—';
    return [
      txDate,
      tx.reference || '—',
      tx.description || tx.recipientName || 'Transaction Activity',
      tx.category || tx.type,
      debit,
      credit,
      bal,
    ];
  });

  autoTable(doc, {
    startY: sumTop + 17,
    margin: { left: margin, right: margin, bottom: 35 },
    head: [['Date', 'Reference', 'Description & Details', 'Category', 'Debit ($)', 'Credit ($)', 'Balance ($)']],
    body: tableData.length > 0 ? tableData : [['—', '—', 'No transactions recorded for the selected period & category.', '—', '—', '—', '—']],
    theme: 'striped',
    headStyles: {
      fillColor: [28, 43, 76],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left',
      cellPadding: 2.2,
    },
    bodyStyles: {
      textColor: [40, 50, 65],
      fontSize: 7.2,
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 32 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 26 },
      4: { cellWidth: 20, halign: 'right', fontStyle: 'bold', textColor: [180, 20, 20] },
      5: { cellWidth: 20, halign: 'right', fontStyle: 'bold', textColor: [16, 140, 70] },
      6: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
    },
    didDrawPage: (hookData) => {
      // 6. REAL-TIME BANK STAMP & FOOTER
      const stampY = pageHeight - 27;
      const stampWidth = 96;
      const stampHeight = 15;
      const stampX = margin;

      // Authentic Stamp Seal Box
      doc.setDrawColor(28, 43, 76);
      doc.setLineWidth(0.6);
      doc.roundedRect(stampX, stampY, stampWidth, stampHeight, 1.5, 1.5, 'D');

      doc.setDrawColor(200, 16, 46);
      doc.setLineWidth(0.25);
      doc.roundedRect(stampX + 1, stampY + 1, stampWidth - 2, stampHeight - 2, 1, 1, 'D');

      // Stamp Text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(200, 16, 46);
      doc.text('AURELITH RESERVE  •  OFFICIAL BANK AUDIT STAMP', stampX + stampWidth / 2, stampY + 4.2, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.8);
      doc.setTextColor(28, 43, 76);
      doc.text(`VERIFIED & DIGITALLY STAMPED: ${data.serverTimeFormatted}`, stampX + stampWidth / 2, stampY + 7.8, { align: 'center' });
      doc.text(`TIMEZONE: ${data.serverTimezone}   •   SECURITY CERTIFICATE: VALID`, stampX + stampWidth / 2, stampY + 11.2, { align: 'center' });
      doc.text(`AUDIT REF: ${data.auditReference}`, stampX + stampWidth / 2, stampY + 14, { align: 'center' });

      // Right Side of Footer: Regulatory Disclosures
      const discX = margin + stampWidth + 4;
      const discW = pageWidth - margin - discX;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(110, 120, 135);
      doc.text(
        'FDIC Insured up to $250,000 per depositor. Questions: Contact 855-660-5862 or write to Client Inquiries, 400 Pine Street, Dallas, TX 75201. This statement represents authoritative digital records.',
        discX,
        stampY + 4,
        { maxWidth: discW }
      );

      // Page Numbering
      const pageStr = `Page ${hookData.pageNumber}`;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(130, 140, 155);
      doc.text(pageStr, pageWidth - margin, pageHeight - 7, { align: 'right' });
    },
  });

  // Calculate total pages and update page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(130, 140, 155);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  }

  return doc;
}
