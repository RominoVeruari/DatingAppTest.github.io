const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mariadb = require('mariadb');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const moment = require('moment');
const util = require('util');
const multer = require('multer');
const app = express();
const upload = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, './uploads/');
      },
      filename: function (req, file, cb) {
        cb(null, file.originalname);
      },
    }),
  });
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));


app.use(cookieSession({
    name: 'session',
    secret: 'your-secret-key-here',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
}));

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


        const [results] = await conn.query('SELECT * FROM users WHERE email = ?', email);
        console.log('showing results')
        console.log('Results:', results);
        // console.log(results.user_id);
        // console.log(req.session.userId);
        if (results.length === 0) {
            res.status(401).send('Invalid email or password');
            conn.release();
        } else {
            if (results.password === req.body.password) {
                // console.log(req.session.userId)
                req.session.userId = results.user_id;
                // console.log(req.session.userId)
                res.sendFile(path.join(__dirname, 'views', 'home.html'));
                conn.release();
            } else {
                res.status(401).send('Invalid email or password');

            } conn.release();
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
        const userId = result.insertId;
        // Create a new table for the user's photo gallery
        const photoGalleryTable = `CREATE TABLE \`photo_gallery_${userId}\` (
            \`photo_id\` int(11) NOT NULL AUTO_INCREMENT,
            \`file_name\` varchar(255) NOT NULL,
            \`mimetype\` varchar(255) NOT NULL,
            \`size\` int(11) NOT NULL,
            \`original_name\` varchar(255) NOT NULL,
            \`profile_picture\` boolean DEFAULT 0,
            PRIMARY KEY (\`photo_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

        const setLink = `UPDATE users SET profile_picture_id = (SELECT photo_id FROM photo_gallery_${userId} WHERE profile_picture = true )`
        await conn.query(photoGalleryTable);
        //should be fixed to do it once at the creation of the users database . this query shouldnt be included in the serverside 
        await conn.query(setLink);


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
//handle /home response

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});
// Handle GET request to /profile_setup

app.get('/api/profile', async (req, res) => {
    const userId = req.session.userId;
    const conn = await pool.getConnection();
    try {
        const [userResults] = await conn.query('SELECT * FROM users WHERE user_id = ?', userId);
        const [photoResults] = await conn.query(`SELECT * FROM photo_gallery_${userId}`);
        conn.release();
        res.json({user: userResults, photos: photoResults});
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
        conn.release();
    }
});
// Handle POST request and response of /profile_setup

app.post('/profile_setup', (req, res) => {
    const userId = req.session.userId;
    const profileData = {
        sexualOrientation: req.body.sexual_orientation,
        dateOfBirth: req.body.date_of_birth,
        profilePicture: req.body.profile_picture,
        photoGallery: req.body.photo_gallery,
        bio: req.body.bio,
        interests: req.body.interests
    };
    /* Save profile data to user's database using userId */
    res.redirect('home.html');
});
// Set up route for handling photo uploads
app.post('/api/photo', upload.single('photo'), async (req, res) => {
    try {
      // Extract photo information from request
      const { originalname, mimetype, size, filename } = req.file;
  
      // Insert photo information into database
      const [rows] = await connection.query(
        'INSERT INTO photo_gallery (filename, originalname, mimetype, size) VALUES (?, ?, ?, ?)',
        [filename, originalname, mimetype, size]
      );
  
      // Send success response
      res.status(200).json({
        message: 'Photo uploaded successfully!',
        photoId: rows.photo_id,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Error uploading photo',
      });
    }
  });
  
  // Set up route for updating profile picture
  app.post('/api/update-profile-picture', upload.single('photo'), async (req, res) => {
    try {
      // Extract photo information from request
      const { originalname, mimetype, size, filename } = req.file;
  
      // Update user's profile picture URL in database
      const [rows] = await connection.query(
        'UPDATE users SET profile_picture_url = ? WHERE user_id = ?',
        [filename, req.session.userId]
      );
  
      // Send success response
      res.status(200).json({
        message: 'Profile picture updated successfully!',
        profilePictureUrl: filename,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Error updating profile picture',
      });
    }
  });
  
  // Set up route for adding a photo to user's gallery
  app.post('/api/add-photo-gallery', upload.single('photo'), async (req, res) => {
    try {
      // Extract photo information from request
      const { originalname, mimetype, size, filename } = req.file;
  
      // Insert photo information into database
      const [rows] = await connection.query(
        'INSERT INTO photo_gallery (filename, originalname, mimetype, size) VALUES (?, ?, ?, ?)',
        [filename, originalname, mimetype, size]
      );
  
      // Associate photo with user in user_photo_gallery table
      await connection.query(
        'INSERT INTO user_photo_gallery (photo_id, user_id) VALUES (?, ?)',
        [rows.photo_id, req.session.userId]
      );
  
      // Send success response
      res.status(200).json({
        message: 'Photo added to gallery successfully!',
        photoId: rows.photo_id,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Error adding photo to gallery',
      });
    }
  });
  
  // Set up route for deleting a photo from user's gallery
  app.delete('/api/delete-photo-gallery/:photoId', async (req, res) => {
    try {
      // Delete photo from photo_gallery table
      await connection.query(
        'DELETE FROM photo_gallery WHERE photo_id = ?',
        [req.params.photoId]
      );
  
      // Remove association of photo with user from user_photo_gallery table
      await connection.query(
        'DELETE FROM user_photo_gallery WHERE photo_id = ? AND user_id = ?',
        [req.params.photoId, req.session.userId]
      );
  
      // Send success response
      res.status(200).json({
        message: 'Photo deleted from gallery successfully!',
      });
    } catch (error) {
        console.error(error);
        res.status(500).json({
          message: 'Error adding photo to gallery',
        });
      }
    });
// Handle GET request to /logout
app.get('/logout', (req, res) => {
    // Clear the user id stored in the session cookie
    req.session.userId = null;

    // Redirect the user to the login page
    res.redirect('/login.html');
});

// Handle POST request to /logout
app.post('/logout', (req, res) => {
    // Clear the user id stored in the session cookie
    req.session.userId = null;

    // Return a success message
    res.json({ success: true });
});
app.get('/api/user', async (req, res) => {
    const { userId } = req.session;
    const conn = await pool.getConnection();
    if (!userId) {
        return res.status(401).json({ error: 'Not authorized' });
    }

    try {

        const [user] = await conn.query('SELECT * FROM users WHERE user_id = ?', userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ firstName: user.first_name });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});




// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
