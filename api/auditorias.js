// api/auditorias.js
const { connectDB } = require('../lib/mongodb');
const Auditoria = require('../models/Auditoria');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  await connectDB();

  // GET — traer todos los registros
  if (req.method === 'GET') {
    try {
      const registros = await Auditoria.find().sort({ createdAt: -1 }).limit(200);
      return res.status(200).json({ ok: true, data: registros });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  // POST — guardar registro nuevo
  if (req.method === 'POST') {
    try {
      const nuevo = await Auditoria.create(req.body);
      return res.status(201).json({ ok: true, data: nuevo });
    } catch (err) {
      return res.status(400).json({ ok: false, error: err.message });
    }
  }

  // PUT — editar registro existente
  if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      const actualizado = await Auditoria.findByIdAndUpdate(id, req.body, { new: true });
      if (!actualizado) return res.status(404).json({ ok: false, error: 'Registro no encontrado' });
      return res.status(200).json({ ok: true, data: actualizado });
    } catch (err) {
      return res.status(400).json({ ok: false, error: err.message });
    }
  }

  // DELETE — eliminar registro
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      const eliminado = await Auditoria.findByIdAndDelete(id);
      if (!eliminado) return res.status(404).json({ ok: false, error: 'Registro no encontrado' });
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(400).json({ ok: false, error: err.message });
    }
  }

  res.status(405).json({ ok: false, error: 'Método no permitido' });
};
