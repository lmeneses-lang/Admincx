const mongoose = require('mongoose');

let cached = global._mongoConn || { conn: null, promise: null };
global._mongoConn = cached;

async function connectDB() {
  if (cached.conn) return cached.conn;
  cached.promise = cached.promise || mongoose.connect(process.env.MONGODB_URI);
  cached.conn = await cached.promise;
  return cached.conn;
}

const UsuarioSchema = new mongoose.Schema({
  user: { type: String, required: true, unique: true, trim: true, lowercase: true },
  pass: { type: String, required: true },
  nombre: { type: String, default: '' },
  rol: { type: String, default: 'Agente Remoto' },
  activo: { type: Boolean, default: true },
}, { timestamps: true });

const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', UsuarioSchema);

module.exports = async function handler(req, res) {
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
    const found = await Usuario.findOne({ user: user.toLowerCase(), pass: pass, activo: true });
    if (found) {
      return res.status(200).json({ success: true, user: found.user, nombre: found.nombre, rol: found.rol });
    } else {
      return res.status(200).json({ success: false, message: 'Usuario o contrasena incorrectos' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error interno', error: err.message });
  }
};
