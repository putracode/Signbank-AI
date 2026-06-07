import response from '../utils/response.js';
import { ClientError } from '../exceptions/index.js';
import fs from 'fs';

const ErrorHandler = (err, req, res, next) => {
  // Clean up uploaded files if an error occurred after they were uploaded
  if (req.files) {
    if (req.files.thumbnail?.[0]) {
      fs.unlink(req.files.thumbnail[0].path, () => {});
    }
    if (req.files.video?.[0]) {
      fs.unlink(req.files.video[0].path, () => {});
    }
  }

  if (err instanceof ClientError) {
    return response(res, err.statusCode, err.message, null);
  }

  if (err.isJoi) {
    return response(res, 400, err.details[0].message, null);
  }

  if (err.name === 'MulterError') {
    return response(res, 400, err.message, null);
  }

  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  console.error('Unhandled error:', err);

  return response(res, status, message, null);
};

export default ErrorHandler;
