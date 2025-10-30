import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { proteggiRoute } from '../middleware/auth.js';

const router = express.Router();

// Genera JWT Token
const generaToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// POST /api/auth/registrazione - Registrazione nuovo utente
router.post('/registrazione', async (req, res) => {
  try {
    const { nome, cognome, email, password, peso, altezza, eta, sesso } = req.body;

    // Validazione
    if (!nome || !email || !password || !peso) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email, password e peso sono obbligatori',
      });
    }

    // Verifica se l'utente esiste già
    const userEsistente = await User.findOne({ email });
    if (userEsistente) {
      return res.status(400).json({
        success: false,
        message: 'Email già registrata',
      });
    }

    // Crea nuovo utente
    const user = await User.create({
      nome,
      cognome,
      email,
      password,
      peso,
      altezza,
      eta,
      sesso,
    });

    // Calcola obiettivi automaticamente
    user.calcolaObiettivi();
    await user.save();

    // Genera token
    const token = generaToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registrazione completata con successo',
      user: user.getProfiloPubblico(),
      token,
    });
  } catch (error) {
    console.error('Errore registrazione:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la registrazione',
      error: error.message,
    });
  }
});

// POST /api/auth/login - Login utente
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validazione
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e password sono obbligatori',
      });
    }

    // Trova utente con password
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Credenziali non valide',
      });
    }

    // Aggiorna ultimo accesso
    user.ultimoAccesso = new Date();
    await user.save();

    // Genera token
    const token = generaToken(user._id);

    res.json({
      success: true,
      message: 'Login effettuato con successo',
      user: user.getProfiloPubblico(),
      token,
    });
  } catch (error) {
    console.error('Errore login:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il login',
      error: error.message,
    });
  }
});

// GET /api/auth/profilo - Ottieni profilo utente autenticato
router.get('/profilo', proteggiRoute, async (req, res) => {
  try {
    // Popola gli alimenti personalizzati
    await req.user.populate('alimentiPersonalizzati');

    res.json({
      success: true,
      user: req.user.getProfiloPubblico(),
      alimentiPersonalizzati: req.user.alimentiPersonalizzati,
    });
  } catch (error) {
    console.error('Errore GET profilo:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero del profilo',
      error: error.message,
    });
  }
});

// PUT /api/auth/profilo - Aggiorna profilo utente
router.put('/profilo', proteggiRoute, async (req, res) => {
  try {
    const campiModificabili = [
      'nome',
      'cognome',
      'peso',
      'altezza',
      'eta',
      'sesso',
      'livelloAttivita',
      'avatar',
    ];

    // Aggiorna solo i campi forniti
    campiModificabili.forEach((campo) => {
      if (req.body[campo] !== undefined) {
        req.user[campo] = req.body[campo];
      }
    });

    // Aggiorna preferenze se fornite
    if (req.body.preferenze) {
      req.user.preferenze = {
        ...req.user.preferenze,
        ...req.body.preferenze,
      };
    }

    // Ricalcola obiettivi se peso o livello attività sono cambiati
    if (req.body.peso || req.body.livelloAttivita || req.body.altezza || req.body.eta || req.body.sesso) {
      req.user.calcolaObiettivi();
    }

    await req.user.save();

    res.json({
      success: true,
      message: 'Profilo aggiornato con successo',
      user: req.user.getProfiloPubblico(),
    });
  } catch (error) {
    console.error('Errore PUT profilo:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'aggiornamento del profilo',
      error: error.message,
    });
  }
});

// PUT /api/auth/password - Cambia password
router.put('/password', proteggiRoute, async (req, res) => {
  try {
    const { passwordCorrente, nuovaPassword } = req.body;

    if (!passwordCorrente || !nuovaPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password corrente e nuova password sono obbligatorie',
      });
    }

    // Recupera utente con password
    const user = await User.findById(req.user._id).select('+password');

    // Verifica password corrente
    if (!(await user.matchPassword(passwordCorrente))) {
      return res.status(401).json({
        success: false,
        message: 'Password corrente non valida',
      });
    }

    // Imposta nuova password
    user.password = nuovaPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password aggiornata con successo',
    });
  } catch (error) {
    console.error('Errore cambio password:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel cambio password',
      error: error.message,
    });
  }
});

// DELETE /api/auth/account - Elimina account
router.delete('/account', proteggiRoute, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password richiesta per eliminare l\'account',
      });
    }

    // Verifica password
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Password non valida',
      });
    }

    // Elimina account
    await user.deleteOne();

    res.json({
      success: true,
      message: 'Account eliminato con successo',
    });
  } catch (error) {
    console.error('Errore eliminazione account:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'eliminazione dell\'account',
      error: error.message,
    });
  }
});

export default router;
