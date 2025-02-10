import { Request, Response } from "express";
import { logger } from "../utils/logger";
import { PostModel } from "../models/Post.model";
import { validateCreatePost } from "../utils/validations";
import { invalidatePostCache } from "../utils/redis";

export const createPost = async (req: any, res: Response) => {
    logger.info('Create Post Endpoint Hit')
    try {
        const { error } = validateCreatePost(req.body);
        if (error) {
            logger.warn('Validation Error', error.details[0].message);
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            })
        }
        const { content, mediaUrls } = req.body;
        const newPost = await PostModel.create({
            user: req.user.userId,
            content,
            mediaUrls: mediaUrls || []
        });
        logger.info('Post Created Succesfully', newPost);
        invalidatePostCache(req, newPost._id.toString())
        res.status(201).json({
            success: true,
            message: 'Post Created Succesfully'
        })
    } catch (error) {
        logger.error("Error creating post", error);
        res.status(500).json({
            success: false,
            message: "Error Creating Post"
        })
    }
}

export const getAllPosts = async (req: any, res: Response) => {
    const { page, limit } = req.query;
    try {
        const page_ = parseInt(page as string) || 1;
        const limit_ = parseInt(limit as string) || 10;
        const startIndex = (page_ - 1) * limit_;

        const cacheKey = `posts:${page_}:${limit_}`;
        const cachedPosts = await req.redisClient.get(cacheKey);
        if (cachedPosts) {
            return res.status(200).json({
                success: true,
                posts: JSON.parse(cachedPosts)
            });
        }

        const posts = await PostModel.find({}).sort({ createdAt: -1 }).skip(startIndex).limit(limit_);

        const totalNoOfPosts = await PostModel.countDocuments();

        const result = {
            posts,
            currentPage: page_,
            totalPages: Math.ceil(totalNoOfPosts / limit_),
            totalPosts: totalNoOfPosts
        }
        await req.redisClient.setex(cacheKey, 3600, JSON.stringify(result));
        res.status(200).json({
            success: true,
            result
        });

    } catch (error) {
        logger.error("Error Fetching Posts", error);
        res.status(500).json({
            success: false,
            message: "Error Fetching Posts"
        })
    }
}

export const getPost = async (req: any, res: Response) => {
    try {
        const postId = req.params.id;
        const cacheKey = `post:${postId}`;
        const cachedPost = await req.redisClient.get(cacheKey);
        if (cachedPost) {
            return res.status(200).json({
                success: true,
                post: JSON.parse(cachedPost)
            });
        }
        const singlePost = await PostModel.findById(postId);
        if (!singlePost) {
            return res.status(404).json({
                success: false,
                message: 'Post Not Found'
            });
        }

        await req.redisClient.setex(cacheKey, 3600, JSON.stringify(singlePost));
        res.status(200).json({
            success: true,
            singlePost
        });
    } catch (error) {
        logger.error("Error Fetching Post", error);
        res.status(500).json({
            success: false,
            message: "Error Fetching Post"
        })
    }
}

export const deletePost = async (req: Request, res: Response) => {
    logger.info('Post Delete Endpoint Hit')
    try {
        const { postId } = req.params;
        console.log("check1", postId)
        const post = await PostModel.findById(postId)
        console.log("check2")
        await PostModel.findByIdAndDelete({ _id: postId });
        console.log("check3")
        invalidatePostCache(post, postId, true);
        console.log("check4")
        res.status(200).json({
            success: true,
            message: "Post Deleted Succesfully"
        });
    } catch (error) {
        logger.error("Error Deleting Post", error);
        res.status(500).json({
            success: false,
            message: "Error Deleting Post"
        })
    }
}
