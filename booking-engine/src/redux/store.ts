// src/store/store.ts
'use client';

import { configureStore } from '@reduxjs/toolkit';
export const store = configureStore({
  reducer: {
  },
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;