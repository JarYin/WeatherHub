export interface Location {
  id?: string;
  name: string;
  lat: number;
  lon: number;
  timezone: string;
  isActive?: boolean;
  isDefault?: boolean;
  createdAt?: Date;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  location?: Location
}