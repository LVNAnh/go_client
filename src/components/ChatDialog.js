import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
} from "@mui/material";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const ChatDialog = ({
  open,
  onClose,
  guestName,
  setGuestName,
  guestPhone,
  setGuestPhone,
  onStartChat,
  isAdmin,
}) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const ws = useRef(null);

  const handleStartChat = async () => {
    const payload = { guestName, guestPhone };
    console.log("Payload being sent to server:", JSON.stringify(payload));

    try {
      const response = await axios.post(`${API_URL}/api/create-chat`, payload);
      console.log("Chat started:", response.data);
      onStartChat(response.data);
      fetchMessages(response.data.id);
      openWebSocket(response.data.id);
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const openWebSocket = (chatId) => {
    ws.current = new WebSocket(`${API_URL.replace("http", "ws")}/ws/chat`);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
      ws.current.send(JSON.stringify({ type: "join", chatId }));
    };

    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, msg]);
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  };

  const handleSendMessage = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const msg = {
        chatId: messages[0]?.chatId,
        content: message,
        senderRole: isAdmin ? "Admin" : "Guest",
      };
      ws.current.send(JSON.stringify(msg));
      setMessage("");
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/chat/${chatId}/messages`
      );
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    if (open) {
      setMessages([]);
      if (isAdmin) {
        openWebSocket();
      }
    }

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <Box p={2}>
        <Typography variant="h6">Chat</Typography>
        <Box sx={{ maxHeight: 400, overflowY: "auto", my: 2 }}>
          {messages.map((msg) => (
            <Paper
              key={msg.id}
              sx={{
                p: 1,
                mb: 1,
                bgcolor: msg.senderRole === "Admin" ? "lightblue" : "lightgrey",
              }}
            >
              <Typography variant="body2">
                <strong>{msg.senderRole}:</strong> {msg.content}
              </Typography>
            </Paper>
          ))}
        </Box>
        {isAdmin ? (
          <TextField
            label="Reply"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ my: 1 }}
          />
        ) : (
          <>
            <TextField
              label="Your Name"
              fullWidth
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              sx={{ my: 1 }}
            />
            <TextField
              label="Your Phone"
              fullWidth
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              sx={{ my: 1 }}
            />
            <Button
              onClick={handleStartChat}
              color="primary"
              variant="contained"
            >
              Start Chat
            </Button>
          </>
        )}
        {isAdmin && (
          <Button
            onClick={handleSendMessage}
            color="primary"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Send
          </Button>
        )}
      </Box>
    </Dialog>
  );
};

export default ChatDialog;
