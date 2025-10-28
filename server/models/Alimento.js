// server/models/Alimento.js
import mongoose from 'mongoose';

const alimentoSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, unique: true },
    categoria: { type: String, required: true, index: true }, // es. colazione, pranzo, spuntino, condimento
    proteine: { type: Number, default: 0 },
    carboidrati: { type: Number, default: 0 },
    grassi: { type: Number, default: 0 },
    fibre: { type: Number, default: 0 },
    ferro: { type: Number, default: 0 },
    calcio: { type: Number, default: 0 },
    vitB12: { type: Number, default: 0 },
    vitB2: { type: Number, default: 0 },
    vitD: { type: Number, default: 0 },
    omega3: { type: Number, default: 0 },
    iodio: { type: Number, default: 0 },
    zinco: { type: Number, default: 0 },
    calorie: { type: Number, default: 0 },
    porzione: { type: Number, default: 100 }, // Porzione di riferimento in grammi
    // Aggiungi un campo per l'utente se vuoi che gli alimenti siano specifici per utente
    // utente: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// Indice per migliorare le ricerche per nome (case-insensitive)
alimentoSchema.index({ nome: 'text' });

export default mongoose.model('Alimento', alimentoSchema);
