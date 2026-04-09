'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../utils/firebase.config'; // Adjust the import path as needed
import toast from 'react-hot-toast';
import { AppDispatch } from '../Redux/store';
import { addNotification } from '../Redux/slices/notification.slice';
import type { Notification } from '../components/notifications/types/notification';

const vapidKey = process.env.NEXT_PUBLIC_VAPIDKEY as string; // from Firebase Console

const useFCM = (userId?: string) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    //console.log('🔔 useFCM hook initialized with userId-----------------------------:', userId);
    
    const setupFCM = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn('🚫 Notification permission denied');
          return;
        }

        //console.log('✅ Notification permission granted', vapidKey);

        if (!messaging) {
          console.error("Firebase Messaging is not supported in this browser.");
          return;
        }

        const token = await getToken(messaging, { vapidKey });
        //console.log('🔑 FCM Token:', token);

        if (token) {
          //console.log('📱 FCM Token:', token);

          // 🔁 Send to backend
          await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notification/register-device-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // Include auth token if needed
            },
            body: JSON.stringify({
              userId,
              token,
              platform: 'web',
            }),
          });
        }
      } catch (err) {
        console.warn('⚠️ FCM setup failed:', err);
      }
    };

    setupFCM();
    //console.log('✅ useFCM effect running, setting up onMessage...');

    // Handle incoming messages with real-time updates
    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        //console.log('📩 Foreground message:', payload);
        
        // Create notification object that matches your Redux state structure
        const newNotification: Notification = {
          id: payload.messageId || `fcm-${Date.now()}`,
          title: payload.notification?.title || 'New Notification',
          body: payload.notification?.body || '',
          type: payload.data?.type || 'general',
          isRead: false,
          timestamp: new Date().toISOString(),
          data: { 
            type: payload.data?.type,
            offerCode: payload.data?.offerCode,
            ...payload.data
          }        };

        // Add notification to Redux store (this will automatically update the count)
        dispatch(addNotification(newNotification));

        // Show toast notification
        toast.success(`New Notification: ${payload.notification?.title}`, {
          duration: 7000,
          icon: '🔔',
          // position: 'top-right',
        });
      });

      // Return cleanup function
      return () => {
        unsubscribe();
      };
    } else {
      console.warn('❌ Firebase Messaging is not available (unsupported browser or not initialized)');
    }
  }, [userId, dispatch]);
};

export default useFCM;