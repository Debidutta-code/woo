import { Response } from 'express';
import { CustomRequest } from '../../utils/customRequest';
import { cloudinary } from '../../utils/cloudinary';
import { errorResponse, successResponse } from '../../utils/return';
import fs from 'fs/promises';

// Helper function to upload with retry logic
const uploadWithRetry = async (
    filePath: string,
    options: any,
    maxRetries = 2
) => {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            console.log(
                `Uploading file (attempt ${attempt + 1}/${maxRetries + 1}): ${filePath}`
            );
            const result = await cloudinary.uploader.upload(filePath, options);
            console.log(`Successfully uploaded: ${filePath}`);
            return result;
        } catch (error: any) {
            lastError = error;
            console.error(
                `Upload attempt ${attempt + 1} failed:`,
                error.message
            );

            if (attempt < maxRetries) {
                // Wait before retrying (exponential backoff)
                await new Promise(resolve =>
                    setTimeout(resolve, 1000 * (attempt + 1))
                );
            }
        }
    }

    throw lastError;
};

export const uploadHandler = async (req: CustomRequest, res: Response) => {
    const files = req.files;
    const cloudinaryFolderName =
        process.env.CLOUDINARY_FOLDER_NAME || 'SwiftRooms-Images';

    if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json(errorResponse('Upload at least one file'));
    }

    try {
        console.log(`Starting upload of ${files.length} file(s)...`);
        const urls: string[] = [];

        // Upload files sequentially to avoid overwhelming the connection
        for (const file of files) {
            const result = await uploadWithRetry(file.path, {
                folder: cloudinaryFolderName,
                timeout: 60000, // 60 seconds per file
                resource_type: 'auto',
                quality: 'auto:good',
                fetch_format: 'auto',
            });

            urls.push(result.url);
        }

        console.log(`Successfully uploaded ${urls.length} file(s)`);
        return res
            .status(200)
            .json(successResponse('Files uploaded successfully', urls));
    } catch (err: any) {
        console.error('Cloudinary upload failed:', err);
        return res
            .status(500)
            .json(
                errorResponse(
                    'Failed to upload images',
                    err?.message || 'Upload timeout or network error'
                )
            );
    } finally {
        if (files && Array.isArray(files)) {
            console.log('Cleaning up temporary files...');

            const unlinkPromises = files.map(file => fs.unlink(file.path));

            try {
                const results = await Promise.allSettled(unlinkPromises);
                results.forEach((result, index) => {
                    if (result.status === 'rejected') {
                        console.error(
                            `Failed to delete temporary file: ${files[index].path}`,
                            result.reason
                        );
                    }
                });
            } catch (cleanupErr) {
                console.error('Error during file cleanup:', cleanupErr);
            }
        }
    }
};
