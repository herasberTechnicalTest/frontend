export interface ProfessionalDTO {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  servicesDescription: string;
  photoUrl: string;
  gallery: string[];
  rate: number;
  currency: string;
  countryName: string;
  cityName: string;
  districtName: string;
  mapsUrl: string;
  whatsappLink?: string;
}
