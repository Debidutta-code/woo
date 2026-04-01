import { Router } from "express";
import { OccupancyController } from "../controllers";
import { protect } from "../../middlewares/auth.middleware";
import { attachPropertyDetails } from "../../middlewares/property.middleware";

const occupancyController = new OccupancyController();
const occupancyRouter = Router();

occupancyRouter.route("/create/:propertyId").post(protect, 
    attachPropertyDetails({
    identifierType: "id",
    key: "propertyId",
    source: "params"
}), occupancyController.createOccupancy.bind(occupancyController));
occupancyRouter.route("/by-room/:roomId").get(protect,occupancyController.getOccupancyByRoomId.bind(occupancyController));
occupancyRouter.route("/update/:id").put(protect,occupancyController.updateOccupancy.bind(occupancyController));

occupancyRouter.route("/delete/:id").delete(protect,occupancyController.deleteOccupancy.bind(occupancyController));

export {occupancyRouter}

