import mongoose from 'mongoose';

const alimentoSchema = new mongoose.Schema(
  {
    nome: String,
    quantita: Number,
    proteine: Number,
    carboidrati: Number,
    grassi: Number,
    fibre: Number,
    ferro: Number,
    calcio: Number,
    vitB12: Number,
    vitB2: Number,
    vitD: Number,
    omega3: Number,
    iodio: Number,
    zinco: Number,
    calorie: Number,
  },
  { _id: false }
);

const integratoreSchema = new mongoose.Schema(
  {
    nome: String,
    dosaggio: String,
  },
  { _id: false }
);

const giornataSchema = new mongoose.Schema(
  {
    utente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    data: {
      type: Date,
      required: true,
    },
    pasti: {
      colazione: [alimentoSchema],
      spuntinoMattina: [alimentoSchema],
      pranzo: [alimentoSchema],
      spuntinoPomeriggio: [alimentoSchema],
      cena: [alimentoSchema],
    },
    integratori: {
      colazione: [integratoreSchema],
      spuntinoMattina: [integratoreSchema],
      pranzo: [integratoreSchema],
      spuntinoPomeriggio: [integratoreSchema],
      cena: [integratoreSchema],
    },
    totaliGiornalieri: {
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
    },
  },
  { timestamps: true }
);

giornataSchema.index({ utente: 1, data: -1 });

export default mongoose.model('GiornataAlimentare', giornataSchema);
