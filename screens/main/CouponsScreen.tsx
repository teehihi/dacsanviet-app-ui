import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { ApiService } from '../../services/api';

const CouponsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const initialTab = (route.params as any)?.initialTab ?? 'coupons';
  const [tab, setTab] = useState<'coupons' | 'points'>(initialTab);
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
    Alert.alert('Đã sao chép', `Mã: ${code}`);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('vi-VN');
  const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';

  const getDiscountLabel = (c: any) => {
    if (c.discount_type === 'PERCENT' || c.discount_type === 'percentage') {
      const max = c.max_discount_amount ? ` (tối đa ${formatPrice(c.max_discount_amount)})` : '';
      return `Giảm ${c.discount_value}%${max}`;
    }
    return `Giảm ${formatPrice(c.discount_value)}`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#16a34a', '#15803d']}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>Ưu đãi & Điểm thưởng</Text>
          </View>
          {/* Tabs */}
          <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 0 }}>
            {(['coupons', 'points'] as const).map((t) => (
              <TouchableOpacity key={t} onPress={() => setTab(t)}
                style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: tab === t ? 'white' : 'transparent' }}>
                <Text style={{ color: tab === t ? 'white' : 'rgba(255,255,255,0.6)', fontWeight: '600', fontSize: 14 }}>
                  {t === 'coupons' ? 'Mã giảm giá' : 'Điểm tích lũy'}
                </Text>
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
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={['#16a34a']} />}>

          {tab === 'coupons' ? (
            coupons.length === 0 ? (
              <View style={{ alignItems: 'center', paddingTop: 60 }}>
                <MaterialCommunityIcons name="ticket-percent-outline" size={64} color="#d1d5db" />
                <Text style={{ fontSize: 16, color: '#6b7280', marginTop: 16 }}>Chưa có mã giảm giá</Text>
                <Text style={{ fontSize: 13, color: '#9ca3af', marginTop: 8, textAlign: 'center' }}>Đánh giá sản phẩm để nhận mã giảm giá</Text>
              </View>
            ) : coupons.map((c, i) => (
              <View key={i} style={{ backgroundColor: 'white', borderRadius: 12, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
                <LinearGradient colors={['#16a34a', '#15803d']} style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ color: 'white', fontSize: 22, fontWeight: '800' }}>{c.code}</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 2 }}>{getDiscountLabel(c)}</Text>
                  </View>
                  <TouchableOpacity onPress={() => copyCode(c.code)}
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}>
                    <Text style={{ color: 'white', fontWeight: '600', fontSize: 13 }}>Sao chép</Text>
                  </TouchableOpacity>
                </LinearGradient>
                <View style={{ padding: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: '#6b7280' }}>
                    {c.min_order_amount > 0 ? `Đơn tối thiểu ${formatPrice(c.min_order_amount)}` : 'Không giới hạn đơn tối thiểu'}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#ef4444' }}>HSD: {formatDate(c.expires_at)}</Text>
                </View>
              </View>
            ))
          ) : (
            <>
              {/* Points balance card */}
              <LinearGradient colors={['#f59e0b', '#d97706']} style={{ borderRadius: 16, padding: 20, marginBottom: 16 }}>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Điểm tích lũy hiện tại</Text>
                <Text style={{ color: 'white', fontSize: 40, fontWeight: '800', marginTop: 4 }}>
                  {(pointsData?.current_balance || 0).toLocaleString()}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 }}>
                  Tổng tích lũy: {(pointsData?.total_points || 0).toLocaleString()} điểm
                </Text>
                <View style={{ marginTop: 12, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: 10 }}>
                  <Text style={{ color: 'white', fontSize: 12 }}>1.000 điểm = 1.000đ giảm giá khi thanh toán</Text>
                </View>
              </LinearGradient>

              {/* How to earn */}
              <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#1f2937', marginBottom: 12 }}>Cách tích điểm</Text>
                {[
                  { label: 'Đánh giá sản phẩm', points: '+500 điểm' },
                  { label: 'Mua hàng thành công', points: '+1đ/1.000đ' },
                ].map((item, i) => (
                  <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: '#f3f4f6' }}>
                    <Text style={{ fontSize: 14, color: '#374151' }}>{item.label}</Text>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#16a34a' }}>{item.points}</Text>
                  </View>
                ))}
              </View>

              {/* History */}
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#1f2937', marginBottom: 12 }}>Lịch sử điểm</Text>
              {history.length === 0 ? (
                <Text style={{ color: '#9ca3af', textAlign: 'center', paddingVertical: 24 }}>Chưa có lịch sử điểm</Text>
              ) : history.map((h, i) => (
                <View key={i} style={{ backgroundColor: 'white', borderRadius: 10, padding: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: '#1f2937' }}>{h.description}</Text>
                    <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{formatDate(h.created_at)}</Text>
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: h.points > 0 ? '#16a34a' : '#ef4444' }}>
                    {h.points > 0 ? '+' : ''}{h.points.toLocaleString()}
                  </Text>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default CouponsScreen;
