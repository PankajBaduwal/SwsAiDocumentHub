const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Documents');
const Notification = require('../models/Notifications');

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files allowed'), false);
    },
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// GET all documents
router.get('/', async (req, res) => {
    try {
        const docs = await Document.find().sort({ uploadedAt: -1 });
        res.json(docs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST upload (supports multiple)
router.post('/upload', upload.array('files', 50), async (req, res) => {
    try {
        const io = req.app.get('io');
        const files = req.files;
        const isBulk = files.length > 3;

        // Save all docs to DB
        const saved = await Promise.all(files.map(file =>
            Document.create({
                name: file.filename,
                originalName: file.originalname,
                size: file.size,
                mimetype: file.mimetype,
                path: file.path,
                status: 'complete'
            })
        ));

        // If bulk upload (>3 files), create notification
        if (isBulk) {
            const notification = await Notification.create({
                message: `${files.length} files uploaded successfully`,
                type: 'success'
            });
            // Emit real-time notification
            io.emit('notification', notification);
        }

        res.json({ success: true, documents: saved, isBulk });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a document
router.delete('/:id', async (req, res) => {
    try {
        const doc = await Document.findByIdAndDelete(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Not found' });
        // Delete file from disk
        if (fs.existsSync(doc.path)) fs.unlinkSync(doc.path);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;