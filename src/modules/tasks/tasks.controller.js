import * as taskService from "./tasks.service.js";

export const createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.body, req.user.id, req.companyId);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getAllTasks(req.companyId);
    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id, req.user, req.companyId);
    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(
      req.params.id,
      req.body,
      req.user.id,
      req.companyId,
    );
    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const changeTaskStatus = async (req, res, next) => {
  try {
    const task = await taskService.changeTaskStatus(
      req.params.id,
      req.body.status,
      req.user,
      req.companyId,
    );
    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const result = await taskService.deleteTask(req.params.id, req.companyId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getMyTasks = async (req, res, next) => {
  try {
    if (!req.user.employee) {
      return res.status(200).json({ success: true, data: [] });
    }
    const tasks = await taskService.getMyTasks(req.user.employee.id, req.companyId);
    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getEmployeeTasks(req.params.employeeId, req.companyId);
    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};
