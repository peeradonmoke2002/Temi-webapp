const express = require('express');
const amqp = require('amqplib/callback_api');
const cors = require('cors');
const WebSocket = require('ws');
const app = express();
const { Pool } = require('pg');
const bodyParser = require('body-parser');



// Increase the body size limit
app.use(bodyParser.json({ limit: '50mb' })); // Adjust the limit as needed
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // Adjust the limit for URL-encoded data

app.use(cors());

// RabbitMQ connection //
const port = 3002;
const RABBITMQ_URL = 'amqp://admin:123456@10.62.31.12:5672'; 

// PostgreSQL database connection details
const pool = new Pool({
    user: 'admin',
    host: '10.62.31.12',  
    database: 'temi-db',
    password: '123456',
    port: 5432,  
});

// Function to convert BYTEA to base64
function convertImageToBase64(row) {
    if (row.product_image) {
        // Ensure product_image is a Buffer, then convert to base64
        row.product_image = Buffer.from(row.product_image).toString('base64'); 
    }
    if (row.qr_code_image) {
        // Ensure qr_code_image is a Buffer, then convert to base64
        row.qr_code_image = Buffer.from(row.qr_code_image).toString('base64'); 
    }
    return row;
}

app.use(cors());
app.use(express.json());

let channel;
let connection;

const connectToRabbitMQ = () => {
    amqp.connect(RABBITMQ_URL, (error0, conn) => {
        if (error0) {
            console.error('Failed to connect to RabbitMQ:', error0);
            setTimeout(connectToRabbitMQ, 5000); // Retry after 5 seconds
            return;
        }
        connection = conn;
        connection.createChannel((error1, ch) => {
            if (error1) {
                console.error('Failed to create channel:', error1);
                return;
            }
            channel = ch;
            const controlQueuequeue = 'robot_control_queue';
            const storeupdateQueue = 'store_update_queue';
            console.log(`Connected to RabbitMQ and created channel for queue: ${controlQueuequeue} and ${storeupdateQueue}`);
            channel.assertQueue(controlQueuequeue, {
                durable: false,
                arguments: {
                    'x-message-ttl': 300000  // TTL set to 300,000 ms (5 minutes)
                }
            });
            channel.assertQueue(storeupdateQueue, {
                durable: false,
                arguments: {
                    'x-message-ttl': 300000  // TTL set to 300,000 ms (5 minutes)
                }
            });
        });
    });
};

connectToRabbitMQ();


// const wss = new WebSocket.Server({ port: 8080 });  // WebSocket signaling server

// // // WebSocket signaling server logic
// wss.on('connection', (ws) => {
//     console.log('A client connected to the WebSocket signaling server');

//     ws.on('message', (message) => {
//         console.log('Received message:', message);

//         // Broadcast the message to all clients except the sender
//         wss.clients.forEach((client) => {
//             if (client !== ws && client.readyState === WebSocket.OPEN) {
//                 client.send(message);
//             }
//         });
//     });

//     ws.on('close', () => {
//         console.log('A client disconnected from the WebSocket signaling server');
//     });

//     ws.on('error', (error) => {
//         console.error('WebSocket error:', error);
//     });
// });


app.post('/send-command', (req, res) => {
    const command = req.body.command;
    const queue = 'robot_control_queue';

    if (channel) {
        channel.sendToQueue(queue, Buffer.from(command));
        console.log(`Sent command: ${command}`);
        res.status(200).send('Command sent to RabbitMQ');
    } else {
        res.status(500).send('Channel is not available');
    }
});

app.post('/update-store', (req, res) => {
    const command = req.body.command;
    const queue = 'store_update_queue';

    if (channel) {
        channel.sendToQueue(queue, Buffer.from(command));
        console.log(`Sent command: ${command}`);
        res.status(200).send('Command sent to RabbitMQ');
    }
    else {
        res.status(500).send('Channel is not available');
    }
});

