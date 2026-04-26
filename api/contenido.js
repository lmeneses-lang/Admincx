const mongoose = require('mongoose');

let cached = global._mongoConn || { conn: null, promise: null };
global._mongoConn = cached;

async function connectDB() {
  if (cached.conn) return cached.conn;
  cached.promise = cached.promise || mongoose.connect(process.env.MONGODB_URI);
  cached.conn = await cached.promise;
  return cached.conn;
}

const ContenidoSchema = new mongoose.Schema({
  seccion:  { type: String, required: true },
  key:      { type: String, required: true },
  titulo:   { type: String, default: '' },
  desc:     { type: String, default: '' },
  emoji:    { type: String, default: '' },
  imagen:   { type: String, default: '' },
  topics:   { type: [String], default: [] },
  // ── Campos para kits de indumentaria ──
  nombre:   { type: String, default: '' },
  precio:   { type: String, default: '' },
  estado:   { type: String, default: 'stock' },
  visible:  { type: Boolean, default: true },
}, { timestamps: true });

ContenidoSchema.index({ seccion: 1, key: 1 }, { unique: true });

const Contenido = mongoose.models.Contenido || mongoose.model('Contenido', ContenidoSchema);

module.exports = async function handler(req, res) {
  await connectDB();

  // ── GET ──────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { seccion, guia } = req.query;
    let query = { seccion };
    if (guia) query.key = { $regex: '^' + guia + '-' };
    const docs = await Contenido.find(query).lean();
    return res.status(200).json({ success: true, data: docs });
  }

  // ── PUT: guardar cambios (admin) ─────────────────────────────
  if (req.method === 'PUT') {
    const { seccion, key, titulo, desc, emoji, imagen, topics, nombre, precio, estado, visible } = req.body;
    if (!seccion || !key) {
      return res.status(400).json({ success: false, message: 'Faltan campos' });
    }
    const doc = await Contenido.findOneAndUpdate(
      { seccion, key },
      { titulo, desc, emoji, imagen, topics, nombre, precio, estado, visible },
      { upsert: true, new: true }
    );
    return res.status(200).json({ success: true, data: doc });
  }

  // ── DELETE: eliminar documento ───────────────────────────────
  if (req.method === 'DELETE') {
    const { seccion, key } = req.body;
    if (!seccion || !key) {
      return res.status(400).json({ success: false, message: 'Faltan campos' });
    }
    await Contenido.findOneAndDelete({ seccion, key });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ success: false, message: 'Método no permitido' });
};
