const express = require('express');
const amqp = require('amqplib/callback_api');
const cors = require('cors');
const WebSocket = require('ws');
const app = express();
const { Pool } = require('pg');

// RabbitMQ connection //
const port = 3002;
const RABBITMQ_URL = 'amqp://admin:123456@localhost:5672'; 

// PostgreSQL database connection details
const pool = new Pool({
    user: 'peeradon',
    host: 'localhost',  
    database: 'temi_store_db',
    password: '1234',
    port: 5432,  // Default PostgreSQL port
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
            const queue = 'temi_control_queue';
            console.log(`Connected to RabbitMQ and created channel for queue: ${queue}`);
            channel.assertQueue(queue, {
                durable: false,
                arguments: {
                    'x-message-ttl': 300000  // TTL set to 300,000 ms (5 minutes)
                }
            });
        });
    });
};

connectToRabbitMQ();


// WebSocket server for WebRTC signaling
const wss = new WebSocket.Server({ port: 8080 });  // WebSocket signaling server

wss.on('connection', (ws) => {
    console.log('A client connected to the WebSocket signaling server');

    ws.on('message', (message) => {
        console.log('Received message:', message);

        // Broadcast the message to all clients except the sender (if needed)
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log('A client disconnected');
    });
});

app.post('/send-command', (req, res) => {
    const command = req.body.command;
    const queue = 'temi_control_queue';

    if (channel) {
        channel.sendToQueue(queue, Buffer.from(command));
        console.log(`Sent command: ${command}`);
        res.status(200).send('Command sent to RabbitMQ');
    } else {
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

app.delete('/api/products/data/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const client = await pool.connect();
        const result = await client.query('DELETE FROM store WHERE id = $1', [id]);
        client.release();
        
        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Row not found' });
        } else {
            res.json({ message: 'Row deleted successfully' });
        }
    } catch (err) {
        console.error('Error deleting data from PostgreSQL', err);
        res.status(500).json({ error: 'Internal server error' });
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






app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});