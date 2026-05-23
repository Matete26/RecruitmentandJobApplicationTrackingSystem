import User from '../models/userModel.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const queryUsers = async ({ queryParams }, { UserModel = User } = {}) => {
  const { role, page = 1, limit = 20, search, skills } = queryParams;
  const query = {};
  if (role) query.role = role;
  if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
  if (skills) query['profile.skills'] = { $in: skills.split(',') };

  const users = await UserModel.find(query).select('-password').skip((page - 1) * limit).limit(parseInt(limit)).sort({ createdAt: -1 });
  const total = await UserModel.countDocuments(query);
  return { users, total, page: parseInt(page), limit: parseInt(limit) };
};

export const getUserById = async (id, { UserModel = User } = {}) => {
  const user = await UserModel.findById(id).select('-password');
  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const updateUser = async (id, updates, { UserModel = User } = {}) => {
  const { role, isActive, ...profileUpdates } = updates;
  const user = await UserModel.findByIdAndUpdate(id, { role, isActive, ...profileUpdates }, { new: true, runValidators: true }).select('-password');
  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const toggleUserStatus = async (id, isActive, { UserModel = User } = {}) => {
  const user = await UserModel.findByIdAndUpdate(id, { isActive }, { new: true }).select('-password');
  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const searchCandidates = async ({ queryParams }, { UserModel = User } = {}) => {
  const { skills, experienceMin, location, search } = queryParams;
  const query = { role: 'candidate' };
  if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { 'profile.skills': { $regex: search, $options: 'i' } }];
  if (skills) query['profile.skills'] = { $all: skills.split(',') };
  if (experienceMin) query['profile.experienceYears'] = { $gte: parseInt(experienceMin) };
  if (location) query['profile.location'] = { $regex: location, $options: 'i' };

  const candidates = await UserModel.find(query).select('-password').sort({ 'profile.experienceYears': -1 });
  return candidates;
};

export default { queryUsers, getUserById, updateUser, toggleUserStatus, searchCandidates };
