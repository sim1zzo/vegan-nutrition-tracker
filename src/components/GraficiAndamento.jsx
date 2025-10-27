import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, X } from 'lucide-react';
import { useStorico } from '../hooks/useStorico';

const GraficiAndamento = ({ onClose }) => {
  const [nutrienteSelezionato, setNutrienteSelezionato] = useState('proteine');
  const [periodoSelezionato, setPeriodoSelezionato] = useState('7giorni');
  const {
    storico,
    loading,
    caricaUltimiGiorni,
    caricaSettimanaCorrente,
    caricaMeseCorrente,
    getDatiGrafico,
    calcolaMediaNutriente,
  } = useStorico();

  useEffect(() => {
    if (periodoSelezionato === '7giorni') {
      caricaUltimiGiorni(7);
    } else if (periodoSelezionato === 'settimana') {
      caricaSettimanaCorrente();
    } else if (periodoSelezionato === 'mese') {
      caricaMeseCorrente();
    }
  }, [
    periodoSelezionato,
    caricaUltimiGiorni,
    caricaSettimanaCorrente,
    caricaMeseCorrente,
  ]);

  const nutrienti = [
    { key: 'proteine', label: 'Proteine', color: '#3b82f6', unita: 'g' },
    { key: 'carboidrati', label: 'Carboidrati', color: '#8b5cf6', unita: 'g' },
    { key: 'grassi', label: 'Grassi', color: '#f59e0b', unita: 'g' },
    { key: 'calorie', label: 'Calorie', color: '#ef4444', unita: 'kcal' },
    { key: 'ferro', label: 'Ferro', color: '#dc2626', unita: 'mg' },
    { key: 'calcio', label: 'Calcio', color: '#2563eb', unita: 'mg' },
    { key: 'vitB12', label: 'Vitamina B12', color: '#7c3aed', unita: 'µg' },
    { key: 'omega3', label: 'Omega-3', color: '#06b6d4', unita: 'g' },
  ];

  const nutrienteCorrente = nutrienti.find(
    (n) => n.key === nutrienteSelezionato
  );
  const datiGrafico = getDatiGrafico(nutrienteSelezionato);
  const media = calcolaMediaNutriente(nutrienteSelezionato);

  if (loading) {
    return (
      <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
        <div className='bg-white rounded-xl p-8'>
          <p className='text-xl'>Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b'>
          <div className='flex items-center gap-3'>
            <TrendingUp className='w-8 h-8 text-green-600' />
            <h2 className='text-2xl font-bold'>Andamento Nutrizionale</h2>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        <div className='p-6'>
          {/* Filtri */}
          <div className='mb-6 space-y-4'>
            {/* Periodo */}
            <div>
              <label className='block text-sm font-semibold mb-2'>
                Periodo
              </label>
              <div className='flex gap-2 flex-wrap'>
                <button
                  onClick={() => setPeriodoSelezionato('7giorni')}
                  className={`px-4 py-2 rounded-lg ${
                    periodoSelezionato === '7giorni'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  Ultimi 7 giorni
                </button>
                <button
                  onClick={() => setPeriodoSelezionato('settimana')}
                  className={`px-4 py-2 rounded-lg ${
                    periodoSelezionato === 'settimana'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  Settimana corrente
                </button>
                <button
                  onClick={() => setPeriodoSelezionato('mese')}
                  className={`px-4 py-2 rounded-lg ${
                    periodoSelezionato === 'mese'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  Mese corrente
                </button>
              </div>
            </div>

            {/* Nutriente */}
            <div>
              <label className='block text-sm font-semibold mb-2'>
                Nutriente
              </label>
              <select
                value={nutrienteSelezionato}
                onChange={(e) => setNutrienteSelezionato(e.target.value)}
                className='w-full p-2 border-2 border-gray-300 rounded-lg'
              >
                {nutrienti.map((n) => (
                  <option key={n.key} value={n.key}>
                    {n.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Statistiche */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            <div className='bg-blue-50 p-4 rounded-lg'>
              <p className='text-sm text-gray-600'>Media</p>
              <p className='text-2xl font-bold text-blue-700'>
                {media.toFixed(1)} {nutrienteCorrente.unita}
              </p>
            </div>
            <div className='bg-green-50 p-4 rounded-lg'>
              <p className='text-sm text-gray-600'>Massimo</p>
              <p className='text-2xl font-bold text-green-700'>
                {Math.max(...datiGrafico.map((d) => d.valore)).toFixed(1)}{' '}
                {nutrienteCorrente.unita}
              </p>
            </div>
            <div className='bg-orange-50 p-4 rounded-lg'>
              <p className='text-sm text-gray-600'>Minimo</p>
              <p className='text-2xl font-bold text-orange-700'>
                {Math.min(...datiGrafico.map((d) => d.valore)).toFixed(1)}{' '}
                {nutrienteCorrente.unita}
              </p>
            </div>
          </div>

          {/* Grafico a Linea */}
          <div className='mb-6'>
            <h3 className='text-lg font-bold mb-4'>
              Andamento - {nutrienteCorrente.label}
            </h3>
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={datiGrafico}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='data' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type='monotone'
                  dataKey='valore'
                  stroke={nutrienteCorrente.color}
                  strokeWidth={2}
                  name={nutrienteCorrente.label}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Grafico a Barre */}
          <div>
            <h3 className='text-lg font-bold mb-4'>Confronto giornaliero</h3>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={datiGrafico}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='data' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey='valore'
                  fill={nutrienteCorrente.color}
                  name={nutrienteCorrente.label}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraficiAndamento;
