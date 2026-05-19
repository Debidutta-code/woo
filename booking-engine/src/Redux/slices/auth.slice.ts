"use client";

import { createSlice, PayloadAction, Draft } from "@reduxjs/toolkit";
import { AuthState } from "../states/auth.state";
import axios from "axios";
import Cookies from "js-cookie";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../store";

const cookieOptions = {
  sameSite: "strict" as const,
  path: "/",
};

const getInitialAuth = (): AuthState => {
  if (typeof window === "undefined") {
    return {
      isAuthenticated: false,
      accessToken: "",
      user: null,
    };
  }

  const accessToken = Cookies.get("accessToken") || "";
  const isAuthenticated = Cookies.get("isAuthenticated") === "true";
  const userData = Cookies.get("userData");
  let user = null;

  try {
    user = userData ? JSON.parse(userData) : null;
  } catch (e) {
    console.error("Failed to parse userData from cookies", e);
  }

  return {
    isAuthenticated: isAuthenticated || !!accessToken,
    accessToken,
    user,
  };
};

const initialState: AuthState = getInitialAuth();

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
    setAccessToken: (
      state,
      action: PayloadAction<typeof initialState.accessToken>,
    ) => {
      state.accessToken = action.payload;
      if (action.payload) {
        state.isAuthenticated = true;
        Cookies.set("accessToken", action.payload, cookieOptions);
        Cookies.set("isAuthenticated", "true", cookieOptions);
      } else {
        state.isAuthenticated = false;
        Cookies.remove("accessToken", { path: "/" });
        Cookies.remove("isAuthenticated", { path: "/" });
      }
    },
    setUser(
      state: Draft<typeof initialState>,
      action: PayloadAction<typeof initialState.user>,
    ) {
      const normalizedUser = normalizeUser(action.payload);
      state.user = normalizedUser;
      if (normalizedUser) {
        Cookies.set("userData", JSON.stringify(normalizedUser), cookieOptions);
      } else {
        Cookies.remove("userData", { path: "/" });
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = "";
      Cookies.remove("accessToken", { path: "/" });
      Cookies.remove("isAuthenticated", { path: "/" });
      Cookies.remove("userData", { path: "/" });
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
        Cookies.set(
          "userData",
          JSON.stringify(normalizeUser(state.user)),
          cookieOptions,
        );
      })
      .addCase(updateProfile.pending, (state) => {})
      .addCase(updateProfile.rejected, (state, action) => {
        state.user = state.user;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.accessToken = action.payload.token;
        Cookies.set("accessToken", action.payload.token, cookieOptions);
        Cookies.set("isAuthenticated", "true", cookieOptions);
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.accessToken = "";
        state.user = null;
        Cookies.remove("accessToken", { path: "/" });
        Cookies.remove("isAuthenticated", { path: "/" });
        Cookies.remove("userData", { path: "/" });
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
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking-engine/customer/login`,
    {
      ...data,
    },
    { withCredentials: true }
  );
  //console.log("Login response from REDUX:", res);
  if (res.status !== 200) {
    throw new Error(res.data.error || "Failed to login");
  }
  const token = res.data.data?.accessToken; 
  const loginUser = res.data.data?.user;
  Cookies.set("accessToken", token, cookieOptions);
  dispatch(setAccessToken(token));
  if (loginUser) {
    dispatch(setUser(normalizeUser(loginUser)));
  }
  try {
    await dispatch(getUser(token));
  } catch (_error) {}
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

      Cookies.set("accessToken", token, cookieOptions);
      dispatch(setAccessToken(token));
      try {
        await dispatch(getUser(token));
      } catch (_error) {}

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
  string | undefined,
  { dispatch: AppDispatch; state: RootState }
>("auth/getUser", async (providedToken, { dispatch, getState }) => {
  const stateToken = getState().auth.accessToken;
  const accessToken = providedToken || stateToken || Cookies.get("accessToken");
  //console.log(`The access token we get from cookies ${accessToken}`);
  // if (!accessToken) {
  // const token = Cookies.get("accessToken");
  // }
  if (!accessToken) {
    throw new Error("No access token available for getUser");
  }
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking-engine/customer/me`,
    {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
       withCredentials: true, 
    },
  );

  const normalizedUser = normalizeUser(res.data.data);
  dispatch(setUser(normalizedUser));
  Cookies.set("userData", JSON.stringify(normalizedUser), cookieOptions);
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
    const token = Cookies.get("accessToken") || "";
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/customers/update`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
    } catch (_error) {
      // Even if backend logout fails, clear local auth state in UI flow.
    }
  },
);

export const { setAccessToken, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
