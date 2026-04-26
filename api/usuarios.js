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
  user:   { type: String, required: true, unique: true, trim: true, lowercase: true },
  pass:   { type: String, required: true },
  nombre: { type: String, default: '' },
  rol:    { type: String, default: 'Agente Remoto' },
  activo: { type: Boolean, default: true },
}, { timestamps: true });

const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', UsuarioSchema);

module.exports = async function handler(req, res) {
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
      const nuevo = await Usuario.create({
        user: body.user.toLowerCase(),
        pass: body.pass,
        nombre: body.nombre || '',
        rol: body.rol || 'Agente Remoto'
      });
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
};
