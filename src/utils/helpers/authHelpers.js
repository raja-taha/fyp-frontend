import Cookies from "js-cookie";

// Set token in cookies with expiry
export const setToken = (token, expiryDays = 7) => {
  Cookies.set("token", token, { expires: expiryDays });
};

// Get token from cookies
export const getToken = () => {
  return Cookies.get("token");
};

// Remove token from cookies
export const removeToken = () => {
  Cookies.remove("token");
};

// Set user data in localStorage
export const setUserData = (userData) => {
  localStorage.setItem("user", JSON.stringify(userData));
};

// Get user data from localStorage
export const getUserData = () => {
  const userData = localStorage.getItem("user");
  return userData ? JSON.parse(userData) : null;
};

// Remove user data from localStorage
export const removeUserData = () => {
  localStorage.removeItem("user");
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken() && !!getUserData();
};

// Clear all auth data (for logout)
export const clearAuthData = () => {
  removeToken();
  removeUserData();
};

// Check if user has required role
export const hasRole = (requiredRole) => {
  const user = getUserData();
  return user && user.role === requiredRole;
};

// Check if user has any of the required roles
export const hasAnyRole = (requiredRoles) => {
  const user = getUserData();
  return user && requiredRoles.includes(user.role);
};
