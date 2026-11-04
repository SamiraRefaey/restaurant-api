require('dotenv').config();
const express = require('express');
const pool = require('./database');
const app = express();
const port = Number(process.env.PORT || 3000);

const menuRoutes = require('./routes/menuRoutes');

app.use(express.json());

app.get('/',(req,res) => {
  res.send('Smart Restaurant API is running');
});


app.use('/api/menu', menuRoutes);

// Previously app.listen() started without checking PostgreSQL. The provided
// database already owns its schema, so verify connectivity without creating tables.
async function start() {
  try {
    await pool.query('SELECT 1');
    app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
  } catch (error) {
    console.error('Could not connect to PostgreSQL:', error.message);
    process.exitCode = 1;
    await pool.end();
  }
}

start();
