const express = require('express');
const session = require('express-session');
const pg = require('pg');
const path = require('path');
const fs = require('fs');
let app = express();

let env;
try {
    env = require('../env.json');
} catch (error) {
    console.error('Error loading env.json:', error);
    process.exit(1);
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});