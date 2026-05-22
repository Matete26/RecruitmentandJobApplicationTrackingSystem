import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true 
  },
  password: { 
    type: String, 
    required: true, 
    select: false,
    minlength: 8 
  },
  role: { 
    type: String, 
    enum: ['candidate', 'recruiter', 'hiring_manager', 'admin'], 
    default: 'candidate' 
  },

  // Email Verification
  isEmailVerified: { 
    type: Boolean, 
    default: false 
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,

  // Password Reset
  passwordResetToken: String,
  passwordResetExpires: Date,

  isActive: { 
    type: Boolean, 
    default: true 
  },

  // Candidate Profile
  profile: {
    phone: String,
    location: String,
    resume: String,
    linkedin: String,
    github: String,
    experienceYears: Number,
    education: [{
      degree: String,
      institution: String,
      year: Number
    }],
    skills: [String],
    experience: [{
      company: String,
      position: String,
      duration: String,
      description: String
    }]
  }
}, { timestamps: true });

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate email verification token (optional helper)
userSchema.methods.generateEmailVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = token;
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

export default mongoose.model('userSchema', userSchema);