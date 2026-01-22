import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Home,
  Building,
  Users,
  Shield,
  Menu,
  LogOut,
  ChevronLeft,
  ChevronRight,
  HeadsetIcon,
  BrushCleaning,
  LayoutDashboard,
  Calendar,
  Moon,
  CreditCard,
  Clock,
  DoorOpen,
  ClipboardList,
  NotebookPen,
  Package,
  FileText,
  // Tag,
  PlusCircle,
  Receipt,
  Wrench,
  Puzzle,
  HelpCircle,
} from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';
import { useEffect, useState } from 'react';
import createAxiosInstance from '@/components/axiosInstance';
import type { Access } from '@/redux/access-slice';
interface NavItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  userLevels: number[];
  children?: NavItem[];
  access?: (keyof Access)[];
}

// Main app navigation
const mainNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/app', icon: Home, userLevels: [0, 1, 2, 3, 4] },
  { name: 'Properties', href: '/app/property', icon: Building, userLevels: [2, 3, 4] },
  { name: "My Property", href: `/app/property`, icon: Building, userLevels: [1, 0] },
        { name: 'Manage Members', href: '/app/members', icon: Users, userLevels: [4, 3, 2, 1, 0], access: ["canCreateLevel0User", "canCreateLevel1User", "canCreateLevel2User"] },
  { name: 'Access Control', href: '/app/access-control', icon: Shield, userLevels: [4] },
  { name: 'Utils Management', href: '/app/utils-management', icon: Wrench, userLevels: [4, 3], access: ["canCDAmenity", "canCDCategory", "canCDPropertyType", "canCDCategory"] },
];

