import User from '../models/userModel.js';

/**
 * Get all users / candidates with filtering and pagination
 */
export const getUsers = async (req, res) => {
  try {
    const { 
      role, 
      page = 1, 
      limit = 20, 
      search, 
      skills 
    } = req.query;

    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (skills) {
      query['profile.skills'] = { $in: skills.split(',') };
    }

    const users = await User.find(query)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

/**
 * Get single user by ID (Detailed profile)
 */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

/**
 * Update user (Admin / Recruiter only)
 */
export const updateUser = async (req, res) => {
  try {
    const { role, isActive, ...profileUpdates } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        role,
        isActive,
        ...profileUpdates
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

/**
 * Deactivate / Activate user
 */
export const toggleUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
};

/**
 * Search candidates (Optimized for recruiters)
 */
export const searchCandidates = async (req, res) => {
  try {
    const { skills, experienceMin, location, search } = req.query;

    const query = { role: 'candidate' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'profile.skills': { $regex: search, $options: 'i' } }
      ];
    }
    if (skills) {
      query['profile.skills'] = { $all: skills.split(',') };
    }
    if (experienceMin) {
      query['profile.experienceYears'] = { $gte: parseInt(experienceMin) };
    }
    if (location) {
      query['profile.location'] = { $regex: location, $options: 'i' };
    }

    const candidates = await User.find(query)
      .select('-password')
      .sort({ 'profile.experienceYears': -1 });

    res.json({
      success: true,
      count: candidates.length,
      data: candidates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching candidates',
      error: error.message
    });
  }
};

export default {
  getUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  searchCandidates
};