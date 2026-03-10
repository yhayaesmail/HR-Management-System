import * as employeeService from "./employee.service.js";


export const createEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.createEmployee(req.body);
    res.status(201).json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
};

export const getEmployees = async (req, res, next) => {
  try {
    const employees = await employeeService.getEmployees(req.query);
    res.status(200).json({ success: true, ...employees });
  } catch (err) {
    next(err);
  }
};

export const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    res.status(200).json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const updatedEmployee = await employeeService.updateEmployee(
      req.params.id,
      req.body,
    );
    res.status(200).json({ success: true, data: updatedEmployee });
  } catch (err) {
    next(err);
  }
};

export const deleteEmployee = async (req, res, next) => {
  try {
    const deletedEmployee = await employeeService.deleteEmployee(req.params.id);
    res.status(200).json({ success: true, data: deletedEmployee });
  } catch (err) {
    next(err);
  }
};

export const deleteAllEmployees = async (req, res, next) => {
  try {
    const result = await employeeService.deleteAllEmployees();
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
