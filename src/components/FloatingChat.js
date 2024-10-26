// FloatingChat.js
import React, { useState } from "react";
import { Box, Drawer, Typography, IconButton } from "@mui/material";
import MinimizeIcon from "@mui/icons-material/Minimize";
import CloseIcon from "@mui/icons-material/Close";
import ChatSidebar from "./ChatSidebar";
import ChatContent from "./ChatContent";

const FloatingChat = ({ chatList, onSelectChat, selectedChatId, isAdmin }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <Drawer
      anchor="right"
      open={isExpanded}
      onClose={toggleExpand}
      PaperProps={{
        sx: {
          width: isExpanded ? "30%" : "5%",
          height: "70vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      <Box
        sx={{
          p: 1,
          bgcolor: "primary.main",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Hỗ trợ Trò chuyện</Typography>
        <Box>
          <IconButton onClick={toggleExpand} color="inherit">
            {isExpanded ? <MinimizeIcon /> : <CloseIcon />}
          </IconButton>
        </Box>
      </Box>
      {isExpanded && (
        <Box sx={{ display: "flex", height: "100%" }}>
          <ChatSidebar
            chatList={chatList}
            onSelectChat={onSelectChat}
            selectedChatId={selectedChatId}
          />
          <ChatContent chatId={selectedChatId} isAdmin={isAdmin} />
        </Box>
      )}
    </Drawer>
  );
};

export default FloatingChat;
