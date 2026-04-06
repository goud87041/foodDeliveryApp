/**
 * Central error handler — keeps API responses consistent.
 */
export function errorHandler(err, req, res, next) {
  const status = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(status).json({
    success: false,
    message,
    ...(err.errors && { errors: err.errors }),
  });
}

export function notFound(req, res, next) {
  const e = new Error(`Not Found — ${req.originalUrl}`);
  e.statusCode = 404;
  next(e);
}
