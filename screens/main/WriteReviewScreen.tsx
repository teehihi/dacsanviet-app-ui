import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, StatusBar, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ApiService, getProductImage } from '../../services/api';

interface ReviewItem {
  productId: number;
  productName: string;
  productImage: string;
  category?: string;
}

const StarRating = ({ rating, onChange }: { rating: number; onChange: (r: number) => void }) => (
  <View style={{ flexDirection: 'row', gap: 8 }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity key={star} onPress={() => onChange(star)}>
        <Ionicons name={star <= rating ? 'star' : 'star-outline'} size={36} color={star <= rating ? '#fbbf24' : '#d1d5db'} />
      </TouchableOpacity>
    ))}
  </View>
);

const STAR_LABELS = ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Rất tốt'];

const WriteReviewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as {
    orderId: number;
    // Single product (legacy)
    productId?: number; productName?: string; productImage?: string; category?: string;
    // Multi product
    items?: ReviewItem[];
  };

  // Normalize to items array
  const items: ReviewItem[] = params.items || (params.productId ? [{
    productId: params.productId,
    productName: params.productName || '',
    productImage: params.productImage || '',
    category: params.category,
  }] : []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviews, setReviews] = useState<{ rating: number; comment: string }[]>(
    items.map(() => ({ rating: 5, comment: '' }))
  );
  const [submitting, setSubmitting] = useState(false);
  const [totalReward, setTotalReward] = useState<{ points: number; coupons: string[] } | null>(null);

  const current = items[currentIndex];
  const currentReview = reviews[currentIndex];
  const isLast = currentIndex === items.length - 1;

  const updateReview = (field: 'rating' | 'comment', value: any) => {
    setReviews(prev => prev.map((r, i) => i === currentIndex ? { ...r, [field]: value } : r));
  };

  const handleNext = () => {
    if (!currentReview.comment.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nhận xét');
      return;
    }
    if (currentIndex < items.length - 1) {
      setCurrentIndex(i => i + 1);
    }
  };

  const handleSubmit = async () => {
    if (!currentReview.comment.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nhận xét');
      return;
    }
    setSubmitting(true);
    try {
      let totalPoints = 0;
      const coupons: string[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const review = reviews[i];
        if (!review.comment.trim()) continue;

        const res = await ApiService.createReview({
          productId: item.productId,
          orderId: params.orderId,
          rating: review.rating,
          comment: review.comment,
        });

        if (res.success && res.data?.reward) {
          totalPoints += res.data.reward.points || 0;
          if (res.data.reward.couponCode) coupons.push(res.data.reward.couponCode);
        }
      }

      const rewardMsg = totalPoints > 0
        ? `🎁 Bạn nhận được:\n• +${totalPoints} điểm tích lũy${coupons.length > 0 ? `\n• Mã giảm giá: ${coupons.join(', ')}` : ''}`
        : 'Cảm ơn bạn đã đánh giá!';

      Alert.alert('🎉 Đánh giá thành công!', rewardMsg, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch {
      Alert.alert('Lỗi', 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#6b7280' }}>Không có sản phẩm để đánh giá</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#16a34a', '#15803d']}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>Đánh giá sản phẩm</Text>
              {items.length > 1 && (
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 }}>
                  {currentIndex + 1}/{items.length} sản phẩm
                </Text>
              )}
            </View>
          </View>

          {/* Progress dots for multi-product */}
          {items.length > 1 && (
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, paddingBottom: 12 }}>
              {items.map((_, i) => (
                <View key={i} style={{
                  width: i === currentIndex ? 20 : 8, height: 8, borderRadius: 4,
                  backgroundColor: i <= currentIndex ? 'white' : 'rgba(255,255,255,0.4)',
                }} />
              ))}
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Product info */}
        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Image
            source={{ uri: getProductImage(current.productImage, current.category || '', current.productName, current.productId) }}
            style={{ width: 64, height: 64, borderRadius: 8, backgroundColor: '#f3f4f6' }}
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#1f2937' }} numberOfLines={2}>{current.productName}</Text>
            {items.length > 1 && (
              <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Sản phẩm {currentIndex + 1}/{items.length}</Text>
            )}
          </View>
        </View>

        {/* Rating */}
        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 16 }}>Chất lượng sản phẩm</Text>
          <StarRating rating={currentReview.rating} onChange={(r) => updateReview('rating', r)} />
          <Text style={{ marginTop: 8, color: '#6b7280', fontSize: 14 }}>{STAR_LABELS[currentReview.rating]}</Text>
        </View>

        {/* Comment */}
        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>Nhận xét của bạn</Text>
          <TextInput
            value={currentReview.comment}
            onChangeText={(v) => updateReview('comment', v)}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            multiline
            numberOfLines={5}
            style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, fontSize: 14, color: '#1f2937', minHeight: 120, textAlignVertical: 'top' }}
          />
          <Text style={{ fontSize: 12, color: currentReview.comment.trim().length >= 5 ? '#16a34a' : '#9ca3af', marginTop: 6, textAlign: 'right' }}>
            {currentReview.comment.trim().length} ký tự {currentReview.comment.trim().length >= 5 ? '✓' : '(tối thiểu 5)'}
          </Text>
        </View>

        {/* Reward info */}
        <View style={{ backgroundColor: '#f0fdf4', borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#bbf7d0' }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#16a34a', marginBottom: 8 }}>🎁 Phần thưởng khi đánh giá</Text>
          <Text style={{ fontSize: 13, color: '#15803d' }}>• +50 điểm tích lũy / sản phẩm</Text>
          <Text style={{ fontSize: 13, color: '#15803d', marginTop: 4 }}>• Mã giảm giá 10% (tối đa 50.000đ)</Text>
        </View>

        {/* Buttons */}
        {!isLast ? (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={handleNext}
              style={{ flex: 1, backgroundColor: '#16a34a', borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}
            >
              <Text style={{ color: 'white', fontSize: 15, fontWeight: '700' }}>Tiếp theo →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={handleSubmit} disabled={submitting} style={{ borderRadius: 12, overflow: 'hidden' }}>
            <LinearGradient
              colors={submitting ? ['#9ca3af', '#6b7280'] : ['#16a34a', '#15803d']}
              style={{ paddingVertical: 16, alignItems: 'center' }}
            >
              {submitting ? <ActivityIndicator color="white" /> : (
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
                  {items.length > 1 ? `Gửi tất cả ${items.length} đánh giá` : 'Gửi đánh giá'}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

export default WriteReviewScreen;
