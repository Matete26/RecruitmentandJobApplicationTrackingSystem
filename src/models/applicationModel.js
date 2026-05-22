import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['applied', 'reviewed', 'shortlisted', 'interview', 'offered', 'hired', 'rejected', 'withdrawn'],
    default: 'applied'
  },
  resume: String,
  coverLetter: String,
  notes: [{
    text: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  score: Number,           // AI or manual score
  feedback: String
}, { timestamps: true });

export default mongoose.model('Application', applicationSchema);