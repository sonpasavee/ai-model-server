<script setup>
const config = useRuntimeConfig()

const models = ref([])
const loading = ref(true)
const error = ref(null)

// ================= FETCH MODELS =================
const fetchModels = async () => {
  try {
    loading.value = true
    error.value = null
    const res = await $fetch(`${config.public.apiBase}/models/latest`)
    models.value = res.models || []
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchModels)

// ================= UPLOAD =================
const file = ref(null)
const modelName = ref('')
const version = ref('')
const uploading = ref(false)
const uploadSuccess = ref(false)
const fileName = ref('')

const handleFileChange = (e) => {
  file.value = e.target.files[0]
  fileName.value = file.value?.name || ''
}

const uploadModel = async () => {
  if (!file.value || !modelName.value || !version.value) return

  try {
    uploading.value = true
    uploadSuccess.value = false

    const formData = new FormData()
    formData.append('file', file.value)
    formData.append('modelName', modelName.value)
    formData.append('version', version.value)

    await fetch(`${config.public.apiBase}/models/upload`, {
      method: 'POST',
      body: formData
    })

    uploadSuccess.value = true
    file.value = null
    modelName.value = ''
    version.value = ''
    fileName.value = ''

    setTimeout(() => { uploadSuccess.value = false }, 3000)
    fetchModels()
  } catch (err) {
    error.value = "Upload failed: " + err.message
  } finally {
    uploading.value = false
  }
}

const formatSize = (bytes) => {
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(2) + ' GB'
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(2) + ' MB'
  return (bytes / 1e3).toFixed(1) + ' KB'
}
</script>

<template>
  <div class="dashboard">

    <!-- BACKGROUND GRID -->
    <div class="grid-bg" aria-hidden="true"></div>

    <!-- HEADER -->
    <header class="header">
      <div class="header-left">
        <div class="logo-dot"></div>
        <div>
          <p class="header-eyebrow">Model Registry</p>
          <h1 class="header-title">AI Model Dashboard</h1>
        </div>
      </div>
      <button class="btn-refresh" @click="fetchModels" :disabled="loading">
        <svg class="refresh-icon" :class="{ spinning: loading }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
          <path d="M3 21v-5h5" />
        </svg>
        Refresh
      </button>
    </header>

    <!-- UPLOAD CARD -->
    <section class="upload-card">
      <div class="upload-card-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <h2>Deploy New Model</h2>
      </div>

      <div class="upload-fields">
        <div class="field-group">
          <label class="field-label">Model Name</label>
          <input v-model="modelName" placeholder="e.g. YOLOv8-face" class="field-input" />
        </div>

        <div class="field-group">
          <label class="field-label">Version</label>
          <input v-model="version" placeholder="e.g. 1.0.1" class="field-input" />
        </div>

        <div class="field-group file-group">
          <label class="field-label">Model File</label>
          <label class="file-input-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span>{{ fileName || 'Choose file...' }}</span>
            <input type="file" @change="handleFileChange" style="display:none" />
          </label>
        </div>

        <button
          class="btn-upload"
          @click="uploadModel"
          :disabled="uploading || !file || !modelName || !version"
          :class="{ success: uploadSuccess }"
        >
          <span v-if="uploading" class="upload-spinner"></span>
          <svg v-else-if="uploadSuccess" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {{ uploadSuccess ? 'Deployed!' : uploading ? 'Uploading...' : 'Deploy' }}
        </button>
      </div>
    </section>

    <!-- STATS BAR -->
    <div class="stats-bar" v-if="!loading">
      <div class="stat">
        <span class="stat-value">{{ models.length }}</span>
        <span class="stat-label">Models</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat">
        <span class="stat-value">{{ models.filter(m => m.required).length }}</span>
        <span class="stat-label">Required</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat">
        <span class="stat-value">{{ models.reduce((a, m) => a + (m.files?.length || 0), 0) }}</span>
        <span class="stat-label">Files</span>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="loading-state">
      <div class="loader-ring">
        <div class="loader-ring-inner"></div>
        <div class="loader-pulse"></div>
      </div>
      <p class="loading-text">Fetching models</p>
      <div class="loading-dots">
        <span></span><span></span><span></span>
      </div>
    </div>

    <!-- ERROR -->
    <div v-if="error && !loading" class="error-banner">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {{ error }}
    </div>

    <!-- MODEL GRID -->
    <div v-if="!loading && models.length" class="model-grid">
      <div
        v-for="(model, i) in models"
        :key="model.name"
        class="model-card"
        :style="{ animationDelay: `${i * 60}ms` }"
      >
        <div class="model-card-top">
          <div class="model-name-row">
            <div class="model-indicator" :class="{ required: model.required }"></div>
            <h3 class="model-name">{{ model.name }}</h3>
          </div>
          <span class="version-badge">v{{ model.version }}</span>
        </div>

        <div class="model-meta">
          <span class="meta-tag" :class="{ 'meta-tag--required': model.required }">
            {{ model.required ? '⬥ Required' : '◇ Optional' }}
          </span>
          <span class="meta-tag">{{ model.files?.length || 0 }} file{{ model.files?.length !== 1 ? 's' : '' }}</span>
        </div>

        <div class="file-list">
          <div v-for="f in model.files" :key="f.filename" class="file-row">
            <div class="file-info">
              <span class="file-name">{{ f.filename }}</span>
              <span class="file-size">{{ formatSize(f.size_bytes) }}</span>
            </div>
            <a :href="f.download_url" target="_blank" class="download-btn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- EMPTY -->
    <div v-if="!loading && models.length === 0 && !error" class="empty-state">
      <div class="empty-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
          <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      </div>
      <p class="empty-title">No models deployed</p>
      <p class="empty-sub">Upload your first model to get started</p>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');

/* ─── ROOT ─────────────────────────────── */
.dashboard {
  min-height: 100vh;
  background: #0a0a0f;
  color: #e8e6e0;
  font-family: 'Syne', sans-serif;
  padding: 2rem;
  position: relative;
  overflow-x: hidden;
}

/* ─── GRID BG ───────────────────────────── */
.grid-bg {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
  z-index: 0;
}

.dashboard > * { position: relative; z-index: 1; }

/* ─── HEADER ────────────────────────────── */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e8c84a;
  box-shadow: 0 0 12px #e8c84a88;
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 8px #e8c84a66; }
  50% { box-shadow: 0 0 20px #e8c84aaa; }
}

.header-eyebrow {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  color: #e8c84a;
  text-transform: uppercase;
  margin: 0 0 2px;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
  color: #f0ede6;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  color: #a8a49e;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-refresh:hover:not(:disabled) {
  background: rgba(255,255,255,0.08);
  color: #e8e6e0;
  border-color: rgba(255,255,255,0.2);
}
.btn-refresh:disabled { opacity: 0.4; cursor: not-allowed; }

.refresh-icon {
  width: 14px; height: 14px;
  transition: transform 0.3s;
}
.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ─── UPLOAD CARD ───────────────────────── */
.upload-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.upload-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  color: #a8a49e;
}

