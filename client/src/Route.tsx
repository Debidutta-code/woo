import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
} from "react-router-dom";

import AuthLayout from "./Layout/AuthLayout.tsx";
import Login from "@/pages/login/Login.tsx";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm.tsx";
import LinkVerification from "@/components/auth/LinkVerification.tsx";
import Dashboard from "./pages/dashboard/DashBoard.tsx";
import Property from "@/pages/property/Super.tsx";
import MembersPage from "./pages/members/ManageMember.tsx";
import LogsPage from "./pages/logs/page.tsx";
import Inventory from "./pages/inventory/page.tsx";
import PropertyById from "./pages/property/id/page.tsx";
import RatePlan from "./pages/rate-plan/page.tsx";
import CreateProperty from "./pages/property/create/page.tsx";
import AccessControlPage from "./pages/access-control/AccessControll.tsx";
import NotFound from "./pages/not-found/Page.tsx";
import GroupId from "./pages/property/group/Group.tsx";
import BrandId from "./pages/property/brand/Brand.tsx";
import PropertyId from "./pages/property/property/page.tsx";
import MappedRatePlans from "./pages/map-rate-plan/Map.tsx";
import Policies from "./pages/policies/page.tsx";
import PromoCode from "./pages/promocode/page.tsx";
import AddOn from "./pages/add-on/page.tsx";
import TaxSystem from "./pages/tax-system/page.tsx";
import ManagementPage from "./pages/management/Management.tsx";

//Front Desk Routes
import ContactSupport from "./pages/contact-support/ContactSupport.tsx";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/">
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPasswordForm />} />
        <Route path="reset-password" element={<LinkVerification />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/property/create" element={<CreateProperty />} />
      </Route>
      <Route path="/app" element={<AuthLayout />}>
        <Route index element={<Dashboard />} />

\        <Route path="property">
          <Route path="super/:superId" element={<Property />} />
          <Route path="group/:groupId" element={<GroupId />} />
          <Route path="brand/:brandId" element={<BrandId />} />
          <Route path="property/:propertyId" element={<PropertyId />} />
        </Route>

        {/* General App Routes */}
        <Route path="members" element={<MembersPage />} />
        <Route path="logs" element={<LogsPage />} />
        <Route path="access-control" element={<AccessControlPage />} />
        <Route path="bookings" element={<AccessControlPage />} />
        <Route path="utils-management" element={<ManagementPage />} />
        <Route path="contact-support" element={<ContactSupport />} />
      </Route>

      <Route path="/property/:propertyId" element={<AuthLayout/>}>
        <Route index element={<PropertyById />} />
        <Route path="rate-plan" element={<RatePlan />} />
        <Route path="rate-plan/map" element={<MappedRatePlans />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="policy" element={<Policies />} />
        <Route path="promo-code" element={<PromoCode />} />
        <Route path="add-on" element={<AddOn />} />
        <Route path="tax-system" element={<TaxSystem />} />
      </Route>

      
      <Route path="*" element={<NotFound />} />

    </>
  )
);
