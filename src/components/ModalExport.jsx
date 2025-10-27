import React, { useState } from 'react';
import { Download, X, FileJson, FileSpreadsheet, FileText } from 'lucide-react';
import { exportJSON, exportCSV, exportPDF } from '../utils/export';
import { useStorico } from '../hooks/useStorico';
import { useAuth } from '../context/AuthContext';

const ModalExport = ({ giornataCorrente, onClose }) => {
  const [tipoExport, setTipoExport] = useState('json');
  const [periodoExport, setPeriodoExport] = useState('oggi');
  const { storico, caricaUltimiGiorni, caricaMeseCorrente } = useStorico();
  const { user } = useAuth();

  const handleExport = async () => {
    if (periodoExport === 'oggi') {
      // Export giornata corrente
      if (tipoExport === 'json') {
        exportJSON(giornataCorrente, 'giornata');
      } else if (tipoExport === 'csv') {
        exportCSV([giornataCorrente], 'giornata');
      } else if (tipoExport === 'pdf') {
        exportPDF(giornataCorrente, user);
      }
    } else {
      // Carica storico e exporta
      if (periodoExport === 'settimana') {
        await caricaUltimiGiorni(7);
      } else if (periodoExport === 'mese') {
        await caricaMeseCorrente();
      }

      if (tipoExport === 'json') {
        exportJSON(storico, periodoExport);
      } else if (tipoExport === 'csv') {
        exportCSV(storico, periodoExport);
      }
    }

    onClose();
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-xl max-w-md w-full'>
        <div className='flex items-center justify-between p-6 border-b'>
          <div className='flex items-center gap-3'>
            <Download className='w-6 h-6 text-green-600' />
            <h2 className='text-2xl font-bold'>Esporta Dati</h2>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        <div className='p-6 space-y-4'>
          {/* Tipo Export */}
          <div>
            <label className='block text-sm font-semibold mb-2'>Formato</label>
            <div className='space-y-2'>
              <button
                onClick={() => setTipoExport('json')}
                className={`w-full p-3 border-2 rounded-lg flex items-center gap-3 ${
                  tipoExport === 'json'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300'
                }`}
              >
                <FileJson className='w-5 h-5' />
                <div className='text-left flex-1'>
                  <p className='font-semibold'>JSON</p>
                  <p className='text-xs text-gray-600'>Per backup completo</p>
                </div>
              </button>

              <button
                onClick={() => setTipoExport('csv')}
                className={`w-full p-3 border-2 rounded-lg flex items-center gap-3 ${
                  tipoExport === 'csv'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300'
                }`}
              >
                <FileSpreadsheet className='w-5 h-5' />
                <div className='text-left flex-1'>
                  <p className='font-semibold'>CSV</p>
                  <p className='text-xs text-gray-600'>
                    Per Excel/Fogli Google
                  </p>
                </div>
              </button>

              {periodoExport === 'oggi' && (
                <button
                  onClick={() => setTipoExport('pdf')}
                  className={`w-full p-3 border-2 rounded-lg flex items-center gap-3 ${
                    tipoExport === 'pdf'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300'
                  }`}
                >
                  <FileText className='w-5 h-5' />
                  <div className='text-left flex-1'>
                    <p className='font-semibold'>PDF</p>
                    <p className='text-xs text-gray-600'>Report stampabile</p>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Periodo */}
          <div>
            <label className='block text-sm font-semibold mb-2'>Periodo</label>
            <select
              value={periodoExport}
              onChange={(e) => setPeriodoExport(e.target.value)}
              className='w-full p-2 border-2 border-gray-300 rounded-lg'
            >
              <option value='oggi'>Solo oggi</option>
              <option value='settimana'>Ultima settimana</option>
              <option value='mese'>Ultimo mese</option>
            </select>
          </div>

          {/* Buttons */}
          <div className='flex gap-2 pt-4'>
            <button
              onClick={onClose}
              className='flex-1 p-3 bg-gray-200 rounded-lg hover:bg-gray-300'
            >
              Annulla
            </button>
            <button
              onClick={handleExport}
              className='flex-1 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700'
            >
              Esporta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalExport;
