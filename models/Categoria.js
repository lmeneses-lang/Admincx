const mongoose = require('mongoose');

const CategoriaSchema = new mongoose.Schema({
  slug:   { type: String, required: true, unique: true, trim: true, lowercase: true },
  label:  { type: String, required: true },
  emoji:  { type: String, default: '🚗' },
  activo: { type: Boolean, default: true },
  orden:  { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.models.Categoria || mongoose.model('Categoria', CategoriaSchema);
