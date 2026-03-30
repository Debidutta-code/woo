import {
    weekendRouter
} from "./index";
import {WeekendController} from "../controllers";
import { attachPropertyDetails } from "../../middlewares/property.middleware";
import { protect } from "../../middlewares/auth.middleware";

const weekendController = new WeekendController();

weekendRouter.route("/create/:propertyId").post(protect,attachPropertyDetails({
      identifierType: "id",
      key: "id",
      source: "params"
    }),weekendController.createWeekend.bind(weekendController));
weekendRouter.route("/by-room/:roomId").get(protect,weekendController.getWeekendByRoomId.bind(weekendController));
weekendRouter.route("/update-room/:id").put(protect,weekendController.updateWeekend.bind(weekendController));
weekendRouter.route("/delete/:id").delete(protect,weekendController.deleteWeekend.bind(weekendController));
