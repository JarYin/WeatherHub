export interface Location {
    id: string;
    userId?: string;
    name: string;
    lat: number;
    lon: number;
    timezone: string;
    isActive: boolean;
    isDefault: boolean;
    createdAt: Date;
}