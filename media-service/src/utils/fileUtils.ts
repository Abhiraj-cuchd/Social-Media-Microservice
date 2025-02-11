import crypto from 'crypto';
import { logger } from './logger';

export const generateFileName = (originalName: string) => {
    const fileExtension = originalName.split('.').pop();
    const randomName = crypto.randomBytes(16).toString('hex');
    return `${randomName}.${fileExtension}`;
};

export const createFileUrl = (bucketName: string, region: string, fileName: string) =>
    `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;


export const formatResponse = (fileUrls: any, originalFiles: any) => {

    const splitString = 'bucket.abhiraj.dev.s3.us-east-1.amazonaws.com/';
    // console.log(fileUrls[0].url.split(splitString), 'imageKey')
    return {
        success: true,
        files: fileUrls.map((url: string, index: number) => ({
            originalName: originalFiles[index].originalname,
            fileUrl: url,
            imageKey: url?.split(splitString)[1]
        }))
    }
}
