const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const connection = require('../index'); // Import the connection from index.js

exports.register = (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    connection.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
        if (error) {
            console.log(error);
            res.status(500).send("Error");
            return;
        }

        if (results.length > 0) {
            res.render('register', {
                message: 'That email is already in use'
            });
            return;
        }

        if (password !== confirmPassword) {
            res.render('register', {
                message: 'Password does not match'
            });
            return;
        }

        let hashedPassword = await bcrypt.hash(password, 8);

        connection.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?);', [name, email, hashedPassword], (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send("Error");
                return;
            }

            res.render('register', {
                message: 'User registered successfully'
            });
        });
    });
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).render('login', {
            message: 'Please provide an email and password'
        });
    }

    connection.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
        if (error) {
            console.log(error);
            return res.status(500).send("Error");
        }

        if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
            return res.status(401).render('login', {
                message: 'Email or password is incorrect'
            });
        }

        const id = results[0].id;
        const token = jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });

        const cookieOptions = {
            expires: new Date(
                Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
        };

        res.cookie('jwt', token, cookieOptions);
        res.status(200).redirect('/');
    });
};
