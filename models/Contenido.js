import mongoose from 'mongoose';

const ContenidoSchema = new mongoose.Schema({
  seccion: { type: String, required: true }, // ej: 'material-apoyo'
  key:     { type: String, required: true }, // ej: 'liquidaciones'
  titulo:  { type: String, default: '' },
  desc:    { type: String, default: '' },
  emoji:   { type: String, default: '' },
  imagen:  { type: String, default: '' },  // base64 o URL
  topics:  { type: [String], default: [] },
}, { timestamps: true });

// índice compuesto para buscar rápido
ContenidoSchema.index({ seccion: 1, key: 1 }, { unique: true });

export default mongoose.models.Contenido || mongoose.model('Contenido', ContenidoSchema);
