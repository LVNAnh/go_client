import React, { useState, useEffect } from "react";
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

  const handleStartChat = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/create-chat`, {
        guestName,
        guestPhone,
      });
      console.log("Chat started:", response.data);
      onStartChat(response.data);
      fetchMessages(response.data.id);
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const handleReplyChat = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/reply-chat`,
        { content: message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages([...messages, response.data]);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
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
    }
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
            onClick={handleReplyChat}
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
