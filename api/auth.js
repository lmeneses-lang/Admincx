import { connectDB } from '../lib/mongodb.js';
import Usuario from '../models/Usuario.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Metodo no permitido' });
  }

  let user = '', pass = '';
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    user = (body.user || '').trim();
    pass = (body.pass || '').trim();
  } catch {
    return res.status(400).json({ success: false, message: 'Body invalido' });
  }

  try {
    await connectDB();
    const found = await Usuario.findOne({
      user: user.toLowerCase(),
      pass: pass,
      activo: true,
    });

    if (found) {
      return res.status(200).json({ success: true, user: found.user, nombre: found.nombre, rol: found.rol });
    } else {
      return res.status(200).json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error interno', error: err.message });
  }
}