.upload-card-header h2 {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin: 0;
  color: #c8c4bc;
}

.upload-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: flex-end;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #6e6a62;
}

.field-input {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  padding: 0.55rem 0.75rem;
  color: #e8e6e0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.8rem;
  width: 160px;
  outline: none;
  transition: border-color 0.2s;
}
.field-input::placeholder { color: #4a4740; }
.field-input:focus { border-color: rgba(232,200,74,0.4); }

.file-group { flex: 1; min-width: 200px; }

.file-input-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255,255,255,0.05);
  border: 1px dashed rgba(255,255,255,0.15);
  border-radius: 6px;
  padding: 0.55rem 0.75rem;
  cursor: pointer;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;
  color: #6e6a62;
  transition: all 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.file-input-label:hover { border-color: rgba(232,200,74,0.3); color: #a8a49e; }

.btn-upload {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #e8c84a;
  color: #0a0a0f;
  border: none;
  border-radius: 6px;
  padding: 0.6rem 1.25rem;
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 110px;
  justify-content: center;
}
.btn-upload:hover:not(:disabled) {
  background: #f0d660;
  transform: translateY(-1px);
}
.btn-upload:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }
.btn-upload.success { background: #4ade80; }

.upload-spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(0,0,0,0.2);
  border-top-color: #0a0a0f;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* ─── STATS BAR ─────────────────────────── */
.stats-bar {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 0 0.25rem;
}

.stat {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
}
.stat-value {
  font-size: 1.4rem;
  font-weight: 800;
  color: #f0ede6;
  line-height: 1;
}
.stat-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.65rem;
  color: #6e6a62;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.stat-divider {
  width: 1px;
  height: 24px;
  background: rgba(255,255,255,0.08);
}

