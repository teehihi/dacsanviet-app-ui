// API địa giới hành chính Việt Nam
const BASE_URL = 'https://provinces.open-api.vn/api';

export interface Province {
  code: number;
  name: string;
  division_type: string;
  codename: string;
  phone_code: number;
}

export interface District {
  code: number;
  name: string;
  division_type: string;
  codename: string;
  province_code: number;
}

export interface Ward {
  code: number;
  name: string;
  division_type: string;
  codename: string;
  district_code: number;
}

export interface ProvinceDetail extends Province {
  districts: District[];
}

export interface DistrictDetail extends District {
  wards: Ward[];
}

export const LocationApi = {
  // Lấy danh sách tỉnh/thành phố
  getProvinces: async (): Promise<Province[]> => {
    try {
      const response = await fetch(`${BASE_URL}/p/`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching provinces:', error);
      return [];
    }
  },

  // Lấy chi tiết tỉnh/thành phố kèm danh sách quận/huyện
  getProvinceDetail: async (provinceCode: number): Promise<ProvinceDetail | null> => {
    try {
      const response = await fetch(`${BASE_URL}/p/${provinceCode}?depth=2`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching province detail:', error);
      return null;
    }
  },

  // Lấy chi tiết quận/huyện kèm danh sách phường/xã
  getDistrictDetail: async (districtCode: number): Promise<DistrictDetail | null> => {
    try {
      const response = await fetch(`${BASE_URL}/d/${districtCode}?depth=2`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching district detail:', error);
      return null;
    }
  },
};
