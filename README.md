# 🗄️ Integrazione MongoDB - Guida Completa

## 📋 Indice

- [Panoramica](#panoramica)
- [Prerequisiti](#prerequisiti)
- [Installazione](#installazione)
- [Configurazione MongoDB](#configurazione-mongodb)
- [Setup Backend](#setup-backend)
- [Popolare il Database](#popolare-il-database)
- [Testing API](#testing-api)
- [Integrazione Frontend](#integrazione-frontend)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Panoramica

Questa integrazione trasforma il tracker nutrizionale da un'app con dati hardcoded a un sistema full-stack con database MongoDB.

### Caratteristiche:

- ✅ **Database persistente** con MongoDB
- ✅ **API RESTful** completa per alimenti
- ✅ **Alimenti custom** per utente
- ✅ **Fallback automatico** a dati hardcoded se server offline
- ✅ **Sistema di ricerca** avanzato
- ✅ **Autenticazione** JWT per alimenti personalizzati

---

## 📦 Prerequisiti

1. **Node.js** (v16+)

   ```bash
   node --version  # Deve essere >= 16.x
   ```

2. **MongoDB** (installato localmente o account MongoDB Atlas)

   - **Locale**: [Download MongoDB Community](https://www.mongodb.com/try/download/community)
   - **Cloud**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (GRATIS)

3. **npm o yarn**
   ```bash
   npm --version
   ```

---

## 🚀 Installazione

### 1. Clona/Copia i file del progetto

```bash
cd vegan-tracker
```

### 2. Installa dipendenze Backend

```bash
cd server
npm install
```

### 3. Installa dipendenze Frontend (se non già fatto)

```bash
cd ../
npm install
```

---

## 🗄️ Configurazione MongoDB

### Opzione A: MongoDB Locale

1. **Installa MongoDB**

   - **macOS**: `brew install mongodb-community`
   - **Ubuntu**: `sudo apt-get install mongodb`
   - **Windows**: [Download installer](https://www.mongodb.com/try/download/community)

2. **Avvia MongoDB**

   ```bash
   # macOS/Linux
   mongod --dbpath ~/data/db

   # Windows
   "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath C:\data\db
   ```

3. **Verifica connessione**
   ```bash
   mongosh
   > show dbs
   ```

### Opzione B: MongoDB Atlas (Cloud - CONSIGLIATO)

1. **Crea account** su [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. **Crea cluster gratuito** (M0 Free Tier)

3. **Configura accesso**:

   - Network Access: Aggiungi tuo IP o `0.0.0.0/0` (tutti)
   - Database Access: Crea utente con password

4. **Copia Connection String**:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/vegan-tracker
   ```

---

## ⚙️ Setup Backend

### 1. Crea file `.env`

```bash
cd server
cp .env.example .env
```

### 2. Modifica `.env` con le tue credenziali

**Per MongoDB locale:**

```env
MONGODB_URI=mongodb://localhost:27017/vegan-tracker
JWT_SECRET=mia_stringa_segreta_cambiarla
PORT=5000
NODE_ENV=development
```

**Per MongoDB Atlas:**

```env
MONGODB_URI=mongodb+srv://tuouser:tuapassword@cluster.mongodb.net/vegan-tracker?retryWrites=true&w=majority
JWT_SECRET=mia_stringa_segreta_cambiarla
PORT=5000
NODE_ENV=development
```

### 3. Avvia il server

```bash
npm run dev
```

Dovresti vedere:

```
✅ MongoDB Connected: cluster.mongodb.net
🚀 Server running on port 5000
```

---

## 🌱 Popolare il Database

### 1. Apri il file seed e aggiungi TUTTI gli alimenti

Modifica `server/scripts/seedAlimenti.js` e copia **tutti** gli alimenti dal tuo codice esistente nell'oggetto `ALIMENTI_DA_IMPORTARE`.

### 2. Esegui lo script di seed

```bash
cd server
npm run seed
```

Output atteso:

```
🌱 Avvio seed database alimenti...
🗑️  Cancellazione alimenti esistenti...
📥 Inserimento 120 alimenti...
✅ 120 alimenti inseriti con successo!

📊 Statistiche per categoria:
  - colazione: 35 alimenti
  - pranzo: 50 alimenti
  - condimento: 20 alimenti
  - verdura: 15 alimenti
```

### 3. Verifica in MongoDB

```bash
mongosh

> use vegan-tracker
> db.alimentos.countDocuments()
120

> db.alimentos.findOne()
{
  _id: ObjectId("..."),
  nome: "Avena (fiocchi)",
  categoria: "colazione",
  proteine: 13.2,
  ...
}
```

---

## 🧪 Testing API

### Testa gli endpoint con curl o Postman

```bash
# 1. Health check
curl http://localhost:5000/api/health

# 2. GET tutti gli alimenti
curl http://localhost:5000/api/alimenti

# 3. GET alimenti per categoria
curl http://localhost:5000/api/alimenti/categoria/colazione

# 4. Ricerca alimenti
curl "http://localhost:5000/api/alimenti?search=lenticchie"

# 5. Ricerca avanzata
curl "http://localhost:5000/api/alimenti/ricerca?q=proteico"
```

### Risposta attesa (esempio):

```json
{
  "success": true,
  "count": 120,
  "alimenti": {
    "Avena (fiocchi)": {
      "categoria": "colazione",
      "proteine": 13.2,
      "carboidrati": 58.7,
      "grassi": 7,
      "fibre": 10.1,
      ...
    },
    ...
  }
}
```

---

## 💻 Integrazione Frontend

### 1. Aggiorna il file principale del componente

Nel tuo `src/App.jsx` o `src/vegan-tracker-pro-final.jsx`:

```javascript
// PRIMA (hardcoded)
const ALIMENTI_DATABASE = {
  'Avena': { ... },
  // ... 100+ alimenti
};

// DOPO (da MongoDB con fallback)
import useAlimenti from './hooks/useAlimenti';

const TrackerNutrizionaleVegano = () => {
  const { alimenti: ALIMENTI_DATABASE, loading, useHardcoded } = useAlimenti();

  if (loading) {
    return <div>Caricamento...</div>;
  }

  // Resto del codice INVARIATO!
};
```

### 2. Configura URL API (opzionale)

Crea `.env` nel frontend:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

O per produzione:

```env
REACT_APP_API_URL=https://tuo-dominio.com/api
```

### 3. Avvia frontend

```bash
npm start
```

L'app ora:

- ✅ Carica alimenti da MongoDB se server online
- ✅ Usa fallback hardcoded se server offline
- ✅ Mostra indicatore visivo della fonte dati

---

## 🔧 Troubleshooting

### Problema: "MongoDB connection failed"

**Soluzione:**

```bash
# Verifica che MongoDB sia avviato
mongosh
# Se errore, avvia MongoDB
mongod --dbpath ~/data/db

# Oppure controlla credenziali in .env
```

### Problema: "Alimenti non caricano nel frontend"

**Soluzione:**

1. Verifica che il server sia avviato: `npm run dev` (in `/server`)
2. Controlla console browser per errori CORS
3. Verifica che l'URL API sia corretto
4. Testa API direttamente: `curl http://localhost:5000/api/alimenti`

### Problema: "CORS Error"

**Soluzione:**
In `server/server.js` aggiungi:

```javascript
app.use(
  cors({
    origin: 'http://localhost:3000', // URL del tuo frontend
    credentials: true,
  })
);
```

### Problema: "Cannot find module"

**Soluzione:**

```bash
cd server
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Struttura Database

### Collection: `alimentos`

```javascript
{
  _id: ObjectId("..."),
  nome: "Avena (fiocchi)",
  categoria: "colazione",
  proteine: 13.2,
  carboidrati: 58.7,
  grassi: 7,
  fibre: 10.1,
  ferro: 3.8,
  calcio: 53,
  vitB12: 0,
  vitB2: 0.13,
  vitD: 0,
  omega3: 0,
  iodio: 0.5,
  zinco: 3,
  calorie: 389,
  porzione: 40,
  createdBy: null, // ObjectId dell'utente se custom
  isPublico: true,
  verificato: true,
  tags: ["colazione", "cereali", "fibre"],
  note: "",
  createdAt: ISODate("2025-01-15T10:00:00.000Z"),
  updatedAt: ISODate("2025-01-15T10:00:00.000Z")
}
```

---

## 🎯 Prossimi Passi

1. ✅ **Deploy Backend** (Render, Railway, Heroku)
2. ✅ **Deploy Frontend** (Vercel, Netlify)
3. ✅ **Implementa alimenti custom** (form nel frontend)
4. ✅ **Aggiungi caching** (Redis o in-memory)
5. ✅ **Implementa sync offline** (Service Worker)

---

## 📚 Risorse

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Guide](https://mongoosejs.com/docs/guide.html)
- [Express.js](https://expressjs.com/)
- [React Hooks](https://react.dev/reference/react)

---

## 🆘 Supporto

Se hai problemi:

1. Controlla i log del server: `npm run dev`
2. Controlla console browser (F12)
3. Verifica connessione MongoDB: `mongosh`
4. Testa API con Postman/curl

---

**Buon coding! 🚀🌱**
