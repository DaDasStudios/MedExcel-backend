
export interface ISubscription {
    name: string;
    description: string;
    price: number;
    points: number;
}

export interface IDateSubscription extends ISubscription {
    createdAt: Date
    updatedAt: Date
}

