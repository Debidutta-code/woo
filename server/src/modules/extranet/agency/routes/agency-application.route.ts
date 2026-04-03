import { Router } from 'express';
import { AgencyApplicationController } from '../controllers';
import { protect } from '../../../../common/middlewares';

const agencyApplicationRouter = Router();
const agencyApplicationController = new AgencyApplicationController();

// Create agency application (no protection - public endpoint)
agencyApplicationRouter
    .route('/')
    .get(
        agencyApplicationController.getApplications.bind(
            agencyApplicationController
        )
    )
    .post(
        agencyApplicationController.createAgencyApplication.bind(
            agencyApplicationController
        )
    );
agencyApplicationRouter
    .route('/name/:name')
    .get(
        agencyApplicationController.getAgencyApplicationByName.bind(
            agencyApplicationController
        )
    );
// Update application status (approve/reject)
agencyApplicationRouter
    .route('/:applicationId/status')
    .put(
        protect,
        agencyApplicationController.updateApplicationStatus.bind(
            agencyApplicationController
        )
    );

export { agencyApplicationRouter };
