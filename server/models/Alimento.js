import mongoose from 'mongoose';

const alimentoSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'Il nome è obbligatorio'],
      unique: true,
      trim: true,
    },
    categoria: {
      type: String,
      required: [true, 'La categoria è obbligatoria'],
      enum: [
        'colazione',
        'pranzo',
        'spuntino',
        'condimento',
        'verdura',
        'integratore',
      ],
    },

    // Macronutrienti (per 100g)
    proteine: {
      type: Number,
      required: true,
      default: 0,
    },
    carboidrati: {
      type: Number,
      required: true,
      default: 0,
    },
    grassi: {
      type: Number,
      required: true,
      default: 0,
    },
    fibre: {
      type: Number,
      default: 0,
    },
    calorie: {
      type: Number,
      required: false,
      default: 0,
    },

    // Micronutrienti (per 100g)
    ferro: {
      type: Number,
      default: 0,
    },
    calcio: {
      type: Number,
      default: 0,
    },
    vitB12: {
      type: Number,
      default: 0,
    },
    vitB2: {
      type: Number,
      default: 0,
    },
    vitD: {
      type: Number,
      default: 0,
    },
    omega3: {
      type: Number,
      default: 0,
    },
    iodio: {
      type: Number,
      default: 0,
    },
    zinco: {
      type: Number,
      default: 0,
    },

    // Metadata
    porzione: {
      type: Number,
      default: 100,
      description: 'Porzione standard in grammi',
    },

    // Per alimenti custom
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isPublico: {
      type: Boolean,
      default: true,
      description: 'Se false, visibile solo al creatore',
    },
    verificato: {
      type: Boolean,
      default: false,
      description: 'Verificato da admin/nutrizionista',
    },

    // Tags per ricerca
    tags: {
      type: [String],
      default: [],
    },

    // Note aggiuntive
    note: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indici per performance
alimentoSchema.index({ nome: 'text', tags: 'text' });
alimentoSchema.index({ categoria: 1 });
alimentoSchema.index({ createdBy: 1 });
alimentoSchema.index({ isPublico: 1, verificato: 1 });

// Virtual per densità proteica
alimentoSchema.virtual('densitaProteica').get(function () {
  return (this.proteine / this.calorie) * 100;
});

// Virtual per densità nutrizionale
alimentoSchema.virtual('densitaNutrizionale').get(function () {
  const score =
    this.proteine * 4 +
    this.fibre * 2 +
    this.ferro * 10 +
    this.calcio * 0.5 +
    this.omega3 * 20;
  return Math.round((score / this.calorie) * 100);
});

// Metodo per formattare per il frontend (compatibile con formato esistente)
alimentoSchema.methods.toFrontendFormat = function () {
  return {
    nome: this.nome,
    categoria: this.categoria,
    proteine: this.proteine,
    carboidrati: this.carboidrati,
    grassi: this.grassi,
    fibre: this.fibre,
    ferro: this.ferro,
    calcio: this.calcio,
    vitB12: this.vitB12,
    vitB2: this.vitB2,
    vitD: this.vitD,
    omega3: this.omega3,
    iodio: this.iodio,
    zinco: this.zinco,
    calorie: this.calorie,
    porzione: this.porzione,
  };
};

// Metodo statico per ricerca avanzata
alimentoSchema.statics.ricercaAvanzata = function (query, filtri = {}) {
  const searchQuery = { isPublico: true };

  // Ricerca testuale
  if (query) {
    searchQuery.$or = [
      { nome: { $regex: query, $options: 'i' } },
      { tags: { $regex: query, $options: 'i' } },
    ];
  }

  // Filtro categoria
  if (filtri.categoria) {
    searchQuery.categoria = filtri.categoria;
  }

  // Filtro per alto contenuto proteico
  if (filtri.altoProteico) {
    searchQuery.proteine = { $gte: 15 };
  }

  // Filtro per basso contenuto calorico
  if (filtri.ipocalorico) {
    searchQuery.calorie = { $lte: 100 };
  }

  return this.find(searchQuery).sort({ nome: 1 });
};

export default mongoose.model('Alimento', alimentoSchema);
