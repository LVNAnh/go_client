import React, { useEffect, useState } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/order-management`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleStatusChange = (order, status) => {
    if (order.status === "completed" || order.status === "cancelled") {
      setSnackbarMessage(
        "Không thể cập nhật đơn hàng ĐÃ HOÀN THÀNH hoặc ĐÃ BỊ HỦY"
      );
      setSnackbarOpen(true);
    } else {
      setSelectedOrder(order);
      setNewStatus(status);
      if (status === "completed")
        setConfirmMessage("Xác nhận HOÀN THÀNH đơn hàng");
      else if (status === "cancelled")
        setConfirmMessage("Xác nhận HỦY đơn hàng này");
      else setConfirmMessage("Bạn có muốn cập nhật đơn hàng này không?");
      setDialogOpen(true);
    }
  };

  const updateOrderStatus = async () => {
    try {
      await axios.patch(
        `${API_URL}/api/order/${selectedOrder.id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSnackbarMessage("Cập nhật trạng thái đơn hàng thành công");
      setSnackbarOpen(true);
      setDialogOpen(false);
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      setSnackbarMessage("Cập nhật trạng thái đơn hàng thất bại");
      setSnackbarOpen(true);
    }
  };

  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>STT</TableCell>
            <TableCell>Tên khách hàng</TableCell>
            <TableCell>SDT</TableCell>
            <TableCell>Tên sản phẩm</TableCell>
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
              <TableCell>
                {order.user?.firstname} {order.user?.lastname}
              </TableCell>
              <TableCell>{order.user?.phone}</TableCell>
              <TableCell>
                {order.items.map((item) => item.name).join(", ")}
              </TableCell>
              <TableCell>
                {order.items.map((item) => item.quantity).join(", ")}
              </TableCell>
              <TableCell>{order.total_price}</TableCell>
              <TableCell>
                {new Date(order.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>{order.user?.address}</TableCell>
              <TableCell>
                <Select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order, e.target.value)}
                  disabled={
                    order.status === "completed" || order.status === "cancelled"
                  }
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{confirmMessage}</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={updateOrderStatus} color="primary">
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
    </Paper>
  );
}

export default OrderManagement;
