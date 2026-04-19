import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";

const socket = io("http://localhost:5001");

function EditorPage() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [code, setCode] = useState("// Start coding here");
  const [language, setLanguage] = useState("javascript");
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("load_state", (state) => {
      setCode(state.code);
      setLanguage(state.language);
    });

    socket.on("receive_code", (newCode) => {
      setCode(newCode);
    });

    socket.on("receive_language", (newLanguage) => {
      setLanguage(newLanguage);
    });

    socket.on("user_list", (usernames) => {
      setUsers(usernames);
    });

    socket.on("system_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("load_state");
      socket.off("receive_code");
      socket.off("receive_language");
      socket.off("user_list");
      socket.off("system_message");
    };
  }, []);

  const joinRoom = () => {
    if (!roomId.trim() || !username.trim()) return;

    socket.emit("join_room", {
      roomId,
      username
    });

    setJoined(true);
  };

  const handleEditorChange = (value) => {
    const updatedCode = value || "";
    setCode(updatedCode);

    if (joined) {
      socket.emit("code_change", {
        roomId,
        code: updatedCode
      });
    }
  };

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setLanguage(newLanguage);

    if (joined) {
      socket.emit("language_change", {
        roomId,
        language: newLanguage
      });
    }
  };

  const copyRoomId = async () => {
    if (!roomId) return;
    try {
      await navigator.clipboard.writeText(roomId);
      alert("Room ID copied to clipboard");
    } catch (error) {
      console.error("Failed to copy room ID:", error);
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "20px auto", fontFamily: "Arial" }}>
      <h1>Collaborative Code Editor</h1>

      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: "10px", width: "220px" }}
        />

        <input
          type="text"
          placeholder="Enter room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          style={{ padding: "10px", width: "220px" }}
        />

        <button onClick={joinRoom} style={{ padding: "10px 16px" }}>
          Join Room
        </button>

        <button onClick={copyRoomId} style={{ padding: "10px 16px" }}>
          Copy Room ID
        </button>

        <select
          value={language}
          onChange={handleLanguageChange}
          style={{ padding: "10px" }}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="c">C</option>
        </select>
      </div>

      <p>
        Status: {joined ? `Connected to room "${roomId}" as ${username}` : "Not connected"}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "20px" }}>
        <div>
          <Editor
            height="75vh"
            language={language}
            value={code}
            theme="vs-dark"
            onChange={handleEditorChange}
          />
        </div>

        <div>
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "16px"
            }}
          >
            <h3>Connected Users</h3>
            {users.length === 0 ? (
              <p>No users connected</p>
            ) : (
              <ul style={{ paddingLeft: "18px" }}>
                {users.map((user, index) => (
                  <li key={`${user}-${index}`}>{user}</li>
                ))}
              </ul>
            )}
          </div>

          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "12px",
              maxHeight: "300px",
              overflowY: "auto"
            }}
          >
            <h3>Room Activity</h3>
            {messages.length === 0 ? (
              <p>No activity yet</p>
            ) : (
              <ul style={{ paddingLeft: "18px" }}>
                {messages.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditorPage;