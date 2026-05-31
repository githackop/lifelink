import AppError from '../utils/AppError.js';

export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authorized.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`Role '${req.user.role}' is not authorized for this action.`, 403)
      );
    }

    next();
  };
