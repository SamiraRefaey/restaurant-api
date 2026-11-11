const { Pool } = require('pg');

let instance;

class DatabaseConnection {
    static getInstance() {
        if (!instance) {
            instance = new Pool({
                connectionString: process.env.DATABASE_URL,
                host: process.env.PGHOST,
                port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
                database: process.env.PGDATABASE,
                user: process.env.PGUSER,
                password: process.env.PGPASSWORD,
                ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
                max: Number(process.env.PGPOOL_MAX || 10),
                connectionTimeoutMillis: 10000
            });
        }

        return instance;
    }
}

module.exports = DatabaseConnection;