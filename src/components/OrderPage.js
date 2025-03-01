import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

function OrderPage() {
  const navigate = useNavigate();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchSelectedItems = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/selecteditems`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.data.items) {
          setSelectedProducts(response.data.items);
        } else {
          setSnackbar({
            open: true,
            message: "Không có sản phẩm nào được chọn.",
            severity: "error",
          });
        }
      } catch (error) {
        console.error("Error fetching selected items", error);
        setSnackbar({
          open: true,
          message: "Có lỗi xảy ra khi lấy danh sách sản phẩm đã chọn.",
          severity: "error",
        });
      }
    };

    fetchSelectedItems();
  }, []);

  const calculateTotalPrice = () => {
    const totalPrice = selectedProducts.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    return totalPrice.toLocaleString();
  };

  const handleOrderConfirmation = () => {
    setOpenDialog(true);
  };

  const handlePlaceOrder = async () => {
    try {
      const selectedItemsResponse = await axios.get(
        `${API_URL}/api/selecteditems`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const selectedProducts = selectedItemsResponse.data.items;

      if (!selectedProducts || selectedProducts.length === 0) {
        setSnackbar({
          open: true,
          message: "Không có sản phẩm nào được chọn để đặt hàng.",
          severity: "warning",
        });
        return;
      }

      const orderResponse = await axios.post(
        `${API_URL}/api/order`,
        { items: selectedProducts },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (orderResponse.status === 200) {
        setSnackbar({
          open: true,
          message: "Đơn hàng đã được đặt thành công!",
          severity: "success",
        });

        await axios.delete(`${API_URL}/api/selecteditems/clear`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setOpenDialog(false);
        navigate("/shop");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error placing order", error);
      setSnackbar({
        open: true,
        message: "Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại.",
        severity: "error",
      });
      setOpenDialog(false);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Xác nhận đơn hàng</h2>

      {selectedProducts.length > 0 ? (
        <>
          <Table
            sx={{
              borderCollapse: "collapse",
              width: "80%",
              margin: "0 auto",
              tableLayout: "fixed",
            }}
          >
            <thead>
              <tr>
                <th style={{ textAlign: "center", border: "1px solid black" }}>
                  Hình ảnh
                </th>
                <th style={{ textAlign: "center", border: "1px solid black" }}>
                  Tên sản phẩm
                </th>
                <th style={{ textAlign: "center", border: "1px solid black" }}>
                  Số lượng
                </th>
                <th style={{ textAlign: "center", border: "1px solid black" }}>
                  Tổng giá
                </th>
              </tr>
            </thead>
            <tbody>
              {selectedProducts.map((item) => (
                <tr key={item.product_id}>
                  <td
                    style={{ textAlign: "center", border: "1px solid black" }}
                  >
                    <img
                      src={item.imageurl}
                      alt={item.name}
                      style={{ width: "70px", height: "70px" }}
                    />
                  </td>
                  <td
                    style={{ textAlign: "center", border: "1px solid black" }}
                  >
                    {item.name}
                  </td>
                  <td
                    style={{ textAlign: "center", border: "1px solid black" }}
                  >
                    {item.quantity}
                  </td>
                  <td
                    style={{ textAlign: "center", border: "1px solid black" }}
                  >
                    {(item.price * item.quantity).toLocaleString()} VND
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <h3>Tổng cộng: {calculateTotalPrice()} VND</h3>

          <Button
            variant="contained"
            color="primary"
            onClick={handleOrderConfirmation}
            sx={{ marginTop: "20px" }}
          >
            Đặt hàng
          </Button>
        </>
      ) : (
        <p>Không có sản phẩm nào được chọn.</p>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Xác nhận đặt hàng</DialogTitle>
        <DialogContent>Bạn có chắc chắn muốn đặt hàng không?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Không
          </Button>
          <Button onClick={handlePlaceOrder} color="primary">
            Có
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() =>
          setSnackbar({ open: false, message: "", severity: "success" })
        }
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
}

export default OrderPage;
