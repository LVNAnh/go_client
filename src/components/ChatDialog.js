// components/ChatDialog.js
import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Button,
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
}) => {
  const [message, setMessage] = useState("");

  const handleStartChat = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/create-chat`, {
        guestName,
        guestPhone,
      });
      console.log("Chat started:", response.data);
      onStartChat();
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
      console.log("Message sent:", response.data);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Start Chat</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please enter your name and phone number to start the chat.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Name"
          type="text"
          fullWidth
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Phone"
          type="text"
          fullWidth
          value={guestPhone}
          onChange={(e) => setGuestPhone(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Message"
          type="text"
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleStartChat} color="primary">
          Start Chat
        </Button>
        <Button onClick={handleReplyChat} color="primary">
          Reply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChatDialog;
