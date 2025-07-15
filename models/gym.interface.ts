import {Timestamps} from "./timestamps";

export interface Gym extends Timestamps {
    _id: string;
    name: string;
    capacity: number;
    equipments: string[];
    installations: string[];
    activities: string[];
    openingHours: {
        start: string;
        end: string;
    };
    pricing: number;
    address: {
        street: string;
        city: string;
        postalCode: string;
        country: string;
    };
    coachCount: number;
    contact: {
        phone: string;
        email: string;
        website: string;
    };
}