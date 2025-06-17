import { createContext, useContext, useState, useEffect } from "react";
import {
  addToCartAPI, updateCartItemAPI, removeCartItemAPI,
  clearCartAPI, getCartItemsAPI
} from "../../services/api-service";
import { AuthContext } from "./auth-context";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useContext(AuthContext);

  // Debug: log mỗi lần cart thay đổi
  useEffect(() => {
    console.log('Cart state changed:', cart);
  }, [cart]);

  // Lấy lại giỏ hàng từ backend
  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const res = await getCartItemsAPI();
      if (res?.data?.items) {
        setCart(res.data.items);
        const totalAmount = res.data.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
        setTotal(totalAmount);
      } else {
        setCart([]);
        setTotal(0);
      }
    } catch (err) {
      setCart([]);
      setTotal(0);
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
        return res;
      }
    } catch (err) {
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