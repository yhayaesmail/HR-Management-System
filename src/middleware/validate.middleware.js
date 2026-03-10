export const validateBody = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.validateAsync(req.body, { abortEarly: false });
      next();
    } catch (err) {
      res.status(400).json({
        success: false,
        message: "Validation error",
        details: err.details.map((d) => d.message),
      });
    }
  };
};
