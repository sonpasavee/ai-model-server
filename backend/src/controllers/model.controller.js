const modelService = require('../services/model.service')

// upload model
const uploadModel = async (req, res) => {
    try {
        const { modelName, version } = req.body

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' })
        }

        if (!modelName || !version) {
            return res.status(400).json({ message: 'modelName and version required' })
        }

        const result = await modelService.uploadModel(req.file, {
            modelName,
            version
        })

        res.json(result)

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Upload failed' })
    }
}


// GET latest manifest (สำคัญสุดสำหรับ RBPI)
const getLatestManifest = async (req, res) => {
    try {
        const manifest = await modelService.getManifest()
        res.json(manifest)
    } catch (err) {
        res.status(500).json({ message: 'Failed to get manifest' })
    }
}

module.exports = {
    uploadModel,
    getLatestManifest
}