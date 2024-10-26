import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const NotificationList = ({ open, onClose, chatList = [], onSelectChat }) => (
  <Dialog open={open} onClose={onClose} fullWidth>
    <DialogTitle>
      Chat Requests
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
        }}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent>
      <List>
        {chatList.map((chat) => (
          <ListItem key={chat.id} button onClick={() => onSelectChat(chat.id)}>
            <ListItemText
              primary={chat.guest_name || "Anonymous Guest"}
              secondary="Wants to start a chat"
            />
          </ListItem>
        ))}
      </List>
    </DialogContent>
  </Dialog>
);

export default NotificationList;
