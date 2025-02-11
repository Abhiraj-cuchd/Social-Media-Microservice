import { ObjectId } from "mongoose";

export interface IMediaObject {
    originalName: string;
    fileUrl: string;
    imageKey: string;
}

export interface IMedia {
    postId: ObjectId;
    userId: ObjectId;
    mediaUrls: Array<IMediaObject>;
}
