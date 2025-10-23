// import { io, Socket } from 'socket.io-client'; // Temporarily disabled
import { Notification } from '../types/notification';

class SocketService {
  private socket: any = null; // Using any since Socket.IO is disabled
  private _token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  /**
   * Connect to the WebSocket server
   */
  connect(): void {
    // Temporarily disable WebSocket connection to prevent errors
    // TODO: Re-enable when backend WebSocket is properly configured
    // WebSocket connection disabled. Using polling fallback for notifications.
    this.socket = null;
    return;

    // Original connection code (commented out for now)
    /*
    if (this.socket?.connected) {
      return;
    }

    this.token = localStorage.getItem('token');
    if (!this.token) {
      console.warn('No authentication token found. Cannot connect to WebSocket.');
      return;
    }

    // Check if Socket.IO is available (backend might not have WebSocket enabled)
    try {
      this.socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
        auth: {
          token: this.token
        },
        transports: ['websocket', 'polling'],
        timeout: 5000, // 5 second timeout
        forceNew: true
      });

      this.setupEventListeners();
    } catch (error) {
      console.warn('WebSocket connection not available. Notifications will work via polling only.');
      this.socket = null;
    }
    */
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Setup event listeners (disabled when WebSocket is disabled)
   */
  private _setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      // Connected to WebSocket server
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (_reason: string) => {
      // Disconnected from WebSocket server
      this.handleReconnect();
    });

    this.socket.on('connect_error', (error: Error) => {
      console.warn('WebSocket connection error:', error.message);
      // Don't attempt reconnection if it's a transport error
      if (error.message.includes('websocket error') || error.message.includes('TransportError')) {
        console.warn('WebSocket transport not available. Using polling fallback.');
        this.socket = null;
        return;
      }
      this.handleReconnect();
    });

    // Notification events
    this.socket.on('new_notification', (notification: Notification) => {
      // New notification received
      this.emit('new_notification', notification);
    });

    this.socket.on('notification_count_update', (data: { unreadCount: number }) => {
      // Notification count updated
      this.emit('notification_count_update', data);
    });

    this.socket.on('notification_read_success', (data: { notificationId: string }) => {
      // Notification marked as read
      this.emit('notification_read_success', data);
    });

    this.socket.on('notification_read_error', (error: any) => {
      console.error('Error marking notification as read:', error);
      this.emit('notification_read_error', error);
    });

    this.socket.on('all_notifications_read_success', () => {
      // All notifications marked as read
      this.emit('all_notifications_read_success');
    });

    this.socket.on('all_notifications_read_error', (error: any) => {
      console.error('Error marking all notifications as read:', error);
      this.emit('all_notifications_read_error', error);
    });
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached. Stopping reconnection.');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    // Attempting to reconnect

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Emit custom events
   */
  private emit(event: string, data?: any): void {
    const customEvent = new CustomEvent(event, { detail: data });
    window.dispatchEvent(customEvent);
  }

  /**
   * Listen for custom events
   */
  on(event: string, callback: (data?: any) => void): void {
    window.addEventListener(event, (e: any) => {
      callback(e.detail);
    });
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: (data?: any) => void): void {
    window.removeEventListener(event, callback);
  }

  /**
   * Mark notification as read
   */
  markNotificationAsRead(notificationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('mark_notification_read', { notificationId });
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllNotificationsAsRead(): void {
    if (this.socket?.connected) {
      this.socket.emit('mark_all_notifications_read');
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): 'connected' | 'disconnected' | 'connecting' {
    if (!this.socket) return 'disconnected';
    // WebSocket is disabled, so always return disconnected
    return 'disconnected';
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
