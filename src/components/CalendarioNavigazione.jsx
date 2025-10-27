import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { it } from 'date-fns/locale';

const CalendarioNavigazione = ({ dataCorrente, onCambiaData }) => {
  const [mostraCalendario, setMostraCalendario] = useState(false);

  const cambiaGiorno = (offset) => {
    const nuovaData =
      offset > 0
        ? addDays(new Date(dataCorrente), offset)
        : subDays(new Date(dataCorrente), Math.abs(offset));
    onCambiaData(nuovaData.toISOString().split('T')[0]);
  };

  const vaiOggi = () => {
    onCambiaData(new Date().toISOString().split('T')[0]);
  };

  const dataFormattata = format(new Date(dataCorrente), 'EEEE d MMMM yyyy', {
    locale: it,
  });
  const isOggi = dataCorrente === new Date().toISOString().split('T')[0];

  return (
    <div className='bg-white rounded-xl shadow-md p-4 mb-6'>
      <div className='flex items-center justify-between'>
        {/* Bottone Giorno Precedente */}
        <button
          onClick={() => cambiaGiorno(-1)}
          className='p-2 hover:bg-gray-100 rounded-lg transition'
          title='Giorno precedente'
        >
          <ChevronLeft className='w-6 h-6' />
        </button>

        {/* Data Corrente */}
        <div className='flex flex-col items-center flex-1'>
          <div className='flex items-center gap-2'>
            <Calendar className='w-5 h-5 text-green-600' />
            <h2 className='text-xl font-bold capitalize'>{dataFormattata}</h2>
          </div>

          {!isOggi && (
            <button
              onClick={vaiOggi}
              className='text-sm text-green-600 hover:underline mt-1'
            >
              Vai a oggi
            </button>
          )}
        </div>

        {/* Bottone Giorno Successivo */}
        <button
          onClick={() => cambiaGiorno(1)}
          className='p-2 hover:bg-gray-100 rounded-lg transition'
          title='Giorno successivo'
        >
          <ChevronRight className='w-6 h-6' />
        </button>
      </div>

      {/* Scorciatoie Quick */}
      <div className='flex gap-2 mt-4 flex-wrap'>
        <button
          onClick={() => cambiaGiorno(-1)}
          className='px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm'
        >
          Ieri
        </button>
        <button
          onClick={vaiOggi}
          className='px-3 py-1 bg-green-100 hover:bg-green-200 rounded text-sm'
        >
          Oggi
        </button>
        <button
          onClick={() => cambiaGiorno(1)}
          className='px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm'
        >
          Domani
        </button>
        <button
          onClick={() => cambiaGiorno(-7)}
          className='px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded text-sm'
        >
          -7 giorni
        </button>
        <button
          onClick={() => setMostraCalendario(!mostraCalendario)}
          className='px-3 py-1 bg-purple-100 hover:bg-purple-200 rounded text-sm'
        >
          Scegli data
        </button>
      </div>

      {/* Input Data */}
      {mostraCalendario && (
        <div className='mt-4'>
          <input
            type='date'
            value={dataCorrente}
            onChange={(e) => {
              onCambiaData(e.target.value);
              setMostraCalendario(false);
            }}
            className='w-full p-2 border-2 border-gray-300 rounded-lg'
          />
        </div>
      )}
    </div>
  );
};

export default CalendarioNavigazione;
