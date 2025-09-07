export type recipe = {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  cuisine: string;
  dietary: string[];
  ingredients: string[];
  instructions: string[];
  nutrition: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
};

export interface cart_item {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  imageHint?: string;
  extras?: string;
}

export type order_status = 'Ongoing' | 'Completed' | 'Cancelled';

export interface order {
    id: string;
    status: order_status;
    items: {
      name: string;
      image: string;
      hint: string;
    }[];
    price: string;
}

export type notification_type = 'success' | 'error' | 'info' | 'update';

export interface notification {
  id: string;
  type: notification_type;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  link?: {
    href: string;
    text: string;
  };
}

export interface grouped_notifications {
  [group: string]: notification[];
}

export interface promo_card_props {
  title: string;
  description: string;
  buttonText: string;
  imageUrl: string;
  imageHint: string;
  imagePosition: 'left' | 'right';
  href: string;
}
