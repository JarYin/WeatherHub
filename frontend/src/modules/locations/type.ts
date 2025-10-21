export interface Location {
  id?: string;
  name: string;
  lat: number;
  lon: number;
  timezone: string;
  isActive?: boolean;
  isDefault?: boolean;
  createdAt?: Date;
}