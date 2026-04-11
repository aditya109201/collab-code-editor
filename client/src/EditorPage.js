import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";

const socket = io("http://localhost:5001");

function EditorPage() {
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [code, setCode] = useState("// Start coding here");
  const [language, setLanguage] = useState("javascript");

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

    return () => {
      socket.off("load_state");
      socket.off("receive_code");
      socket.off("receive_language");
    };
  }, []);

  const joinRoom = () => {
    if (!roomId.trim()) return;
    socket.emit("join_room", roomId);
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

  return (
    <div style={{ maxWidth: "1100px", margin: "20px auto", fontFamily: "Arial" }}>
      <h1>Collaborative Code Editor</h1>

      <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Enter room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          style={{ padding: "10px", width: "260px" }}
        />

        <button onClick={joinRoom} style={{ padding: "10px 16px" }}>
          Join Room
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
        Status: {joined ? `Connected to room "${roomId}"` : "Not connected"}
      </p>

      <Editor
        height="75vh"
        language={language}
        value={code}
        theme="vs-dark"
        onChange={handleEditorChange}
      />
    </div>
  );
}

export default EditorPage;
