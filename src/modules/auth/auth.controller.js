import * as authService from "./auth.service.js";
import { loginSchema } from "./auth.validation.js";

export const loginController = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
    const result = await authService.login(req.body);
    res.cookie("refreshToken", result.data.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 12 * 60 * 60 * 1000,
    });
    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        user: result.data.user,
        accessToken: result.data.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshTokenController = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const result = await authService.refreshAccessToken(refreshToken);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
