import ApiError from "../utils/logger.js";
import logger from "../utils/logger.js";

export const authorizeRole = (...roles) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user) {
      logger.warn("Unauthorized access attempt without user");
      return next(ApiError("Unauthorized", 401));
    }
    if (!roles.includes(user.role)) {
      logger.warn(`User ${user.id} tried to access restricted route`);
      return next(ApiError("Forbidden", 403));
    }
    next();
  };
};
