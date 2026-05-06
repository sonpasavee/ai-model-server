const express = require('express')
const cors = require('cors')
require('dotenv').config()

const routes = require('./src/routes')

const app = express()

app.use(cors({
  origin: "http://localhost:3001",
  credentials: true
}))

app.use(express.json())

// 👇 สำคัญ: serve model files
app.use('/models', express.static('models'))

app.use('/api', routes)

app.get('/', (req, res) => {
  res.send('API running')
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => 
  console.log(`Server running on port ${PORT}`)
)