// Gracefully close RabbitMQ connection on server shutdown
process.on('SIGINT', () => {
    if (connection) {
        connection.close(() => {
            console.log('RabbitMQ connection closed');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});


// Endpoint to get all products
app.get('/api/products', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT id, name, price, product_image, qr_code_image, detail FROM store');
        client.release();
        // Convert product_image and qr_code_image to base64
        const products = result.rows.map(convertImageToBase64);
        // Send the product data as JSON response
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.get('/api/products/data', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT id, name, price, detail FROM store');
        client.release();
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// get image product image by id
app.get('/api/productImage/:id', async (req, res) => {
    const { id } = req.params; // Extract id from the request parameters

    try {
        const client = await pool.connect();
        // Use the extracted id in the SQL query
        const result = await client.query('SELECT id, product_image FROM store WHERE id = $1', [id]);
        client.release();

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Image not found' });
        }

        const { product_image } = result.rows[0]; // Assuming the column is named product_image
        const imageData = Buffer.from(product_image, 'binary');

        res.set({
            'Content-Type': 'image/png', // You can change this to 'image/jpeg' if necessary
            'Content-Length': imageData.length,
        });
        res.send(imageData);
    } catch (err) {
        console.error('Error fetching image from PostgreSQL', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/qrCodeImage/:id', async (req, res) => {
    const { id } = req.params; // Extract id from the request parameters

    try {
        const client = await pool.connect();
        // Use the extracted id in the SQL query
        const result = await client.query('SELECT id, qr_code_image FROM store WHERE id = $1', [id]);
        client.release();

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Image not found' });
        }

        const { qr_code_image } = result.rows[0];
       

        // Check if the qr_code_image exists
        if (!qr_code_image) {
            return res.status(404).json({ error: 'QR Code image not found' });
        }

        const imageData = Buffer.from(qr_code_image, 'binary');

        res.set({
            'Content-Type': 'image/png', // Adjust the content type if necessary
            'Content-Length': imageData.length,
        });
        res.send(imageData);
    } catch (err) {
        console.error('Error fetching image from PostgreSQL', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add new product
app.post('/api/products/add', async (req, res) => {
    const { name, price, product_image, qr_code_image, detail } = req.body;

    try {
        const client = await pool.connect();
        const result = await client.query(
            'INSERT INTO store (name, price, product_image, qr_code_image, detail) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, price, product_image ? Buffer.from(product_image, 'base64') : null, qr_code_image ? Buffer.from(qr_code_image, 'base64') : null, detail]
        );
        client.release();

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error adding product to PostgreSQL', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to update product
// Endpoint to update product text and float data
app.put('/api/products/updateData/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price, detail } = req.body;

    try {
        const client = await pool.connect();

        // Retrieve the current product data to retain unchanged fields
        const currentProductResult = await client.query('SELECT * FROM store WHERE id = $1', [id]);

        if (currentProductResult.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const currentProduct = currentProductResult.rows[0];

        // Conditionally update fields based on what is provided in the request body
        const updatedName = name !== undefined ? name : currentProduct.name;
        const updatedPrice = price !== undefined ? price : currentProduct.price;
        const updatedDetail = detail !== undefined ? detail : currentProduct.detail;

        // Update the text and float fields in the database
        const result = await client.query(
            'UPDATE store SET name = $1, price = $2, detail = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
            [updatedName, updatedPrice, updatedDetail, id]
        );

        client.release();
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating product text and float data in PostgreSQL', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to update only the product image
app.put('/api/products/updateProductImage/:id', async (req, res) => {
    const { id } = req.params;
    const { product_image } = req.body;

    try {
        const client = await pool.connect();

        // Retrieve the current product data to retain unchanged fields
        const currentProductResult = await client.query('SELECT * FROM store WHERE id = $1', [id]);

        if (currentProductResult.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const currentProduct = currentProductResult.rows[0];

        // Update the product_image if provided, otherwise retain the existing image
        const updatedProductImage = product_image ? Buffer.from(product_image, 'base64') : currentProduct.product_image;

        // Update only the product image in the database
        const result = await client.query(
            'UPDATE store SET product_image = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [updatedProductImage, id]
        );

        client.release();
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating product image in PostgreSQL', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Endpoint to update only the QR code image
app.put('/api/products/updateQrCodeImage/:id', async (req, res) => {
    const { id } = req.params;
    const { qr_code_image } = req.body;

    try {
        const client = await pool.connect();

        // Retrieve the current product data to retain unchanged fields
        const currentProductResult = await client.query('SELECT * FROM store WHERE id = $1', [id]);

        if (currentProductResult.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const currentProduct = currentProductResult.rows[0];

        // Update the qr_code_image if provided, otherwise retain the existing image
        const updatedQRCodeImage = qr_code_image ? Buffer.from(qr_code_image, 'base64') : currentProduct.qr_code_image;

        // Update only the QR code image in the database
        const result = await client.query(
            'UPDATE store SET qr_code_image = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [updatedQRCodeImage, id]
        );

        client.release();
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating QR code image in PostgreSQL', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Delete product by ID
app.delete('/api/products/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const client = await pool.connect();
        const result = await client.query('DELETE FROM store WHERE id = $1 RETURNING id', [id]);
        client.release();

        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Product not found' });
        } else {
            res.json({ message: 'Product deleted successfully', id: result.rows[0].id });
        }
    } catch (err) {
        console.error('Error deleting product from PostgreSQL', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});






app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});