import * as payrollService from "./payroll.service.js";

export const createPayroll = async (req, res, next) => {
  try {
    const payroll = await payrollService.createPayroll(req.body, req.user.id);
    res.status(201).json({
      success: true,
      data: payroll,
    });
  } catch (error) {
    next(error);
  }
};

export const getPayrolls = async (req, res, next) => {
  try {
    const payrolls = await payrollService.getPayrolls();
    res.json({
      success: true,
      data: payrolls,
    });
  } catch (error) {
    next(error);
  }
};

export const getPayrollById = async (req, res, next) => {
  try {
    const payroll = await payrollService.getPayrollById(req.params.id);
    res.json({
      success: true,
      data: payroll,
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeePayrolls = async (req, res, next) => {
  try {
    const payrolls = await payrollService.getEmployeePayrolls(
      req.params.employeeId,
    );
    res.json({
      success: true,
      data: payrolls,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyPayrolls = async (req, res, next) => {
  try {
    const payrolls = await payrollService.getMyPayrolls(req.user.id);
    res.json({
      success: true,
      data: payrolls,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePayroll = async (req, res, next) => {
  try {
    const payroll = await payrollService.updatePayroll(
      req.params.id,
      req.body,
      req.user.id,
    );
    res.json({
      success: true,
      data: payroll,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePayroll = async (req, res, next) => {
  try {
    const result = await payrollService.deletePayroll(req.params.id);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
