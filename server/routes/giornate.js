import express from 'express';
import GiornataAlimentare from '../models/GiornataAlimentare.js';
import { proteggiRoute } from '../middleware/auth.js';

const router = express.Router();
router.use(proteggiRoute);

// GET /api/giornate?data=2025-01-15
router.get('/', async (req, res) => {
  try {
    const { data } = req.query;
    let query = { utente: req.user._id };

    if (data) {
      const dataInizio = new Date(data);
      dataInizio.setHours(0, 0, 0, 0);
      const dataFine = new Date(data);
      dataFine.setHours(23, 59, 59, 999);

      query.data = { $gte: dataInizio, $lte: dataFine };
    }

    const giornate = await GiornataAlimentare.find(query).sort({ data: -1 });

    res.json({
      success: true,
      count: giornate.length,
      giornate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// POST /api/giornate
router.post('/', async (req, res) => {
  try {
    const giornata = await GiornataAlimentare.create({
      ...req.body,
      utente: req.user._id,
    });

    res.status(201).json({
      success: true,
      giornata,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// PUT /api/giornate/:id
router.put('/:id', async (req, res) => {
  try {
    const giornata = await GiornataAlimentare.findOneAndUpdate(
      { _id: req.params.id, utente: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!giornata) {
      return res.status(404).json({
        success: false,
        message: 'Giornata non trovata',
      });
    }

    res.json({
      success: true,
      giornata,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
