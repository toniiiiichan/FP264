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

let stripeKey = env.stripeAPIKEY
const stripe = require("stripe")(stripeKey);

const Pool = pg.Pool;
const pool = new Pool(env);

pool.connect().then(() => {
    console.log("Database connected successfully");
}).catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/index')));
app.use(express.static(path.join(__dirname, 'public/login')));
app.use(express.static(path.join(__dirname, 'public/signup')));
app.use(express.static(path.join(__dirname, 'public/stop')));
app.use(express.static(path.join(__dirname, 'public/makestop')));
app.use(express.static(path.join(__dirname, 'public/makeitinerary')));
app.use(express.static(path.join(__dirname, 'public/itinerary')));
app.use(express.static(path.join(__dirname, 'public/updateitinerary')));
app.use(express.static(path.join(__dirname, 'public/updatestop')));
app.use(express.static(path.join(__dirname, 'public/yourstops')));
app.use(express.static(path.join(__dirname, 'public/youritineraries')));
app.use(express.static(path.join(__dirname, 'public/role')));


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

app.post('/make_stop', async (req, res) => {
    const { username, accessUsers, title, assignedItinerary, location, dateStart, dateEnd, notes } = req.body;

    try {
        const client = await pool.connect();

        const findUser = await client.query(
            'SELECT user_id FROM users WHERE username = $1',
            [username]
        );

        const userId = findUser.rows[0].user_id;
        console.log(userId);

        const accessUsersArray = accessUsers.split(',').map(user => user.trim());
        accessUsersString = JSON.stringify(accessUsersArray);

        let result;
        if (assignedItinerary == "None") {
            result = await pool.query(
                `INSERT INTO stops (user_id, access_usernames, title, location_name, arrival_date, departure_date, notes) 
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING stop_id`,
                [userId, accessUsersString, title, location, dateStart, dateEnd, notes]
            );
        } else {
            result = await pool.query(
                `INSERT INTO stops (itinerary_id, user_id, access_usernames, title, location_name, arrival_date, departure_date, notes) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING stop_id`,
                [assignedItinerary, userId, accessUsersString, title, location, dateStart, dateEnd, notes]
            );
        }
        console.log("Stop saved with ID: ", result.rows[0].stop_id)
        res.status(201).json({ message: 'Stop created successfully!', id: result.rows[0].stop_id});
        client.release();
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/make_itinerary', async (req, res) => {
    const { username, accessUsers, title, description } = req.body;

    try {
        const client = await pool.connect();

        const accessUsersArray = accessUsers.split(',').map(user => user.trim());
        accessUsersString = JSON.stringify(accessUsersArray);
        
        const findUser = await client.query(
            'SELECT user_id FROM users WHERE username = $1',
            [username]
        );

        const userId = findUser.rows[0].user_id;
        console.log(userId);

        const result = await pool.query(
            `INSERT INTO itineraries (user_id, access_usernames, title, description) 
            VALUES ($1, $2, $3, $4) RETURNING itinerary_id`,
            [userId, accessUsersString, title, description]
        );

        console.log("Itinerary created with ID: ", result.rows[0].itinerary_id)
        res.status(201).json({ message: 'Itinerary created successfully!', id: result.rows[0].itinerary_id});
        client.release();
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/get_user_itineraries', async (req, res) => {
    try {
        const username = req.query.username;
        const client = await pool.connect();

        const findUser = await client.query(
            'SELECT user_id FROM users WHERE username = $1',
            [username]
        );

        const userId = findUser.rows[0].user_id;

        const findItineraries = await client.query(
            'SELECT * FROM itineraries WHERE user_id = $1',
            [userId]
        );

        console.log(findItineraries.rows);

        res.status(201).json({ message: 'Itineraries found successfully!', itineraries: findItineraries.rows });
        client.release();
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/stop', async (req, res) => {
    try {
        const stopId = req.query.stopId;
        const username = req.query.username;
        const role = req.query.role;
        let isAdmin = role == "Admin";
        let hasItineraryAccess = false;
        let hasOwnerAccess = false;
        let hasStopAccess = false;
    
        console.log(stopId);
        console.log(username);

        const client = await pool.connect();

        const findUser = await client.query(
            'SELECT user_id FROM users WHERE username = $1',
            [username]
        );

        const userId = findUser.rows[0].user_id;

        const checkStopAccess = await client.query(
            'SELECT access_usernames, user_id FROM stops WHERE stop_id = $1',
            [stopId]
        );

        const accessUsers = checkStopAccess.rows[0];
        console.log('hey', accessUsers);

        if(accessUsers.access_usernames) {
            const viewPermissions = JSON.parse(accessUsers.access_usernames);
            const creatorId = accessUsers.user_id;
            hasStopAccess = viewPermissions.includes(username);
            hasOwnerAccess = creatorId == userId
        }

        const findStop = await client.query(
            'SELECT * FROM stops WHERE stop_id = $1',
            [stopId]
        );

        if (findStop.rows[0].itinerary_id) {
            const checkItineraryAccess = await client.query(
                'SELECT access_usernames FROM itineraries WHERE itinerary_id = $1',
                [findStop.rows[0].itinerary_id]
            );
    
            const itineraryAccess = checkItineraryAccess.rows[0].access_usernames;
            console.log(itineraryAccess);
            hasItineraryAccess = itineraryAccess.includes(username);
        }
        console.log(findStop.rows[0]);
        console.log(userId);
        console.log(accessUsers);
        console.log(hasItineraryAccess);
        console.log(hasStopAccess);
        console.log(hasOwnerAccess);


        if (hasStopAccess || hasOwnerAccess || hasItineraryAccess || isAdmin) {
            res.status(201).json({ stop: findStop.rows[0] });
        } else {
            res.status(400).json({ error: "User does not have access" });
        }
        client.release();
    } catch(err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/itinerary', async (req, res) => {
    try {
        const itineraryId = req.query.itineraryId;
        const username = req.query.username;
        const role = req.query.role;
        let hasItineraryAccess = false;
        let hasOwnerAccess = false;
        let isAdmin = role == "Admin";

        console.log(itineraryId);
        console.log(username);

        const client = await pool.connect();

        const findUser = await client.query(
            'SELECT user_id FROM users WHERE username = $1',
            [username]
        );

        const userId = findUser.rows[0].user_id;

        const checkItineraryAccess = await client.query(
            'SELECT access_usernames, user_id FROM itineraries WHERE itinerary_id = $1',
            [itineraryId]
        );

        const accessUsers = checkItineraryAccess.rows[0];
        console.log(accessUsers);
        if(accessUsers) {
            const viewPermissions = JSON.parse(accessUsers.access_usernames);
            const creatorId = accessUsers.user_id;
            hasItineraryAccess = viewPermissions.includes(username);
            hasOwnerAccess = creatorId == userId
        }

        const findItinerary = await client.query(
            'SELECT * FROM itineraries WHERE itinerary_id = $1',
            [itineraryId]
        );

        const findStops = await client.query(
            'SELECT * FROM stops WHERE itinerary_id = $1',
            [itineraryId]
        );

        console.log(findItinerary.rows[0]);
        console.log(userId);
        console.log(accessUsers);
        console.log(hasItineraryAccess);
        console.log(hasOwnerAccess);
        console.log(findStops.rows);


        if (hasOwnerAccess || hasItineraryAccess || isAdmin) {
            res.status(201).json({ itinerary: findItinerary.rows[0], stops: findStops.rows});
        } else {
            res.status(400).json({ error: "User does not have access" });
        }
        client.release();
    } catch(err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/update_itinerary', async (req, res) => {
    const { accessUsers, title, description, itineraryId} = req.body;

    try {
        const client = await pool.connect();

        const accessUsersArray = accessUsers.split(',').map(user => user.trim());
        accessUsersString = JSON.stringify(accessUsersArray);

        const result = await pool.query(
            `UPDATE itineraries SET access_usernames = $1, title = $2, description = $3 
            WHERE itinerary_id = $4`,
            [accessUsersString, title, description, itineraryId]
        );

        console.log("Itinerary updated with ID: ", itineraryId)
        res.status(201).json({ message: 'Itinerary updated successfully!'});
        client.release();
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/update_stop', async (req, res) => {
    const {stopId, accessUsers, title, assignedItinerary, location, dateStart, dateEnd, notes} = req.body;

    try {
        const client = await pool.connect();

        const accessUsersArray = accessUsers.split(',').map(user => user.trim());
        accessUsersString = JSON.stringify(accessUsersArray);

        let result;
        if (assignedItinerary == "None") {
            result = await pool.query(
                `UPDATE stops SET access_usernames = $1, title = $2, location_name = $3, arrival_date = $4,
                departure_date = $5, notes = $6
                WHERE stop_id = $7`,
                [accessUsersString, title, location, dateStart, dateEnd, notes, stopId]
            );
        } else {
            result = await pool.query(
                `UPDATE stops SET itinerary_id = $1, access_usernames = $2, title = $3, location_name = $4, arrival_date = $5,
                departure_date = $6, notes = $7
                WHERE stop_id = $8`,
                [assignedItinerary, accessUsersString, title, location, dateStart, dateEnd, notes, stopId]
            );
        }

        console.log("Stop updated with ID: ", stopId)
        res.status(201).json({ message: 'Stop updated successfully!'});
        client.release();
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/update_role', async (req, res) => {
    const {username, chosenRole} = req.body;

    try {
        const client = await pool.connect();

        const findUser = await client.query(
            'SELECT user_id FROM users WHERE username = $1',
            [username]
        );

        const userId = findUser.rows[0].user_id;

        if (chosenRole == Paid) {
            try {
                const session = await stripe.checkout.sessions.
                    create({
                        payment_method_types: ["card"],
                        phone_number_collection: {
                            enabled: true,
                        },
                        mode: "payment",
                        line_items: [
                            {
                                price_data: {
                                    currency: 'usd',
                                    product_data: {
                                        name: "Paid Membership"
                                    },
                                    unit_amount: 1000
                                },
                                quantity: 1
                            }
                        ],
                        success_url: "/paid.html",
                        cancel_url: "/cancel.html",
                    });
            } catch (error) {
                console.error(`Error sending email: ${error}`);
            }
        }
        let result = await pool.query(
            `UPDATE users SET role = $1
            WHERE user_id = $2`,
            [chosenRole, userId]
        );

        console.log("Role updated successfully")
        console.log(chosenRole);
        res.status(201).json({ message: 'Role updated successfully!', role: chosenRole});
        client.release();
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/user_stops', async (req, res) => {
    try {
        const username = req.query.username;

        console.log(username);

        const client = await pool.connect();

        const findUser = await client.query(
            'SELECT user_id FROM users WHERE username = $1',
            [username]
        );

        const userId = findUser.rows[0].user_id;

        const findStops = await client.query(
            'SELECT * FROM stops WHERE user_id = $1',
            [userId]
        );

        res.status(201).json({ stops: findStops.rows });
        client.release();
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/user_itineraries', async (req, res) => {
    try {
        const username = req.query.username;

        console.log(username);

        const client = await pool.connect();

        const findUser = await client.query(
            'SELECT user_id FROM users WHERE username = $1',
            [username]
        );

        const userId = findUser.rows[0].user_id;

        console.log(userId);

        const findItineraries = await client.query(
            'SELECT * FROM itineraries WHERE user_id = $1',
            [userId]
        );

        console.log(findItineraries.rows);

        res.status(201).json({ itineraries: findItineraries.rows });
        client.release();
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});