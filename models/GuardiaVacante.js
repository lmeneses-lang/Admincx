import mongoose from 'mongoose';

const GuardiaVacanteSchema = new mongoose.Schema({
  // ── Datos de la guardia ──────────────────────────────
  fecha:       { type: Date, required: true },
  turno:       { type: String, enum: ['Mañana', 'Tarde', 'Noche', 'Madrugada'], required: true },
  cola:        { type: String, required: true },          // grupo/cola de atención
  horaInicio:  { type: String, required: true },          // ej: "08:00"
  horaFin:     { type: String, required: true },          // ej: "14:00"
  tipoPago:    { type: String, enum: ['fijo', 'horas'], default: 'fijo' },
  montoPago:   { type: Number, default: 0 },              // precio fijo O precio por hora

  // ── Estado de la vacante ─────────────────────────────
  estado: {
    type: String,
    enum: ['disponible', 'aceptada', 'vencida'],
    default: 'disponible'
  },

  // ── Penalización si nadie acepta ─────────────────────
  mostrarPenalizacion: { type: Boolean, default: false },
  montoPenalizacion:   { type: Number, default: 0 },      // costo extra que paga el equipo

  // ── Quién la aceptó ──────────────────────────────────
  aceptadaPor:    { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null },
  nombreAgente:   { type: String, default: '' },          // denormalizado para reportes rápidos
  fechaAceptacion:{ type: Date, default: null },

  // ── Pago (registro post-guardia) ─────────────────────
  pagada:      { type: Boolean, default: false },
  fechaPago:   { type: Date, default: null },
  notaPago:    { type: String, default: '' },

  // ── Quién la creó ────────────────────────────────────
  creadaPor:   { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  visible:     { type: Boolean, default: true },           // el admin puede ocultarla

}, { timestamps: true });

export default mongoose.models.GuardiaVacante
  || mongoose.model('GuardiaVacante', GuardiaVacanteSchema);
