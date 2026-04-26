const { connectDB }  = require('../lib/mongodb');
const Disponibilidad = require('../models/Disponibilidad');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  await connectDB();

  // GET
  if (req.method === 'GET') {
    try {
      const { id, ciudad } = req.query;
      if (id) {
        const doc = await Disponibilidad.findById(id);
        if (!doc) return res.status(404).json({ ok: false, error: 'Registro no encontrado' });
        return res.status(200).json({ ok: true, data: doc });
      }
      const filtro = { activo: true };
      if (ciudad) filtro.ciudad = new RegExp(ciudad, 'i');
      const registros = await Disponibilidad.find(filtro).sort({ ciudad: 1 });
      return res.status(200).json({ ok: true, data: registros });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  // POST
  if (req.method === 'POST') {
    try {
      const { ciudad, subcities, cupos } = req.body;
      if (!ciudad)
        return res.status(400).json({ ok: false, error: 'ciudad es requerida' });
      const existe = await Disponibilidad.findOne({ ciudad: ciudad.trim() });
      if (existe)
        return res.status(409).json({ ok: false, error: 'Ya existe un registro para esa ciudad' });
      const nuevo = await Disponibilidad.create({ ciudad, subcities, cupos });
      return res.status(201).json({ ok: true, data: nuevo });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  // PUT
  if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ ok: false, error: 'Falta el parámetro id' });
      const { ciudad, subcities, cupos } = req.body;
      const setObj = {};
      if (ciudad) setObj.ciudad = ciudad;
      if (subcities !== undefined) setObj.subcities = subcities;
      if (cupos) {
        Object.keys(cupos).forEach(k => {
          setObj[`cupos.${k}`] = cupos[k];
        });
      }
      const updated = await Disponibilidad.findByIdAndUpdate(
        id, { $set: setObj }, { new: true, runValidators: true }
      );
      if (!updated) return res.status(404).json({ ok: false, error: 'Registro no encontrado' });
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
      const deleted = await Disponibilidad.findByIdAndUpdate(
        id, { $set: { activo: false } }, { new: true }
      );
      if (!deleted) return res.status(404).json({ ok: false, error: 'Registro no encontrado' });
      return res.status(200).json({ ok: true, message: 'Registro desactivado', data: deleted });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).json({ ok: false, error: `Método ${req.method} no permitido` });
};
