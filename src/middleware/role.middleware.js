export const authorizeRole = (requiredRole) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user || user.role !== requiredRole) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    next();
  };
};

