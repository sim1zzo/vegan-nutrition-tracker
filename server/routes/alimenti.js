import express from 'express';
import Alimento from '../models/Alimento.js';
import { proteggiRoute } from '../middleware/auth.js';

const router = express.Router();

// Helper per generare tags (visto in seedAlimenti.js)
function generaTags(nome, categoria) {
  const tags = [categoria];
  const nomeLower = nome.toLowerCase();
  if (nomeLower.includes('latte')) tags.push('latte vegetale', 'bevanda');
  if (nomeLower.includes('lenticchie')) tags.push('legumi', 'proteine');
  if (nomeLower.includes('ceci')) tags.push('legumi', 'proteine');
  if (nomeLower.includes('fagioli')) tags.push('legumi', 'proteine');
  if (nomeLower.includes('soia')) tags.push('soia', 'proteine');
  if (nomeLower.includes('integrale')) tags.push('integrale', 'fibre');
  if (nomeLower.includes('semi')) tags.push('semi', 'grassi buoni');
  if (nomeLower.includes('olio')) tags.push('grassi', 'condimento');
  return tags;
}

// ==================== ROUTES PUBBLICHE ====================

// GET /api/alimenti - Lista tutti gli alimenti pubblici E verificati
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

    // CORREZIONE: Mostra solo alimenti pubblici E verificati
    const query = { isPublico: true, verificato: true };

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
      alimentiArray: alimenti, // Utile per il frontend
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

// GET /api/alimenti/categoria/:categoria - Alimenti pubblici E verificati per categoria
router.get('/categoria/:categoria', async (req, res) => {
  try {
    const { categoria } = req.params;

    const alimenti = await Alimento.find({
      categoria,
      isPublico: true,
      verificato: true, // Aggiunto controllo
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
    // <-- MODIFICA CHIAVE: Rimuovi 'isPublico: false'
    // Deve trovare TUTTI gli alimenti creati dall'utente.
    const alimenti = await Alimento.find({
      creatoDA: req.user._id,
    }).sort({ nome: 1 });

    const alimentiFormattati = {};
    alimenti.forEach((alimento) => {
      alimentiFormattati[alimento.nome] = alimento.toFrontendFormat();
    });

    res.json({
      success: true,
      count: alimenti.length,
      alimenti: alimentiFormattati,
      alimentiArray: alimenti, // Invia l'array completo per la gestione
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
      isPublico, // <-- NUOVO: Accetta il flag dal body
    } = req.body;

    // Validazione campi obbligatori
    if (!nome || !categoria) {
      return res.status(400).json({
        success: false,
        message: 'Nome e categoria sono obbligatori',
      });
    }

    // Modifica: Verifica se esiste già un alimento (pubblico o privato dell'utente) con lo stesso nome
    const alimentoEsistente = await Alimento.findOne({
      nome: { $regex: `^${nome}$`, $options: 'i' }, // Case-insensitive exact match
      $or: [{ isPublico: true }, { creatoDA: req.user._id }],
    });

    if (alimentoEsistente) {
      return res.status(400).json({
        success: false,
        message: 'Esiste già un alimento (pubblico o privato) con questo nome',
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
      isPublico: isPublico || false, // Modifica: Usa il flag o imposta a false
      verificato: false, // Gli alimenti custom non sono mai verificati all'inizio
      tags: generaTags(nome, categoria),
    });

    // Aggiungi alimento alla lista personalizzata dell'utente
    req.user.alimentiPersonalizzati.push(nuovoAlimento._id);
    await req.user.save();

    res.status(201).json({
      success: true,
      message: 'Alimento creato con successo',
      alimento: nuovoAlimento, // Modifica: Restituisci l'oggetto intero
    });
  } catch (error) {
    console.error('Errore POST alimento:', error);
    // Gestione errore duplicato (anche se il check sopra dovrebbe prenderlo)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Esiste già un alimento con questo nome.',
      });
    }
    res.status(500).json({
      success: false,
      message: "Errore nella creazione dell'alimento",
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
      'isPublico', // <-- NUOVO: Campo aggiornabile
    ];

    campiModificabili.forEach((campo) => {
      if (req.body[campo] !== undefined) {
        alimento[campo] = req.body[campo];
      }
    });

    // Se l'alimento viene reso pubblico, resetta la verifica
    if (req.body.isPublico === true && alimento.isModified('isPublico')) {
      alimento.verificato = false;
    }

    // Rigenera i tags se nome o categoria cambiano
    if (alimento.isModified('nome') || alimento.isModified('categoria')) {
      alimento.tags = generaTags(alimento.nome, alimento.categoria);
    }

    await alimento.save();

    res.json({
      success: true,
      message: 'Alimento aggiornato con successo',
      alimento: alimento, // Modifica: Restituisci l'oggetto intero
    });
  } catch (error) {
    console.error('Errore PUT alimento:', error);
    // Gestione errore duplicato
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Esiste già un alimento con questo nome.',
      });
    }
    res.status(500).json({
      success: false,
      message: "Errore nell'aggiornamento dell'alimento",
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
    await alimento.deleteOne(); // Usa deleteOne() sull'istanza

    res.json({
      success: true,
      message: 'Alimento eliminato con successo',
    });
  } catch (error) {
    console.error('Errore DELETE alimento:', error);
    res.status(500).json({
      success: false,
      message: "Errore nell'eliminazione dell'alimento",
      error: error.message,
    });
  }
});

export default router;
