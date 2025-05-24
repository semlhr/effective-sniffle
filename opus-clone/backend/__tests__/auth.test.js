const request = require('supertest');
const { app, setDB, initializeDB, getDB } = require('../server'); // Adjusted to import setDB
const sqlite3 = require('sqlite3').verbose();

let dbInstance; // To hold the in-memory db instance

// Helper function to initialize the database for tests
const setupTestDB = (done) => {
  dbInstance = new sqlite3.Database(':memory:', (err) => {
    if (err) return done(err);
    // Use the setDB function from server.js to set the database for the app
    setDB(dbInstance); 
    // The setDB function in server.js already ensures the table is created.
    done();
  });
};

// Helper function to clear the users table
const clearUsersTable = (done) => {
  if (!dbInstance) return done(new Error("DB instance not initialized"));
  dbInstance.serialize(() => {
    dbInstance.run("DELETE FROM users", (err) => {
      if (err) return done(err);
      dbInstance.run("DELETE FROM sqlite_sequence WHERE name='users'", done); // Reset autoincrement
    });
  });
};

beforeAll((done) => {
  setupTestDB(done);
});

afterAll((done) => {
  if (dbInstance) {
    dbInstance.close((err) => {
      if (err) return done(err);
      // Restore original DB for server if needed, or ensure server restarts cleanly next time.
      // For now, we assume server.js will re-initialize its own DB if not in test mode.
      initializeDB(); // Re-initialize with default DB
      done();
    });
  } else {
    done();
  }
});

beforeEach((done) => {
  clearUsersTable(done);
});

describe('Auth API', () => {
  // Registration Tests
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'User registered successfully.');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.username).toBe('testuser');
      expect(res.body.user.email).toBe('test@example.com');

      // Verify user in DB
      const userInDb = await new Promise((resolve, reject) => {
        getDB().get("SELECT * FROM users WHERE email = ?", ['test@example.com'], (err, row) => {
          if (err) reject(err);
          resolve(row);
        });
      });
      expect(userInDb).toBeDefined();
      expect(userInDb.username).toBe('testuser');
      expect(userInDb.password_hash).not.toBe('password123'); // Ensure password is hashed
    });

    it('should fail if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser' }); // Missing email and password
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Username, email, and password are required.');
    });

    it('should fail for invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'invalidemail',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid email format.');
    });

    it('should fail if password is too short', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: '123', // Too short
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Password must be at least 8 characters long.');
    });

    it('should fail if username is a duplicate', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'duplicateuser',
          email: 'first@example.com',
          password: 'password123',
        });
      // Attempt to register with same username
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'duplicateuser',
          email: 'second@example.com',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty('message', 'User with this username already exists.');
    });

    it('should fail if email is a duplicate', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'anotheruser',
          email: 'duplicate@example.com',
          password: 'password123',
        });
      // Attempt to register with same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'yetanotheruser',
          email: 'duplicate@example.com',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty('message', 'User with this email already exists.');
    });
  });

  // Login Tests
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register a user before each login test
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'loginuser',
          email: 'login@example.com',
          password: 'password123',
        });
    });

    it('should login successfully with correct email and password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Login successful.');
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('login@example.com');
    });
    
    it('should login successfully with correct username and password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'loginuser',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Login successful.');
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.username).toBe('loginuser');
    });

    it('should fail with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials.');
    });
    
    it('should fail with non-existent username', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistentuser',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials.');
    });

    it('should fail with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        });
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials.');
    });

    it('should fail if email/username or password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com' }); // Missing password
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Email/username and password are required.');
    });
  });
});
