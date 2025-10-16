export interface User {
    id: string;
    username: string;
    fullName:string;
    email: string;
    password: string;
    createdAt?: Date;
}