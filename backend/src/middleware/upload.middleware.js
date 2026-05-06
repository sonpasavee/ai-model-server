const multer = require('multer')

const upload = multer({
  dest: 'uploads/' // temp file ก่อนย้ายไป models
})

module.exports = upload