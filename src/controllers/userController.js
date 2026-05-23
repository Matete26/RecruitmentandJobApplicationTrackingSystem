import userService from '../services/userService.js';

/**
 * Get all users / candidates with filtering and pagination
 */
export const getUsers = async (req, res, next) => {
  try {
    const result = await userService.queryUsers({ queryParams: req.query });
    res.json({ success: true, count: result.users.length, total: result.total, totalPages: Math.ceil(result.total / result.limit), currentPage: result.page, data: result.users });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single user by ID (Detailed profile)
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user (Admin / Recruiter only)
 */
export const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.json({ success: true, message: 'User updated successfully', data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate / Activate user
 */
export const toggleUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await userService.toggleUserStatus(req.params.id, isActive);
    res.json({ success: true, message: `User ${isActive ? 'activated' : 'deactivated'} successfully`, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * Search candidates (Optimized for recruiters)
 */
export const searchCandidates = async (req, res, next) => {
  try {
    const candidates = await userService.searchCandidates({ queryParams: req.query });
    res.json({ success: true, count: candidates.length, data: candidates });
  } catch (error) {
    next(error);
  }
};

export default {
  getUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  searchCandidates
};