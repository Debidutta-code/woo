// src/store/store.ts
'use client';

import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import accessReducer from "./access-slice";
export const store = configureStore({
  reducer: {
    user: userReducer,
    access: accessReducer,
  },
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;