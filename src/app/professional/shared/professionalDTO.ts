export interface ProfessionalDTO {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  servicesDescription: string;
  photoUrl: string;      // ← NO null
  gallery: string[];
  rate: number;
  currency: string;
  countryName: string;
  cityName: string;
  districtName: string;
  mapsUrl: string;
  whatsappLink?: string;
}

export interface CreateProfessionalPayload {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  servicesDescription: string;
  photoUrl: string;      // ← NO null
  gallery: string[];
  rate: number;
  currency: string;
  countryName: string;
  cityName: string;
  districtName: string;
  mapsUrl: string;
  whatsappLink?: string;
}
