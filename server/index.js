// Exemplo mínimo de backend seguro para proxy de remoção de fundo.
// Corre separadamente do frontend. Requer: npm install express multer node-fetch cors
import express from 'express';
import multer from 'multer';
import fetch from 'node-fetch';
import FormData from 'form-data';
import cors from 'cors';

const app = express();
app.use(cors());
const upload = multer();

const API_KEY = process.env.REMOVE_BG_API_KEY;

app.post('/remove-bg', upload.single('image'), async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ error: 'REMOVE_BG_API_KEY não configurada no servidor.' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
  }

  try {
    const form = new FormData();
    form.append('image_file', req.file.buffer, req.file.originalname);
    form.append('size', 'auto');

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': API_KEY, ...form.getHeaders() },
      body: form,
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    const buffer = await response.buffer();
    res.set('Content-Type', 'image/png');
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Falha ao contactar o serviço de remoção de fundo.' });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Proxy de remoção de fundo a correr na porta ${port}`));