/* ─── LOADING ───────────────────────────── */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  gap: 1.25rem;
}

.loader-ring {
  position: relative;
  width: 64px;
  height: 64px;
}

.loader-ring-inner {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: #e8c84a;
  border-right-color: rgba(232,200,74,0.3);
  animation: spin 0.9s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.loader-ring::before {
  content: '';
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  border: 1px solid transparent;
  border-top-color: rgba(232,200,74,0.4);
  animation: spin 1.4s cubic-bezier(0.5, 0, 0.5, 1) infinite reverse;
}

.loader-pulse {
  position: absolute;
  inset: 20px;
  border-radius: 50%;
  background: rgba(232,200,74,0.12);
  animation: pulse-scale 1.4s ease-in-out infinite;
}

@keyframes pulse-scale {
  0%, 100% { transform: scale(0.8); opacity: 0.4; }
  50% { transform: scale(1.2); opacity: 1; }
}

.loading-text {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;
  color: #6e6a62;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin: 0;
}

.loading-dots {
  display: flex;
  gap: 5px;
}
.loading-dots span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #e8c84a;
  animation: dot-bounce 1.2s ease-in-out infinite;
}
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes dot-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.3; }
  40% { transform: translateY(-6px); opacity: 1; }
}

/* ─── ERROR ─────────────────────────────── */
.error-banner {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.2);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.8rem;
  color: #f87171;
}

/* ─── MODEL GRID ────────────────────────── */
.model-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.model-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.2s;
  animation: card-in 0.4s ease both;
}

@keyframes card-in {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.model-card:hover {
  border-color: rgba(232,200,74,0.2);
  background: rgba(255,255,255,0.05);
  transform: translateY(-2px);
}

.model-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.model-name-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.model-indicator {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #4a4740;
  flex-shrink: 0;
  margin-top: 1px;
}
.model-indicator.required {
  background: #e8c84a;
  box-shadow: 0 0 8px #e8c84a66;
}

.model-name {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: #f0ede6;
  letter-spacing: -0.01em;
}

.version-badge {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.65rem;
  color: #6e6a62;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 4px;
  padding: 0.2rem 0.45rem;
  white-space: nowrap;
}

.model-meta {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.meta-tag {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.65rem;
  color: #6e6a62;
  letter-spacing: 0.05em;
}
.meta-tag--required { color: #a08820; }

.file-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 6px;
  padding: 0.55rem 0.75rem;
  gap: 0.75rem;
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.file-name {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.72rem;
  color: #c8c4bc;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.6rem;
  color: #4a4740;
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.65rem;
  color: #e8c84a;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  transition: opacity 0.2s;
}
.download-btn:hover { opacity: 0.7; }

/* ─── EMPTY ─────────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 5rem 2rem;
  color: #4a4740;
}
.empty-icon { opacity: 0.3; }
.empty-title {
  font-size: 1rem;
  font-weight: 700;
  color: #4a4740;
  margin: 0;
}
.empty-sub {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.72rem;
  color: #3a3730;
  margin: 0;
}

/* ─── RESPONSIVE ────────────────────────── */
@media (max-width: 640px) {
  .dashboard { padding: 1rem; }
  .upload-fields { flex-direction: column; }
  .field-input { width: 100%; }
  .btn-upload { width: 100%; }
  .model-grid { grid-template-columns: 1fr; }
}
</style>