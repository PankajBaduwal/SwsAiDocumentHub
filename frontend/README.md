# Document Management Dashboard — MERN Stack

A full-stack web application for uploading, managing, and tracking company PDF documents with real-time notifications.

## Tech Stack
- **Frontend**: React (Vite), React Router, Axios, Socket.io-client
- **Backend**: Node.js, Express, Multer, Socket.io
- **Database**: MongoDB + Mongoose

## Database Schema
- **Document**: name, originalName, size, mimetype, path, status, uploadedAt
- **Notification**: message, type (success/error/info), isRead, createdAt

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017

### Backend
```bash
cd backend
npm install
npm run dev    # runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev    # runs on http://localhost:5173
```

## Features
- ✅ Single & bulk PDF upload with per-file progress bars
- ✅ Drag-and-drop upload zone
- ✅ Bulk upload banner for >3 files
- ✅ Real-time WebSocket notifications (Socket.io)
- ✅ Notification center with unread badge and bell dropdown
- ✅ Persistent notifications fetched from MongoDB
- ✅ Mark individual/all notifications as read
- ✅ Documents table with download & delete
- ✅ White & blue Livvic font theme