# 📦 AI Model Server

A lightweight backend server for managing, hosting, and distributing AI models for edge devices (e.g. Raspberry Pi).  
Designed for OTA (Over-The-Air) model updates and inference pipeline support.

---

## 🚀 Overview

This project acts as a central **model repository server** that:

- Stores AI models (ONNX / TensorFlow / PyTorch / etc.)
- Serves models via HTTP API
- Provides version control for models
- Allows edge devices (Raspberry Pi) to automatically check and download updates

---

## 🧠 Architecture

```
Frontend / Admin Panel (Nuxt)
        │
        ▼
Backend API (Node.js / Express)
        │
        ├── /models (static storage)
        ├── /api/models/latest
        ├── /api/models/version
        ▼
Raspberry Pi (Edge Device)
        │
        ├── check update
        ├── download model
        └── run inference locally
```

---

## ⚙️ Tech Stack

- Node.js
- Express.js
- REST API
- Static file serving
- (Optional) Nuxt frontend for admin dashboard

---

## 📁 Project Structure

```
backend/
 ├── src/
 │   ├── controllers/
 │   │    └── model.controller.js
 │   ├── routes/
 │   │    └── model.routes.js
 │   ├── services/
 │   └── app.js
 ├── models/
 │    ├── model_v1.onnx
 │    ├── model_v2.onnx
 ├── server.js
```

---

## 📦 Installation

```bash
git clone https://github.com/sonpasavee/ai-model-server.git
cd ai-model-server/backend
npm install
```

---

## ▶️ Run Server

```bash
node server.js
```

or with dev mode:

```bash
npm run dev
```

Server runs on:

```
http://localhost:8000
```

---

## 📡 API Endpoints

### 1. Get latest model
```http
GET /api/models/latest
```

Response:
```json
{
  "version": "1.0.0",
  "url": "http://localhost:8000/models/model_v1.onnx"
}
```

---

### 2. List models
```http
GET /api/models
```

---

### 3. Download model (static)
```http
GET /models/:filename
```

Example:
```
/models/model_v1.onnx
```

---

## 📥 Model Upload (Optional)

You can extend API:

```http
POST /api/models/upload
```

Used for:
- Upload new model version
- Auto update pipeline

---

## 🤖 Raspberry Pi Flow (Edge Device)

1. Request latest model version
2. Compare with local version
3. If newer → download model
4. Replace local model
5. Run inference

---

## 🔁 OTA Model Update Concept

This system supports:

- Version checking
- Model rollback (optional)
- Hot swap models
- Edge autonomous update

---

## 🔐 Notes

- `/models` is publicly accessible (static hosting)
- For production, add authentication layer
- Consider checksum validation (SHA256) for model integrity

---

## 🧪 Example Use Case

- Bus detection system
- Edge AI camera
- Real-time inference on Raspberry Pi
- Offline AI processing with periodic updates

---

## 🧱 Future Improvements

- Model registry database (MongoDB / PostgreSQL)
- Admin dashboard (Nuxt 4)
- Authentication (JWT)
- Model checksum verification
- Auto rollback system

---

## 📌 License

MIT

---

## 💡 Summary

This project is a **lightweight model distribution server** designed for:

> "Train centrally → deploy to edge → update automatically"

