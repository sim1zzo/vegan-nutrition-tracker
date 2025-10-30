import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { proteggiRoute } from '../middleware/auth.js';

const router = express.Router();

const creaToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// POST /api/auth/registrazione
router.post('/registrazione', async (req, res) => {
  try {
    const { email, password, nome } = req.body;

    const utenteEsistente = await User.findOne({ email });
    if (utenteEsistente) {
      return res.status(400).json({
        success: false,
        message: 'Email già registrata',
      });
    }

    const utente = await User.create({ email, password, nome });
    const token = creaToken(utente._id);

    res.status(201).json({
      success: true,
      token,
      utente: {
        id: utente._id,
        email: utente.email,
        nome: utente.nome,
        obiettivi: utente.obiettivi,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const utente = await User.findOne({ email }).select('+password');

    if (!utente || !(await utente.verificaPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Credenziali non valide',
      });
    }

    const token = creaToken(utente._id);

    res.json({
      success: true,
      token,
      utente: {
        id: utente._id,
        email: utente.email,
        nome: utente.nome,
        obiettivi: utente.obiettivi,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET /api/auth/me
router.get('/me', proteggiRoute, async (req, res) => {
  res.json({
    success: true,
    utente: req.user,
  });
});

export default router;
