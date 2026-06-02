"use client";

import { createSlice, PayloadAction, Draft } from "@reduxjs/toolkit";
import { AuthState } from "../states/auth.state";
import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../store";

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
};

const normalizeUser = (user: any) => {
  if (!user) return null;
  const normalizedId = user._id || user.id;
  return {
    ...user,
    _id: normalizedId,
    id: user.id || normalizedId,
    phone: user.phone || user.mobilePhone || "",
    mobilePhone: user.mobilePhone || user.phone || "",
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(
      state: Draft<typeof initialState>,
      action: PayloadAction<typeof initialState.user>,
    ) {
      const normalizedUser = normalizeUser(action.payload);
      state.user = normalizedUser;
      if (normalizedUser) {
        state.isAuthenticated = true;
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateProfile.fulfilled, (state, action) => {
        const normalizedPayload = normalizeUser(action.payload);
        state.user = {
          ...state.user,
          ...normalizedPayload,
        };
      })
      .addCase(updateProfile.pending, (state) => {})
      .addCase(updateProfile.rejected, (state, action) => {
        state.user = state.user;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isAuthenticated = true;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const login = createAsyncThunk<
  void,
  { email: string; password: string; provider: string },
  { dispatch: AppDispatch; state: RootState }
>("auth/login", async (data, { dispatch }) => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking-engine/customer/login`,
    {
      ...data,
    },
    { withCredentials: true }
  );
  if (res.status !== 200) {
    throw new Error(res.data.error || "Failed to login");
  }
  const loginUser = res.data.data?.user;
  if (loginUser) {
    dispatch(setUser(normalizeUser(loginUser)));
  }
  try {
    await dispatch(getUser());
  } catch (_error) {}
});

export const googleLogin = createAsyncThunk<
  void,
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

      try {
        await dispatch(getUser());
      } catch (_error) {}

    } catch (error) {
      if (axios.isAxiosError(error)) {
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

export const getUser = createAsyncThunk<
  void,
  void,
  { dispatch: AppDispatch; state: RootState }
>("auth/getUser", async (_, { dispatch }) => {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking-engine/customer/me`,
    {
       withCredentials: true, 
    },
  );

  const normalizedUser = normalizeUser(res.data.data);
  dispatch(setUser(normalizedUser));
});

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
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking-engine/customer/me`,
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
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking-engine/customer/me`,
      {
        withCredentials: true,
      },
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

export const logoutUser = createAsyncThunk<void, void>(
  "auth/logoutUser",
  async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking-engine/customer/logout`,
        {},
        { withCredentials: true },
      );
    } catch (_error) {}
  },
);

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
