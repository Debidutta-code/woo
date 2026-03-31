import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { RoomTypes } from "@/pages/inventory/types";
import type {
  IWeekendDynamicPricing,
  ICWeekendDynamicPricingS,
  WeekEndDays,
} from "../interface";
import type { DiscountType } from "@/pages/tax-system/interface";
import type { CurrencyCode } from "@/components/currency-code/currency-code.type";
import { currencies } from "@/components/currency-code/cuurency";

const WEEKEND_DAYS: { value: WeekEndDays; label: string }[] = [
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface WeekendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  item: IWeekendDynamicPricing | null;
  rooms: RoomTypes[];
  dynamicId: string;
  onSave: (data: ICWeekendDynamicPricingS, id?: string) => Promise<void>;
  isSaving: boolean;
}

// ─── Default ──────────────────────────────────────────────────────────────────
const DEFAULT_FORM: ICWeekendDynamicPricingS = {
  roomId: "",
  ruleName: "",
  weekendDays: [],
  startDate: new Date(),
  endDate: new Date(),
  adjustmentType: "percentage",
  adjustmentValue: 0,
  currencyCode: null,
  minCap: null,
  maxCap: null,
};

export default function WeekendDialog({
  open,
  onOpenChange,
  mode,
  item,
  rooms,
  dynamicId,
  onSave,
  isSaving,
}: WeekendDialogProps) {
  const [form, setForm] = useState<ICWeekendDynamicPricingS>(DEFAULT_FORM);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && item) {
      setForm({
        roomId: item.roomId,
        ruleName: item.ruleName,
        weekendDays: item.weekendDays,
        startDate: new Date(item.startDate),
        endDate: new Date(item.endDate),
        adjustmentType: item.adjustmentType,
        adjustmentValue: item.adjustmentValue,
        currencyCode: item.currencyCode,
        minCap: item.minCap,
        maxCap: item.maxCap,
      });
    } else {
      setForm(DEFAULT_FORM);
    }
  }, [open, mode, item, dynamicId]);

  const handleClose = () => {
    setForm(DEFAULT_FORM);
    onOpenChange(false);
  };

  const toggleDay = (day: WeekEndDays) => {
    setForm((prev) => ({
      ...prev,
      weekendDays: prev.weekendDays.includes(day)
        ? prev.weekendDays.filter((d) => d !== day)
        : [...prev.weekendDays, day],
    }));
  };

  const isFlat = form.adjustmentType === "flat";
  const canSave =
    form.roomId &&
    form.ruleName.trim() &&
    form.weekendDays.length > 0 &&
    form.startDate &&
    form.endDate;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Weekend Rule" : "Edit Weekend Rule"}
          </DialogTitle>
          <DialogDescription>
            Apply price adjustments on specific weekend days within a date
            range.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Room */}
          <div className="space-y-1">
            <Label htmlFor="wk-room">Room *</Label>
            <Select
              value={form.roomId}
              onValueChange={(v) => setForm({ ...form, roomId: v })}
            >
              <SelectTrigger id="wk-room">
                <SelectValue placeholder="Select a room" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.roomName} ({r.roomType})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rule name */}
          <div className="space-y-1">
            <Label htmlFor="wk-name">Rule Name *</Label>
            <Input
              id="wk-name"
              placeholder="e.g., Weekend Surcharge"
              value={form.ruleName}
              onChange={(e) => setForm({ ...form, ruleName: e.target.value })}
            />
          </div>

          {/* Weekend days */}
          <div className="space-y-2">
            <Label>Weekend Days *</Label>
            <div className="flex gap-4">
              {WEEKEND_DAYS.map(({ value, label }) => (
                <div key={value} className="flex items-center gap-2">
                  <Checkbox
                    id={`wk-day-${value}`}
                    checked={form.weekendDays.includes(value)}
                    onCheckedChange={() => toggleDay(value)}
                  />
                  <Label
                    htmlFor={`wk-day-${value}`}
                    className="cursor-pointer font-normal"
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.startDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.startDate
                      ? format(form.startDate, "dd MMM yyyy")
                      : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.startDate}
                    onSelect={(d) => d && setForm({ ...form, startDate: d })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1">
              <Label>End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.endDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.endDate
                      ? format(form.endDate, "dd MMM yyyy")
                      : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.endDate}
                    onSelect={(d) => d && setForm({ ...form, endDate: d })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Adjustment type */}
          <div className="space-y-1">
            <Label htmlFor="wk-adj-type">Adjustment Type *</Label>
            <Select
              value={form.adjustmentType}
              onValueChange={(v) =>
                setForm({
                  ...form,
                  adjustmentType: v as DiscountType,
                  currencyCode: v === "percentage" ? null : form.currencyCode,
                })
              }
            >
              <SelectTrigger id="wk-adj-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="flat">Flat Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Adjustment value */}
          <div className="space-y-1">
            <Label htmlFor="wk-adj-val">
              Adjustment Value {isFlat ? "(amount)" : "(%)"} *
            </Label>
            <Input
              id="wk-adj-val"
              type="number"
              min={0}
              max={form.adjustmentType === "percentage" ? 100 : undefined}
              value={form.adjustmentValue}
              onChange={(e) =>
                setForm({ ...form, adjustmentValue: Number(e.target.value) })
              }
            />
          </div>

          {/* Currency (flat only) */}
          {isFlat && (
            <div className="space-y-1">
              <Label htmlFor="wk-currency">Currency Code *</Label>
              <Select
                value={form.currencyCode ?? ""}
                onValueChange={(v) =>
                  setForm({ ...form, currencyCode: v as CurrencyCode })
                }
              >
                <SelectTrigger id="wk-currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Optional caps */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="wk-min-cap">Min Cap (optional)</Label>
              <Input
                id="wk-min-cap"
                type="number"
                min={0}
                placeholder="No min cap"
                value={form.minCap ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    minCap: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="wk-max-cap">Max Cap (optional)</Label>
              <Input
                id="wk-max-cap"
                type="number"
                min={0}
                placeholder="No max cap"
                value={form.maxCap ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    maxCap: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSave(form, mode === "edit" && item ? item.id : undefined)
            }
            disabled={isSaving || !canSave}
          >
            {isSaving
              ? "Saving..."
              : mode === "create"
                ? "Add Rule"
                : "Update Rule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
