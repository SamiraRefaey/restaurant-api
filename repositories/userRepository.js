const pool = require('../database');

async function findByEmail(email) {
    // Return the hash only for credential comparison; SQL parameters keep email data out of the query text.
    const result = await pool.query(
        'SELECT user_id, email, password_hash FROM app_users WHERE email = $1',
        [email]
    );
    return result.rows[0] || null;
}

async function createUser(email, passwordHash) {
    // Persist the hash and return only public account fields to the service.
    const result = await pool.query(
        'INSERT INTO app_users (email, password_hash) VALUES ($1, $2) RETURNING user_id, email',
        [email, passwordHash]
    );
    return { id: result.rows[0].user_id, email: result.rows[0].email };
}

module.exports = { findByEmail, createUser };