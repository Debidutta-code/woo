import { Router } from 'express';
import { syncPropertiesController } from '../controllers';

const router = Router();

router.get('/', syncPropertiesController);

export default router;