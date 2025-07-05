import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

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
      console.log('✅ Connected to server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
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
      console.log('🚀 Joining wishlist room:', wishlistId);
      this.socket.emit('join_wishlist', wishlistId);
    }
  }

  leaveWishlist(wishlistId: string) {
    if (this.socket) {
      console.log('👋 Leaving wishlist room:', wishlistId);
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

  // Comments and Reactions
  onCommentAdded(callback: (data: any) => void) {
    if (this.socket) {
      console.log('🔵 Listening for comment_added events');
      this.socket.on('comment_added', callback);
    }
  }

  onCommentDeleted(callback: (data: any) => void) {
    if (this.socket) {
      console.log('🔵 Listening for comment_deleted events');
      this.socket.on('comment_deleted', callback);
    }
  }

  onReactionUpdated(callback: (data: any) => void) {
    if (this.socket) {
      console.log('🔵 Listening for reaction_updated events');
      this.socket.on('reaction_updated', callback);
    }
  }

  onReactionRemoved(callback: (data: any) => void) {
    if (this.socket) {
      console.log('🔵 Listening for reaction_removed events');
      this.socket.on('reaction_removed', callback);
    }
  }

  onUserTypingComment(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user_typing_comment', callback);
    }
  }

  // Emit typing events
  emitTypingComment(wishlistId: string, itemId: string, userId: string, isTyping: boolean) {
    if (this.socket) {
      this.socket.emit('typing_comment', { wishlistId, itemId, userId, isTyping });
    }
  }

  // Remove specific event listeners
  offCommentAdded(callback: any) {
    if (this.socket) {
      this.socket.off('comment_added', callback);
    }
  }

  offCommentDeleted(callback: any) {
    if (this.socket) {
      this.socket.off('comment_deleted', callback);
    }
  }

  offReactionUpdated(callback: any) {
    if (this.socket) {
      this.socket.off('reaction_updated', callback);
    }
  }

  offReactionRemoved(callback: any) {
    if (this.socket) {
      this.socket.off('reaction_removed', callback);
    }
  }

  offUserTypingComment(callback: any) {
    if (this.socket) {
      this.socket.off('user_typing_comment', callback);
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