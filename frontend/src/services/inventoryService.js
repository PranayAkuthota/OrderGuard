import axiosInstance from "./axiosInstance";

export const getInventoryLevels = async (params = {}) => {
  // Inventory levels list is equivalent to getting products
  const response = await axiosInstance.get("/inventory", { params: { ...params, limit: 100 } });
  return response.data;
};

export const reduceStock = async (productId, quantity) => {
  const response = await axiosInstance.post("/inventory/reduce", { product_id: productId, quantity });
  return response.data;
};

export const updateStock = async (id, stock) => {
  const response = await axiosInstance.put(`/inventory/${id}`, { stock });
  return response.data;
};
