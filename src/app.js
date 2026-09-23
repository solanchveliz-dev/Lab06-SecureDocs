require('dotenv').config();
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('SecureDocs funcionando'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SecureDocs en http://localhost:${PORT}`));