import mongoose from "mongoose";
import { IMedia } from "../types/ModelInterface";


const mediaSchema = new mongoose.Schema<IMedia>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
    },
    mediaUrls: [
        {
            imageKey: {
                type: String
            },
            originalName: {
                type: String
            },
            fileUrl: {
                type: String
            }

        }
    ]
}, { timestamps: true })

export const MediaModel = mongoose.model<IMedia>('Media', mediaSchema);
