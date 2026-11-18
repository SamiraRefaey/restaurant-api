const jwt = require('jsonwebtoken');
const AppError = require('../errors/AppError');

function authenticate(req, res, next) {
    const secret = process.env.JWT_SECRET;

    if (!secret || Buffer.byteLength(secret) < 32) {
        return next(new AppError('Authentication is not configured', 500));
    }

    const authorization = req.get('authorization');
    const match = authorization?.match(/^Bearer\s+(\S+)$/i);

    if (!match) {
        return next(new AppError('Authentication required', 401));
    }

    try {
        // Restrict verification to the algorithm used when issuing access tokens.
        const payload = jwt.verify(match[1], secret, { algorithms: ['HS256'] });
        if (typeof payload !== 'object' || typeof payload.sub !== 'string') {
            return next(new AppError('Authentication required', 401));
        }

        // Downstream handlers can use this ID to identify the authenticated user.
        req.user = { id: payload.sub };
        return next();
    } catch {
        return next(new AppError('Authentication required', 401));
    }
}

module.exports = authenticate;