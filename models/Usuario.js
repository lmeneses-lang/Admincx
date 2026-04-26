import mongoose from 'mongoose';

const UsuarioSchema = new mongoose.Schema({
  user: { type: String, required: true, unique: true, trim: true, lowercase: true },
  pass: { type: String, required: true },
  nombre: { type: String, default: '' },
  rol: { type: String, enum: ['Administrador', 'Agente Remoto', 'Especialista Calidad'], default: 'Agente Remoto' },
  activo: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Usuario || mongoose.model('Usuario', UsuarioSchema);
