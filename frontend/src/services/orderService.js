import axiosInstance from "./axiosInstance";

export const getOrders = async (params = {}) => {
  const response = await axiosInstance.get("/order", { params });
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await axiosInstance.get(`/order/${id}`);
  return response.data;
};

export const createOrder = async (orderData) => {
  const response = await axiosInstance.post("/order", orderData);
  return response.data;
};

export const updateOrderStatus = async (orderId, newStatus) => {
  const response = await axiosInstance.post("/order/status", { orderId, newStatus });
  return response.data;
};
