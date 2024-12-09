const express = require('express');
const session = require('express-session');
const pg = require('pg');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
let app = express();

let env;
try {
    env = require('../env.json');
} catch (error) {
    console.error('Error loading env.json:', error);
    process.exit(1);
}

const Pool = pg.Pool;
const pool = new Pool(env);

pool.connect().then(() => {
    console.log("Database connected successfully");
}).catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/login')));
app.use(express.static(path.join(__dirname, 'public/signup')));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/signup', async (req, res) => {
    const { email, username, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'User already exists with this email or username' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Inserting new user into database\n');
        console.log(`Email: ${email}`);
        console.log(`Hashed password: ${hashedPassword}`);

        await pool.query(
            'INSERT INTO users (email, username, password) VALUES ($1, $2, $3)',
            [email, username, hashedPassword]
        );

        res.status(201).json({ message: 'Account created successfully!' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const client = await pool.connect();
        const result = await client.query(
            'SELECT password, username, role FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            res.status(401).json({ error: 'Invalid email or password' });
        } else {
            const storedPassword = result.rows[0].password;
            const username = result.rows[0].username;
            const role = result.rows[0].role;

            const match = await bcrypt.compare(password, storedPassword);

            if (match) {
                req.session.loggedIn = true;
                req.session.username = username;
                req.session.email = email;
                req.session.role = role;

                // Return the username in the response
                res.status(200).json({ message: 'Login successful', username: username, email: email, role: role });
            } else {
                res.status(401).json({ error: 'Invalid email or password' });
            }
        }
        client.release();
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});