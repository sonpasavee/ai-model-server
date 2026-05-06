const express = require('express')
const router = express.Router()

const modelRoutes = require('./model.routes')

router.use('/models', modelRoutes)

module.exports = router