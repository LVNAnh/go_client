// ChatContent.js
import React, { useEffect, useRef, useState } from "react";
import { Box, Paper, Typography, TextField, Button } from "@mui/material";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const ChatContent = ({ chatId, isAdmin }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const ws = useRef(null);

  useEffect(() => {
    if (chatId) {
      fetchMessages();
      openWebSocket(chatId);
    }
  }, [chatId]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/chat/${chatId}/messages`
      );
      setMessages(response.data);
    } catch (error) {
      console.error("Lỗi khi tải tin nhắn:", error);
    }
  };

  const openWebSocket = (chatId) => {
    ws.current = new WebSocket(
      `${API_URL.replace("http", "ws")}/api/ws/chat?chatId=${chatId}`
    );

    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages((prev) => [...prev, msg]);
    };
  };

  const handleSendMessage = () => {
    const msg = { content: message, senderRole: isAdmin ? "Admin" : "Guest" };
    ws.current.send(JSON.stringify(msg));
    setMessages((prev) => [...prev, msg]);
    setMessage("");
  };

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2 }}>
      <Box sx={{ flex: 1, overflowY: "auto", mb: 2 }}>
        {messages.map((msg, index) => (
          <Paper
            key={index}
            sx={{
              p: 1,
              mb: 1,
              alignSelf: msg.senderRole === "Admin" ? "flex-start" : "flex-end",
              bgcolor: msg.senderRole === "Admin" ? "lightgrey" : "lightblue",
            }}
          >
            <Typography variant="body2">{msg.content}</Typography>
          </Paper>
        ))}
      </Box>
      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          placeholder="Nhập tin nhắn..."
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <Button onClick={handleSendMessage} variant="contained">
          Gửi
        </Button>
      </Box>
    </Box>
  );
};

export default ChatContent;
