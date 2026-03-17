import { create } from "zustand";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "@/utils/pushNotificationsAsync";

interface NotificationState {
  expoPushToken: string | null;
  devicePushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
  setExpoPushToken: (token: string | null) => void;
  setDevicePushToken: (token: string | null) => void;
  setNotification: (notification: Notifications.Notification | null) => void;
  setError: (error: Error | null) => void;
  initialize: () => () => void; 
}

export const useNotificationStore = create<NotificationState>((set) => ({
  expoPushToken: null,
  devicePushToken: null,
  notification: null,
  error: null,

  setExpoPushToken: (token) => set({ expoPushToken: token }),
  setDevicePushToken: (token) => set({ devicePushToken: token }),
  setNotification: (notification) => set({ notification }),
  setError: (error) => set({ error }),

  initialize: () => {
    registerForPushNotificationsAsync().then(
      (token) => set({ expoPushToken: token }),
      (error) => set({ error }),
    );

    Notifications.getDevicePushTokenAsync().then(
      (deviceToken) => {
        set({ devicePushToken: deviceToken.data });
      },
      (error) => {
        set({ error });
      },
    );

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("🔔 Notification Received: ", notification);
        set({ notification });
      },
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("🔔 Notification Response: ", response);
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  },
}));
