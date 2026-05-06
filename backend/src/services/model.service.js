const fs = require('fs-extra')
const path = require('path')
const crypto = require('crypto')

const MANIFEST_PATH = path.join(__dirname, '../data/manifest.json')

const getManifest = async () => {
    return await fs.readJson(MANIFEST_PATH)
}

const generateSHA256 = async (filePath) => {
    const buffer = await fs.readFile(filePath)
    return crypto.createHash('sha256').update(buffer).digest('hex')
}

const uploadModel = async (file, { modelName, version }) => {
    const modelDir = path.join('models', modelName, version)

    await fs.ensureDir(modelDir)

    const modelPath = path.join(modelDir, file.originalname)

    await fs.move(file.path, modelPath, { overwrite: true })

    const sha256 = await generateSHA256(modelPath)
    const size = (await fs.stat(modelPath)).size

    const manifest = await getManifest()

    const newModel = {
        name: modelName,
        version,
        required: true,
        files: [
            {
                filename: file.originalname,
                platform: "generic",
                sha256,
                size_bytes: size,
                download_url: `http://localhost:5000/models/${modelName}/${version}/${file.originalname}`
            }
        ]
    }

    // replace model
    manifest.models = manifest.models.filter(m => m.name !== modelName)
    manifest.models.push(newModel)

    manifest.updated_at = new Date().toISOString()

    await fs.writeJson(MANIFEST_PATH, manifest, { spaces: 2 })

    return {
        message: "Upload success",
        model: newModel
    }
}

module.exports = {
    getManifest,
    uploadModel
}