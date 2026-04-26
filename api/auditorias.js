// api/auditoria.js
const { connectDB } = require('../lib/mongodb');
const Auditoria = require('../models/Auditoria');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  await connectDB();

  // GET — traer registros
  if (req.method === 'GET') {
    try {
      const registros = await Auditoria.find().sort({ createdAt: -1 }).limit(200);
      return res.status(200).json({ ok: true, data: registros });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  // POST — guardar registro
  if (req.method === 'POST') {
    try {
      const nuevo = await Auditoria.create(req.body);
      return res.status(201).json({ ok: true, data: nuevo });
    } catch (err) {
      return res.status(400).json({ ok: false, error: err.message });
    }
  }

  res.status(405).json({ ok: false, error: 'Método no permitido' });
};
