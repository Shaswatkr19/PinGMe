# 🚀 PingMe – Real-Time Chat Backend

PingMe is a **real-time chat backend** built using **Django, Django REST Framework, and Django Channels**.

This project focuses on building a **scalable, secure, and production-ready chat system** similar to WhatsApp / Instagram DM, starting from backend fundamentals.

---

## ✨ Features Implemented

### 🔐 Authentication
- JWT authentication using SimpleJWT
- Custom JWT middleware for WebSocket authentication
- Secure user handling inside WebSocket scope

### 💬 Real-Time Messaging
- WebSocket-based real-time chat
- Thread-based 1-to-1 chat system
- Redis-backed Django Channels
- Messages broadcasted to all users in a thread

### 🧵 Chat System
- Thread model for conversations
- Message model with:
  - sender
  - timestamp
  - read status
  - attachment support (planned)
- Messages stored in database

### 🔄 REST + WebSocket Hybrid
- REST APIs for:
  - User registration & login
  - Thread creation
  - Message history
- WebSockets for:
  - Live message delivery

### 🧪 Testing
- WebSocket tested using `websocat`
- JWT tokens tested manually
- Redis & Channels verified

---

## 🛠 Tech Stack

| Layer | Technology |
|------|-----------|
| Backend | Django |
| APIs | Django REST Framework |
| Real-Time | Django Channels |
| Auth | JWT (SimpleJWT) |
| Channel Layer | Redis |
| Database | SQLite (dev) |
| Server | Daphne |
| Protocol | HTTP + WebSocket |

---

## 🚧 Upcoming Features 

- Typing indicator
- Online / offline user presence
- Read receipts
- Group chat support
- Media sharing (images, files, videos)
- WebSocket reconnect & retry handling
- React / Next.js frontend
- Docker setup & cloud deployment

---

## 🎯 Learning Outcomes

- Django Channels & WebSocket architecture
- Async DB handling using `database_sync_to_async`
- JWT authentication beyond REST APIs
- Redis channel layers & pub/sub
- Designing a real-world chat backend system

---

## ⭐ Project Status

- 🚧 **Under active development**
- ❌ Frontend not implemented yet
- ⚠️ Not production-ready (yet)

---

## 📜 License

This project is licensed under the **MIT License**.  
See the `LICENSE` file for more details.

---

## 👨‍💻 Author

**Shaswat Kumar**  
Backend Developer (Python / Django)

---

> Built with ❤️ while learning real world backend systems.