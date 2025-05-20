import { createContext, useContext, useState } from "react";
import {
  addToCartAPI, updateCartItemAPI, removeCartItemAPI,
  clearCartAPI, getCartItemsAPI
} from "../../services/api-service";
import { message } from "antd";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Lấy lại giỏ hàng từ backend
  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const res = await getCartItemsAPI();
      if (res && res.data) {
        let items = [];
        if (Array.isArray(res.data)) {
          items = res.data;
        } else if (Array.isArray(res.data.items)) {
          items = res.data.items;
        } else if (Array.isArray(res.data.data)) {
          items = res.data.data;
        } else {
          items = [];
        }
        setCart(items);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error("[CartContext] Lỗi khi lấy giỏ hàng:", err);
      message.error("Không thể lấy thông tin giỏ hàng. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  // Thêm sách vào giỏ hàng
  const addToCart = async (bookId, quantity) => {
    setIsLoading(true);
    try {
      const res = await addToCartAPI(bookId, quantity);
      if (res && res.data) {
        await fetchCart();
        message.success("Thêm vào giỏ hàng thành công");
        return res.data;
      }
    } catch (err) {
      console.error("Lỗi khi thêm vào giỏ hàng:", err);
      if (err.response?.status === 401) {
        message.error("Bạn cần đăng nhập để thêm vào giỏ hàng");
      } else if (err.response?.data?.message) {
        message.error(err.response.data.message);
      } else {
        message.error("Không thể thêm vào giỏ hàng. Vui lòng thử lại sau.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Cập nhật số lượng
  const updateCartItem = async (bookId, quantity) => {
    setIsLoading(true);
    try {
      const res = await updateCartItemAPI(bookId, quantity);
      if (res && res.data) {
        await fetchCart();
        return res.data;
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật giỏ hàng:", err);
      if (err.response?.data?.message) {
        message.error(err.response.data.message);
      } else {
        message.error("Không thể cập nhật số lượng. Vui lòng thử lại sau.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Xóa một sách
  const removeCartItem = async (bookId) => {
    setIsLoading(true);
    try {
      const res = await removeCartItemAPI(bookId);
      if (res && res.data) {
        await fetchCart();
        return res.data;
      }
    } catch (err) {
      console.error("Lỗi khi xóa khỏi giỏ hàng:", err);
      message.error("Không thể xóa khỏi giỏ hàng. Vui lòng thử lại sau.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = async () => {
    setIsLoading(true);
    try {
      const res = await clearCartAPI();
      if (res && res.data) {
        await fetchCart();
        return res.data;
      }
    } catch (err) {
      console.error("Lỗi khi xóa giỏ hàng:", err);
      message.error("Không thể xóa giỏ hàng. Vui lòng thử lại sau.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getCartCount = () => cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <CartContext.Provider value={{
      cart, total, isLoading, fetchCart, addToCart, updateCartItem, removeCartItem, clearCart, getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext); 