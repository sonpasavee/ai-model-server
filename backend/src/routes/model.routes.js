const express = require('express')
const router = express.Router()

const modelController = require('../controllers/model.controller')
const upload = require('../middleware/upload.middleware')

// GET manifest
router.get('/latest', modelController.getLatestManifest)

// upload model (admin)
router.post('/upload', upload.single('file'), modelController.uploadModel)

module.exports = router