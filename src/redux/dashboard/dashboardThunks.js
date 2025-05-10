import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/api/apiClient";

export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async () => {
    const response = await axiosInstance.get("/api/dashboard/superadmin/stats");
    return response.data;
  }
);

export const fetchAdminDashboardStats = createAsyncThunk(
  "dashboard/fetchAdminStats",
  async () => {
    const response = await axiosInstance.get("/api/dashboard/admin/stats");
    return response.data;
  }
);

export const fetchClientData = createAsyncThunk(
  "dashboard/fetchClientData",
  async (period) => {
    const response = await axiosInstance.get(
      `/api/dashboard/clients/period/${period}`
    );

    // The API returns formatted data in the structure:
    // { data: [{ date: "YYYY-MM-DD" or "YYYY-MM-DD HH:00" or "YYYY-MM", count: number }] }
    const clientStats = response.data.data || [];

    // Create a complete dataset with all time points, filling gaps with zeros
    let formattedData = [];
    const now = new Date();

    // Define time points based on period
    let timePoints = [];

    switch (period) {
      case "day": {
        // 24 hours
        for (let i = 0; i < 24; i++) {
          const date = new Date(now);
          date.setHours(i, 0, 0, 0);
          const dateStr = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}-${String(date.getDate()).padStart(
            2,
            "0"
          )} ${String(i).padStart(2, "0")}:00`;
          timePoints.push(dateStr);
        }
        break;
      }
      case "week": {
        // 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateStr = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          timePoints.push(dateStr);
        }
        break;
      }
      case "month": {
        // 30 days
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateStr = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          timePoints.push(dateStr);
        }
        break;
      }
      case "year": {
        // 12 months
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          const dateStr = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}`;
          timePoints.push(dateStr);
        }
        break;
      }
    }

    // Create a map of existing data
    const dataMap = {};
    clientStats.forEach((item) => {
      dataMap[item.date] = item.count;
    });

    // Fill in all time points with data or zeros
    formattedData = timePoints.map((timePoint) => {
      let label = timePoint;

      // Format the labels based on period for better readability
      if (period === "day") {
        // For "day" period, convert "YYYY-MM-DD HH:00" to just "HH:00"
        const hourPart = timePoint.split(" ")[1];
        label = hourPart;
      } else if (period === "week" || period === "month") {
        // For "week" or "month" period, convert "YYYY-MM-DD" to "DD MMM"
        const date = new Date(timePoint);
        label = date.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
        });
      } else if (period === "year") {
        // For "year" period, convert "YYYY-MM" to "MMM"
        const date = new Date(timePoint + "-01"); // Add day to make valid date
        label = date.toLocaleDateString("en-US", { month: "short" });
      }

      return {
        date: timePoint,
        value: dataMap[timePoint] || 0, // Use 0 if no data exists
        label: label,
      };
    });

    return formattedData;
  }
);

