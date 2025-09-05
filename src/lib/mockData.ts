import { User } from "../types/user";

export let users: User[] = [];
export let  refreshTokens: { [userId: string]: string } = {};