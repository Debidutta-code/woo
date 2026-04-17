"use client";

import { createSlice, PayloadAction, Draft } from "@reduxjs/toolkit";
import { AuthState } from "../states/auth.state";
import axios from "axios";
import Cookies from "js-cookie";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../store";

const initialState: AuthState = {
  isAuthenticated: false,
  accessToken: "",
  user: null,
};

const cookieOptions = {
  sameSite: "strict" as const,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken: (
      state,
      action: PayloadAction<typeof initialState.accessToken>,
    ) => {
      state.isAuthenticated = true;
      state.accessToken = action.payload;
      Cookies.set("isAuthenticated", "true", cookieOptions);
    },
    setUser(
      state: Draft<typeof initialState>,
      action: PayloadAction<typeof initialState.user>,
    ) {
      state.user = action.payload;
      if (action.payload) {
        state.isAuthenticated = true;
        Cookies.set("isAuthenticated", "true", cookieOptions);
        Cookies.set("userData", JSON.stringify(action.payload), cookieOptions);
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = "";
      Cookies.remove("isAuthenticated");
      Cookies.remove("userData");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = {
          ...state.user,
          _id: action.payload._id,
          firstName: action.payload.firstName,
          lastName: action.payload.lastName,
          email: action.payload.email,
          phone: action.payload.phone || state.user?.phone,
        };
        Cookies.set("userData", JSON.stringify(action.payload), cookieOptions);
      })
      .addCase(updateProfile.pending, (state) => {})
      .addCase(updateProfile.rejected, (state, action) => {
        state.user = state.user;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.accessToken = action.payload.token;
        Cookies.set("isAuthenticated", "true");
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.accessToken = "";
        state.user = null;
      });
  },
});

// Login thunk for email/password authentication
export const login = createAsyncThunk<
  string,
  { email: string; password: string; provider: string },
  { dispatch: AppDispatch; state: RootState }
>("auth/login", async (data, { dispatch }) => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/customers/login`,
    {
      ...data,
    },
    {
      withCredentials: true,
    }
  );
  //console.log("Login response from REDUX:", res);
  if (res.status !== 200) {
    throw new Error(res.data.error || "Failed to login");
  }
  const token = res.data.token;
  dispatch(setAccessToken(token));
  await dispatch(getUser());
  return token;
});

// Google login thunk
export const googleLogin = createAsyncThunk<
  { token: string },
  {
    code: string;
    provider: string;
    referrerId?: string | null;
    referralCode?: string | null;
  },
  { dispatch: AppDispatch; state: RootState }
>(
  "auth/googleLogin",
  async (
    { code, provider, referrerId, referralCode },
    { dispatch, rejectWithValue },
  ) => {
    try {
      let apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/google/auth/google`;

      if (referrerId && referralCode) {
        const params = new URLSearchParams({
          referrerId: referrerId,
          referralCode: referralCode,
        });
        apiUrl += `?${params.toString()}`;
      }

      const response = await axios.post(
        apiUrl,
        { code, provider },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          withCredentials: true,
        },
      );

      if (response.status !== 201) {
        throw new Error(response.data.error || "Failed to login with Google");
      }

      const token = response.data.token;

      if (!token) {
        throw new Error("No token received from Google login");
      }

      //console.log("🔑 Token received from backend:", token);

      dispatch(setAccessToken(token));
      await dispatch(getUser());

      return { token };
    } catch (error) {
      console.error("❌ Error in googleLogin thunk:", error);

      if (axios.isAxiosError(error)) {
        console.error("❌ Axios error details:", {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
        });

        // IMPORTANT: Extract the exact error message from your API response
        const apiErrorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to login with Google";

        return rejectWithValue(apiErrorMessage);
      }

      return rejectWithValue("Failed to login with Google");
    }
  },
);

// Get user thunk
export const getUser = createAsyncThunk<
  void,
  void,
  { dispatch: AppDispatch; state: RootState }
>("auth/getUser", async (_, { dispatch }) => {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/customers/me`,
    {
      withCredentials: true,
    },
  );

  dispatch(setUser(res.data.data));
  Cookies.set("userData", JSON.stringify(res.data.data), cookieOptions);
});

// Logout thunk
export const logoutUser = createAsyncThunk<
  void,
  void,
  { dispatch: AppDispatch; state: RootState }
>("auth/logoutUser", async (_, { dispatch }) => {
  try {
    await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/customers/logout`,
      {},
      {
        withCredentials: true,
      }
    );
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    dispatch(logout());
  }
});

// Update profile thunk
export const updateProfile = createAsyncThunk<
  any,
  {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password?: string;
  },
  { dispatch: AppDispatch; state: RootState }
>("auth/updateProfile", async (data, { rejectWithValue }) => {
  try {
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/customers/update`,
      data,
      {
        withCredentials: true,
      },
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile",
      );
    }
    return rejectWithValue("Failed to update profile");
  }
});

// Delete account thunk
export const deleteAccount = createAsyncThunk<
  any,
  {
    name: string;
    email: string;
    phone: string;
    reason: string;
    description: string;
  },
  { dispatch: AppDispatch; state: RootState }
>("auth/deleteAccount", async (data, { dispatch, rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/customers/delete-form`,
      data,
      {
        withCredentials: true,
      }
    );
    dispatch(logout());
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete account",
      );
    }
    return rejectWithValue("Failed to delete account");
  }
});

export const { setAccessToken, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
