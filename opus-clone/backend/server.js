const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Added jsonwebtoken

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = 'YOUR_SECRET_KEY'; // IMPORTANT: Change this for production and use an environment variable!

app.use(express.json());

// Database setup
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
      } else {
        console.log('Users table created or already exists.');
      }
    });
  }
});

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  console.log('POST /api/auth/register request received:');
  console.log('Request body:', req.body);

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    console.log('Validation error: Missing username, email, or password.');
    return res.status(400).json({ message: 'Username, email, and password are required.' });
  }
  const emailRegex = /^\\S+@\\S+\\.\\S+$/;
  if (!emailRegex.test(email)) {
    console.log('Validation error: Invalid email format.');
    return res.status(400).json({ message: 'Invalid email format.' });
  }
  if (password.length < 8) {
    console.log('Validation error: Password too short.');
    return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
  }

  try {
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    if (existingUser) {
      console.log('Conflict error: User already exists.');
      return res.status(409).json({ message: 'User with this username or email already exists.' });
    }
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    console.log('Password hashed successfully.');
    const result = await new Promise((resolve, reject) => {
      db.run('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)', [username, email, password_hash], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
    console.log('User created successfully with ID:', result.id);
    res.status(201).json({
      message: 'User registered successfully.',
      user: { id: result.id, username, email }
    });
  } catch (error) {
    console.error('Database error during registration:', error.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  console.log('POST /api/auth/login request received:');
  console.log('Request body:', req.body);

  const { email, username, password } = req.body;

  // Input validation: either email or username must be provided, and password
  if (!(email || username) || !password) {
    console.log('Validation error: Missing email/username or password.');
    return res.status(400).json({ message: 'Email/username and password are required.' });
  }

  try {
    // Find user by email or username
    const query = email ? 'SELECT * FROM users WHERE email = ?' : 'SELECT * FROM users WHERE username = ?';
    const params = email ? [email] : [username];

    const user = await new Promise((resolve, reject) => {
      db.get(query, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });

    if (!user) {
      console.log('Authentication error: User not found.');
      return res.status(401).json({ message: 'Invalid credentials.' }); // User not found
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      console.log('Authentication error: Password mismatch.');
      return res.status(401).json({ message: 'Invalid credentials.' }); // Password does not match
    }

    // Generate JWT
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      email: user.email
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
    console.log('Login successful, JWT generated for user:', user.username);

    res.status(200).json({
      message: 'Login successful.',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Database error during login:', error.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.listen(port, () => {
  console.log(\`Server listening on port \${port}\`);
});
