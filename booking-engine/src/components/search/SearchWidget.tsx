import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Search, Minus, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { SearchParams } from '@/types';

interface SearchWidgetProps {
  variant?: 'hero' | 'compact';
  className?: string;
}

const SearchWidget = ({ variant = 'hero', className }: SearchWidgetProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState<SearchParams>({
    location: '',
    checkIn: null,
    checkOut: null,
    adults: 2,
    children: 0,
    rooms: 1,
  });

  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchParams.location) params.set('location', searchParams.location);
    if (dateRange.from) params.set('checkIn', format(dateRange.from, 'yyyy-MM-dd'));
    if (dateRange.to) params.set('checkOut', format(dateRange.to, 'yyyy-MM-dd'));
    params.set('adults', String(searchParams.adults));
    params.set('children', String(searchParams.children));
    params.set('rooms', String(searchParams.rooms));
    
    navigate(`/hotel-listing?${params.toString()}`);
  };

  const updateGuests = (field: 'adults' | 'children' | 'rooms', delta: number) => {
    setSearchParams((prev) => {
      const newValue = prev[field] + delta;
      const min = field === 'children' ? 0 : 1;
      const max = field === 'rooms' ? 10 : 10;
      return {
        ...prev,
        [field]: Math.max(min, Math.min(max, newValue)),
      };
    });
  };

  const isHero = variant === 'hero';

  return (
    <div className={cn(
      'search-widget',
      isHero ? 'max-w-5xl mx-auto' : 'w-full',
      className
    )}>
      <div className={cn(
        'grid gap-4',
        isHero ? 'md:grid-cols-4' : 'md:grid-cols-5'
      )}>
        {/* Location */}
        <div className={cn('space-y-2', isHero && 'md:col-span-1')}>
          <label className="text-sm font-medium text-muted-foreground">Destination</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Where are you going?"
              value={searchParams.location}
              onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className={cn('space-y-2', isHero && 'md:col-span-1')}>
          <label className="text-sm font-medium text-muted-foreground">Check-in / Check-out</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full h-12 justify-start text-left font-normal',
                  !dateRange.from && 'text-muted-foreground'
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d')}
                    </>
                  ) : (
                    format(dateRange.from, 'MMM d, yyyy')
                  )
                ) : (
                  <span>Select dates</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-card" align="start">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                numberOfMonths={2}
                disabled={(date) => date < new Date()}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Guests */}
        <div className={cn('space-y-2', isHero && 'md:col-span-1')}>
          <label className="text-sm font-medium text-muted-foreground">Guests & Rooms</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-12 justify-start text-left font-normal"
              >
                <Users className="mr-2 h-4 w-4" />
                {searchParams.adults + searchParams.children} Guests, {searchParams.rooms} Room{searchParams.rooms > 1 ? 's' : ''}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 bg-card" align="start">
              <div className="space-y-4">
                {/* Adults */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Adults</p>
                    <p className="text-sm text-muted-foreground">Ages 13+</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateGuests('adults', -1)}
                      disabled={searchParams.adults <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center font-medium">{searchParams.adults}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateGuests('adults', 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Children</p>
                    <p className="text-sm text-muted-foreground">Ages 0-12</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateGuests('children', -1)}
                      disabled={searchParams.children <= 0}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center font-medium">{searchParams.children}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateGuests('children', 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Rooms */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Rooms</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateGuests('rooms', -1)}
                      disabled={searchParams.rooms <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center font-medium">{searchParams.rooms}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateGuests('rooms', 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Search Button */}
        <div className={cn('flex items-end', isHero && 'md:col-span-1')}>
          <Button
            onClick={handleSearch}
            variant="cta"
            size="xl"
            className="w-full"
          >
            <Search className="h-5 w-5" />
            Search
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchWidget;
