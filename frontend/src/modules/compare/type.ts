import { Location } from "../locations/type";

export type CompareLocation = {
    id: string;
    UserId: string;
    locationId: string;
    createdAt: string;
    updatedAt: string;
    location: Location[];
};