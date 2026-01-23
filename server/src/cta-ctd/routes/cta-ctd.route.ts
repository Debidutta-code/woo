import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import {
    CtaCtdController
} from "../controllers";

const router = Router();
const ctaCtdController = new CtaCtdController();

router.route("/create-cta")
    .post(protect, ctaCtdController.createCTA.bind(ctaCtdController));
router.route("/create-ctd")
    .post(protect, ctaCtdController.createCTD.bind(ctaCtdController));
router.route("/remove-ctd")
    .post(protect, ctaCtdController.removeCTD.bind(ctaCtdController));
router.route("/remove-cta")
    .post(protect, ctaCtdController.removeCTA.bind(ctaCtdController));
router.route("/get-cta-ctd/:propertyId")
    .get(protect, ctaCtdController.getCTACTDStatus.bind(ctaCtdController));

    export {ctaCtdController}
