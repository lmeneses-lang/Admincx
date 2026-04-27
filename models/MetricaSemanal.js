// models/MetricaSemanal.js
const mongoose = require('mongoose');

const DatoAgenteSemanaSchema = new mongoose.Schema({
  agente:          { type: String, required: true },
  turno:           { type: String, default: '' },
  tickets:         { type: Number, default: 0 },
  avgDaily:        { type: Number, default: 0 },
  ticketsBad:      { type: Number, default: 0 },
  ticketsGood:     { type: Number, default: 0 },
  firstResponse:   { type: Number, default: 0 },
  resolutionTime:  { type: Number, default: 0 },
  pctCalidad:      { type: Number, default: null },
}, { _id: false });

const SemanaSchema = new mongoose.Schema({
  label:  { type: String, required: true },   // "Semana 1"
  start:  { type: String, required: true },   // "2025-04-01"
  end:    { type: String, required: true },   // "2025-04-07"
  datos:  { type: [DatoAgenteSemanaSchema], default: [] },
}, { _id: false });

const MetricaSemanalSchema = new mongoose.Schema({
  mesKey: { type: String, required: true, unique: true },  // "2025-04"
  semanas: { type: [SemanaSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.models.MetricaSemanal
  || mongoose.model('MetricaSemanal', MetricaSemanalSchema);
