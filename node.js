const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'auth_db',
  password: '0000',
  port: 5432,
});

// pool.query(`CREATE TABLE IF NOT EXISTS users (
//     id SERIAL PRIMARY KEY,
//     username VARCHAR(50) UNIQUE NOT NULL,
//     password TEXT NOT NULL
//   )`, (err) => {
//     if (err) console.error(err);
//     else console.log('Таблица users готова!');
//   });

app.use(express.static(path.join(__dirname, 'public')));

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Enter username and password' });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);
      res.status(201).json({ message: 'User registered!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Registration error' });
    }
  });
  
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Enter username and password' });
    }
  
    try {
      const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Wrong User' });
      }
  
      const user = result.rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Wrong password' });
      }

      res.json({ message: 'Login successful'});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Login error' });
    }
});
  
app.listen(PORT, () => {
    console.log(`The server is running on http://localhost:${PORT}`);
});
  