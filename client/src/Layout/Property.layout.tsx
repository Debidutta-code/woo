import { useEffect, useState } from "react";
import { Outlet, useParams, useMatches } from "react-router-dom";
import Sidebar from "@/components/layout/SideBar/Sidebar";
import Navbar from "@/components/layout/NavBar/Navbar";
import { getPropertyDetails } from "@/components/property/api/show/propertyDetails";
import type { IPropertyAddress } from "@/pages/property/types/types";
import toast from "react-hot-toast";
import { MapPin } from "lucide-react";
import BackButton from "@/components/shared/BackButton";

export default function AppLayout() {
  const { propertyId } = useParams<{ propertyId: string }>();

  const matches = useMatches();
  const hidePropertyHeader = matches.some(
    (match: any) => (match.handle as any)?.hideHeader === true,
  );

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [propertyDetails, setPropertyDetails] = useState<{
    propertyName: string;
  }>({
    propertyName: "",
  });
  const [propertyAddress, setPropertyAddress] = useState<IPropertyAddress>({
    addressLine1: "",
    addressLine2: "",
    city: "",
    country: "",
    landmark: "",
    latitude: 0,
    location: "",
    longitude: 0,
    propertyId: "",
    state: "",
    zipCode: 0,
  });

  const [_loading, setLoading] = useState(true);
  useEffect(() => {
    if (!propertyId) {
      toast.error("Go back and try again");
      return;
    }
    fetchPropertyDetails(propertyId);
  }, [propertyId]);
  const fetchPropertyDetails = async (propertyId: string) => {
    try {
      setLoading(true);
      const response = await getPropertyDetails(propertyId);
      if (response.data) {
        const data = response.data;
        setPropertyDetails({
          propertyName: data.propertyName,
        });
        if (data.propertyAddress) {
          setPropertyAddress(data.propertyAddress);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to get Property details");
    } finally {
      setLoading(false);
    }
  };
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const getFullAddress = () => {
    const parts = [
      propertyAddress.city,
      propertyAddress.state,
      propertyAddress.country,
      propertyAddress.zipCode?.toString(),
    ].filter(Boolean);

    return parts.join(", ");
  };
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="sticky top-0 z-20 flex-shrink-0">
          <Navbar isOpen={isSidebarOpen} />
        </div>
        <main className="flex-1 overflow-auto p-4">
          <BackButton />
          {!hidePropertyHeader && (
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between px-6">
              <div className="w-full">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {propertyDetails.propertyName}
                    </h1>
                    <p className="text-base text-gray-600 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 flex-shrink-0" />
                      {getFullAddress()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
