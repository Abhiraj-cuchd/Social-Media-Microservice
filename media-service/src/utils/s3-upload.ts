
import { _envConfig } from './config';
import { createFileUrl, generateFileName } from './fileUtils';
import { logger } from './logger';
const { aws_access_key, aws_bucket_name, aws_region, aws_secret } = _envConfig
const { S3Client, PutObjectCommand, DeleteObjectsCommand } = require('@aws-sdk/client-s3');


const s3Client = new S3Client({
    region: aws_region,
    credentials: {
        accessKeyId: aws_access_key as string,
        secretAccessKey: aws_secret as string
    }
});

const createUploadParams = (file: any, fileName: any) => ({
    Bucket: aws_bucket_name,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    // ACL: 'public-read'
});

export const uploadFileToS3 = async (file: any) => {
    const fileName = generateFileName(file.originalname);
    const uploadParams = createUploadParams(file, fileName);

    await s3Client.send(new PutObjectCommand(uploadParams));
    return createFileUrl(aws_bucket_name!, aws_region!, fileName);
};

export const deleteFileFromS3 = async (imageKeys: Array<string>) => {
    try {
        const command = new DeleteObjectsCommand({
            Bucket: aws_bucket_name,
            Delete: {
                Objects: imageKeys.map(key => ({ Key: key })),
                Quiet: false
            }
        });

        const response = await s3Client.send(command);
        logger.info('Images deleted successfully from AWS S3:', response);
        return response;
    } catch (error) {
        logger.error('Error deleting images from S3:', error);
        throw error;
    }
}
