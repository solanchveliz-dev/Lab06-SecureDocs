require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/auth', require('./routes/authRoutes'));
app.use('/usuarios', require('./routes/usuarioRoutes'));
app.use('/documentos', require('./routes/documentoRoutes'));
app.use('/auditoria', require('./routes/auditoriaRoutes'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SecureDocs en http://localhost:${PORT}`));