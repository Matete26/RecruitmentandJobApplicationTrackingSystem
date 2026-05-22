import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  requirements: [String],
  responsibilities: [String],
  department: String,
  location: String,
  type: { 
    type: String, 
    enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'], 
    required: true 
  },
  salary: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' }
  },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['draft', 'open', 'closed', 'filled', 'archived'], 
    default: 'open' 
  },
  deadline: Date,
  applicantsCount: { type: Number, default: 0 }
}, { timestamps: true });

jobSchema.index({ title: 'text', description: 'text', department: 1, location: 1 });

export default mongoose.model('Job', jobSchema);