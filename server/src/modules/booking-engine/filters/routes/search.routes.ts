import { Router } from 'express';
import { SearchController } from '../controllers';

const searchRouter = Router();
const searchController = new SearchController();

searchRouter.route('/unique-cities').get(
    searchController.getUniqueCities.bind(searchController)
);

searchRouter.route('/amenities').get(
    searchController.getAmenities.bind(searchController)
);

searchRouter.route('/').get(
    searchController.searchProperties.bind(searchController)
);

searchRouter.route('/property-categories').get( 
    searchController.getPropertyCategories.bind(searchController)
);

searchRouter.route('/property-types').get( 
    searchController.getPropertyTypes.bind(searchController)
);


export { searchRouter };