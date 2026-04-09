import React from 'react'
import { ExploreDestinations } from '../Sections/ExploreDestinations'
import { PopularHotels } from '../Sections/PopularHotels'
import AccommodationPromotions from '../Sections/FeaturedOffers'
import { Destination } from '../Sections/Destination'
import PropertiesYouLike from '../Sections/PropertiesYouLike'


const HomeSection = () => {
  return (
    <div>
      <div className="mt-4 mb-4">
        <Destination />
        <AccommodationPromotions />
        <PopularHotels />
        <PropertiesYouLike />
        <ExploreDestinations />
      </div>
    </div>
  )
}

export default HomeSection