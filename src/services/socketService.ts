import { io, Socket } from 'socket.io-client';
import { Constants } from '@/config/constants';
import { useAuthStore } from '@store/useAuthStore';
import { Alert } from 'react-native';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    const token = useAuthStore.getState().token;
    if (!token) {
      console.warn('Cannot connect to socket without token');
      return;
    }
    if (!this.socket) {
      this.socket = io(`${Constants.BASE_URL}/tracking`, {
        auth: {
          token: `${token}`,
        },
        transports: ['polling', 'websocket'],
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      this.socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
      });

      this.socket.on('error', (err) => {
        console.error('Server error:', err.message);
      });
    }

    return this.socket;
  }

  getSocket() {
    if (!this.socket) {
      return this.connect();
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // ── Vendor Events ──────────────────────────────
// apply logs on startRoute and updateRoute for texting pupose use alert
  startRoute(routeId: string) {
    const socket = this.getSocket();
    if (socket) {
      socket.emit('startRoute', { routeId }); 
      Alert.alert('Route started', `Route ${routeId} started`);
    }
  }

  updateLocation(lat: number, lng: number) {
    const socket = this.getSocket();
    if (socket) {
      socket.emit('updateLocation', { lat, lng });
      Alert.alert('Location updated', `Location ${lat}, ${lng} updated`);
    }
  }

  endRoute(routeId: string) {
    const socket = this.getSocket();
    if (socket) {
      socket.emit('endRoute', { routeId });
    }
  }

  // ── Customer Events ────────────────────────────

  subscribeRoute(routeId: string) {
    const socket = this.getSocket();
    if (socket) {
      socket.emit('subscribeRoute', { routeId }); 
    }
  }

  unsubscribeRoute(routeId: string) {
    const socket = this.getSocket();
    if (socket) {
      socket.emit('unsubscribeRoute', { routeId }); 
    }
  }

  // ── Listeners ──────────────────────────────────

  onVendorLocationUpdate(callback: (data: {
    vendorId: string;
    vendorName: string;
    lat: number;
    lng: number;
    timestamp: string;
  }) => void) {
    const socket = this.getSocket();
    if (socket) {
      socket.on('vendorLocationUpdate', callback);
    }
  }

  onVendorRouteStarted(callback: (data: {
    vendorId: string;
    vendorName: string;
    routeId: string;
    routeName: string;
  }) => void) {
    const socket = this.getSocket();
    if (socket) {
      socket.on('vendorRouteStarted', callback);
       console.log(callback,"callback")
    }
  }

  onVendorRouteEnded(callback: (data: {
    vendorId: string;
    vendorName: string;
    routeId: string;
    routeName: string;
  }) => void) {
    const socket = this.getSocket();
    if (socket) {
      socket.on('vendorRouteEnded', callback);
    }
  }

  // vendor ko confirmation milti hai
  onRouteStarted(callback: (data: any) => void) {
    const socket = this.getSocket();
    if (socket) {
      socket.on('routeStarted', callback);
    }
  }

  onRouteEnded(callback: (data: any) => void) {
    const socket = this.getSocket();
    if (socket) {
      socket.on('routeEnded', callback);
    }
  }
// customer
  onSubscribed(callback: (data: { message: string; routeId: string }) => void) {
    const socket = this.getSocket();
    if (socket) {
      socket.on('subscribed', callback);
    }
  }

  onError(callback: (data: { message: string }) => void) {
    const socket = this.getSocket();
    if (socket) {
      socket.on('error', callback);
    }
  }

  removeListeners() {
    const socket = this.getSocket();
    if (socket) {
      socket.off('vendorLocationUpdate');
      socket.off('vendorRouteStarted');
      socket.off('vendorRouteEnded');
      socket.off('routeStarted');
      socket.off('routeEnded');
      socket.off('subscribed');
      socket.off('error');
    }
  }
}

export const socketService = new SocketService();