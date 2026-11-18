const authService = require('../services/authService');

async function register(req, res) {
    const user = await authService.register(req.body);
    // 201 indicates a new account was created; the password hash is never returned.
    res.status(201).json({ user });
}

async function login(req, res) {
    const result = await authService.login(req.body);
    // The client sends this bearer token on later requests to protected routes.
    res.json(result);
}

module.exports = { register, login };