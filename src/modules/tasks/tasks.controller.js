import * as taskService from "./tasks.service.js";

export const createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.body, req.user.id);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getAllTasks();
    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
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
      req.user.id,
    );
    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const result = await taskService.deleteTask(req.params.id);
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
    const tasks = await taskService.getMyTasks(req.user.employee.id);
    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getEmployeeTasks(req.params.employeeId);
    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};
