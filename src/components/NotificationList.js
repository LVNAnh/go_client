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

const NotificationList = ({ open, onClose, chatList = [] }) => (
  <Dialog open={open} onClose={onClose} fullWidth>
    <DialogTitle>
      Chat Notifications
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
          <ListItem key={chat.id} button>
            <ListItemText
              primary={chat.guest_name || "Anonymous Guest"}
              secondary={
                chat.messages?.length > 0
                  ? chat.messages[chat.messages.length - 1]?.content
                  : "No messages yet"
              }
            />
          </ListItem>
        ))}
      </List>
    </DialogContent>
  </Dialog>
);

export default NotificationList;
