import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  
  type: { type: String, enum: ['phone', 'video', 'in-person', 'technical'], required: true },
  date: { type: Date, required: true },
  duration: Number, // in minutes
  location: String, // Zoom link or physical address
  interviewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  status: { 
    type: String, 
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  feedback: [{
    interviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: Number, // 1-5
    comments: String,
    strengths: [String],
    weaknesses: [String]
  }]
}, { timestamps: true });

export default mongoose.model('Interview', interviewSchema);