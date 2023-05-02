const { databaseConnect } = require('./config');
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const app = express();


// Configure multer middleware for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'public/images');
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        const ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'));
        }
        callback(null, true);
    }
}).single('image');


// Serve static files from the public directory
app.use(express.static('public'));
app.use(bodyParser.json());

// API endpoint to get an image
app.get('/', (req, res) => {
    res.json({
        "env": "",
        "status": "API working!"
    });
});
app.get('/images/:filename', (req, res) => {
    const filename = req.params.filename;
    res.sendFile(`public/images/${filename}`, { root: __dirname });
});
// Upload an image to the server and save its details to the database
app.post('/upload/:productId', (req, res) => {
    const productId = req.params.productId;
    const sql = 'SELECT * FROM product WHERE productId = ?';
    connection.query(sql, productId, (err, result) => {

        if (err) {
            res.status(500).send({ message: err.message });
        } else {

            if (result?.length > 0) {
                upload(req, res, (err) => {

                    if (err) {
                        res.status(400).send({ message: err.message });
                    } else {
                        const image = req.file.filename;

                        // Save the image details to the database
                        const sql = 'UPDATE product SET ? WHERE productId = ?';
                        connection.query(sql, [{ "imageName": image }, productId], (err, result) => {
                            if (err) {
                                res.status(500).send({ message: err.message });
                            } else if (result.affectedRows === 0) {
                                res.status(404).send({ message: 'Product not found' });
                            } else {
                                res.send({ imageName: image, message: 'Image uploaded successfully' });
                            }
                        });
                    }
                });
            } else {
                res.status(404).send({ message: 'User not found' });

            }
        }
    });



});


// Create MySQL connection
const connection = mysql.createConnection(databaseConnect());

// Connect to MySQL
connection.connect();

// Define routes for CRUD operations

// GET all product
app.get('/product', (req, res) => {
    connection.query('SELECT * FROM product', (err, results) => {
        if (err) {
            res.status(500).send({ message: err.message });
        } else {
            res.send(results);
        }
    });
});
app.get('/user', (req, res) => {
    connection.query('SELECT * FROM user', (err, results) => {
        if (err) {
            res.status(500).send({ message: err.message });
        } else {
            res.send(results);
        }
    });
});

// GET single product by ID
app.get('/product/:productId', (req, res) => {
    connection.query('SELECT * FROM product WHERE productId = ?', [req.params.productId], (err, results) => {
        if (err) {
            res.status(500).send({ message: err.message });
        } else if (results.length === 0) {
            res.status(404).send({ message: 'Product not found' });
        } else {
            res.send(results[0]);
        }
    });
});

// POST new product
app.post('/product', (req, res) => {
    connection.query('INSERT INTO product SET ?', req.body, (err, result) => {
        if (err) {
            res.status(500).send({ message: err.message });
        } else {
            res.send({ productId: result.insertId, message: 'Product insert successfully' });
        }
    });
});

// PUT update product by ID
app.put('/product/:productId', (req, res) => {
    connection.query('UPDATE product SET ? WHERE productId = ?', [req.body, req.params.productId], (err, result) => {
        if (err) {
            res.status(500).send({ message: err.message });
        } else if (result.affectedRows === 0) {
            res.status(404).send({ message: 'Product not found' });
        } else {
            res.send({ message: 'Product updated successfully' });
        }
    });
});

// DELETE product by ID
app.delete('/product/:productId', (req, res) => {
    connection.query('DELETE FROM product WHERE productId = ?', [req.params.productId], (err, result) => {
        if (err) {
            res.status(500).send({ message: err.message });
        } else if (result.affectedRows === 0) {
            res.status(404).send({ message: 'Product not found' });
        } else {
            res.send({ message: 'Product deleted successfully' });
        }
    });
});

// Start server
app.listen(3000, () => {
    console.log('Server started on port http://localhost:3000');
});
