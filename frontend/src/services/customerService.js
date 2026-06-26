import axiosInstance from "./axiosInstance";

export const getCustomers = async (params = {}) => {
  const response = await axiosInstance.get("/customers", { params });
  return response.data;
};
