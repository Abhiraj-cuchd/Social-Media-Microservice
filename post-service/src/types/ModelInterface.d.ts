import { ObjectId } from "mongoose";

export interface IPost {
    user: ObjectId,
    content: String,
    mediaId: ObjectId
}