// Define the component's props interface
interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isSidebarOpen, toggleSidebar }: SidebarProps) {
  const { user } = useAppSelector((state) => state.user);
  const { access } = useAppSelector((state) => state.access);
  const location = useLocation();
  const navigate = useNavigate();
  const { propertyId } = useParams<{ propertyId: string }>();

  const [navigation, setNavigation] = useState<NavItem[]>(mainNavigation);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Detect which type of route we're on
  const isFrontDeskRoute = location.pathname.includes('/frontdesk');
  const isHouseKeepingRoute = location.pathname.includes('/housekeeping');
  const isPropertyRoute = location.pathname.startsWith('/property/') && propertyId && !isFrontDeskRoute && !isHouseKeepingRoute;

  const handleLogout = async () => {
    try {
      // Call the logout endpoint to clear HTTP-only cookies
      const axiosInstance = createAxiosInstance();
      await axiosInstance.post('/auth/logout');


      // Navigate to login page
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the API call fails, clear local storage and redirect
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('swiftRoomsLogCred');
      navigate('/');
    }
  };

  useEffect(() => {
    if (isFrontDeskRoute && propertyId) {
      if (user && [0, 1, 2, 3, 4].includes(user.userLevel)) {
        const fullNav: NavItem[] = [
          { name: 'Dashboard', href: '/app', icon: Home, userLevels: [0, 1, 2, 3, 4] },
          { name: 'Properties', href: '/app/property', icon: Building, userLevels: [2, 3, 4] },
          { name: "My Property", href: `/app/property`, icon: Building, userLevels: [1, 0] },

          {
            name: 'Property Config',
            icon: Building,
            userLevels: [0, 1, 2, 3, 4],
            children: [
              {
                name: 'Rate Plan',
                href: `/property/${propertyId}/rate-plan`,
                icon: Calendar,
                userLevels: [0, 1, 2, 3, 4],
                access: ["canCreateRatePlan", "canDeleteRatePlan", "canUpdateRatePlan", "canDeleteRatePlan"],
              },
              {
                name: 'Rate Plan Allotment',
                href: `/property/${propertyId}/rate-plan/map`,
                icon: Package,
                userLevels: [0, 1, 2, 3, 4],
                access: ["canMapRatePlan","canCreateRoomAvailability","canModifyStartStopSell"]
              },
              {
                name: 'Inventory',
                href: `/property/${propertyId}/inventory`,
                icon: Building,
                userLevels: [0, 1, 2, 3, 4],
                access: ["canAddInventory"]
              },
              {
                name: 'Policy',
                href: `/property/${propertyId}/policy`,
                icon: FileText,
                userLevels: [0, 1, 2, 3, 4],
                access: ["canCreatePolicy", "canUpdatePolicy", "canDeletePolicy", "canAddPolicyToRatePlans"]
              },
              {
                name: 'Add-On',
                href: `/property/${propertyId}/add-on`,
                icon: PlusCircle,
                userLevels: [0, 1, 2, 3, 4],
                access: ["canAddAddons", "canViewAddons", "canUpdateAddons", "canDeleteAddons"]
              },
              {
                name: 'Tax System',
                href: `/property/${propertyId}/tax-system`,
                icon: Receipt,
                userLevels: [0, 1, 2, 3, 4],
                access: ["canAddTax", "canViewTax", "canUpdateTax", "canDeleteTax", "canAddTaxToRatePlans", "canCreateTaxGroup", "canDeleteTaxGroup"]
              },
            ]
          },
          
        { name: 'Manage Members', href: '/app/members', icon: Users, userLevels: [4, 3, 2, 1, 0], access: ["canCreateLevel0User", "canCreateLevel1User", "canCreateLevel2User"] },
          { name: 'Access Control', href: '/app/access-control', icon: Shield, userLevels: [4] },
          { name: 'Utils Management', href: '/app/utils-management', icon: Wrench, userLevels: [4] },
          { name: "Contact Support", href: "/app/contact-support", icon: HelpCircle, userLevels: [0, 1, 2, 3, 4] }
        ];
        setNavigation(fullNav);
      } 
    } else if (isPropertyRoute && propertyId) {
      const propertyNav: NavItem[] = [
        // Main App Routes
        { name: 'Dashboard', href: '/app', icon: Home, userLevels: [0, 1, 2, 3, 4] },
        { name: 'Properties', href: '/app/property', icon: Building, userLevels: [2, 3, 4] },
        { name: "My Property", href: `/app/property`, icon: Building, userLevels: [1, 0] },

        {
          name: 'Property Config',
          icon: Building,
          userLevels: [0, 1, 2, 3, 4],
          children: [
            {
              name: 'Rate Plan',
              href: `/property/${propertyId}/rate-plan`,
              icon: Calendar,
              userLevels: [0, 1, 2, 3, 4],
              access: ["canCreateRatePlan", "canDeleteRatePlan", "canUpdateRatePlan"],
            },
            {
              name: 'Rate Plan Allotment',
              href: `/property/${propertyId}/rate-plan/map`,
              icon: Package,
              userLevels: [0, 1, 2, 3, 4],
                access: ["canMapRatePlan","canCreateRoomAvailability","canModifyStartStopSell"]
            },
            {
              name: 'Inventory',
              href: `/property/${propertyId}/inventory`,
              icon: Building,
              userLevels: [0, 1, 2, 3, 4],
              access: ["canAddInventory"],
            },
            {
              name: 'Policy',
              href: `/property/${propertyId}/policy`,
              icon: FileText,
              userLevels: [0, 1, 2, 3, 4],
              access: ["canCreatePolicy", "canUpdatePolicy", "canDeletePolicy", "canAddPolicyToRatePlans"],
            },
            {
              name: 'Add-On',
              href: `/property/${propertyId}/add-on`,
              icon: PlusCircle,
              userLevels: [0, 1, 2, 3, 4],
              access: ["canAddAddons", "canViewAddons", "canUpdateAddons", "canDeleteAddons"],
            },
            {
              name: 'Tax System',
              href: `/property/${propertyId}/tax-system`,
              icon: Receipt,
              userLevels: [0, 1, 2, 3, 4],
              access: ["canAddTax", "canViewTax", "canUpdateTax", "canDeleteTax", "canAddTaxToRatePlans", "canCreateTaxGroup", "canDeleteTaxGroup"],
            },
          ]
        },
        {
          name: 'Front Desk',
          icon: HeadsetIcon,
          userLevels: [0, 1, 2, 3, 4],
          access: ["canAccessFrontoffice"],
          children: [
            {
              name: 'Dashboard',
              href: `/property/${propertyId}/frontdesk`,
              icon: LayoutDashboard,
              userLevels: [0, 1, 2, 3, 4],
            },
            {
              name: 'Reservations',
              href: `/property/${propertyId}/frontdesk/reservation`,
              icon: Calendar,
              userLevels: [0, 1, 2, 3, 4],
              access: ["canViewReservation", "canAmendReservation", "canCancelReservation", "canMakeCheckIn", "canMakeCheckOut", "canCreateReservation", "canDownloadBookingVouchers", "canDownloadInvoice"],
            },
            {
              name: 'Arrival / Departure',
              href: `/property/${propertyId}/frontdesk/reservation/arrival-departure`,
              icon: Clock,
              userLevels: [0, 1, 2, 3, 4],
              access: ["canViewArrivals", "canViewDepartures"],
            },
            {
              name: 'Check In/Out',
              href: `/property/${propertyId}/frontdesk/reservation/check-in-out`,
              icon: DoorOpen,
              userLevels: [0, 1, 2, 3, 4],
              access: ["canViewCheckIns", "canViewCheckOuts"],
            },
            {
              name: 'Guests',
              href: `/property/${propertyId}/frontdesk/guests`,
              icon: Users,
              userLevels: [0, 1, 2, 3, 4],
              access: ["canViewGuests", "canCreateGuests", "canUpdateGuests", "canDeleteGuests"],
            },
            {
              name: 'Night Audit',
              href: `/property/${propertyId}/frontdesk/night-audit/make`,
              icon: Moon,
              userLevels: [0, 1, 2, 3, 4],
              access: ["canPerformNightAudit"],
            },
            {
              name: 'Payments',
              href: `/property/${propertyId}/frontdesk/payment`,
              icon: CreditCard,
              userLevels: [0, 1, 2, 3, 4],
              access: ["canAddPayments", "canViewPayments", "canDeletePayments", "canUpdatePayments"],
            },
            {
              name: 'Room Management',
              href: `/property/${propertyId}/frontdesk/room-management`,
              icon: DoorOpen,
              userLevels: [0, 1, 2, 3, 4],
              access: ["canCreateIndividualRooms", "canDeleteIndividualRooms", "canUpdateIndividualRooms", "canViewIndividualRooms"],
            },
            {
              name: 'Task Assignment',
              href: `/property/${propertyId}/frontdesk/task-assignment`,
              icon: ClipboardList,
              userLevels: [0, 1, 2, 3, 4],
              access: ["canViewHouseKeepingTasks", "canCreateHouseKeepingTasks", "canDeleteHouseKeepingTasks", "canUpdateHouseKeepingTasks"],
            },

            {
              name: 'Reports',
              href: `/property/${propertyId}/frontdesk/reports`,
              icon: NotebookPen,
              userLevels: [0, 1, 2, 3, 4],
              access: ["canViewReports", "canDownloadReports"],
            },
            {
              name: 'Addons Management',
              href: `/property/${propertyId}/frontdesk/addons-management`,
              icon: Puzzle,
              userLevels: [0, 1, 2, 3, 4],
              access: ["canViewAddons", "canAddAddons", "canUpdateAddons", "canDeleteAddons", "canAddAddonsForBookings"],
            },
          ]
        },
        {
          name: 'House Keeping',
          icon: BrushCleaning,
          userLevels: [0, 1, 2, 3, 4],
          access: ["canAccessHousekeeping"],
          children: [
            {
              name: 'Dashboard',
              href: `/property/${propertyId}/housekeeping`,
              icon: LayoutDashboard,
              userLevels: [0, 1, 2, 3, 4],
              access: ["canViewHouseKeepingTasks", "canUpdateHouseKeepingTasks"],
            },
          ]
        },
        { name: 'Manage Members', href: '/app/members', icon: Users, userLevels: [4, 3, 2, 1, 0], access: ["canCreateLevel0User", "canCreateLevel1User", "canCreateLevel2User"] },
        { name: 'Access Control', href: '/app/access-control', icon: Shield, userLevels: [4] },
        { name: 'Utils Management', href: '/app/utils-management', icon: Wrench, userLevels: [4], access: ["canCDAmenity", "canCDCategory", "canCDPropertyType"] },
        { name: "Contact Support", href: "/app/contact-support", icon: HelpCircle, userLevels: [0, 1, 2, 3, 4] }
      ];
      setNavigation(propertyNav);
    } else {
      const updatedMainNav = [...mainNavigation];


      setNavigation(updatedMainNav);
    }
  }, [isFrontDeskRoute, isHouseKeepingRoute, isPropertyRoute, propertyId, user]);

  // Auto-expand parent items when child is active
  useEffect(() => {
    const expanded: string[] = [];
    navigation.forEach(item => {
      if (item.children) {
        const isChildActive = item.children.some(child =>
          child.href && (location.pathname === child.href || location.pathname.startsWith(child.href + '/'))
        );
        if (isChildActive) expanded.push(item.name);
      }
    });
    setExpandedItems(prev => {
      const isSame = prev.length === expanded.length && prev.every(val => expanded.includes(val));
      return isSame ? prev : expanded;
    });
  }, [location.pathname, navigation]);

  // Handle role-based redirects
  useEffect(() => {
    if (user?.role === "front_desk" && user?.propertyId && !isFrontDeskRoute) {
      navigate(`/property/${user.propertyId}/frontdesk`);
    }
    if (user?.role === "housekeeping" && user?.propertyId && !isHouseKeepingRoute) {
      navigate(`/property/${user.propertyId}/housekeeping`);
    }
  }, [user, navigate, isFrontDeskRoute, isHouseKeepingRoute]);

  const toggleExpand = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isItemActive = (item: NavItem) => {
    if (item.children) {
      return item.children.some(child =>
        child.href && location.pathname === child.href
      );
    }
    return item.href && location.pathname === item.href;
  };
  const hasAccess = (requiredAccess?: (keyof Access)[]): boolean => {
    if (!requiredAccess || requiredAccess.length === 0) return true;
    if (!access) return false;
    return requiredAccess.some(permission => access[permission] === true);
  };

  const filteredNavigation = navigation
    .filter(item => user && item.userLevels.includes(user.userLevel) && hasAccess(item.access))
    .map(item => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter(
            child => user && child.userLevels.includes(user.userLevel) && hasAccess(child.access)
          )
        };
      }
      return item;
    })
    .filter(item => !item.children || item.children.length > 0);

  const getLinkPath = (href: string | undefined) => {
    if (!href) return '#';
    if (href === `/app/property`) {
      if (user?.userLevel === 4) return `/app/property/super/${user.creation}`;
      if (user?.userLevel === 3) return `/app/property/group/${user.creation}`;
      if (user?.userLevel === 2) return `/app/property/brand/${user.creation}`;
      if (user?.userLevel === 1) return `/app/property/property/${user.creation}`;
      if (user?.userLevel === 0) return `/app/property/property/${user.creation}`;
    }
    return href;
  };

  // Reusable component for the sidebar's content
  const SidebarContent = () => (
    <div className='flex flex-col h-full bg-white border-r w-full'>
      <div className="flex justify-around items-center h-16 px-2 border-b border-gray-200">
        <Button onClick={toggleSidebar} variant="ghost" size="icon" className={`hidden sm:flex justify-center items-center`}>
          {isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
        <h1 className={cn(
          'font-bold text-xl ml-2 whitespace-nowrap transition-opacity duration-300',
          isSidebarOpen ? 'block' : 'hidden'
        )}>
        </h1>
        {isSidebarOpen && (
          <img src='/swiftrooms.jpeg' alt="Swiftrooms" className='w-28' />
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredNavigation.map((item) => (
          <div key={item.name}>
            {/* PARENT ITEM */}
            {item.children ? (
              <button
                onClick={() => toggleExpand(item.name)}
                title={item.name}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isItemActive(item)
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50',
                  !isSidebarOpen && 'justify-center'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className={cn('whitespace-nowrap flex-1 text-left', !isSidebarOpen && 'hidden')}>
                  {item.name}
                </span>
                {isSidebarOpen && (
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 transition-transform',
                      expandedItems.includes(item.name) && 'rotate-90'
                    )}
                  />
                )}
              </button>
            ) : (
              <Link
                to={getLinkPath(item.href)}
                title={item.name}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isItemActive(item)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50',
                  !isSidebarOpen && 'justify-center'
                )}
              >
                <item.icon className='h-5 w-5 flex-shrink-0' />
                <span className={cn('whitespace-nowrap', !isSidebarOpen && 'hidden')}>
                  {item.name}
                </span>
              </Link>
            )}

            {/* CHILD ITEMS (Nested) */}
            {item.children && expandedItems.includes(item.name) && isSidebarOpen && (
              <div className="ml-4 mt-1 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.name}
                    to={getLinkPath(child.href)}
                    title={child.name}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                      location.pathname === child.href
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <child.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">{child.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-2">

        <Button
          onClick={handleLogout}
          variant="ghost"
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50',
            !isSidebarOpen && 'justify-center'
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span className={cn('whitespace-nowrap', !isSidebarOpen && 'hidden')}>Logout</span>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar (Slide-out Sheet) */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 bg-white/50 backdrop-blur-sm">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-56">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar (Permanent Flex Item) */}
      <aside className={cn(
        'hidden md:flex flex-col   border-gray-200 transition-all duration-300 ease-in-out',
        isSidebarOpen ? 'w-56' : 'w-20'
      )}>
        <SidebarContent />
      </aside>
    </>
  );
}