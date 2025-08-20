// standard response function
import {
  createUserService,
  getAllUsersService,
  getUserByIdService,
  getUserByEmailService,
  updateUserService,
  deleteUserService,
} from "../models/userModel.js";

import { handleResponse, isValidDate } from "../utils/helpers.js";

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
    //extract query params for pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    //extract query params for sorting
    const sortBy = req.query.sortBy || "id";
    const order = req.query.order || "ASC";

    //extract query params for filtering
    const search = req.query.search || "";
    const role = req.query.role || "";
    const startDate = req.query.startDate || "";
    const endDate = req.query.endDate || "";

    //validate all the query params
    if (page < 1) {
      return handleResponse(res, 400, "Page number must be at least 1");
    }

    //only allowing max 100 users per page
    if (limit < 1 || limit > 100) {
      return handleResponse(res, 400, "Limit must be between 1 and 100");
    }

    const validSortFields = ["id", "username", "email", "role", "created_at"];
    if (!validSortFields.includes(sortBy.toLowerCase())) {
      return handleResponse(
        res,
        400,
        `Invalid sortBy field. Valid fields are: ${validSortFields.join(", ")}`
      );
    }

    const validOrder = ["ASC", "DESC"];
    if (!validOrder.includes(order.toUpperCase())) {
      return handleResponse(res, 400, "Order must be either 'ASC' or 'DESC'");
    }

    const validRRoles = ["user", "admin"];
    if (
      role &&
      role.trim() &&
      !validRRoles.includes(role.trim().toLowerCase())
    ) {
      return handleResponse(
        res,
        400,
        `Invalid role filter. Valid roles are: ${validRRoles.join(", ")}`
      );
    }

    if (startDate && !isValidDate(startDate)) {
      return handleResponse(
        res,
        400,
        "Invalid startDate format. Use YYYY-MM-DD"
      );
    }
    if (endDate && !isValidDate(endDate)) {
      return handleResponse(res, 400, "Invalid endDate format. Use YYYY-MM-DD");
    }

    const options = {
      page,
      limit,
      sortBy: sortBy.toLowerCase(),
      order: order.toUpperCase(),
      search,
      role: role.trim().toLowerCase(),
      startDate,
      endDate,
    };

    const users = await getAllUsersService(options);
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
