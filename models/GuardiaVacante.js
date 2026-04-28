const mongoose = require('mongoose');

const GuardiaVacanteSchema = new mongoose.Schema({
  fecha:       { type: Date, required: true },
  turno:       { type: String, enum: ['Mañana', 'Tarde', 'Noche', 'Madrugada'], required: true },
  cola:        { type: String, required: true },
  horaInicio:  { type: String, required: true },
  horaFin:     { type: String, required: true },
  tipoPago:    { type: String, enum: ['fijo', 'horas'], default: 'fijo' },
  montoPago:   { type: Number, default: 0 },
  estado:      { type: String, enum: ['disponible', 'aceptada', 'vencida'], default: 'disponible' },
  mostrarPenalizacion: { type: Boolean, default: false },
  montoPenalizacion:   { type: Number, default: 0 },
  aceptadaPor:     { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null },
  nombreAgente:    { type: String, default: '' },
  fechaAceptacion: { type: Date, default: null },
  pagada:    { type: Boolean, default: false },
  fechaPago: { type: Date, default: null },
  notaPago:  { type: String, default: '' },
  creadaPor: { type: String, default: '' },
  visible:   { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.models.GuardiaVacante
  || mongoose.model('GuardiaVacante', GuardiaVacanteSchema);
