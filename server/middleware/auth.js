import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const proteggiRoute = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Non autorizzato',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Utente non trovato',
      });
    }

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token non valido',
    });
  }
};
