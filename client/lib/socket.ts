import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://wishshare.onrender.com';

class SocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    if (this.socket?.connected) return this.socket;

    const token = localStorage.getItem('token');
    if (!token) return null;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('reconnect_attempt', (attempt) => {
      console.log(`Reconnection attempt ${attempt}`);
    });

    this.socket.on('reconnect_failed', () => {
      console.log('Failed to reconnect to server');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  joinWishlist(wishlistId: string) {
    if (this.socket) {
      this.socket.emit('join_wishlist', wishlistId);
    }
  }

  leaveWishlist(wishlistId: string) {
    if (this.socket) {
      this.socket.emit('leave_wishlist', wishlistId);
    }
  }

  // Event listeners
  onWishlistUpdated(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('wishlist_updated', callback);
    }
  }

  onItemAdded(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('item_added', callback);
    }
  }

  onItemUpdated(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('item_updated', callback);
    }
  }

  onItemDeleted(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('item_deleted', callback);
    }
  }

  onItemClaimed(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('item_claimed', callback);
    }
  }

  onMemberInvited(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('member_invited', callback);
    }
  }

  // Remove event listeners
  off(event: string, callback: any) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export const socketManager = new SocketManager();
export default socketManager;