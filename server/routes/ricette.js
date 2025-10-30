import express from 'express';
import { proteggiRoute } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();
router.use(proteggiRoute); // Tutte le rotte delle ricette sono protette

// GET /api/ricette - Ottieni tutte le ricette dell'utente
router.get('/', async (req, res) => {
  try {
    // L'utente è già in req.user, e il modello User ora ha le ricette
    res.json({
      success: true,
      ricette: req.user.ricette,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ricette - Salva una nuova ricetta
router.post('/', async (req, res) => {
  try {
    const { nome, alimenti } = req.body;

    if (!nome || !alimenti || alimenti.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nome e almeno un alimento sono richiesti',
      });
    }

    const utente = await User.findById(req.user._id);

    // Controlla se esiste già una ricetta con lo stesso nome
    if (
      utente.ricette.find((r) => r.nome.toLowerCase() === nome.toLowerCase())
    ) {
      return res.status(400).json({
        success: false,
        message: 'Hai già una ricetta con questo nome',
      });
    }

    const nuovaRicetta = {
      nome,
      alimenti,
    };

    utente.ricette.push(nuovaRicetta);
    await utente.save();

    res.status(201).json({
      success: true,
      message: 'Ricetta salvata!',
      ricette: utente.ricette, // Invia l'elenco aggiornato
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/ricette/:id - Elimina una ricetta
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const utente = await User.findById(req.user._id);

    // Trova e rimuovi la ricetta
    utente.ricette.pull({ _id: id });
    await utente.save();

    res.json({
      success: true,
      message: 'Ricetta eliminata',
      ricette: utente.ricette, // Invia l'elenco aggiornato
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
