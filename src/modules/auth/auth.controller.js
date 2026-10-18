import * as authService from "./auth.service.js";
import { loginSchema, registerCompanySchema, registerEmployeeSchema } from "./auth.validation.js";

const isProduction = process.env.NODE_ENV === "production";

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "strict",
  maxAge: 12 * 60 * 60 * 1000,
};

export const loginController = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
    const result = await authService.login(req.body);
    res.cookie("refreshToken", result.data.refreshToken, refreshCookieOptions);
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

export const registerCompanyController = async (req, res, next) => {
  try {
    const { error } = registerCompanySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
    const result = await authService.registerCompany(req.body);
    res.cookie("refreshToken", result.data.refreshToken, refreshCookieOptions);
    res.status(201).json({
      success: true,
      message: result.message,
      data: {
        user: result.data.user,
        company: result.data.company,
        accessToken: result.data.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const registerEmployeeController = async (req, res, next) => {
  try {
    const { error } = registerEmployeeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
    const result = await authService.registerEmployee(req.body);
    res.cookie("refreshToken", result.data.refreshToken, refreshCookieOptions);
    res.status(201).json({
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

export const createInviteController = async (req, res, next) => {
  try {
    const { email, role, expiresInDays, name, department, title, salary } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    const result = await authService.createInvite({
      email,
      companyId: req.companyId,
      role: role || "EMPLOYEE",
      expiresInDays: expiresInDays || 7,
      name,
      department,
      title,
      salary,
    });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const logoutController = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    await authService.logout(refreshToken);
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "strict",
    });
    res.status(200).json({ success: true, message: "Logged out successfully" });
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
