import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
} from "react-router-dom";

import Home from "@/pages/home/Home";
import HotelListing from "@/pages/hotel-listing/HotelListing";
import PropertyDetails from "./pages/property-details/Property";
import SignIn from "./pages/signin/SignIn";
import SignUp from "./pages/signup/SignUp";
import ForgotPassword from "./pages/forget-password/ForgetPassword";
export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/">
        <Route index element={<Home />} />
        <Route path="sign-in" element={<SignIn />} />
        <Route path="sign-up" element={<SignUp />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="hotel-listing" element={<HotelListing />} />
        <Route path="property/:propertyId" element={<PropertyDetails />} />
      </Route>

    </>
  )
);
