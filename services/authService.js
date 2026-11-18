const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const AppError = require('../errors/AppError');

const tokenLifetime = process.env.JWT_EXPIRES_IN || '1h';

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret || Buffer.byteLength(secret) < 32) {
        throw new AppError('Authentication is not configured', 500);
    }
    return secret;
}

function validateCredentials(credentials, isRegistration) {
    if (!credentials || typeof credentials !== 'object' || Array.isArray(credentials)) {
        throw new AppError('Email and password are required', 400);
    }

    // Normalize email so registration and login use the same case-insensitive identity.
    const email = typeof credentials.email === 'string'
        ? credentials.email.trim().toLowerCase()
        : '';
    const password = credentials.password;

    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new AppError('A valid email is required', 400);
    }
    if (typeof password !== 'string' || Buffer.byteLength(password) === 0) {
        throw new AppError('Password is required', 400);
    }
    // bcrypt only considers up to 72 bytes; reject longer input rather than truncating it.
    if (Buffer.byteLength(password) > 72) {
        throw new AppError('Password must be 72 bytes or fewer', 400);
    }
    if (isRegistration && password.length < 8) {
        throw new AppError('Password must be at least 8 characters', 400);
    }

    return { email, password };
}

function createAccessToken(user) {
    // The subject identifies the user; the signing secret and expiry are checked on each request.
    return jwt.sign({}, getJwtSecret(), {
        algorithm: 'HS256',
        subject: String(user.id),
        expiresIn: tokenLifetime
    });
}

async function register(credentials) {
    const { email, password } = validateCredentials(credentials, true);
    // Store only bcrypt's slow one-way hash, never the submitted password.
    const passwordHash = await bcrypt.hash(password, 12);

    try {
        return await userRepository.createUser(email, passwordHash);
    } catch (error) {
        if (error.code === '23505') {
            throw new AppError('An account with this email already exists', 409);
        }
        throw error;
    }
}

async function login(credentials) {
    const { email, password } = validateCredentials(credentials, false);
    const user = await userRepository.findByEmail(email);

    // Use one generic error so callers cannot distinguish an unknown email from a wrong password.
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        throw new AppError('Invalid email or password', 401);
    }

    return {
        token: createAccessToken({ id: user.user_id }),
        tokenType: 'Bearer',
        expiresIn: tokenLifetime,
        user: { id: user.user_id, email: user.email }
    };
}

module.exports = { register, login };