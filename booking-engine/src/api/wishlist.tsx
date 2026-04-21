import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = Cookies.get("accessToken");
  return token ? {
    Authorization: `Bearer ${token}`,
  } : {};
};

export const wishlistAPI = {
  /**
   * Toggle a property in/out of wishlist
   */
 toggleWishlist: async (propertyId: string, propertyCode?: string, propertyName?: string) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/booking-engine/wish-list`,
        {
          propertyId: propertyId,
          propertyCode: propertyCode || "",
          propertyName: propertyName || "",
          roomId: null,
          roomType: null,
          roomName: null
        },
        {
          headers: getAuthHeaders(),
          withCredentials: true 
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("Please log in to manage your wishlist");
      }
      throw error;
    }
  },

  /**
   * Get wishlist grouped by cities
   */
  getWishlistGrouped: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/wishlist`, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("Please log in to view your wishlist");
      }
      throw error;
    }
  },

  /**
   * Get wishlist properties for a specific city
   */
  getWishlistByCity: async (city: string) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/wishlist/city/${city}`,
        {
          headers: getAuthHeaders(),
          withCredentials: true
        }
      );
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("Please log in to view your wishlist");
      }
      throw error;
    }
  },

  /**
   * Check if property is in wishlist
   */
  checkIfInWishlist: async (propertyId: string) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/wishlist/check/${propertyId}`,
        {},
        {
          headers: getAuthHeaders(),
          withCredentials: true
        }
      );
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("Please log in to check wishlist status");
      }
      throw error;
    }
  },

  /**
   * Get wishlist count
   */
  getWishlistCount: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/wishlist/count`, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("Please log in to view wishlist count");
      }
      throw error;
    }
  }
};