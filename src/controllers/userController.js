// standard response function
import {
  createUserService,
  getAllUsersService,
  getUserByIdService,
  getUserByEmailService,
  updateUserService,
  deleteUserService,
} from "../models/userModel.js";

import { handleResponse } from "../utils/responseHandler.js";

export const createUser = async (req, res, next) => {
  const { username, email, password, role } = req.body;
  try {
    // only allow role setting if user is admin
    const finalRole = req.user && req.user.role === "admin" ? role : "user";
    const newUser = await createUserService(
      username,
      email,
      password,
      finalRole
    );
    handleResponse(res, 201, "User created successfully", newUser);
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await getAllUsersService();
    handleResponse(res, 200, "Users fetched successfully", users);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await getUserByIdService(req.params.id);
    if (!user) {
      return handleResponse(res, 404, "User not found");
    }
    handleResponse(res, 200, "User fetched successfully", user);
  } catch (error) {
    next(error);
  }
};

export const getUserByEmail = async (req, res, next) => {
  const { email } = req.params;
  try {
    const user = await getUserByEmailService(email);
    if (!user) {
      return handleResponse(res, 404, "User not found");
    }
    handleResponse(res, 200, "User fetched successfully", user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  const { username, email, password, role } = req.body;
  const targetUserId = req.params.id;
  const authenticatedUserId = req.user.id;
  const userRole = req.user.role;

  try {
    const targetUser = await getUserByIdService(targetUserId);
    if (!targetUser) {
      return handleResponse(res, 404, "User not found");
    }

    // only allow admins to change roles
    let updatedRole = targetUser.role; //default to current role
    if (role && userRole === "admin") {
      updatedRole = role; // allow admin to change role
    } else if (role && userRole !== "admin") {
      return handleResponse(res, 403, "Only admins can change user roles");
    }

    const isOwner = parseInt(targetUserId) === parseInt(authenticatedUserId);
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      return handleResponse(
        res,
        403,
        "You can only update your own account or you need admin privileges"
      );
    }

    const updatedUser = await updateUserService(
      targetUserId,
      username,
      email,
      password,
      updatedRole
    );

    handleResponse(res, 200, "User updated successfully", updatedUser);
  } catch (error) {
    console.error("Error in updateUser:", error);
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  const targetUserId = req.params.id;
  const authenticatedUserId = req.user.id;
  const userRole = req.user.role;

  try {
    const targetUser = await getUserByIdService(targetUserId);
    if (!targetUser) {
      return handleResponse(res, 404, "User not found");
    }

    // Authorization check
    const isOwner = parseInt(targetUserId) === parseInt(authenticatedUserId);
    const isAdmin = userRole === "admin";

    // Prevent admins from deleting themselves (optional safety check)
    if (isAdmin && isOwner) {
      return handleResponse(res, 403, "Admins cannot delete their own account");
    }

    if (!isOwner && !isAdmin) {
      return handleResponse(
        res,
        403,
        "You can only delete your own account or you need admin privileges"
      );
    }

    const deletedUser = await deleteUserService(targetUserId);
    handleResponse(res, 204, "User deleted successfully", deletedUser);
  } catch (error) {
    console.error("Error in deleteUser:", error);
    next(error);
  }
};
