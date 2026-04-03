import { Router } from 'express';
import { UploadController } from '../controllers';
import { protect } from '../../../common/middlewares';

const uploadRouter = Router();
const uploadController = new UploadController();
uploadRouter
    .route('/generate-url')
    .post(protect, uploadController.generatePresetUrl.bind(uploadController));

export { uploadRouter };
