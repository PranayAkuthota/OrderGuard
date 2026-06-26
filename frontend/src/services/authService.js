import axiosInstance from "./axiosInstance";

export const login = async (email, password) => {
  const response = await axiosInstance.post("/auth/login", { email, password });
  if (response.data.token) {
    localStorage.setItem("orderguard_token", response.data.token);
    localStorage.setItem("orderguard_user", JSON.stringify(response.data.user));
  }
  return response.data;
};

export const register = async (name, email, password, role) => {
  const response = await axiosInstance.post("/auth/register", { name, email, password, role });
  if (response.data.token) {
    localStorage.setItem("orderguard_token", response.data.token);
    localStorage.setItem("orderguard_user", JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("orderguard_token");
  localStorage.removeItem("orderguard_user");
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("orderguard_user");
  return user ? JSON.parse(user) : null;
};
