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

    if (categoria && categoria !== 'tutti') {
      query.categoria = categoria;
    }

    if (search) {
      query.$or = [
        { nome: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

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

    const alimentiFormattati = {};
    alimenti.forEach((alimento) => {
      alimentiFormattati[alimento.nome] = alimento.toFrontendFormat();
    });

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      alimenti: alimentiFormattati,
      alimentiArray: alimenti,
    });
  } catch (error) {
    console.error('Errore GET alimenti:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero degli alimenti',
      error: error.message,
    });
  }
});

// GET /api/alimenti/categoria/:categoria - Alimenti per categoria
router.get('/categoria/:categoria', async (req, res) => {
  try {
    const { categoria } = req.params;

    const alimenti = await Alimento.find({
      categoria,
      isPublico: true,
    }).sort({ nome: 1 });

    const alimentiFormattati = {};
    alimenti.forEach((alimento) => {
      alimentiFormattati[alimento.nome] = alimento.toFrontendFormat();
    });

    res.json({
      success: true,
      count: alimenti.length,
      categoria,
      alimenti: alimentiFormattati,
    });
  } catch (error) {
    console.error('Errore GET categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero degli alimenti per categoria',
      error: error.message,
    });
  }
});

// ==================== ROUTES PROTETTE (ALIMENTI PERSONALIZZATI) ====================

// GET /api/alimenti/miei - Lista alimenti personalizzati dell'utente
router.get('/miei', proteggiRoute, async (req, res) => {
  try {
    const alimenti = await Alimento.find({
      creatoDA: req.user._id,
      isPublico: false,
    }).sort({ nome: 1 });

    const alimentiFormattati = {};
    alimenti.forEach((alimento) => {
      alimentiFormattati[alimento.nome] = alimento.toFrontendFormat();
    });

    res.json({
      success: true,
      count: alimenti.length,
      alimenti: alimentiFormattati,
      alimentiArray: alimenti,
    });
  } catch (error) {
    console.error('Errore GET alimenti personalizzati:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero degli alimenti personalizzati',
      error: error.message,
    });
  }
});

// POST /api/alimenti - Crea nuovo alimento personalizzato
router.post('/', proteggiRoute, async (req, res) => {
  try {
    const {
      nome,
      categoria,
      proteine,
      carboidrati,
      grassi,
      fibre,
      ferro,
      calcio,
      vitB12,
      vitB2,
      vitD,
      omega3,
      iodio,
      zinco,
      calorie,
      porzione,
    } = req.body;

    // Validazione campi obbligatori
    if (!nome || !categoria) {
      return res.status(400).json({
        success: false,
        message: 'Nome e categoria sono obbligatori',
      });
    }

    // Verifica se esiste già un alimento con lo stesso nome per questo utente
    const alimentoEsistente = await Alimento.findOne({
      nome: { $regex: `^${nome}$`, $options: 'i' },
      creatoDA: req.user._id,
    });

    if (alimentoEsistente) {
      return res.status(400).json({
        success: false,
        message: 'Hai già un alimento con questo nome',
      });
    }

    // Crea nuovo alimento
    const nuovoAlimento = await Alimento.create({
      nome,
      categoria,
      proteine: proteine || 0,
      carboidrati: carboidrati || 0,
      grassi: grassi || 0,
      fibre: fibre || 0,
      ferro: ferro || 0,
      calcio: calcio || 0,
      vitB12: vitB12 || 0,
      vitB2: vitB2 || 0,
      vitD: vitD || 0,
      omega3: omega3 || 0,
      iodio: iodio || 0,
      zinco: zinco || 0,
      calorie: calorie || 0,
      porzione: porzione || 100,
      creatoDA: req.user._id,
      isPublico: false,
    });

    // Aggiungi alimento alla lista personalizzata dell'utente
    req.user.alimentiPersonalizzati.push(nuovoAlimento._id);
    await req.user.save();

    res.status(201).json({
      success: true,
      message: 'Alimento creato con successo',
      alimento: nuovoAlimento.toFrontendFormat(),
    });
  } catch (error) {
    console.error('Errore POST alimento:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nella creazione dell\'alimento',
      error: error.message,
    });
  }
});

// PUT /api/alimenti/:id - Modifica alimento personalizzato
router.put('/:id', proteggiRoute, async (req, res) => {
  try {
    const { id } = req.params;

    // Trova l'alimento
    const alimento = await Alimento.findById(id);

    if (!alimento) {
      return res.status(404).json({
        success: false,
        message: 'Alimento non trovato',
      });
    }

    // Verifica che l'alimento appartenga all'utente
    if (alimento.creatoDA.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non hai i permessi per modificare questo alimento',
      });
    }

    // Aggiorna i campi
    const campiModificabili = [
      'nome',
      'categoria',
      'proteine',
      'carboidrati',
      'grassi',
      'fibre',
      'ferro',
      'calcio',
      'vitB12',
      'vitB2',
      'vitD',
      'omega3',
      'iodio',
      'zinco',
      'calorie',
      'porzione',
    ];

    campiModificabili.forEach((campo) => {
      if (req.body[campo] !== undefined) {
        alimento[campo] = req.body[campo];
      }
    });

    await alimento.save();

    res.json({
      success: true,
      message: 'Alimento aggiornato con successo',
      alimento: alimento.toFrontendFormat(),
    });
  } catch (error) {
    console.error('Errore PUT alimento:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'aggiornamento dell\'alimento',
      error: error.message,
    });
  }
});

// DELETE /api/alimenti/:id - Elimina alimento personalizzato
router.delete('/:id', proteggiRoute, async (req, res) => {
  try {
    const { id } = req.params;

    const alimento = await Alimento.findById(id);

    if (!alimento) {
      return res.status(404).json({
        success: false,
        message: 'Alimento non trovato',
      });
    }

    // Verifica che l'alimento appartenga all'utente
    if (alimento.creatoDA.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non hai i permessi per eliminare questo alimento',
      });
    }

    // Rimuovi l'alimento dalla lista personalizzata dell'utente
    req.user.alimentiPersonalizzati = req.user.alimentiPersonalizzati.filter(
      (alimentoId) => alimentoId.toString() !== id
    );
    await req.user.save();

    // Elimina l'alimento
    await alimento.deleteOne();

    res.json({
      success: true,
      message: 'Alimento eliminato con successo',
    });
  } catch (error) {
    console.error('Errore DELETE alimento:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'eliminazione dell\'alimento',
      error: error.message,
    });
  }
});

export default router;
