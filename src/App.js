import React, { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Route,
  Routes,
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import AddProductCategory from "./components/AddProductCategory";
import AddProduct from "./components/AddProduct";
import AddServiceCategory from "./components/AddServiceCategory";
import AddService from "./components/AddService";
import Shop from "./components/Shop";
import Cart from "./components/Cart";
import ServiceBooking from "./components/ServiceBooking";
import OrderPage from "./components/OrderPage";
import OrderBookingServiceManagement from "./components/OrderBookingServiceManagement";
import OrderManagement from "./components/OrderManagement";
import ChatWidget from "./components/ChatDialog";
import NotificationList from "./components/NotificationList";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Fab,
} from "@mui/material";
import {
  Search,
  ShoppingCart,
  Person,
  Chat,
  Notifications,
} from "@mui/icons-material";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

function AdminMenu() {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleAdminMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAdminMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button color="inherit" onClick={handleAdminMenuClick}>
        Admin
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleAdminMenuClose}
      >
        <MenuItem component={Link} to="/add-product-category">
          Quản lý danh mục sản phẩm
        </MenuItem>
        <MenuItem component={Link} to="/add-product">
          Quản lý sản phẩm
        </MenuItem>
        <MenuItem component={Link} to="/add-service-category">
          Quản lý danh mục dịch vụ
        </MenuItem>
        <MenuItem component={Link} to="/add-service">
          Quản lý dịch vụ
        </MenuItem>
        <MenuItem component={Link} to="/order-booking-service-history">
          Quản lý lịch sử đơn hàng dịch vụ
        </MenuItem>
        <MenuItem component={Link} to="/order-management">
          Quản lý đơn hàng
        </MenuItem>
      </Menu>
    </div>
  );
}

function AppContent() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [openChatDialog, setOpenChatDialog] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [, setCartItems] = useState([]);
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [chatList, setChatList] = useState([]);
  const [openNotificationList, setOpenNotificationList] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAdmin(parsedUser.role === 0);
    }
    updateCartCount();
    updateNotificationCount();
  }, []);

  const updateCartCount = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await axios.get(`${API_URL}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const cartItems = response.data.items || [];
        setCartItems(cartItems);
        const distinctProductsCount = cartItems.length;
        setCartCount(distinctProductsCount);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    }
  };

  const fetchChatList = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setChatList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching chat list:", error);
      setChatList([]);
    }
  };

  const handleNotificationClick = () => {
    fetchChatList();
    setOpenNotificationList(true);
  };

  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
    setOpenChatDialog(true);
  };

  const updateNotificationCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setNotificationCount(response.data?.length || 0);
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setCartCount(0);
    setCartItems([]);
    window.location.reload();
  };

  const handleChatIconClick = () => {
    setOpenChatDialog(true);
  };

  const handleChatDialogClose = () => {
    setOpenChatDialog(false);
  };

  const handleStartChat = () => {
    console.log("Starting chat with:", guestName, guestPhone);
    setOpenChatDialog(false);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                textDecoration: "none",
                color: "inherit",
                marginRight: 2,
              }}
            >
              Trang chủ
            </Typography>
            <Button color="inherit" component={Link} to="/about">
              About us
            </Button>

            <Button color="inherit" component={Link} to="/contact">
              Liên hệ
            </Button>

            <Button color="inherit" component={Link} to="/shop">
              Shop
            </Button>

            {user && user.role === 0 && <AdminMenu />}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton color="inherit" sx={{ ml: 3 }}>
              <Search />
            </IconButton>
            <IconButton color="inherit" component={Link} to="/cart">
              <Badge badgeContent={cartCount} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>

            <IconButton color="inherit" onClick={handleNotificationClick}>
              <Badge badgeContent={notificationCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>

            {user ? (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/profile"
                  sx={{
                    textDecoration: "none",
                    color: "inherit",
                    marginRight: 2,
                  }}
                >
                  {user.firstname} {user.lastname}
                </Button>
                <Button color="inherit" onClick={handleLogout}>
                  Đăng xuất
                </Button>
              </>
            ) : (
              <IconButton color="inherit" component={Link} to="/login">
                <Person />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Box sx={{ padding: 2 }}>
        {location.pathname === "/" && <ServiceBooking />}
        <Routes>
          <Route path="/register" element={<RegisterForm />} />
          <Route
            path="/login"
            element={
              <LoginForm setUser={setUser} updateCartCount={updateCartCount} />
            }
          />
          <Route
            path="/shop"
            element={<Shop updateCartCount={updateCartCount} />}
          />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/service-booking" element={<ServiceBooking />} />

          {user && user.role === 0 && (
            <>
              <Route
                path="/add-product-category"
                element={<AddProductCategory />}
              />
              <Route path="/add-product" element={<AddProduct />} />
              <Route
                path="/add-service-category"
                element={<AddServiceCategory />}
              />
              <Route path="/add-service" element={<AddService />} />
              <Route
                path="/order-booking-service-history"
                element={<OrderBookingServiceManagement />}
              />
              <Route path="/order-management" element={<OrderManagement />} />
            </>
          )}

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Box>

      <Fab
        color="primary"
        aria-label="chat"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={handleChatIconClick}
      >
        <Chat />
      </Fab>

      <ChatWidget
        open={openChatDialog}
        onClose={handleChatDialogClose}
        guestName={guestName}
        setGuestName={setGuestName}
        guestPhone={guestPhone}
        setGuestPhone={setGuestPhone}
        onStartChat={handleStartChat}
        isAdmin={isAdmin}
        chatId={selectedChatId}
      />

      <NotificationList
        open={openNotificationList}
        onClose={() => setOpenNotificationList(false)}
        chatList={chatList}
        onSelectChat={handleSelectChat}
      />
    </Box>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
