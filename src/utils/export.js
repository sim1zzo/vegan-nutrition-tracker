import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Export JSON
export const exportJSON = (dati, nomeFile = 'nutrition-tracker-backup') => {
  const dataStr = JSON.stringify(dati, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${nomeFile}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export CSV
export const exportCSV = (giornate, nomeFile = 'nutrition-tracker-data') => {
  const headers = [
    'Data',
    'Proteine (g)',
    'Carboidrati (g)',
    'Grassi (g)',
    'Calorie (kcal)',
    'Ferro (mg)',
    'Calcio (mg)',
    'B12 (µg)',
    'Omega-3 (g)',
  ];

  const rows = giornate.map((g) => [
    new Date(g.data).toLocaleDateString('it-IT'),
    g.totaliGiornalieri.proteine.toFixed(1),
    g.totaliGiornalieri.carboidrati.toFixed(1),
    g.totaliGiornalieri.grassi.toFixed(1),
    g.totaliGiornalieri.calorie.toFixed(0),
    g.totaliGiornalieri.ferro.toFixed(1),
    g.totaliGiornalieri.calcio.toFixed(0),
    g.totaliGiornalieri.vitB12.toFixed(1),
    g.totaliGiornalieri.omega3.toFixed(1),
  ]);

  let csv = headers.join(',') + '\n';
  rows.forEach((row) => {
    csv += row.join(',') + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${nomeFile}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export PDF
export const exportPDF = (giornata, utente) => {
  const doc = new jsPDF();

  // Titolo
  doc.setFontSize(20);
  doc.text('Nutrition Tracker - Report Giornaliero', 14, 20);

  // Info utente
  doc.setFontSize(12);
  doc.text(`Utente: ${utente.nome}`, 14, 30);
  doc.text(
    `Data: ${new Date(giornata.data).toLocaleDateString('it-IT')}`,
    14,
    37
  );

  // Totali Giornalieri
  doc.setFontSize(16);
  doc.text('Totali Giornalieri', 14, 50);

  const totaliData = [
    ['Nutriente', 'Valore'],
    ['Proteine', `${giornata.totaliGiornalieri.proteine.toFixed(1)} g`],
    ['Carboidrati', `${giornata.totaliGiornalieri.carboidrati.toFixed(1)} g`],
    ['Grassi', `${giornata.totaliGiornalieri.grassi.toFixed(1)} g`],
    ['Calorie', `${giornata.totaliGiornalieri.calorie.toFixed(0)} kcal`],
    ['Ferro', `${giornata.totaliGiornalieri.ferro.toFixed(1)} mg`],
    ['Calcio', `${giornata.totaliGiornalieri.calcio.toFixed(0)} mg`],
    ['Vitamina B12', `${giornata.totaliGiornalieri.vitB12.toFixed(1)} µg`],
    ['Omega-3', `${giornata.totaliGiornalieri.omega3.toFixed(1)} g`],
  ];

  doc.autoTable({
    startY: 55,
    head: [totaliData[0]],
    body: totaliData.slice(1),
    theme: 'grid',
  });

  // Pasti
  let currentY = doc.lastAutoTable.finalY + 10;

  Object.entries(giornata.pasti).forEach(([nomePasto, alimenti]) => {
    if (alimenti.length > 0) {
      doc.setFontSize(14);
      doc.text(nomePasto.toUpperCase(), 14, currentY);
      currentY += 5;

      const pastoData = alimenti.map((a) => [
        a.nome,
        `${a.quantita}g`,
        `${a.calorie.toFixed(0)} kcal`,
      ]);

      doc.autoTable({
        startY: currentY,
        head: [['Alimento', 'Quantità', 'Calorie']],
        body: pastoData,
        theme: 'striped',
      });

      currentY = doc.lastAutoTable.finalY + 10;
    }
  });

  // Salva
  doc.save(
    `nutrition-tracker-${
      new Date(giornata.data).toISOString().split('T')[0]
    }.pdf`
  );
};
