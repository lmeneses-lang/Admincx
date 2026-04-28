// api/guardias.js
// Vercel Serverless Function — todas las operaciones de Guardia Vacante

import dbConnect from '../lib/dbConnect.js';
import GuardiaVacante from '../models/GuardiaVacante.js';
import Usuario from '../models/Usuario.js';

export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;

  // ── GET ────────────────────────────────────────────────────────────────────
  // ?vista=remoto  → solo guardias disponibles (el agente remoto ve esto)
  // ?vista=admin   → todas las guardias (para el panel admin / registro pagos)
  // ?vista=historial&agente=ID → historial de un agente específico
  if (method === 'GET') {
    const { vista, agente } = req.query;

    try {
      if (vista === 'remoto') {
        // Solo las disponibles, sin datos sensibles de pago
        const guardias = await GuardiaVacante
          .find({ estado: 'disponible', visible: true })
          .select('-pagada -fechaPago -notaPago -montoPenalizacion -mostrarPenalizacion')
          .sort({ fecha: 1 });
        return res.status(200).json({ success: true, data: guardias });
      }

      if (vista === 'historial' && agente) {
        const guardias = await GuardiaVacante
          .find({ aceptadaPor: agente })
          .sort({ fecha: -1 });
        return res.status(200).json({ success: true, data: guardias });
      }

      // Vista admin — todo
      const guardias = await GuardiaVacante
        .find({})
        .populate('aceptadaPor', 'nombre user rol')
        .populate('creadaPor', 'nombre user')
        .sort({ fecha: -1 });
      return res.status(200).json({ success: true, data: guardias });

    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // ── POST — Crear guardia nueva (solo admin) ────────────────────────────────
  if (method === 'POST') {
    const { accion } = req.body;

    // Acción: el agente acepta una guardia disponible
    if (accion === 'aceptar') {
      const { guardiaId, agenteId, nombreAgente } = req.body;
      try {
        // Verificar que sigue disponible (carrera de condición)
        const guardia = await GuardiaVacante.findById(guardiaId);
        if (!guardia || guardia.estado !== 'disponible') {
          return res.status(409).json({ success: false, error: 'La guardia ya no está disponible.' });
        }
        guardia.estado          = 'aceptada';
        guardia.aceptadaPor     = agenteId;
        guardia.nombreAgente    = nombreAgente;
        guardia.fechaAceptacion = new Date();
        await guardia.save();
        return res.status(200).json({ success: true, data: guardia });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }

    // Acción por defecto: crear guardia
    try {
      const guardia = new GuardiaVacante(req.body);
      await guardia.save();
      return res.status(201).json({ success: true, data: guardia });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  // ── PUT — Editar guardia o marcar pago (solo admin) ────────────────────────
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

  // ── DELETE — Eliminar guardia (solo admin) ─────────────────────────────────
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
}
