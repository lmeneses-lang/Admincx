import { connectDB } from '../lib/mongodb.js';
import Usuario from '../models/Usuario.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectDB();

    if (req.method === 'GET') {
      const usuarios = await Usuario.find({ activo: true }).select('-pass').sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: usuarios });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const existe = await Usuario.findOne({ user: body.user.toLowerCase() });
      if (existe) return res.status(400).json({ success: false, message: 'El usuario ya existe' });
      const nuevo = await Usuario.create({ user: body.user.toLowerCase(), pass: body.pass, nombre: body.nombre || '', rol: body.rol || 'Agente Remoto' });
      return res.status(201).json({ success: true, data: { _id: nuevo._id, user: nuevo.user, rol: nuevo.rol } });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await Usuario.findByIdAndUpdate(id, { activo: false });
      return res.status(200).json({ success: true, message: 'Usuario desactivado' });
    }

    return res.status(405).json({ success: false, message: 'Metodo no permitido' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error interno', error: err.message });
  }
}
