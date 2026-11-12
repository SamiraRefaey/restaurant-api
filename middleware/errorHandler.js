// Centralized Express error handler. Route handlers can pass errors here with
// next(error); Express 5 also forwards rejected async route handlers.
function errorHandler(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    const errorStatus = error.statusCode || error.status;
    const status = Number.isInteger(errorStatus) && errorStatus >= 400 && errorStatus < 600
        ? errorStatus
        : 500;

    if (status >= 500) {
        console.error(error);
    }

    return res.status(status).json({
        message: status === 500 ? 'Internal server error' : error.message
    });
}

module.exports = errorHandler;
