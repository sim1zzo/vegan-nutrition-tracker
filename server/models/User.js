import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'Nome obbligatorio'],
      trim: true,
    },
    cognome: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email obbligatoria'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password obbligatoria'],
      minlength: 6,
      select: false,
    },
    avatar: {
      type: String,
      default: null,
    },
    peso: {
      type: Number,
      required: [true, 'Peso obbligatorio'],
      min: 30,
      max: 300,
    },
    altezza: {
      type: Number,
      min: 100,
      max: 250,
    },
    eta: {
      type: Number,
      min: 10,
      max: 120,
    },
    sesso: {
      type: String,
      enum: ['M', 'F', 'altro'],
    },
    livelloAttivita: {
      type: Number,
      default: 1.55,
      enum: [1.2, 1.375, 1.55, 1.725, 1.9],
    },
    obiettivi: {
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
    alimentiPersonalizzati: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Alimento',
      },
    ],
    preferenze: {
      temaDark: {
        type: Boolean,
        default: false,
      },
      lingua: {
        type: String,
        default: 'it',
      },
      notificheEmail: {
        type: Boolean,
        default: true,
      },
    },
    ultimoAccesso: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password prima di salvare
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Verifica password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Calcola obiettivi automatici
userSchema.methods.calcolaObiettivi = function () {
  const peso = this.peso;
  const livello = this.livelloAttivita;

  let bmr;
  if (this.eta && this.altezza && this.sesso) {
    if (this.sesso === 'M') {
      bmr = 10 * peso + 6.25 * this.altezza - 5 * this.eta + 5;
    } else {
      bmr = 10 * peso + 6.25 * this.altezza - 5 * this.eta - 161;
    }
  } else {
    bmr = peso * 22;
  }

  const tdee = bmr * livello;

  this.obiettivi = {
    proteine: peso * 1.1,
    carboidrati: (tdee * 0.6) / 4,
    grassi: (tdee * 0.25) / 9,
    fibre: 35,
    ferro: this.sesso === 'F' ? 18 : 14,
    calcio: 1000,
    vitB12: 2.4,
    vitB2: this.sesso === 'F' ? 1.1 : 1.3,
    vitD: 15,
    omega3: 1.6,
    iodio: 150,
    zinco: this.sesso === 'F' ? 8 : 11,
    calorie: tdee,
  };

  return this.obiettivi;
};

// Profilo pubblico
userSchema.methods.getProfiloPubblico = function () {
  return {
    id: this._id,
    nome: this.nome,
    cognome: this.cognome,
    email: this.email,
    avatar: this.avatar,
    peso: this.peso,
    altezza: this.altezza,
    eta: this.eta,
    sesso: this.sesso,
    livelloAttivita: this.livelloAttivita,
    obiettivi: this.obiettivi,
    preferenze: this.preferenze,
    createdAt: this.createdAt,
    ultimoAccesso: this.ultimoAccesso,
  };
};

export default mongoose.model('User', userSchema);
