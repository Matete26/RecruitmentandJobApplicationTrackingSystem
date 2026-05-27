import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: ['candidate', 'recruiter', 'hiring_manager', 'admin'],
    default: 'candidate'
  },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordChangedAt: Date,
  refreshToken: String,
  refreshTokenExpires: Date,
  profile: {
    phone: String,
    location: String,
    resume: String,
    linkedin: String,
    experience: Number,
    skills: [String]
  }
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if user changed password after JWT was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (!this.passwordChangedAt) return false;
  const changedTimestamp = parseInt(new Date(this.passwordChangedAt).getTime() / 1000, 10);
  return JWTTimestamp < changedTimestamp;
};

export default mongoose.model('User', userSchema);