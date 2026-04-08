import { Router } from 'express';
import { ReviewController } from '../controllers';
import { customerProtect } from '../../../../common/middlewares';

const router = Router();
const reviewController = new ReviewController();

router.get('/property/:propertyId', reviewController.getReviewsByProperty.bind(reviewController));
router.get('/:id', reviewController.getReviewById.bind(reviewController));

router.post('/', customerProtect, reviewController.createReview.bind(reviewController));
router.get('/my/reviews', customerProtect, reviewController.getMyReviews.bind(reviewController));
router.put('/:id', customerProtect, reviewController.updateReview.bind(reviewController));
router.delete('/:id', customerProtect, reviewController.deleteReview.bind(reviewController));

export { router as reviewRouter };
