import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const WISHLIST_BASE = `${API_BASE_URL}/booking-engine/wish-list`;

// Helper function to get auth headers
const getAuthToken = () => Cookies.get("accessToken");

const getAuthHeaders = () => {
  const token = getAuthToken();
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
      const token = getAuthToken();
      if (!token) {
        throw new Error("Please log in to manage your wishlist");
      }

      const response = await axios.post(
        `${WISHLIST_BASE}`,
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
      const response = await axios.get(`${WISHLIST_BASE}/my`, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      return response.data.data || [];
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
      const items = await wishlistAPI.getWishlistGrouped();
      return (items || []).filter((item: any) => {
        const cityName = item?.Property?.propertyAddress?.city || item?.Property?.city;
        return typeof cityName === "string" && cityName.toLowerCase() === city.toLowerCase();
      });
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
      const items = await wishlistAPI.getWishlistGrouped();
      return (items || []).some((item: any) => item?.propertyId === propertyId);
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
      const items = await wishlistAPI.getWishlistGrouped();
      return (items || []).length;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("Please log in to view wishlist count");
      }
      throw error;
    }
  }
};
