import { ObjectId } from "mongoose";

export interface IUser {
    _id?: ObjectId;
    username: string;
    email: string;
    password: string
}


export interface IRefreshToken {
    token: String;
    user: ObjectId;
    expiresAt: Date
}
