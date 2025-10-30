import React from 'react';
import { Plus, Trash2, Pill, BookOpen } from 'lucide-react';

const PastoCard = ({
  titolo,
  tipoPasto,
  alimenti,
  integratori,
  onAggiungiAlimento,
  onAggiungiIntegratore,
  onCaricaRicetta,
  onRimuoviAlimento,
  onRimuoviIntegratore,
}) => {
  return (
    <div className='bg-white rounded-xl shadow-md'>
      {/* Header Card */}
      <div className='flex items-center justify-between p-4 border-b border-gray-100'>
        <h3 className='text-xl font-bold text-gray-800'>{titolo}</h3>
        <div className='flex items-center gap-2'>
          <button
            onClick={onCaricaRicetta}
            title='Carica ricetta'
            className='p-2 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200'
          >
            <BookOpen className='w-5 h-5' />
          </button>
          <button
            onClick={onAggiungiIntegratore}
            title='Aggiungi integratore'
            className='p-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200'
          >
            <Pill className='w-5 h-5' />
          </button>
          <button
            onClick={onAggiungiAlimento}
            title='Aggiungi alimento'
            className='p-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200'
          >
            <Plus className='w-5 h-5' />
          </button>
        </div>
      </div>

      {/* Contenuto Card */}
      <div className='p-4'>
        {alimenti.length === 0 && integratori.length === 0 && (
          <p className='text-gray-400 text-sm text-center py-4'>
            Nessun alimento o integratore aggiunto
          </p>
        )}

        {/* Lista Alimenti */}
        {alimenti.length > 0 && (
          <div className='space-y-2 mb-3'>
            {alimenti.map((item, index) => (
              <div
                key={index}
                className='flex justify-between items-center bg-gray-50 p-2 rounded-lg'
              >
                <div>
                  <div className='font-semibold text-sm text-gray-800'>
                    {item.nome}
                  </div>
                  <div className='text-xs text-gray-600'>
                    {item.quantita}g • {item.calorie?.toFixed(0)} kcal
                  </div>
                </div>
                <button
                  onClick={() => onRimuoviAlimento(index)}
                  className='p-1 text-red-500 hover:bg-red-100 rounded'
                  title='Rimuovi'
                >
                  <Trash2 className='w-4 h-4' />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Lista Integratori */}
        {integratori.length > 0 && (
          <div className='space-y-2 mt-3'>
            <p className='text-xs font-semibold text-purple-600 uppercase'>
              Integratori
            </p>
            {integratori.map((item, index) => (
              <div
                key={index}
                className='flex justify-between items-center bg-purple-50 p-2 rounded-lg'
              >
                <div>
                  <div className='font-semibold text-sm text-purple-800'>
                    {item.nome}
                  </div>
                  <div className='text-xs text-purple-600'>{item.dosaggio}</div>
                </div>
                <button
                  onClick={() => onRimuoviIntegratore(index)}
                  className='p-1 text-red-500 hover:bg-red-100 rounded'
                  title='Rimuovi'
                >
                  <Trash2 className='w-4 h-4' />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PastoCard;
