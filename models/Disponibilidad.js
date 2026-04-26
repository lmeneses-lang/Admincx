const mongoose = require('mongoose');

const DisponibilidadSchema = new mongoose.Schema({
  ciudad:    { type: String, required: true, trim: true },
  subcities: { type: String, default: '' },
  cupos: {
    moto:    { type: Number, default: null },
    moto_b:  { type: Number, default: null },
    carro_b: { type: Number, default: null },
    carro_e: { type: Number, default: null },
    carro_p: { type: Number, default: null },
    cam:     { type: Number, default: null },
  },
  activo: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.models.Disponibilidad || mongoose.model('Disponibilidad', DisponibilidadSchema);
