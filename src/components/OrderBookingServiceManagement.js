import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
} from "@mui/material";

const API_URL = process.env.REACT_APP_API_URL;

function OrderBookingServiceManagement() {
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    fetchServices();
    fetchOrderBookings();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/services`);
      setServices(response.data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchOrderBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/orderbookingservices/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrders(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order bookings:", error);
      setLoading(false);
    }
  };

  const getServiceName = (serviceId) => {
    const service = services.find((s) => s.id === serviceId);
    return service ? service.name : "Không xác định";
  };

  const handleStatusChange = (id, order, status) => {
    if (order.status === "completed" || order.status === "cancelled") {
      setSnackbarMessage(
        "Không thể cập nhật đơn hàng ĐÃ HOÀN THÀNH hoặc ĐÃ BỊ HỦY"
      );
      setSnackbarOpen(true);
    } else {
      setSelectedOrder(order);
      setNewStatus(status);
      setDialogOpen(true);
    }
  };

  const confirmStatusUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_URL}/api/orderbookingservice/${selectedOrder.id}/status`, // sửa lại thành selectedOrder.id nếu vẫn cần selectedOrder hoặc truyền thẳng id nếu chỉ dùng id
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSnackbarMessage("Cập nhật trạng thái đơn hàng thành công");
      setSnackbarOpen(true);
      fetchOrderBookings();
    } catch (error) {
      console.error("Error updating status:", error);
      setSnackbarMessage("Cập nhật trạng thái đơn hàng thất bại");
      setSnackbarOpen(true);
    } finally {
      setDialogOpen(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Quản lý đơn hàng booking dịch vụ
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>Tên dịch vụ</TableCell>
              <TableCell>Tên</TableCell>
              <TableCell>SDT</TableCell>
              <TableCell>Số lượng</TableCell>
              <TableCell>Tổng giá</TableCell>
              <TableCell>Ngày đặt</TableCell>
              <TableCell>Địa chỉ</TableCell>
              <TableCell>Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order, index) => (
              <TableRow key={order.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{getServiceName(order.service_id)}</TableCell>
                <TableCell>{order.contact_name}</TableCell>
                <TableCell>{order.contact_phone}</TableCell>
                <TableCell>{order.quantity}</TableCell>
                <TableCell>{order.total_price}</TableCell>
                <TableCell>
                  {new Date(order.booking_date).toLocaleDateString()}
                </TableCell>
                <TableCell>{order.address}</TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order, e.target.value)}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="in-progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {newStatus === "completed"
            ? "Xác nhận HOÀN THÀNH đơn hàng này"
            : newStatus === "cancelled"
            ? "Xác nhận HỦY đơn hàng này"
            : "Bạn có muốn cập nhật đơn hàng này không?"}
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmStatusUpdate} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="info"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default OrderBookingServiceManagement;
