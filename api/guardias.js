const { connectDB } = require('../lib/mongodb.js');
const GuardiaVacante = require('../models/GuardiaVacante.js');

module.exports = async function handler(req, res) {
  await connectDB();
  const { method } = req;

  if (method === 'GET') {
    const { vista, agente } = req.query;
    try {
      if (vista === 'remoto') {
        const guardias = await GuardiaVacante
          .find({ estado: 'disponible', visible: true })
          .select('-pagada -fechaPago -notaPago')
          .sort({ fecha: 1 });
        return res.status(200).json({ success: true, data: guardias });
      }
      if (vista === 'historial' && agente) {
        const guardias = await GuardiaVacante.find({ nombreAgente: agente }).sort({ fecha: -1 });
        return res.status(200).json({ success: true, data: guardias });
      }
      const guardias = await GuardiaVacante.find({}).sort({ fecha: -1 });
      return res.status(200).json({ success: true, data: guardias });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  if (method === 'POST') {
    const { accion } = req.body;
    if (accion === 'aceptar') {
      const { guardiaId, nombreAgente } = req.body;
      try {
        const guardia = await GuardiaVacante.findById(guardiaId);
        if (!guardia || guardia.estado !== 'disponible') {
          return res.status(409).json({ success: false, error: 'La guardia ya no está disponible.' });
        }
        guardia.estado = 'aceptada';
        guardia.nombreAgente = nombreAgente;
        guardia.fechaAceptacion = new Date();
        await guardia.save();
        return res.status(200).json({ success: true, data: guardia });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }
    try {
      const guardia = new GuardiaVacante(req.body);
      await guardia.save();
      return res.status(201).json({ success: true, data: guardia });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  if (method === 'PUT') {
    const { id, ...campos } = req.body;
    try {
      const guardia = await GuardiaVacante.findByIdAndUpdate(id, campos, { new: true });
      if (!guardia) return res.status(404).json({ success: false, error: 'No encontrada.' });
      return res.status(200).json({ success: true, data: guardia });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  if (method === 'DELETE') {
    const { id } = req.body;
    try {
      await GuardiaVacante.findByIdAndDelete(id);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).json({ success: false, error: `Método ${method} no permitido.` });
};
