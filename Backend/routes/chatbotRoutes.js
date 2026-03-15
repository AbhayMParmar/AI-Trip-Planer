const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // Initialize multer
const chatbotController = require('../controllers/chatbotController');

// Use upload.single('file') or upload.none() to parse FormData
// Even if no file is uploaded, multer handles the text fields in req.body
router.post('/chat', upload.single('file'), chatbotController.chat);

module.exports = router;
