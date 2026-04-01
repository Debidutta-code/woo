import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { TrendingUp, CalendarDays, Moon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Loader from "@/components/Loader/Loader";
import toast from "react-hot-toast";
import { fetchDynamicPricing } from "./services";
import { fetchRoomTypesService } from "@/pages/inventory/services";
import type { IDynamicPricing } from "./interface";
import type { RoomTypes } from "@/pages/inventory/types";
import { OccupancyTab, SeasonalTab, WeekendTab } from "./components";
import type { ILoader } from "./components";

export default function DynamicPricing() {
  const { propertyId } = useParams<{ propertyId: string }>();

  const [loader, setLoader] = useState<ILoader>({
    isLoading: true,
    message: "Loading dynamic pricing...",
  });
  const [dynamicPricing, setDynamicPricing] = useState<IDynamicPricing | null>(null);
  const [rooms, setRooms] = useState<RoomTypes[]>([]);

  useEffect(() => {
    if (propertyId) initialLoad(propertyId);
  }, [propertyId]);

  const initialLoad = async (propertyId: string) => {
    setLoader({ isLoading: true, message: "Loading dynamic pricing..." });
    try {
      const [dpRes, roomsRes] = await Promise.all([
        fetchDynamicPricing(propertyId),
        fetchRoomTypesService(propertyId),
      ]);

      if (dpRes.success) {
        setDynamicPricing(dpRes.data);
        console.log(dpRes.data)
      } else {
        toast.error("Failed to load dynamic pricing");
      }

      if (roomsRes.success) {
        setRooms(roomsRes.data ?? []);
      } else {
        toast.error(roomsRes.message ?? "Failed to load rooms");
      }
    } catch {
      toast.error("Unexpected error loading page");
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  if (loader.isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader text={loader.message} />
      </div>
    );
  }

  if (!dynamicPricing) {
    return (
      <div className="container mx-auto p-6">
        <PageHeader />
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <TrendingUp className="w-14 h-14 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Dynamic Pricing Setup</h3>
            <p className="text-sm text-muted-foreground">
              Dynamic pricing has not been configured for this property yet.
              Please contact support or initialize it from the server.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-primary" />}
          label="Occupancy Rules"
          count={dynamicPricing.OccupancyBasedDynamicPricing.length}
        />
        <StatCard
          icon={<CalendarDays className="w-5 h-5 text-blue-500" />}
          label="Seasonal Rules"
          count={dynamicPricing.SeasonalDynamicPricings.length}
        />
        <StatCard
          icon={<Moon className="w-5 h-5 text-violet-500" />}
          label="Weekend Rules"
          count={dynamicPricing.WeekendDynamicPricing.length}
        />
      </div>

      <Tabs defaultValue="occupancy" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="occupancy" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Occupancy Based
          </TabsTrigger>
          <TabsTrigger value="seasonal" className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Seasonal
          </TabsTrigger>
          <TabsTrigger value="weekend" className="flex items-center gap-2">
            <Moon className="w-4 h-4" />
            Weekend
          </TabsTrigger>
        </TabsList>

        {/* ─── Occupancy Tab ─────────────────────────────────────────────── */}
        <TabsContent value="occupancy" className="mt-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Occupancy Based Pricing
              </CardTitle>
              <CardDescription>
                Automatically adjust room rates when inventory occupancy falls within
                a configured range (e.g., raise prices when 80–100% occupied).
              </CardDescription>
            </CardHeader>
            <CardDivider />
            <CardContent className="pt-4">
              <OccupancyTab
                propertyId={propertyId!}
                dynamicId={dynamicPricing.id}
                rooms={rooms}
                occupancyBasedDynamicPricings={dynamicPricing.OccupancyBasedDynamicPricing}
                refreshData={() => initialLoad(propertyId!)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Seasonal Tab ──────────────────────────────────────────────── */}
        <TabsContent value="seasonal" className="mt-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-500" />
                Seasonal Pricing
              </CardTitle>
              <CardDescription>
                Set price adjustments for specific seasons, holidays, or recurring
                weekend periods within a defined date range.
              </CardDescription>
            </CardHeader>
            <CardDivider />
            <CardContent className="pt-4">
              <SeasonalTab
                propertyId={propertyId!}
                dynamicId={dynamicPricing.id}
                rooms={rooms}
                seasonalDynamicPricings={dynamicPricing.SeasonalDynamicPricings}
                refreshData={() => initialLoad(propertyId!)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Weekend Tab ───────────────────────────────────────────────── */}
        <TabsContent value="weekend" className="mt-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-violet-500" />
                Weekend Pricing
              </CardTitle>
              <CardDescription>
                Apply surcharges or discounts on Friday, Saturday, or Sunday nights
                for a specified date range, with optional min/max caps.
              </CardDescription>
            </CardHeader>
            <CardDivider />
            <CardContent className="pt-4">
              <WeekendTab
                propertyId={propertyId!}
                dynamicId={dynamicPricing.id}
                rooms={rooms}
                weekendDynamicPricings={dynamicPricing.WeekendDynamicPricing}
                refreshData={() => initialLoad(propertyId!)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


function PageHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shrink-0">
        <TrendingUp className="w-6 h-6 text-primary-foreground" />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dynamic Pricing</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage occupancy, seasonal, and weekend pricing rules per room.
        </p>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  count: number;
}

function StatCard({ icon, label, count }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{count}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function CardDivider() {
  return <div className="border-t mx-6" />;
}

