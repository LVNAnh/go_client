// ChatSidebar.js
import React from "react";
import { List, ListItem, ListItemText } from "@mui/material";

const ChatSidebar = ({ chatList, onSelectChat, selectedChatId }) => {
  return (
    <List sx={{ width: "100%", maxWidth: 240, bgcolor: "background.paper" }}>
      {chatList.map((chat) => (
        <ListItem
          key={chat.id}
          button
          selected={selectedChatId === chat.id}
          onClick={() => onSelectChat(chat.id)}
        >
          <ListItemText
            primary={chat.guest_name || "Khách Vãng Lai"}
            secondary="Bấm để xem hội thoại"
          />
        </ListItem>
      ))}
    </List>
  );
};

export default ChatSidebar;
