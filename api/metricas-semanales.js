// api/metricas-semanales.js
const { connectDB } = require('../lib/mongodb');
const MetricaSemanal = require('../models/MetricaSemanal');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectDB();

    // GET /api/metricas-semanales?mes=2025-04
    // GET /api/metricas-semanales?mes=2025-04&agente=Juan Perez  (solo sus datos)
    if (req.method === 'GET') {
      const { mes, agente } = req.query;
      if (!mes) return res.status(400).json({ ok: false, message: 'Falta el parámetro mes' });

      const doc = await MetricaSemanal.findOne({ mesKey: mes });
      if (!doc) return res.status(200).json({ ok: true, data: null });

      // Si viene un agente (vista remoto), filtramos solo sus datos
      if (agente) {
        const filtrado = {
          mesKey: doc.mesKey,
          semanas: doc.semanas.map(s => ({
            label: s.label,
            start: s.start,
            end:   s.end,
            datos: s.datos.filter(d => d.agente === agente),
          })),
        };
        return res.status(200).json({ ok: true, data: filtrado });
      }

      return res.status(200).json({ ok: true, data: doc });
    }

    // POST — guardar/reemplazar el documento entero de un mes
    // Body: { mesKey, semanas }
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { mesKey, semanas } = body;
      if (!mesKey) return res.status(400).json({ ok: false, message: 'Falta mesKey' });

      const doc = await MetricaSemanal.findOneAndUpdate(
        { mesKey },
        { mesKey, semanas: semanas || [] },
        { upsert: true, new: true, runValidators: true }
      );
      return res.status(200).json({ ok: true, data: doc });
    }

    // PUT — actualizar un campo puntual (un agente, una semana)
    // Body: { mesKey, semanaIndex, agente, campos: { tickets, pctCalidad, ... } }
    if (req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { mesKey, semanaIndex, agente, campos } = body;
      if (!mesKey || semanaIndex === undefined || !agente || !campos)
        return res.status(400).json({ ok: false, message: 'Faltan campos requeridos' });

      let doc = await MetricaSemanal.findOne({ mesKey });
      if (!doc) return res.status(404).json({ ok: false, message: 'Mes no encontrado' });

      const semana = doc.semanas[semanaIndex];
      if (!semana) return res.status(404).json({ ok: false, message: 'Semana no encontrada' });

      const idx = semana.datos.findIndex(d => d.agente === agente);
      if (idx >= 0) {
        Object.assign(semana.datos[idx], campos);
      } else {
        semana.datos.push({ agente, ...campos });
      }

      doc.markModified('semanas');
      await doc.save();
      return res.status(200).json({ ok: true, data: doc });
    }

    return res.status(405).json({ ok: false, message: 'Método no permitido' });

  } catch (err) {
    return res.status(500).json({ ok: false, message: 'Error interno', error: err.message });
  }
};
