import { connectDB } from '../lib/mongodb.js';
import Auditoria from '../models/Auditoria.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectDB();

    if (req.method === 'GET') {
      const { agente, limit = 100 } = req.query;
      const filtro = agente ? { agente: { $regex: agente, $options: 'i' } } : {};
      const data = await Auditoria.find(filtro).sort({ createdAt: -1 }).limit(Number(limit));
      return res.status(200).json({ success: true, data });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const nueva = await Auditoria.create(body);
      return res.status(201).json({ success: true, data: nueva });
    }

    return res.status(405).json({ success: false, message: 'Metodo no permitido' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error interno', error: err.message });
  }
}
