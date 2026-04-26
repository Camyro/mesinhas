// server.js — Express server para o MOSAICO Hub de Notícias
// Serve a API /api/news e o frontend estático

const express = require('express');
const path    = require('path');
const axios   = require('axios');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

// Importa o handler da API
const newsHandler = require('./api/news');

// Rota da API de notícias
app.get('/api/news', (req, res) => newsHandler(req, res));

// Serve o frontend para qualquer outra rota
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🗞  MOSAICO rodando em http://localhost:${PORT}`);
});