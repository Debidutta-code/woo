import { Router } from 'express';

import { DashBoardController } from '../controllers';
import { protect } from '../../../../common/middlewares';

const dashBoardController = new DashBoardController();

const dashboardRouter = Router();

dashboardRouter
    .route('/get-analytics')
    .get(protect, dashBoardController.getAnalytics.bind(dashBoardController));
dashboardRouter
    .route('/properties')
    .get(
        protect,
        dashBoardController.getPropertyNames.bind(dashBoardController)
    );
dashboardRouter
    .route('/statistics-comparison')
    .get(
        protect,
        dashBoardController.getStatisticsComparison.bind(dashBoardController)
    );

export { dashboardRouter };
