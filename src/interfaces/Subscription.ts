
export interface ISubscription {
    name: string;
    description: string;
    price: number;
    days: number;
}

export interface IDateSubscription extends ISubscription {
    createdAt: Date
    updatedAt: Date
    _id: string
}

