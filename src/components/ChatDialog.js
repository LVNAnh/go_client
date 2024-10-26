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
import MinimizeIcon from "@mui/icons-material/Minimize";
import { Chat } from "@mui/icons-material";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const ChatDialog = ({ isOpen, onClose, isAdmin, chatId }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [senderName, setSenderName] = useState("");
  const ws = useRef(null);

  const openWebSocket = (chatId, role = isAdmin ? "Admin" : "Guest") => {
    ws.current = new WebSocket(
      `${API_URL.replace(
        "http",
        "ws"
      )}/api/ws/chat?role=${role}&chatId=${chatId}`
    );

    ws.current.onopen = () => {
      console.log("WebSocket connected");
      ws.current.send(JSON.stringify({ type: "join", chatId }));
      fetchChatInfo(chatId);
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

  const fetchChatInfo = async (chatId) => {
    try {
      const response = await axios.get(`${API_URL}/api/chat-info/${chatId}`);
      setSenderName(response.data.guest_name || "Guest");
    } catch (error) {
      console.error("Error fetching chat info:", error);
    }
  };

  const handleStartChat = async () => {
    if (chatId) {
      openWebSocket(chatId);
      setIsChatStarted(true);
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/api/create-chat`, {
        guest_name: guestName,
        guest_phone: guestPhone,
      });
      const newChatId = response.data.id;
      openWebSocket(newChatId);
      setIsChatStarted(true);
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const handleSendMessage = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const msg = {
        content: message,
        senderRole: isAdmin ? "Admin" : guestName,
        timestamp: new Date().toISOString(),
      };
      ws.current.send(JSON.stringify(msg));
      setMessage("");
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Asia/Bangkok",
    };
    return date.toLocaleString("en-GB", options);
  };

  useEffect(() => {
    return () => {
      if (ws.current) {
        ws.current.close(1000, "Component unmounted");
      }
    };
  }, []);

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleRestore = () => {
    setIsMinimized(false);
  };

  return (
    <>
      {isMinimized && (
        <Fab
          color="primary"
          aria-label="chat"
          sx={{ position: "fixed", bottom: 16, right: 86 }}
          onClick={handleRestore}
        >
          <Chat />
        </Fab>
      )}
      <Box
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 350,
          maxHeight: isMinimized ? "auto" : "70vh",
          bgcolor: "white",
          boxShadow: 3,
          borderRadius: 2,
          overflow: "hidden",
          display: isOpen && !isMinimized ? "flex" : "none",
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
          <Typography variant="h6">
            {isAdmin ? "Admin Chat Support" : "Chat with Support"}
          </Typography>
          <Box>
            <IconButton onClick={handleMinimize} sx={{ color: "white" }}>
              <MinimizeIcon />
            </IconButton>
            <IconButton onClick={onClose} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Box>
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
                    msg.senderRole === (isAdmin ? "Admin" : guestName)
                      ? "flex-end"
                      : "flex-start",
                  bgcolor:
                    msg.senderRole === (isAdmin ? "Admin" : guestName)
                      ? "lightblue"
                      : "lightgrey",
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                  {msg.senderRole}{" "}
                  {msg.senderRole !== "Admin" && `(${senderName})`}
                </Typography>
                <Typography variant="body2">{msg.content}</Typography>
                <Typography variant="caption" sx={{ fontStyle: "italic" }}>
                  {formatTimestamp(msg.timestamp)}
                </Typography>
              </Paper>
            ))
          ) : (
            <Box>
              {!isAdmin && (
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
                </>
              )}
              <Button
                onClick={handleStartChat}
                color="primary"
                variant="contained"
                fullWidth
              >
                {isAdmin ? "Join Chat" : "Start Chat"}
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
    </>
  );
};

export default function ChatWidget(props) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <ChatDialog
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        {...props}
      />
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
