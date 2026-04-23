import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  StatusBar, RefreshControl, Alert, Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { ApiService } from '../../services/api';

const EARN_METHODS = [
  { icon: 'receipt-outline', label: 'Hoàn thành đơn hàng', points: '+100–500', color: '#16a34a' },
  { icon: 'star-outline', label: 'Đánh giá sản phẩm', points: '+50', color: '#f59e0b' },
  { icon: 'gift-outline', label: 'Mời bạn bè', points: '+200', color: '#8b5cf6' },
];

const HISTORY_ICONS: Record<string, { icon: string; color: string }> = {
  EARN_ORDER:   { icon: 'receipt-outline',        color: '#16a34a' },
  EARN_REVIEW:  { icon: 'star-outline',            color: '#f59e0b' },
  SPEND_ORDER:  { icon: 'cart-outline',            color: '#ef4444' },
  REFUND_ORDER: { icon: 'refresh-outline',         color: '#3b82f6' },
  default:      { icon: 'ellipse-outline',         color: '#9ca3af' },
};

const CouponsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const initialTab = (route.params as any)?.initialTab ?? 'coupons';
  const [tab, setTab] = useState<'coupons' | 'points'>(initialTab);
  const [couponFilter, setCouponFilter] = useState<'all' | 'valid' | 'expiring' | 'expired'>('all');
  const [coupons, setCoupons] = useState<any[]>([]);
  const [pointsData, setPointsData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [cRes, pRes, hRes] = await Promise.all([
        ApiService.getMyCoupons(),
        ApiService.getLoyaltyPoints(),
        ApiService.getPointsHistory(),
      ]);
      if (cRes.success) setCoupons(cRes.data || []);
      if (pRes.success) setPointsData(pRes.data);
      if (hRes.success) setHistory(hRes.data || []);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const copyCode = (code: string) => {
    Clipboard.setString(code);
    Alert.alert('Đã sao chép', `Mã: ${code}`);
  };

  const formatDate = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatPrice = (p: number) => {
    if (p >= 1000000) return (p / 1000000).toFixed(p % 1000000 === 0 ? 0 : 1) + 'M';
    if (p >= 1000) return Math.round(p / 1000) + 'K';
    return p + 'đ';
  };

  const isExpired = (c: any) => c.expires_at && new Date(c.expires_at) < new Date();
  const isExpiring = (c: any) => {
    if (!c.expires_at || isExpired(c)) return false;
    const days = (new Date(c.expires_at).getTime() - Date.now()) / 86400000;
    return days <= 7;
  };

  const filteredCoupons = coupons.filter(c => {
    if (couponFilter === 'valid') return !isExpired(c) && !isExpiring(c);
    if (couponFilter === 'expiring') return isExpiring(c);
    if (couponFilter === 'expired') return isExpired(c);
    return true;
  });

  const validCount = coupons.filter(c => !isExpired(c)).length;
  const expiringCount = coupons.filter(c => isExpiring(c)).length;
  const expiredCount = coupons.filter(c => isExpired(c)).length;

  const getDiscountBadge = (c: any) => {
    if (c.discount_type === 'PERCENT' || c.discount_type === 'PERCENTAGE') return `${c.discount_value}%`;
    return formatPrice(Number(c.discount_value));
  };

  const getDiscountDesc = (c: any) => {
    const type = c.discount_type === 'PERCENT' || c.discount_type === 'PERCENTAGE' ? 'PERCENT' : 'FIXED';
    if (type === 'PERCENT') {
      const max = c.max_discount_amount ? ` - Tối đa ${formatPrice(Number(c.max_discount_amount))}` : '';
      return `Giảm ${c.discount_value}%${max}`;
    }
    return `Giảm ${formatPrice(Number(c.discount_value))} đơn hàng`;
  };

  const getCouponGradient = (c: any, idx: number): [string, string] => {
    const palettes: [string, string][] = [
      ['#16a34a', '#15803d'],
      ['#3b82f6', '#2563eb'],
      ['#8b5cf6', '#7c3aed'],
      ['#f59e0b', '#d97706'],
      ['#ef4444', '#dc2626'],
    ];
    if (isExpired(c)) return ['#9ca3af', '#6b7280'];
    return palettes[idx % palettes.length];
  };

  const balance = pointsData?.current_balance ?? pointsData?.balance ?? 0;
  const PLATINUM_THRESHOLD = 2000;
  const progress = Math.min(balance / PLATINUM_THRESHOLD, 1);

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={['#16a34a', '#15803d']}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          {/* Stats row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', flex: 1 }}>Ưu đãi của tôi</Text>
          </View>

          {tab === 'coupons' && (
            <View style={{ flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, gap: 10 }}>
              {[
                { label: 'Khả dụng', value: validCount },
                { label: 'Sắp hết hạn', value: expiringCount },
                { label: 'Đã hết hạn', value: expiredCount },
              ].map((s, i) => (
                <View key={i} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 12, alignItems: 'center' }}>
                  <Text style={{ color: 'white', fontSize: 22, fontWeight: '800' }}>{s.value}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2 }}>{s.label}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Tabs */}
          <View style={{ flexDirection: 'row', paddingHorizontal: 16 }}>
            {(['coupons', 'points'] as const).map((t) => (
              <TouchableOpacity key={t} onPress={() => setTab(t)}
                style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: tab === t ? 'white' : 'transparent' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name={t === 'coupons' ? 'ticket-outline' : 'star-outline'} size={15} color={tab === t ? 'white' : 'rgba(255,255,255,0.6)'} />
                  <Text style={{ color: tab === t ? 'white' : 'rgba(255,255,255,0.6)', fontWeight: '600', fontSize: 14 }}>
                    {t === 'coupons' ? 'Mã giảm giá' : 'Điểm thưởng'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </LinearGradient>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={['#16a34a']} />}>

          {tab === 'coupons' ? (
            <View style={{ padding: 16 }}>
              {/* Filter chips */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {([
                  { key: 'all', label: `Tất cả ${coupons.length}` },
                  { key: 'valid', label: `Khả dụng ${validCount}` },
                  { key: 'expiring', label: `Sắp hết hạn ${expiringCount}` },
                  { key: 'expired', label: `Đã hết hạn ${expiredCount}` },
                ] as const).map((f) => (
                  <TouchableOpacity key={f.key} onPress={() => setCouponFilter(f.key)}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginRight: 8,
                      backgroundColor: couponFilter === f.key ? '#16a34a' : 'white',
                      borderWidth: 1, borderColor: couponFilter === f.key ? '#16a34a' : '#e5e7eb',
                    }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: couponFilter === f.key ? 'white' : '#6b7280' }}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {filteredCoupons.length === 0 ? (
                <View style={{ alignItems: 'center', paddingTop: 60 }}>
                  <MaterialCommunityIcons name="ticket-percent-outline" size={64} color="#d1d5db" />
                  <Text style={{ fontSize: 16, color: '#6b7280', marginTop: 16 }}>Không có mã nào</Text>
                </View>
              ) : filteredCoupons.map((c, i) => {
                const expired = isExpired(c);
                const expiring = isExpiring(c);
                const gradient = getCouponGradient(c, i);
                const daysLeft = c.expires_at ? Math.ceil((new Date(c.expires_at).getTime() - Date.now()) / 86400000) : null;

                return (
                  <View key={i} style={{
                    backgroundColor: 'white', borderRadius: 16, marginBottom: 14,
                    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
                    borderWidth: 1.5, borderColor: '#e5e7eb', borderStyle: 'dashed',
                  }}>
                    {/* Top gradient section */}
                    <LinearGradient colors={gradient} style={{ padding: 16, borderTopLeftRadius: 14, borderTopRightRadius: 14 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                              <Text style={{ color: 'white', fontSize: 11, fontWeight: '600' }}>
                                {c.source === 'REVIEW_REWARD' ? 'Đánh giá' : c.source === 'SYSTEM' ? 'Hệ thống' : 'Ưu đãi'}
                              </Text>
                            </View>
                          </View>
                          <Text style={{ color: 'white', fontSize: 18, fontWeight: '800' }}>{getDiscountDesc(c)}</Text>
                          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 }}>
                            {c.description || (c.min_order_amount > 0 ? `Áp dụng cho đơn từ ${formatPrice(Number(c.min_order_amount))}` : 'Áp dụng cho tất cả sản phẩm')}
                          </Text>
                        </View>
                        <View style={{ backgroundColor: 'white', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginLeft: 12 }}>
                          <Text style={{ color: gradient[0], fontSize: 20, fontWeight: '900' }}>{getDiscountBadge(c)}</Text>
                        </View>
                      </View>
                    </LinearGradient>

                    {/* Scalloped divider — circles trắng đè lên gradient */}
                    <View style={{ height: 12, position: 'relative' }}>
                      <View style={{ position: 'absolute', top: -10, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
                        {Array.from({ length: 14 }).map((_, i) => (
                          <View key={i} style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: 'white' }} />
                        ))}
                      </View>
                    </View>

                    {/* Bottom section */}
                    <View style={{ padding: 14 }}>
                      {/* Code row */}
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Ionicons name="pricetag-outline" size={14} color={gradient[0]} />
                          <Text style={{ fontSize: 15, fontWeight: '800', color: gradient[0], letterSpacing: 1 }}>{c.code}</Text>
                        </View>
                        <TouchableOpacity onPress={() => copyCode(c.code)}
                          style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
                          <Ionicons name="copy-outline" size={13} color="#6b7280" />
                          <Text style={{ fontSize: 12, color: '#6b7280', fontWeight: '600' }}>Sao chép</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Info row */}
                      <View style={{ flexDirection: 'row', gap: 16, marginBottom: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="cart-outline" size={13} color="#9ca3af" />
                          <Text style={{ fontSize: 12, color: '#6b7280' }}>
                            Đơn tối thiểu: {c.min_order_amount > 0 ? formatPrice(Number(c.min_order_amount)) : 'Không yêu cầu'}
                          </Text>
                        </View>
                        {c.expires_at && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Ionicons name="time-outline" size={13} color="#9ca3af" />
                            <Text style={{ fontSize: 12, color: '#6b7280' }}>Hết hạn: {formatDate(c.expires_at)}</Text>
                          </View>
                        )}
                      </View>

                      {/* Status bar */}
                      {expired ? (
                        <View style={{ backgroundColor: '#f3f4f6', borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}>
                          <Text style={{ color: '#9ca3af', fontSize: 13, fontWeight: '600' }}>Đã hết hạn</Text>
                        </View>
                      ) : expiring && daysLeft !== null ? (
                        <View style={{ backgroundColor: '#fff7ed', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Ionicons name="warning-outline" size={14} color="#f97316" />
                          <Text style={{ color: '#f97316', fontSize: 12, fontWeight: '600' }}>
                            Sắp hết hạn · Còn {daysLeft} ngày
                          </Text>
                        </View>
                      ) : (
                        <View style={{ backgroundColor: '#f0fdf4', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Ionicons name="checkmark-circle-outline" size={14} color="#16a34a" />
                          <Text style={{ color: '#16a34a', fontSize: 12, fontWeight: '600' }}>Đang hoạt động</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={{ padding: 16 }}>
              {/* Points balance card */}
              <LinearGradient colors={['#f59e0b', '#d97706']} style={{ borderRadius: 20, padding: 20, marginBottom: 16 }}>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '500' }}>Điểm tích lũy</Text>
                <Text style={{ color: 'white', fontSize: 42, fontWeight: '900', marginTop: 2 }}>
                  {balance.toLocaleString('vi-VN')} <Text style={{ fontSize: 20, fontWeight: '600' }}>điểm</Text>
                </Text>

                {/* Progress bar */}
                <View style={{ marginTop: 12 }}>
                  <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3 }}>
                    <View style={{ height: 6, width: `${progress * 100}%`, backgroundColor: 'white', borderRadius: 3 }} />
                  </View>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 6 }}>
                    Còn {Math.max(0, PLATINUM_THRESHOLD - balance).toLocaleString()} điểm để lên hạng Platinum
                  </Text>
                </View>

                <View style={{ marginTop: 14, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="information-circle-outline" size={16} color="white" />
                  <Text style={{ color: 'white', fontSize: 12 }}>1.000 điểm = 1.000đ giảm giá khi thanh toán</Text>
                </View>
              </LinearGradient>

              {/* How to earn */}
              <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#1f2937', marginBottom: 14 }}>Cách nhận điểm</Text>
                {EARN_METHODS.map((m, i) => (
                  <View key={i} style={{
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    paddingVertical: 10, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: '#f3f4f6',
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: m.color + '15', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name={m.icon as any} size={18} color={m.color} />
                      </View>
                      <Text style={{ fontSize: 14, color: '#374151', fontWeight: '500' }}>{m.label}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={{ backgroundColor: m.color + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                        <Text style={{ color: m.color, fontWeight: '700', fontSize: 13 }}>{m.points}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
                    </View>
                  </View>
                ))}
              </View>

              {/* History */}
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#1f2937', marginBottom: 12 }}>Lịch sử điểm</Text>
              {history.length === 0 ? (
                <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 32, alignItems: 'center' }}>
                  <Ionicons name="time-outline" size={48} color="#d1d5db" />
                  <Text style={{ color: '#9ca3af', marginTop: 12, fontSize: 14 }}>Chưa có lịch sử điểm</Text>
                </View>
              ) : history.map((h, i) => {
                const cfg = HISTORY_ICONS[h.type] || HISTORY_ICONS.default;
                const isPositive = h.points > 0;
                return (
                  <View key={i} style={{
                    backgroundColor: 'white', borderRadius: 12, padding: 14, marginBottom: 8,
                    flexDirection: 'row', alignItems: 'center', gap: 12,
                  }}>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: cfg.color + '15', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name={cfg.icon as any} size={20} color={cfg.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937' }}>{h.description}</Text>
                      <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{formatDate(h.created_at)}</Text>
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: isPositive ? '#16a34a' : '#ef4444' }}>
                      {isPositive ? '+' : ''}{Number(h.points).toLocaleString('vi-VN')}
                    </Text>
                  </View>
                );
              })}
              <View style={{ height: 24 }} />
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default CouponsScreen;
