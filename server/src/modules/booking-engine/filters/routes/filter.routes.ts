import  {Router} from "express";
import {availabilityRouter, propertyRouter, searchRouter} from "."
const filterRouter=Router();

filterRouter.use('/availability', availabilityRouter);
filterRouter.use('/property', propertyRouter);
filterRouter.use('/search', searchRouter);

export {filterRouter}