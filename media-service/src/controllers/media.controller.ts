import { Response } from "express";
import { uploadFileToS3 } from "../utils/s3-upload";
import { formatResponse } from "../utils/fileUtils";
import { logger } from "../utils/logger";
import { MediaModel } from "../models/Media.model";

export const handleUploadMedia = async (req: any, res: Response) => {
    if (!req.files?.length) {
        return res.status(400).json({ error: 'No files uploaded' });
    }

    try {
        // const userId = req.user.userId;

        const fileUrls = await Promise.all(
            req.files.map(uploadFileToS3)
        );

        const { files } = formatResponse(fileUrls, req.files);
        await MediaModel.create({ mediaUrls: files })

        return res.json(formatResponse(fileUrls, req.files));
    } catch (error: any) {
        logger.error('Error uploading to S3:', error);
        return res.status(500).json({
            error: 'Failed to upload files',
            details: error.message
        });
    }
}
