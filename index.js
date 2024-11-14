const express = require('express');
const exphbs = require('express-handlebars');
const mysql = require('mysql');
const dotenv = require('dotenv');

const cookieParser = require('cookie-parser');

dotenv.config({path: './.env'})

const app = express();

app.use(cookieParser(process.env.JWT_SECRET));

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({extended: true,}));
app.use(express.json());


// Setup Handlebars as the template engine
const hbs = exphbs.create({ 
    extname: '.handlebars',
    helpers: {
        eq: (a, b) => a === b, // Custom equality helper
    },
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Serve static files from the "public" directory
app.use(express.static('public'));


// MySQL connection configuration
const connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
});

module.exports = connection;

// Define Routes
app.use('/', require('./routes/pages.js'));
app.use('/auth', require('./routes/auth.js'));


// Connect to MySQL and start the server
connection.connect(function (err) {
    if (err) console.log(err);

    console.log('Connected to MySQL');

    app.listen(3000);
});