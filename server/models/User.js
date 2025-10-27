import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    nome: {
      type: String,
      required: true,
    },
    peso: { type: Number, default: 70 },
    obiettivi: {
      proteine: { type: Number, default: 60 },
      carboidrati: { type: Number, default: 250 },
      grassi: { type: Number, default: 70 },
      fibre: { type: Number, default: 30 },
      ferro: { type: Number, default: 15 },
      calcio: { type: Number, default: 1000 },
      vitB12: { type: Number, default: 3 },
      vitB2: { type: Number, default: 1.4 },
      vitD: { type: Number, default: 20 },
      omega3: { type: Number, default: 1.6 },
      iodio: { type: Number, default: 200 },
      zinco: { type: Number, default: 10 },
      calorie: { type: Number, default: 2000 },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.verificaPassword = async function (passwordInserita) {
  return await bcrypt.compare(passwordInserita, this.password);
};

export default mongoose.model('User', userSchema);
