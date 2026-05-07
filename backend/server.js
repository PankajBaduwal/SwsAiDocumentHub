const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.set('io', io);

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/docmanager')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
});

// Routes (add later)
app.use('/api/documents', require('./routes/documents'));
app.use('/api/notifications', require('./routes/notifications'));

server.listen(5000, () => console.log('Server running on port 5000'));