const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mariadb = require('mariadb');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

const pool = mariadb.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'datingapp'
});

pool.getConnection()
    .then(conn => {
        console.log('Connected to MariaDB!');
        conn.release(); // release connection
    })
    .catch(err => {
        console.log('Failed to connect to MariaDB:', err);
    });

// Attach the pool to the app object
app.pool = pool;

// Define routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/login', function (req, res) {
    res.sendFile(path.join(__dirname, 'js', 'login.js'));

});

app.post('/login', async (req, res) => {
    console.log('POST /login request received');
    const { email, password } = req.body;
    console.log(`Email: ${email}, Password: ${password}`);
    const conn = await pool.getConnection();
    try {
        const conn = await pool.getConnection();

        const [results] = await conn.query('SELECT * FROM users WHERE email = ?', email);
        console.log('Results:', results);
        if (results.length === 0) {
            res.status(401).send('Invalid email or password');
            conn.release();
        } else {
            if (results.password === req.body.password) {
                // sessionStorage.setItem("userId", results.user_Id);
                res.sendFile(path.join(__dirname, 'views', 'home.html'));
                conn.release();
            } else {
                res.status(401).send('Invalid email or password');
                conn.release();
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
        conn.release();
    }
});





app.get('/register', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'js', 'register.js'));
});

app.post('/register', async (req, res) => {
    const { firstName, lastName, password, email } = req.body;
    const values = [firstName, lastName, password, email];
    const conn = await pool.getConnection();

    try {

        const sql = 'INSERT INTO users (first_name, last_name, password, email) VALUES (?, ?, ?, ?)';


        const result = await conn.query(sql, values, function (error, results, fields) {
            if (error) throw error;
            console.log(results);
        });

        console.log(result);
        console.log(values);

        res.json({
            success: true,
            message: 'Registration successful!',
        });
        console.log(values);
    } catch (error) {
        console.error('Registration error:', error);
        res.json({
            success: false,
            message: 'Registration failed!',
        });
        console.log(values);
    } finally {
        console.log(values);
        conn.release();
    }
});


app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
