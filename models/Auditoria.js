// models/Auditoria.js
const mongoose = require('mongoose');

const AuditoriaSchema = new mongoose.Schema({
  agente:        { type: String, required: true, trim: true },
  fecha:         { type: String, required: true },
  tipo:          { type: String, default: '' },
  ticket:        { type: String, default: '' },
  puntaje:       { type: Number, required: true, min: 0, max: 100 },
  empatia:       { type: Number, default: 0 },
  gestion:       { type: Number, default: 0 },
  empCriterios:  { type: [String], default: [] },
  gesCriterios:  { type: [String], default: [] },
  observaciones: { type: String, default: '' },
  metricas: {
    satisfaccion:           Number,
    calificados:            Number,
    tiempoPrimeraRespuesta: Number,
    tiempoResolucion:       Number,
    ticketsPorHora:         Number,
    turno:                  String,
  },
  especialista:  { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.models.Auditoria || 
  mongoose.model('Auditoria', AuditoriaSchema);
