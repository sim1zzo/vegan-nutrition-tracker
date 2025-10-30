import React, { useState } from 'react';
import { X, Pill } from 'lucide-react';

// Database statico integratori (puoi spostarlo in /data se preferisci)
const INTEGRATORI_DATABASE = {
  'Vitamina B12 (1000µg)': { dosaggio: '1 compressa' },
  'Vitamina D3 (2000 UI)': { dosaggio: '1 compressa/dose' },
  'Omega-3 DHA+EPA (Algale)': { dosaggio: '1 capsula' },
  'Ferro (es. 14mg)': { dosaggio: '1 compressa' },
  'Zinco (es. 15mg)': { dosaggio: '1 compressa' },
  'Iodio (es. 150µg)': { dosaggio: '1 compressa' },
  'Calcio (es. 500mg)': { dosaggio: '1 compressa' },
  'Multivitaminico Vegano': { dosaggio: '1 dose' },
};

const ModalAggiungiIntegratore = ({ onClose, onSalva }) => {
  const [integratoreSelezionato, setIntegratoreSelezionato] = useState('');

  const handleSalva = () => {
    if (!integratoreSelezionato) return;

    const integratore = {
      nome: integratoreSelezionato,
      dosaggio: INTEGRATORI_DATABASE[integratoreSelezionato].dosaggio,
    };

    onSalva(integratore);
    onClose();
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-xl max-w-md w-full'>
        <div className='flex items-center justify-between p-4 border-b'>
          <h2 className='text-xl font-bold flex items-center gap-2'>
            <Pill /> Aggiungi Integratore
          </h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        <div className='p-4 space-y-4'>
          <div>
            <label className='block text-sm font-semibold mb-2'>
              Integratore
            </label>
            <select
              value={integratoreSelezionato}
              onChange={(e) => setIntegratoreSelezionato(e.target.value)}
              className='w-full p-3 border-2 border-gray-300 rounded-lg'
            >
              <option value=''>-- Seleziona --</option>
              {Object.keys(INTEGRATORI_DATABASE).map((nome) => (
                <option key={nome} value={nome}>
                  {nome}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSalva}
            disabled={!integratoreSelezionato}
            className='w-full p-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300'
          >
            Aggiungi Integratore
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAggiungiIntegratore;
