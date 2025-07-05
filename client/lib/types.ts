export interface User {
  _id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistMember {
  userId: User;
  email: string;
  displayName: string;
  role: 'member' | 'admin';
  joinedAt: string;
}

export interface Wishlist {
  _id: string;
  name: string;
  description?: string;
  ownerId: User;
  members: WishlistMember[];
  isPublic: boolean;
  color: string;
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  _id: string;
  wishlistId: string;
  name: string;
  description?: string;
  imageUrl: string;
  price?: number;
  currency: string;
  url?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'available' | 'claimed' | 'purchased';
  claimedBy?: User;
  addedBy: User;
  editedBy?: User;
  comments: Comment[];
  reactions: Reaction[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  user: User;
  text: string;
  createdAt: string;
}

export interface Reaction {
  _id: string;
  user: User;
  emoji: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
  error?: string;
  errors?: Array<{ field: string; message: string }>;
}