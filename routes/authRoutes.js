const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// These public endpoints let a client create an account and obtain a token.
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;