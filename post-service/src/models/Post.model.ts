import mongoose from "mongoose";
import { IPost } from "../types/ModelInterface";

const postSchema = new mongoose.Schema<IPost>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
    },
    mediaUrls: [
        {
            type: String
        }
    ]
}, { timestamps: true })

postSchema.index({ content: 'text' });

export const PostModel = mongoose.model<IPost>('Post', postSchema);
