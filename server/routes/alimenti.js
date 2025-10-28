import express from 'express';
import Alimento from '../models/Alimento.js';
import { proteggiRoute } from '../middleware/auth.js';

const router = express.Router();

// ==================== ROUTES PUBBLICHE ====================

// GET /api/alimenti - Lista tutti gli alimenti pubblici
router.get('/', async (req, res) => {
  try {
    const {
      categoria,
      search,
      altoProteico,
      ipocalorico,
      page = 1,
      limit = 1000,
    } = req.query;

    const query = { isPublico: true };

    // Filtro categoria
    if (categoria && categoria !== 'tutti') {
      query.categoria = categoria;
    }

    // Ricerca testuale
    if (search) {
      query.$or = [
        { nome: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    // Filtri nutrizionali
    if (altoProteico === 'true') {
      query.proteine = { $gte: 15 };
    }
    if (ipocalorico === 'true') {
      query.calorie = { $lte: 100 };
    }

    const alimenti = await Alimento.find(query)
      .sort({ nome: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Alimento.countDocuments(query);

    // Converti in formato frontend (compatibile con codice esistente)
    const alimentiFormattati = {};
    alimenti.forEach((alimento) => {
      alimentiFormattati[alimento.nome] = alimento.toFrontendFormat();
    });

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      alimenti: alimentiFormattati, // Formato oggetto come nell'app originale
      alimentiArray: alimenti, // Formato array per uso alternativo
    });
  } catch (error) {
    console.error('Errore GET alimenti:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET /api/alimenti/ricerca - Ricerca avanzata
router.get('/ricerca', async (req, res) => {
  try {
    const { q, categoria } = req.query;

    const alimenti = await Alimento.ricercaAvanzata(q, { categoria });

    res.json({
      success: true,
      count: alimenti.length,
      alimenti,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET /api/alimenti/:id - Dettaglio singolo alimento
router.get('/:id', async (req, res) => {
  try {
    const alimento = await Alimento.findById(req.params.id);

    if (!alimento) {
      return res.status(404).json({
        success: false,
        message: 'Alimento non trovato',
      });
    }

    res.json({
      success: true,
      alimento,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET /api/alimenti/categoria/:categoria - Alimenti per categoria
router.get('/categoria/:categoria', async (req, res) => {
  try {
    const alimenti = await Alimento.find({
      categoria: req.params.categoria,
      isPublico: true,
    }).sort({ nome: 1 });

    res.json({
      success: true,
      count: alimenti.length,
      alimenti,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==================== ROUTES PROTETTE (autenticazione richiesta) ====================

// POST /api/alimenti - Crea alimento custom (solo utenti autenticati)
router.post('/', proteggiRoute, async (req, res) => {
  try {
    const alimento = await Alimento.create({
      ...req.body,
      createdBy: req.user._id,
      isPublico: false, // Alimenti custom sono privati di default
      verificato: false,
    });

    res.status(201).json({
      success: true,
      message: 'Alimento creato con successo',
      alimento,
    });
  } catch (error) {
    // Gestione errore duplicato
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Esiste già un alimento con questo nome',
      });
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// GET /api/alimenti/miei - Alimenti custom dell'utente
router.get('/utente/miei', proteggiRoute, async (req, res) => {
  try {
    const alimenti = await Alimento.find({
      createdBy: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: alimenti.length,
      alimenti,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// PUT /api/alimenti/:id - Modifica alimento (solo proprio o admin)
router.put('/:id', proteggiRoute, async (req, res) => {
  try {
    const alimento = await Alimento.findById(req.params.id);

    if (!alimento) {
      return res.status(404).json({
        success: false,
        message: 'Alimento non trovato',
      });
    }

    // Verifica che l'utente sia il creatore
    if (alimento.createdBy?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non autorizzato a modificare questo alimento',
      });
    }

    const alimentoAggiornato = await Alimento.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Alimento aggiornato con successo',
      alimento: alimentoAggiornato,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// DELETE /api/alimenti/:id - Elimina alimento (solo proprio o admin)
router.delete('/:id', proteggiRoute, async (req, res) => {
  try {
    const alimento = await Alimento.findById(req.params.id);

    if (!alimento) {
      return res.status(404).json({
        success: false,
        message: 'Alimento non trovato',
      });
    }

    // Verifica che l'utente sia il creatore
    if (alimento.createdBy?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non autorizzato a eliminare questo alimento',
      });
    }

    await Alimento.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Alimento eliminato con successo',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==================== ADMIN ROUTES (da implementare con middleware admin) ====================

// POST /api/alimenti/:id/verifica - Verifica alimento (solo admin)
router.post('/:id/verifica', proteggiRoute, async (req, res) => {
  try {
    // TODO: Aggiungi middleware per verificare se l'utente è admin

    const alimento = await Alimento.findByIdAndUpdate(
      req.params.id,
      { verificato: true },
      { new: true }
    );

    if (!alimento) {
      return res.status(404).json({
        success: false,
        message: 'Alimento non trovato',
      });
    }

    res.json({
      success: true,
      message: 'Alimento verificato con successo',
      alimento,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
