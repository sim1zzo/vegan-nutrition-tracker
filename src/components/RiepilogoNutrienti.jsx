import React from 'react';
import { CheckCircle, Loader } from 'lucide-react';

// Componente BarraProgresso (puoi estrarlo se preferisci)
const BarraProgresso = ({ label, valore, obiettivo, unita = 'g' }) => {
  const perc = obiettivo > 0 ? (valore / obiettivo) * 100 : 0;
  let colore = 'bg-green-500';
  if (perc < 80) colore = 'bg-yellow-500';
  if (perc < 50) colore = 'bg-red-500';

  return (
    <div>
      <div className='flex justify-between text-sm mb-1'>
        <span className='font-medium'>{label}</span>
        <span className='font-bold'>
          {valore?.toFixed(1)} / {obiettivo?.toFixed(1)} {unita}
        </span>
      </div>
      <div className='w-full bg-gray-200 rounded-full h-2 overflow-hidden'>
        <div
          className={`h-full ${colore} transition-all duration-300`}
          style={{ width: `${Math.min(perc, 100)}%` }}
        />
      </div>
    </div>
  );
};

const RiepilogoNutrienti = ({ totali, obiettivi, salvando }) => {
  const {
    calorie,
    proteine,
    carboidrati,
    grassi,
    fibre,
    ferro,
    calcio,
    vitB12,
    vitB2,
    vitD,
    omega3,
    iodio,
    zinco,
    proteineComplementarita,
    proteineEffettive,
  } = totali;

  return (
    <div className='bg-white rounded-xl shadow-md p-6'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-bold'>Riepilogo Giornaliero</h2>
        {salvando ? (
          <span className='text-xs text-gray-500 flex items-center gap-1'>
            <Loader className='w-4 h-4 animate-spin' /> Salvataggio...
          </span>
        ) : (
          <span className='text-xs text-green-600 flex items-center gap-1'>
            <CheckCircle className='w-4 h-4' /> Salvato
          </span>
        )}
      </div>

      {/* Calorie */}
      <div className='text-center mb-4'>
        <p className='text-gray-600'>Calorie Totali</p>
        <p className='text-4xl font-bold text-green-600'>
          {calorie?.toFixed(0)}
        </p>
        <p className='text-sm text-gray-500'>
          Obiettivo: {obiettivi.calorie?.toFixed(0)} kcal
        </p>
      </div>

      {/* Bonus Proteine */}
      {proteineComplementarita > 0 && (
        <div className='bg-green-50 border border-green-200 rounded-lg p-3 mb-4'>
          <p className='font-bold text-green-800 text-sm'>🎉 Bonus Proteine!</p>
          <p className='text-xs text-green-700'>
            + {proteineComplementarita.toFixed(1)}g per complementarità
            cereali/legumi.
          </p>
          <p className='text-sm font-bold text-green-800 mt-1'>
            Totale Effettivo: {proteineEffettive.toFixed(1)}g
          </p>
        </div>
      )}

      {/* Barre Macro */}
      <div className='space-y-3'>
        <BarraProgresso
          label='Proteine'
          valore={proteineEffettive} // Usa le proteine effettive
          obiettivo={obiettivi.proteine}
        />
        <BarraProgresso
          label='Carboidrati'
          valore={carboidrati}
          obiettivo={obiettivi.carboidrati}
        />
        <BarraProgresso
          label='Grassi'
          valore={grassi}
          obiettivo={obiettivi.grassi}
        />

        {/* Barre Micro */}
        <hr className='my-4' />

        <BarraProgresso
          label='Fibre'
          valore={fibre}
          obiettivo={obiettivi.fibre}
        />
        <BarraProgresso
          label='Ferro'
          valore={ferro}
          obiettivo={obiettivi.ferro}
          unita='mg'
        />
        <BarraProgresso
          label='Calcio'
          valore={calcio}
          obiettivo={obiettivi.calcio}
          unita='mg'
        />
        <BarraProgresso
          label='Vit. B12'
          valore={vitB12}
          obiettivo={obiettivi.vitB12}
          unita='µg'
        />
        <BarraProgresso
          label='Vit. B2'
          valore={vitB2}
          obiettivo={obiettivi.vitB2}
          unita='mg'
        />
        <BarraProgresso
          label='Vit. D'
          valore={vitD}
          obiettivo={obiettivi.vitD}
          unita='µg'
        />
        <BarraProgresso
          label='Omega 3'
          valore={omega3}
          obiettivo={obiettivi.omega3}
          unita='g'
        />
        <BarraProgresso
          label='Iodio'
          valore={iodio}
          obiettivo={obiettivi.iodio}
          unita='µg'
        />
        <BarraProgresso
          label='Zinco'
          valore={zinco}
          obiettivo={obiettivi.zinco}
          unita='mg'
        />
      </div>
    </div>
  );
};

export default RiepilogoNutrienti;
