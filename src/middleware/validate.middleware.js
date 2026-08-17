const validate = (source) => (schema) => {
  return async (req, res, next) => {
    try {
      const value = await schema.validateAsync(req[source], {
        abortEarly: false,
        stripUnknown: true,
      });
      if (source === "query") {
        Object.defineProperty(req, "query", {
          value,
          configurable: true,
          writable: true,
        });
      } else {
        req[source] = value;
      }
      next();
    } catch (err) {
      res.status(400).json({
        success: false,
        message: "Validation error",
        details: err.details
          ? err.details.map((d) => d.message)
          : [err.message],
      });
    }
  };
};

export const validateBody = validate("body");
export const validateQuery = validate("query");
export const validateParams = validate("params");
