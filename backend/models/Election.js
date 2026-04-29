const mongoose = require('mongoose');

const LocalizedStringSchema = new mongoose.Schema({
  en: { type: String, required: true },
  hi: { type: String },
  mr: { type: String },
  gu: { type: String },
  bn: { type: String },
  ta: { type: String },
  te: { type: String },
  ml: { type: String },
  kn: { type: String }
}, { _id: false });

const StepSchema = new mongoose.Schema({
  title: LocalizedStringSchema,
  description: LocalizedStringSchema,
  order: { type: Number, required: true },
  actionLink: { type: String }
});

const ElectionSchema = new mongoose.Schema({
  title: LocalizedStringSchema,
  date: { type: Date, required: true },
  locationType: { type: String, enum: ['National', 'State', 'District'], default: 'National' },
  state: { type: String }, // e.g. 'Maharashtra', 'Uttar Pradesh'
  district: { type: String },
  steps: [StepSchema],
  candidates: [{
    name: { type: String, required: true },
    party: { type: String },
    bio: LocalizedStringSchema,
    platform: [String]
  }],
  pollingStations: [{
    name: { type: String },
    address: { type: String },
    accessibilityFeatures: [String]
  }]
}, { timestamps: true });

module.exports = mongoose.model('Election', ElectionSchema);
