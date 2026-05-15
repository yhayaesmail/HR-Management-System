import logger from "../utils/logger.js";
import { forbidden, unauthorized } from "../utils/ApiError.js";

export const authorizeRole = (...roles) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user) {
      logger.warn("Unauthorized access attempt without user");
      return next(unauthorized("Unauthorized"));
    }
    if (!roles.includes(user.role)) {
      logger.warn(`User ${user.id} tried to access restricted route`);
      return next(forbidden("Forbidden"));
    }
    next();
  };
};
