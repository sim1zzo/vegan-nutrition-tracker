// server/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import giornateRoutes from './routes/giornate.js';
import alimentiRoutes from './routes/alimenti.js'; // <-- Importa le nuove routes

// Connetti DB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/giornate', giornateRoutes);
app.use('/api/alimenti', alimentiRoutes); // <-- Usa le nuove routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server attivo' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
