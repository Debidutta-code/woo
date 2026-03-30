import {
    seasonalRouter
} from "./index";
import {SeasonalController} from "../controllers";
import { protect } from "../../middlewares/auth.middleware";
import { attachPropertyDetails } from "../../middlewares/property.middleware";

const seasonalController = new SeasonalController();

seasonalRouter.route("/create/:propertyId").post(protect,attachPropertyDetails({
      identifierType: "id",
      key: "id",
      source: "params"
    }),seasonalController.createSeasonal.bind(seasonalController));
seasonalRouter.route("/by-room/:roomId").get(protect,seasonalController.getSeasonalByRoomId.bind(seasonalController));
seasonalRouter.route("/update-room/:id").put(protect,seasonalController.updateSeasonal.bind(seasonalController));
seasonalRouter.route("/delete/:id").delete(protect,seasonalController.deleteSeasonal.bind(seasonalController));
