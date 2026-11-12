class AppError extends Error {//Default error class in JS
    constructor(message, status = 500) {
        super(message);
        this.name = 'AppError';
        this.status = status;
        Error.captureStackTrace?.(this, this.constructor);
    }
}

module.exports = AppError;
