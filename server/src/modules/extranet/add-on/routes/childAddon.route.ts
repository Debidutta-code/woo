import { Router } from 'express';
import { ChildAddonsController } from '../controllers';
import { protect } from '../../../../common/middlewares';

const childAddonRoute = Router();
const childAddonController = new ChildAddonsController();

childAddonRoute
    .route('/')
    .post(protect, childAddonController.createChildAddons.bind(childAddonController))
    .get(protect, childAddonController.getChildAddons.bind(childAddonController));

childAddonRoute
    .route('/:childAddonId')
    .put(protect, childAddonController.updateChildAddons.bind(childAddonController))
    .delete(protect, childAddonController.deleteChildAddon.bind(childAddonController));

export { childAddonRoute };
