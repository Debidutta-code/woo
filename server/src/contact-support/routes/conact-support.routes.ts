import { Router } from 'express';
import { ContactSupportController } from '../controllers';
import { protect, restrictTo } from '../../middlewares/auth.middleware';

const conactSupportRouter = Router();
const contactSupportController = new ContactSupportController();

conactSupportRouter.post(
    '/:propertyId',
    protect,

    contactSupportController.createTicket.bind(contactSupportController)
);

conactSupportRouter.get(
    '/',
    protect,
    contactSupportController.getAllTickets.bind(contactSupportController)
);

conactSupportRouter.get(
    '/:id',
    protect,
    contactSupportController.getTicketById.bind(contactSupportController)
);

conactSupportRouter.patch(
    '/:id/status',
    protect,
    restrictTo('super_admin'),
    contactSupportController.updateTicketStatus.bind(contactSupportController)
);

conactSupportRouter.patch(
    '/:id/priority',

    protect,
    restrictTo('super_admin'),
    contactSupportController.updateTicketPriority.bind(contactSupportController)
);

conactSupportRouter.delete(
    '/:id',
    protect,
    contactSupportController.deleteTicket.bind(contactSupportController)
);

export { conactSupportRouter };
