import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  StyleSheet,
  Modal,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { LocationApi, Province, District, Ward } from '../../services/locationApi';
import { useAddressStore } from '../../store/addressStore';

const AddAddressScreen = () => {
  const navigation = useNavigation();
  const { addAddress } = useAddressStore();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Location states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);

  // Modal states
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showWardModal, setShowWardModal] = useState(false);

  useEffect(() => {
    loadProvinces();
  }, []);

  const loadProvinces = async () => {
    const data = await LocationApi.getProvinces();
    setProvinces(data);
  };

  const handleProvinceSelect = async (province: Province) => {
    setSelectedProvince(province);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistricts([]);
    setWards([]);
    setShowProvinceModal(false);

    const provinceDetail = await LocationApi.getProvinceDetail(province.code);
    if (provinceDetail) {
      setDistricts(provinceDetail.districts);
    }
  };

  const handleDistrictSelect = async (district: District) => {
    setSelectedDistrict(district);
    setSelectedWard(null);
    setWards([]);
    setShowDistrictModal(false);

    const districtDetail = await LocationApi.getDistrictDetail(district.code);
    if (districtDetail) {
      setWards(districtDetail.wards);
    }
  };

  const handleWardSelect = (ward: Ward) => {
    setSelectedWard(ward);
    setShowWardModal(false);
  };

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Vui lòng cấp quyền truy cập vị trí');
        setIsLoadingLocation(false);
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Reverse geocoding
      const [geocode] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode) {
        console.log('Geocode result:', geocode);
        
        // Set street address
        const streetAddress = [
          geocode.streetNumber,
          geocode.street,
        ].filter(Boolean).join(' ');
        
        if (streetAddress) {
          setAddress(streetAddress);
        }

        // Helper function for fuzzy matching with normalization
        const normalizeText = (text: string): string => {
          return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
            .replace(/^(tp\.|thanh pho|tinh|quan|huyen|thi xa|phuong|xa|thi tran|p\.|x\.)\s*/gi, '') // Remove prefixes
            .trim();
        };

        const fuzzyMatch = (str1: string, str2: string): boolean => {
          const s1 = normalizeText(str1);
          const s2 = normalizeText(str2);
          return s1.includes(s2) || s2.includes(s1) || s1 === s2;
        };

        // Try to match city/province
        if (geocode.city || geocode.region) {
          const cityName = geocode.city || geocode.region || '';
          const matchedProvince = provinces.find(p => fuzzyMatch(p.name, cityName));

          if (matchedProvince) {
            await handleProvinceSelect(matchedProvince);
            
            // Try to match district (subregion = Quận/Huyện)
            const districtName = geocode.subregion || '';
            if (districtName) {
              const provinceDetail = await LocationApi.getProvinceDetail(matchedProvince.code);
              if (provinceDetail && provinceDetail.districts) {
                const matchedDistrict = provinceDetail.districts.find(d => fuzzyMatch(d.name, districtName));
                
                if (matchedDistrict) {
                  await handleDistrictSelect(matchedDistrict);
                  
                  // Try to match ward (district field from geocode = Phường/Xã)
                  const wardName = geocode.district || '';
                  if (wardName) {
                    const districtDetail = await LocationApi.getDistrictDetail(matchedDistrict.code);
                    if (districtDetail && districtDetail.wards) {
                      const matchedWard = districtDetail.wards.find(w => fuzzyMatch(w.name, wardName));
                      
                      if (matchedWard) {
                        handleWardSelect(matchedWard);
                      }
                    }
                  }
                }
              }
            }
          }
        }

        Alert.alert(
          'Thành công', 
          'Đã lấy vị trí hiện tại.\n\nVui lòng kiểm tra và chọn lại Quận/Huyện, Phường/Xã nếu cần.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại. Vui lòng thử lại.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const validateForm = () => {
    if (!fullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ tên');
      return false;
    }
    if (!phoneNumber.trim() || !/^[0-9]{10}$/.test(phoneNumber)) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại hợp lệ (10 số)');
      return false;
    }
    if (!address.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ cụ thể');
      return false;
    }
    if (!selectedProvince || !selectedDistrict || !selectedWard) {
      Alert.alert('Lỗi', 'Vui lòng chọn đầy đủ Tỉnh/Thành phố, Quận/Huyện, Phường/Xã');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    await addAddress({
      fullName,
      phoneNumber,
      address,
      ward: selectedWard!.name,
      district: selectedDistrict!.name,
      city: selectedProvince!.name,
      isDefault,
    });

    Alert.alert('Thành công', 'Đã thêm địa chỉ mới', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
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
            <Text style={styles.headerTitle}>Thêm địa chỉ mới</Text>
          </View>
          <View style={styles.backButton} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          {/* Use Current Location Button */}
          <TouchableOpacity
            style={styles.locationButton}
            onPress={getCurrentLocation}
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? (
              <ActivityIndicator size="small" color="#16a34a" />
            ) : (
              <Ionicons name="location" size={20} color="#16a34a" />
            )}
            <Text style={styles.locationButtonText}>
              {isLoadingLocation ? 'Đang lấy vị trí...' : 'Sử dụng vị trí hiện tại'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Họ và tên</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập họ và tên"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập số điện thoại"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            maxLength={10}
          />

          <Text style={styles.label}>Tỉnh/Thành phố</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowProvinceModal(true)}
          >
            <Text style={selectedProvince ? styles.pickerText : styles.pickerPlaceholder}>
              {selectedProvince ? selectedProvince.name : 'Chọn Tỉnh/Thành phố'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <Text style={styles.label}>Quận/Huyện</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => {
              if (!selectedProvince) {
                Alert.alert('Thông báo', 'Vui lòng chọn Tỉnh/Thành phố trước');
                return;
              }
              setShowDistrictModal(true);
            }}
            disabled={!selectedProvince}
          >
            <Text style={selectedDistrict ? styles.pickerText : styles.pickerPlaceholder}>
              {selectedDistrict ? selectedDistrict.name : 'Chọn Quận/Huyện'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <Text style={styles.label}>Phường/Xã</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => {
              if (!selectedDistrict) {
                Alert.alert('Thông báo', 'Vui lòng chọn Quận/Huyện trước');
                return;
              }
              setShowWardModal(true);
            }}
            disabled={!selectedDistrict}
          >
            <Text style={selectedWard ? styles.pickerText : styles.pickerPlaceholder}>
              {selectedWard ? selectedWard.name : 'Chọn Phường/Xã'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <Text style={styles.label}>Địa chỉ cụ thể</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Số nhà, tên đường..."
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
          />

          <View style={styles.defaultRow}>
            <Text style={styles.defaultLabel}>Đặt làm địa chỉ mặc định</Text>
            <Switch
              value={isDefault}
              onValueChange={setIsDefault}
              trackColor={{ false: '#d1d5db', true: '#86efac' }}
              thumbColor={isDefault ? '#16a34a' : '#f3f4f6'}
            />
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <LinearGradient colors={['#16a34a', '#15803d']} style={styles.saveGradient}>
            <Text style={styles.saveText}>Lưu địa chỉ</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <Modal
        visible={showProvinceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProvinceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn Tỉnh/Thành phố</Text>
              <TouchableOpacity onPress={() => setShowProvinceModal(false)}>
                <Ionicons name="close" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {provinces.map((province) => (
                <TouchableOpacity
                  key={province.code}
                  style={styles.modalItem}
                  onPress={() => handleProvinceSelect(province)}
                >
                  <Text style={styles.modalItemText}>{province.name}</Text>
                  {selectedProvince?.code === province.code && (
                    <Ionicons name="checkmark" size={20} color="#16a34a" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showDistrictModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDistrictModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn Quận/Huyện</Text>
              <TouchableOpacity onPress={() => setShowDistrictModal(false)}>
                <Ionicons name="close" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {districts.map((district) => (
                <TouchableOpacity
                  key={district.code}
                  style={styles.modalItem}
                  onPress={() => handleDistrictSelect(district)}
                >
                  <Text style={styles.modalItemText}>{district.name}</Text>
                  {selectedDistrict?.code === district.code && (
                    <Ionicons name="checkmark" size={20} color="#16a34a" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showWardModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWardModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn Phường/Xã</Text>
              <TouchableOpacity onPress={() => setShowWardModal(false)}>
                <Ionicons name="close" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {wards.map((ward) => (
                <TouchableOpacity
                  key={ward.code}
                  style={styles.modalItem}
                  onPress={() => handleWardSelect(ward)}
                >
                  <Text style={styles.modalItemText}>{ward.name}</Text>
                  {selectedWard?.code === ward.code && (
                    <Ionicons name="checkmark" size={20} color="#16a34a" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#16a34a',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 8,
  },
  locationButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#16a34a',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1f2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  pickerText: {
    fontSize: 15,
    color: '#1f2937',
  },
  pickerPlaceholder: {
    fontSize: 15,
    color: '#9ca3af',
  },
  defaultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  defaultLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  footer: {
    backgroundColor: 'white',
    padding: 16,
    paddingBottom: 48,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  saveButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  saveGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalItemText: {
    fontSize: 16,
    color: '#1f2937',
  },
});

export default AddAddressScreen;
