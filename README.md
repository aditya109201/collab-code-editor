# Collaborative Code Editor

A real-time collaborative code editor that allows multiple users to edit code simultaneously in shared rooms, with live synchronization powered by WebSockets.

---

## 🚀 Features

- Real-time multi-user code editing
- Room-based collaboration system
- Live synchronization using WebSockets (Socket.IO)
- User presence tracking (see who is connected)
- Activity feed (join/leave notifications)
- Persistent room storage (code is saved across sessions)
- Shareable room IDs
- Monaco Editor integration (VS Code-like experience)

---

## 🧠 Tech Stack

### Frontend
- React
- Monaco Editor
- Socket.IO Client

### Backend
- Node.js
- Express
- Socket.IO

### Storage
- JSON-based persistence (file system)

---

## 📂 Project Structure

```bash
collab-code-editor/
├── client/
│   ├── package.json
│   └── src/
│       ├── App.js
│       ├── EditorPage.js
│       └── index.js
├── server/
│   ├── server.js
│   ├── rooms.json
│   └── package.json
└── README.md
