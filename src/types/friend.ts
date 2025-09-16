export interface FriendRequest{
    id: number,
    senderId: string,
    receiverId: string,
    createdAt?: Date
}
export interface Friend{
    id: number,
    userId1:string,
    userId2:string,
    createdAt?: Date
}