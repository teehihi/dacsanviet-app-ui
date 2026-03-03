// Cart types
export interface CartItem {
  id: string;
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  category: string;
  addedAt: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  updatedAt: string;
}
