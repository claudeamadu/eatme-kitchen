
import { Timestamp } from 'firebase/firestore';

export interface food_size {
  name: string;
  price: number;
}

export interface food_extra {
  name:string;
  price: number;
  image: string; // Changed from optional to required
  hint?: string;
}

export type food_item = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  cuisine: string;
  dietary: string[];
  price: number; // Base price for non-customizable items
  isDeleted?: boolean;
  createdAt?: Timestamp;
  sizes?: food_size[];
  extras?: food_extra[];
};

export interface category {
    id: string;
    name: string;
    image: string;
}

export interface cart_item {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  imageHint?: string;
  extras?: string;
}

export type order_status = 'Pending' | 'Confirmed' | 'Ready' | 'Completed' | 'Cancelled';

export interface order {
    id: string;
    uid: string;
    items: cart_item[];
    total: number;
    status: order_status;
    createdAt: Timestamp;
}

export type notification_type = 'success' | 'error' | 'info' | 'update';

export interface notification {
  id: string;
  type: notification_type;
  title: string;
  description: string;
  isRead: boolean;
  createdAt: Timestamp;
  isGlobal?: boolean;
  uid?: string;
  link?: {
    href: string;
    text: string;
  };
}

export interface grouped_notifications {
  [group: string]: notification[];
}

export interface promo {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  imageUrl: string;
  imageHint: string;
  imagePosition: 'left' | 'right';
  href: string;
  discountType?: 'none' | 'fixed' | 'percentage';
  discountValue?: number;
}

export interface wallet {
  id: string;
  name: string;
  network: string;
  number: string;
  logo: string;
  logoHint: string;
}

export interface LoyaltyData {
  points: number;
  referrals: number;
  reviews: number;
  orders: number;
  orderedFoodIds?: string[];
  [key: string]: number | string[] | undefined;
}

export interface user {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  dob?: string;
  photoURL?: string;
}

export type reservation_status = 'Pending' | 'Confirmed' | 'Cancelled';

export interface reservation {
    id: string;
    uid: string;
    name: string;
    phone: string;
    date: string;
    time: string;
    guests: string;
    duration: string;
    occasion: string;
    specialInstructions: string;
    total: number;
    status: reservation_status;
    createdAt: Timestamp;
}

export interface reservation_config {
    ratePerHour: number;
    guestRates: {
        [key: string]: number;
    };
}

export interface review {
    id: string;
    uid: string;
    foodId: string;
    orderId: string;
    rating: number;
    text: string;
    createdAt: Timestamp;
    userDisplayName: string;
    userPhotoURL?: string;
}
