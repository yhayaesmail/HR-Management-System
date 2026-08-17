import * as hiringService from "./hiring.service.js";

export const receiveApplications = async (req, res, next) => {
  try {
    const application = await hiringService.receiveApplications(req.body);
    res.status(201).json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
};

export const getApplications = async (req, res, next) => {
  try {
    const applications = await hiringService.getApplications(
      req.query,
      req.user,
    );
    res.status(200).json({ success: true, ...applications });
  } catch (err) {
    next(err);
  }
};

export const getApplicationById = async (req, res, next) => {
  try {
    const application = await hiringService.getApplicationById(
      req.params.email,
      req.user,
    );
    res.status(200).json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
};

export const proccessApplication = async (req, res, next) => {
  try {
    const application = await hiringService.proccessApplication(
      req.params.email,
      req.body.status,
      req.user,
    );
    res.status(200).json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
};

export const deleteApplication = async (req, res, next) => {
  try {
    const application = await hiringService.deleteApplication(
      req.params.email,
      req.user,
    );
    res.status(200).json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
};
