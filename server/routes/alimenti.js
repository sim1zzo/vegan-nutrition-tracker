// server/routes/alimenti.js
import express from 'express';
import Alimento from '../models/Alimento.js';
import { proteggiRoute } from '../middleware/auth.js'; // Assicurati che l'auth sia necessaria se vuoi proteggere le rotte

const router = express.Router();

// GET /api/alimenti - Recupera tutti gli alimenti (o filtrati)
router.get('/', proteggiRoute, async (req, res) => {
  try {
    // Aggiungi qui eventuali filtri se necessario (es. per categoria, per utente)
    const alimenti = await Alimento.find({}).sort({ nome: 1 }); // Ordina per nome
    res.json({ success: true, count: alimenti.length, alimenti });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: 'Errore nel recupero alimenti: ' + error.message,
      });
  }
});

// POST /api/alimenti - Aggiunge un nuovo alimento
router.post('/', proteggiRoute, async (req, res) => {
  try {
    const nuovoAlimento = await Alimento.create(req.body);
    res.status(201).json({ success: true, alimento: nuovoAlimento });
  } catch (error) {
    res
      .status(400)
      .json({
        success: false,
        message: 'Errore creazione alimento: ' + error.message,
      });
  }
});

// PUT /api/alimenti/:id - Modifica un alimento esistente
router.put('/:id', proteggiRoute, async (req, res) => {
  try {
    const alimentoAggiornato = await Alimento.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!alimentoAggiornato) {
      return res
        .status(404)
        .json({ success: false, message: 'Alimento non trovato' });
    }
    res.json({ success: true, alimento: alimentoAggiornato });
  } catch (error) {
    res
      .status(400)
      .json({
        success: false,
        message: 'Errore aggiornamento alimento: ' + error.message,
      });
  }
});

// DELETE /api/alimenti/:id - Elimina un alimento (Opzionale)
router.delete('/:id', proteggiRoute, async (req, res) => {
  try {
    const alimentoEliminato = await Alimento.findByIdAndDelete(req.params.id);
    if (!alimentoEliminato) {
      return res
        .status(404)
        .json({ success: false, message: 'Alimento non trovato' });
    }
    res.json({ success: true, message: 'Alimento eliminato' });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: 'Errore eliminazione alimento: ' + error.message,
      });
  }
});

export default router;
