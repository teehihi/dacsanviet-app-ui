import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { ApiService, formatImageUrl } from '../../services/api';

interface AccountScreenProps {
  navigation: any;
}

const AccountScreen: React.FC<AccountScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showCollapsedHeader, setShowCollapsedHeader] = useState(false);
  const [pointsBalance, setPointsBalance] = useState<number>(0);
  const [orderCounts, setOrderCounts] = useState({ pending: 0, shipping: 0, delivered: 0 });

  useEffect(() => {
    ApiService.getLoyaltyPoints().then(res => {
      if (res.success && res.data) setPointsBalance(res.data.current_balance);
    }).catch(() => {});

    ApiService.getUserOrders({ page: 1, limit: 100 }).then(res => {
      if (res.success && res.data) {
        const orders = res.data;
        setOrderCounts({
          pending: orders.filter((o: any) => ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(o.status)).length,
          shipping: orders.filter((o: any) => o.status === 'SHIPPING').length,
          delivered: orders.filter((o: any) => o.status === 'DELIVERED').length,
        });
      }
    }).catch(() => {});
  }, []);

  const getAvatarUrl = () => {
    if (user?.avatarUrl) {
      return formatImageUrl(user.avatarUrl);
    }
    return null;
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.logout();
              logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              // Even if API call fails, still logout locally
              logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            }
          },
        },
      ]
    );
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setShowCollapsedHeader(offsetY > 30);
      },
    }
  );

  const headerOpacity = scrollY.interpolate({
    inputRange: [30, 40],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });



  const MenuItem = ({ icon, title, onPress, badge }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIconWrap}>
          <Ionicons name={icon} size={20} color="#374151" />
        </View>
        <Text style={styles.menuItemText}>{title}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {badge && (
          <View style={styles.badgeWrap}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f59e0b" translucent={false} />
      
      {/* Fixed Back Button */}
      <View style={styles.fixedBackButton}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Collapsed Header - Appears on scroll */}
      {showCollapsedHeader && (
        <Animated.View style={[styles.collapsedHeader, { opacity: headerOpacity }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.collapsedBackButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.collapsedHeaderTitle}>{user?.fullName || user?.username}</Text>
        </Animated.View>
      )}

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Header Background */}
        <LinearGradient
          colors={['#FFF1B8', '#FFD38A', '#FFB55E', '#FFA24A']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.headerBackground}
        />


        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.userCardContent}>
            <View style={styles.userInfo}>
              {getAvatarUrl() ? (
                <Image source={{ uri: getAvatarUrl()! }} style={styles.cardAvatar} />
              ) : (
                <View style={styles.cardAvatarPlaceholder}>
                  <Ionicons name="person" size={24} color="#f59e0b" />
                </View>
              )}
              <Text style={styles.cardUserName}>{user?.fullName || user?.username}</Text>
            </View>
            <TouchableOpacity 
              style={styles.profileButtonCard}
              onPress={() => navigation.navigate('ProfileEdit')}
              activeOpacity={0.8}
            >
              <Text style={styles.profileButtonCardText}>Hồ sơ</Text>
            </TouchableOpacity>
          </View>

          {/* Mini Badges */}
          <View style={styles.miniBadges}>
            <View style={styles.miniBadge}>
              <MaterialCommunityIcons name="ticket-percent" size={20} color="#f59e0b" />
              <Text style={styles.miniBadgeText}>Quyền lợi hội viên</Text>
            </View>
            <View style={styles.miniBadge}>
              <MaterialCommunityIcons name="crown" size={20} color="#eab308" />
              <Text style={styles.miniBadgeText}>Theo dõi tiến độ</Text>
            </View>
          </View>
        </View>

        {/* Order Status Bar */}
        <View style={styles.orderStatusCard}>
          <View style={styles.orderStatusHeader}>
            <Text style={styles.orderStatusTitle}>Đơn hàng của tôi</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Orders', {
              screen: 'OrdersMain',
              params: { initialTab: 'ALL' },
            })} style={styles.orderStatusSeeAll}>
              <Text style={styles.orderStatusSeeAllText}>Xem tất cả</Text>
              <Ionicons name="chevron-forward" size={14} color="#16a34a" />
            </TouchableOpacity>
          </View>
          <View style={styles.orderStatusRow}>
            {[
              { icon: 'cube-outline', label: 'Chờ xác\nnhận', count: orderCounts.pending, tab: 'PENDING' },
              { icon: 'car-outline', label: 'Đang giao', count: orderCounts.shipping, tab: 'SHIPPING' },
              { icon: 'checkmark-circle-outline', label: 'Hoàn thành', count: orderCounts.delivered, tab: 'DELIVERED' },
              { icon: 'star-outline', label: 'Đánh giá', count: 0, tab: 'DELIVERED' },
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.orderStatusItem}
                onPress={() => navigation.navigate('Orders', {
                  screen: 'OrdersMain',
                  params: { initialTab: item.tab },
                })}
                activeOpacity={0.7}
              >
                <View style={styles.orderStatusIconWrap}>
                  <Ionicons name={item.icon as any} size={26} color="#16a34a" />
                  {item.count > 0 && (
                    <View style={styles.orderStatusBadge}>
                      <Text style={styles.orderStatusBadgeText}>{item.count}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.orderStatusLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tài khoản */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="heart-outline"
              title="Sản phẩm yêu thích"
              onPress={() => navigation.navigate('Favorites')}
            />
            <MenuItem
              icon="location-outline"
              title="Địa chỉ giao hàng"
              onPress={() => navigation.navigate('AddressList' as never)}
            />
            <MenuItem
              icon="card-outline"
              title="Phương thức thanh toán"
              onPress={() => {}}
            />
            <MenuItem
              icon="gift-outline"
              title="Ưu đãi của tôi"
              onPress={() => navigation.navigate('Coupons')}
            />
          </View>
        </View>

        {/* Cài đặt */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cài đặt</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="notifications-outline"
              title="Thông báo"
              onPress={() => navigation.navigate('Notifications' as never)}
            />
            <MenuItem
              icon="shield-checkmark-outline"
              title="Bảo mật"
              onPress={() => navigation.navigate('ChangePassword' as never)}
            />
            <MenuItem
              icon="settings-outline"
              title="Cài đặt"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Hỗ trợ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hỗ trợ</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="help-circle-outline"
              title="Trung tâm trợ giúp"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Đăng xuất */}
        <View style={styles.section}>
          <View style={styles.menuCard}>
            <TouchableOpacity
              style={styles.logoutItem}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.logoutIconWrap}>
                  <MaterialCommunityIcons name="logout" size={20} color="#dc2626" />
                </View>
                <Text style={styles.logoutText}>Đăng xuất</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#dc2626" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Version */}
        <View style={{ alignItems: 'center', paddingBottom: 100, paddingTop: 8 }}>
          <Text style={{ color: '#9ca3af', fontSize: 12 }}>Phiên bản 1.0.0</Text>
          <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>© 2026 DacSanViet. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  collapsedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 130,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  collapsedBackButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  collapsedHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerBackground: {
    backgroundColor: '#f59e0b',
    height: 190,
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  fixedBackButton: {
    position: 'absolute',
    top: 75,
    left: 16,
    zIndex: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },
  userCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -60,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  cardAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardUserName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  profileButtonCard: {
    backgroundColor: '#e0f2f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  profileButtonCardText: {
    color: '#00897b',
    fontSize: 14,
    fontWeight: '600',
  },
  miniBadges: {
    flexDirection: 'row',
    gap: 12,
  },
  miniBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  miniBadgeText: {
    fontSize: 12,
    color: '#92400e',
    marginLeft: 6,
    fontWeight: '500',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  menuCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  logoutText: {
    fontSize: 15,
    color: '#dc2626',
    marginLeft: 12,
    fontWeight: '500',
  },
  // Order status bar
  orderStatusCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  orderStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderStatusTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  orderStatusSeeAll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderStatusSeeAllText: {
    fontSize: 13,
    color: '#16a34a',
    fontWeight: '600',
    marginRight: 2,
  },
  orderStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  orderStatusItem: {
    alignItems: 'center',
    flex: 1,
  },
  orderStatusIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  orderStatusBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  orderStatusBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  orderStatusLabel: {
    fontSize: 11,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
  // Menu icon wrap
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeWrap: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginRight: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  logoutIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
});

export default AccountScreen;
