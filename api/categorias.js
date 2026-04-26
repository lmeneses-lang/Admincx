const { connectDB }  = require('../lib/mongodb');
const Categoria      = require('../models/Categoria');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  await connectDB();

  // GET
  if (req.method === 'GET') {
    try {
      const { id } = req.query;
      if (id) {
        const cat = await Categoria.findById(id);
        if (!cat) return res.status(404).json({ ok: false, error: 'Categoría no encontrada' });
        return res.status(200).json({ ok: true, data: cat });
      }
      const categorias = await Categoria.find({ activo: true }).sort({ orden: 1 });
      return res.status(200).json({ ok: true, data: categorias });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  // POST
  if (req.method === 'POST') {
    try {
      const { slug, label, emoji, orden } = req.body;
      if (!slug || !label)
        return res.status(400).json({ ok: false, error: 'slug y label son requeridos' });
      const existe = await Categoria.findOne({ slug });
      if (existe)
        return res.status(409).json({ ok: false, error: 'Ya existe una categoría con ese slug' });
      const nueva = await Categoria.create({ slug, label, emoji, orden });
      return res.status(201).json({ ok: true, data: nueva });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  // PUT
  if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ ok: false, error: 'Falta el parámetro id' });
      const updated = await Categoria.findByIdAndUpdate(
        id, { $set: req.body }, { new: true, runValidators: true }
      );
      if (!updated) return res.status(404).json({ ok: false, error: 'Categoría no encontrada' });
      return res.status(200).json({ ok: true, data: updated });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  // DELETE
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ ok: false, error: 'Falta el parámetro id' });
      const deleted = await Categoria.findByIdAndUpdate(
        id, { $set: { activo: false } }, { new: true }
      );
      if (!deleted) return res.status(404).json({ ok: false, error: 'Categoría no encontrada' });
      return res.status(200).json({ ok: true, message: 'Categoría desactivada', data: deleted });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).json({ ok: false, error: `Método ${req.method} no permitido` });
};
