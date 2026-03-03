// Order types
export type OrderStatus = 
  | 'NEW'              // 1. Đơn hàng mới
  | 'CONFIRMED'        // 2. Đã xác nhận
  | 'PREPARING'        // 3. Đang chuẩn bị hàng
  | 'SHIPPING'         // 4. Đang giao hàng
  | 'DELIVERED'        // 5. Đã giao thành công
  | 'CANCELLED'        // 6. Đã hủy
  | 'CANCEL_REQUESTED'; // Yêu cầu hủy đơn

export type PaymentMethod = 'COD' | 'E_WALLET' | 'BANK_TRANSFER';

export interface OrderItem {
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  note?: string;
}

export interface Order {
  id: string;
  userId: number;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  deliveredAt?: string;
  canCancel: boolean; // Chỉ cho phép hủy trong 30 phút
  cancelDeadline?: string;
}
