import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  salary: Number,
  currency: { type: String, default: 'USD' },
  startDate: Date,
  status: { type: String, enum: ['pending', 'accepted', 'declined', 'expired'], default: 'pending' }
}, { timestamps: true });

export default mongoose.model('Offer', offerSchema);