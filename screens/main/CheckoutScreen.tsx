import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useCartStore } from '../../store/cartStore';
import { useAddressStore } from '../../store/addressStore';
import { ApiService } from '../../services/api';

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { selectedAddress, loadAddresses } = useAddressStore();
  
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'E_WALLET' | 'BANK_TRANSFER'>('COD');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const subtotal = getTotalPrice();
  const shippingFee = 0; // Free shipping
  const discount = 0;
  const total = subtotal - discount + shippingFee;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Thông báo', 'Vui lòng chọn địa chỉ giao hàng');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          price: item.price,
          quantity: item.quantity,
        })),
        shippingAddress: selectedAddress,
        paymentMethod,
      };

      const response = await ApiService.createOrder(orderData);

      if (response.success && response.data) {
        await clearCart();

        Alert.alert(
          'Đặt hàng thành công!',
          `Mã đơn hàng: ${response.data.order.id}\nChúng tôi sẽ xác nhận đơn hàng trong vòng 30 phút.`,
          [
            {
              text: 'Xem đơn hàng',
              onPress: () => navigation.navigate('Orders' as never),
            },
          ]
        );
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể đặt hàng. Vui lòng thử lại.');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể đặt hàng. Vui lòng thử lại.');
      console.error('Place order error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#16a34a" />
      
      {/* Header */}
      <LinearGradient colors={['#16a34a', '#15803d']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Thanh toán</Text>
          </View>
          <View style={styles.backButton} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Shipping Address */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => navigation.navigate('AddressList' as never)}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color="#16a34a" />
            <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
          </View>
          
          {selectedAddress ? (
            <View style={styles.addressContent}>
              <View style={styles.addressInfo}>
                <View style={styles.addressRow}>
                  <Text style={styles.addressName}>{selectedAddress.fullName}</Text>
                </View>
                <Text style={styles.addressPhone}>{selectedAddress.phoneNumber}</Text>
                <Text style={styles.addressDetail}>
                  {selectedAddress.address}, {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.city}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" style={styles.addressChevron} />
            </View>
          ) : (
            <View style={styles.addressContent}>
              <Text style={styles.noAddress}>Chọn địa chỉ giao hàng</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" style={styles.addressChevron} />
            </View>
          )}
        </TouchableOpacity>

        {/* Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="package-variant" size={20} color="#16a34a" />
            <Text style={styles.sectionTitle}>Sản phẩm ({items.length})</Text>
          </View>
          
          {items.map((item) => (
            <View key={item.id} style={styles.productItem}>
              <Image
                source={{ uri: `https://picsum.photos/seed/${item.productId}/200/200` }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.productName}
                </Text>
                <Text style={styles.productQuantity}>x{item.quantity}</Text>
                <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
              </View>
              <Text style={styles.productTotal}>
                {formatPrice(item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        {/* Shipping Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="truck-delivery" size={20} color="#16a34a" />
            <Text style={styles.sectionTitle}>Phương thức vận chuyển</Text>
          </View>
          
          <TouchableOpacity style={styles.methodRow}>
            <View style={styles.methodLeft}>
              <Text style={styles.methodName}>Giao hàng tiêu chuẩn</Text>
              <Text style={styles.methodDesc}>Nhận hàng trong 3-5 ngày</Text>
            </View>
            <Text style={styles.methodPrice}>Miễn phí</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card" size={20} color="#16a34a" />
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'COD' && styles.paymentSelected]}
            onPress={() => setPaymentMethod('COD')}
          >
            <Ionicons
              name={paymentMethod === 'COD' ? 'radio-button-on' : 'radio-button-off'}
              size={24}
              color={paymentMethod === 'COD' ? '#16a34a' : '#9ca3af'}
            />
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>Thanh toán khi nhận hàng (COD)</Text>
              <Text style={styles.paymentDesc}>Thanh toán bằng tiền mặt khi nhận hàng</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 200 }} />
      </ScrollView>

      {/* Bottom Summary */}
      <View style={styles.bottomContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tạm tính:</Text>
          <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Phí vận chuyển:</Text>
          <Text style={styles.freeShipping}>Miễn phí</Text>
        </View>

        {discount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Giảm giá:</Text>
            <Text style={styles.discountValue}>-{formatPrice(discount)}</Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng cộng:</Text>
          <Text style={styles.totalValue}>{formatPrice(total)}</Text>
        </View>

        <TouchableOpacity
          style={styles.orderButton}
          onPress={handlePlaceOrder}
          disabled={isSubmitting || !selectedAddress}
        >
          <LinearGradient
            colors={isSubmitting || !selectedAddress ? ['#9ca3af', '#6b7280'] : ['#16a34a', '#15803d']}
            style={styles.orderGradient}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.orderText}>Đặt hàng</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 200,
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 8,
    position: 'relative',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  addressContent: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'flex-start',
  },
  addressInfo: {
    flex: 1,
    paddingRight: 8,
  },
  addressRow: {
    marginBottom: 4,
  },
  addressName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  addressPhone: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 4,
  },
  addressDetail: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  noAddress: {
    flex: 1,
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  addressChevron: {
    marginTop: 4,
  },
  productItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  productQuantity: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  productTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
  },
  methodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  methodLeft: {
    flex: 1,
  },
  methodName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  methodDesc: {
    fontSize: 13,
    color: '#6b7280',
  },
  methodPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#16a34a',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 8,
  },
  paymentSelected: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  paymentInfo: {
    marginLeft: 12,
    flex: 1,
  },
  paymentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  paymentDesc: {
    fontSize: 13,
    color: '#6b7280',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20, // Giảm padding vì không có tab bar
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  freeShipping: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  discountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#16a34a',
  },
  orderButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  orderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  orderText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});

export default CheckoutScreen;
