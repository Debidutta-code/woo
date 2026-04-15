import { Router } from "express";
import {ExplorDestinationController} from "../controllers/explor-destination.controller";
import { protect } from "../../../common/middlewares";
const explorDestinationRouter = Router();
const explorDestinationController = new ExplorDestinationController();


explorDestinationRouter.route("/")
    .get(explorDestinationController.getExplorDestinations.bind(explorDestinationController))
    .post(protect,explorDestinationController.createExplorDestination.bind(explorDestinationController))
explorDestinationRouter.route("/:id")
    .patch(protect,explorDestinationController.updateExplorDestination.bind(explorDestinationController))
    .delete(protect,explorDestinationController.deleteExplorDestination.bind(explorDestinationController))
export { explorDestinationRouter };