export const fetchAdminClientData = createAsyncThunk(
  "dashboard/fetchAdminClientData",
  async (period) => {
    const response = await axiosInstance.get(
      `/api/dashboard/admin/clients/period/${period}`
    );

    // The API returns formatted data in the structure:
    // { data: [{ date: "YYYY-MM-DD" or "YYYY-MM-DD HH:00" or "YYYY-MM", count: number }] }
    const clientStats = response.data.data || [];

    // Create a complete dataset with all time points, filling gaps with zeros
    let formattedData = [];
    const now = new Date();

    // Define time points based on period
    let timePoints = [];

    switch (period) {
      case "day": {
        // 24 hours
        for (let i = 0; i < 24; i++) {
          const date = new Date(now);
          date.setHours(i, 0, 0, 0);
          const dateStr = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}-${String(date.getDate()).padStart(
            2,
            "0"
          )} ${String(i).padStart(2, "0")}:00`;
          timePoints.push(dateStr);
        }
        break;
      }
      case "week": {
        // 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateStr = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          timePoints.push(dateStr);
        }
        break;
      }
      case "month": {
        // 30 days
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateStr = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          timePoints.push(dateStr);
        }
        break;
      }
      case "year": {
        // 12 months
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          const dateStr = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}`;
          timePoints.push(dateStr);
        }
        break;
      }
    }

    // Create a map of existing data
    const dataMap = {};
    clientStats.forEach((item) => {
      dataMap[item.date] = item.count;
    });

    // Fill in all time points with data or zeros
    formattedData = timePoints.map((timePoint) => {
      let label = timePoint;

      // Format the labels based on period for better readability
      if (period === "day") {
        // For "day" period, convert "YYYY-MM-DD HH:00" to just "HH:00"
        const hourPart = timePoint.split(" ")[1];
        label = hourPart;
      } else if (period === "week" || period === "month") {
        // For "week" or "month" period, convert "YYYY-MM-DD" to "DD MMM"
        const date = new Date(timePoint);
        label = date.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
        });
      } else if (period === "year") {
        // For "year" period, convert "YYYY-MM" to "MMM"
        const date = new Date(timePoint + "-01"); // Add day to make valid date
        label = date.toLocaleDateString("en-US", { month: "short" });
      }

      return {
        date: timePoint,
        value: dataMap[timePoint] || 0, // Use 0 if no data exists
        label: label,
      };
    });

    return formattedData;
  }
);

export const fetchAgentDashboardStats = createAsyncThunk(
  "dashboard/fetchAgentStats",
  async () => {
    const response = await axiosInstance.get("/api/dashboard/agent/stats");
    return response.data;
  }
);

export const fetchAgentClientData = createAsyncThunk(
  "dashboard/fetchAgentClientData",
  async (period) => {
    const response = await axiosInstance.get(
      `/api/dashboard/agent/clients/period/${period}`
    );

    // The API returns formatted data in the structure:
    // { data: [{ date: "YYYY-MM-DD" or "YYYY-MM-DD HH:00" or "YYYY-MM", count: number }] }
    const clientStats = response.data.data || [];

    // Create a complete dataset with all time points, filling gaps with zeros
    let formattedData = [];
    const now = new Date();

    // Define time points based on period
    let timePoints = [];

    switch (period) {
      case "day": {
        // 24 hours
        for (let i = 0; i < 24; i++) {
          const date = new Date(now);
          date.setHours(i, 0, 0, 0);
          const dateStr = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}-${String(date.getDate()).padStart(
            2,
            "0"
          )} ${String(i).padStart(2, "0")}:00`;
          timePoints.push(dateStr);
        }
        break;
      }
      case "week": {
        // 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateStr = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          timePoints.push(dateStr);
        }
        break;
      }
      case "month": {
        // 30 days
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateStr = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          timePoints.push(dateStr);
        }
        break;
      }
      case "year": {
        // 12 months
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          const dateStr = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}`;
          timePoints.push(dateStr);
        }
        break;
      }
    }

    // Create a map of existing data
    const dataMap = {};
    clientStats.forEach((item) => {
      dataMap[item.date] = item.count;
    });

    // Fill in all time points with data or zeros
    formattedData = timePoints.map((timePoint) => {
      let label = timePoint;

      // Format the labels based on period for better readability
      if (period === "day") {
        // For "day" period, convert "YYYY-MM-DD HH:00" to just "HH:00"
        const hourPart = timePoint.split(" ")[1];
        label = hourPart;
      } else if (period === "week" || period === "month") {
        // For "week" or "month" period, convert "YYYY-MM-DD" to "DD MMM"
        const date = new Date(timePoint);
        label = date.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
        });
      } else if (period === "year") {
        // For "year" period, convert "YYYY-MM" to "MMM"
        const date = new Date(timePoint + "-01"); // Add day to make valid date
        label = date.toLocaleDateString("en-US", { month: "short" });
      }

      return {
        date: timePoint,
        value: dataMap[timePoint] || 0, // Use 0 if no data exists
        label: label,
      };
    });

    return formattedData;
  }
);
