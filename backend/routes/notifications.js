const express = require('express');
const router = express.Router();
const Notification = require('../models/Notifications');

// GET all notifications
router.get('/', async (req, res) => {
    try {
        const notifs = await Notification.find().sort({ createdAt: -1 });
        res.json(notifs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH mark one as read
router.patch('/:id/read', async (req, res) => {
    try {
        const notif = await Notification.findByIdAndUpdate(
            req.params.id, { isRead: true }, { new: true }
        );
        res.json(notif);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH mark all as read
router.patch('/mark-all-read', async (req, res) => {
    try {
        await Notification.updateMany({ isRead: false }, { isRead: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;