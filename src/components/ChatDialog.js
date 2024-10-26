import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  Fab,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Chat } from "@mui/icons-material";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const ChatDialog = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [isChatStarted, setIsChatStarted] = useState(false);
  const ws = useRef(null);

  const openWebSocket = (chatId, role = "Guest") => {
    ws.current = new WebSocket(
      `${API_URL.replace(
        "http",
        "ws"
      )}/api/ws/chat?role=${role}&chatId=${chatId}`
    );

    ws.current.onopen = () => {
      console.log("WebSocket connected");
      ws.current.send(JSON.stringify({ type: "join", chatId }));
    };

    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages((prev) => [...prev, msg]);
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.current.onclose = (event) => {
      console.log("WebSocket disconnected:", event);
    };
  };

  const handleStartChat = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/create-chat`, {
        guest_name: guestName,
        guest_phone: guestPhone,
      });
      const chatId = response.data.id;
      openWebSocket(chatId);
      setIsChatStarted(true);
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const handleSendMessage = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const msg = {
        content: message,
        senderRole: "Guest",
        timestamp: new Date(),
      };
      ws.current.send(JSON.stringify(msg));
      setMessages((prev) => [...prev, msg]);
      setMessage("");
    }
  };

  useEffect(() => {
    return () => {
      if (ws.current) {
        ws.current.close(1000, "Component unmounted");
      }
    };
  }, []);

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 20,
        right: 20,
        width: 350,
        maxHeight: "70vh",
        bgcolor: "white",
        boxShadow: 3,
        borderRadius: 2,
        overflow: "hidden",
        display: isOpen ? "flex" : "none",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          bgcolor: "primary.main",
          p: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "white",
        }}
      >
        <Typography variant="h6">Chat with Support</Typography>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ p: 2, flex: 1, overflowY: "auto" }}>
        {isChatStarted ? (
          messages.map((msg, index) => (
            <Paper
              key={index}
              sx={{
                p: 1,
                my: 1,
                alignSelf:
                  msg.senderRole === "Guest" ? "flex-end" : "flex-start",
                bgcolor: msg.senderRole === "Guest" ? "lightblue" : "lightgrey",
              }}
            >
              <Typography variant="body2">{msg.content}</Typography>
            </Paper>
          ))
        ) : (
          <Box>
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
              fullWidth
            >
              Start Chat
            </Button>
          </Box>
        )}
      </Box>

      {isChatStarted && (
        <Box sx={{ p: 1, display: "flex" }}>
          <TextField
            placeholder="Type a message..."
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button
            onClick={handleSendMessage}
            color="primary"
            variant="contained"
          >
            Send
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default function ChatWidget() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <ChatDialog isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <Fab
        color="primary"
        aria-label="chat"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={() => setIsChatOpen(true)}
      >
        <Chat />
      </Fab>
    </>
  );
}
