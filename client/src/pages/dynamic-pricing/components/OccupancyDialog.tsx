import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { RoomTypes } from "@/pages/inventory/types";
import type {
  IOccupancyBasedDynamicPricing,
  ICOccupancyBasedDynamicPricingS,
} from "../interface";
import type { DiscountType } from "@/pages/tax-system/interface";
import type { CurrencyCode } from "@/components/currency-code/currency-code.type";
import { currencies } from "@/components/currency-code/cuurency";
import type { DynamicPricingType } from "../interface/occupancy.interface";


interface OccupancyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  item: IOccupancyBasedDynamicPricing | null;
  rooms: RoomTypes[];
  dynamicId: string;
  onSave: (
    data: ICOccupancyBasedDynamicPricingS,
    id?: string
  ) => Promise<void>;
  isSaving: boolean;
}

// ─── Default form state ───────────────────────────────────────────────────────
const DEFAULT_FORM: ICOccupancyBasedDynamicPricingS = {
  roomId: "",
  minInventoryPercentage: 0,
  maxInventoryPercentage: 100,
  adjustmentType: "percentage",
  adjustmentValue: 0,
  currencyCode: null,
  maxCap: null,
  minCap: null,
  pricingType: "increase",
};

export default function OccupancyDialog({
  open,
  onOpenChange,
  mode,
  item,
  rooms,
  dynamicId,
  onSave,
  isSaving,
}: OccupancyDialogProps) {
  const [form, setForm] = useState<ICOccupancyBasedDynamicPricingS>(DEFAULT_FORM);

  // ─── Sync form when dialog opens ──────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && item) {
      setForm({
        roomId: item.roomId,
        minInventoryPercentage: item.minInventoryPercentage,
        maxInventoryPercentage: item.maxInventoryPercentage,
        adjustmentType: item.adjustmentType,
        adjustmentValue: item.adjustmentValue,
        currencyCode: item.currencyCode,
        maxCap: item.maxCap,
        minCap: item.minCap,
        pricingType: item.pricingType,
      });
    } else {
      setForm(DEFAULT_FORM);
    }
  }, [open, mode, item, dynamicId]);

  const handleClose = () => {
    setForm(DEFAULT_FORM);
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    await onSave(form, mode === "edit" && item ? item.id : undefined);
  };

  const isFlat = form.adjustmentType === "flat";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Occupancy Rule" : "Edit Occupancy Rule"}
          </DialogTitle>
          <DialogDescription>
            Price adjustments trigger when inventory falls within the specified
            occupancy range.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Room */}
          <div className="space-y-1">
            <Label htmlFor="occ-room">Room *</Label>
            <Select
              value={form.roomId}
              onValueChange={(v) => setForm({ ...form, roomId: v })}
            >
              <SelectTrigger id="occ-room">
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

          {/* Min / Max inventory percentage */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="occ-min">Min Occupancy % *</Label>
              <Input
                id="occ-min"
                type="number"
                min={0}
                max={100}
                value={form.minInventoryPercentage}
                onChange={(e) =>
                  setForm({
                    ...form,
                    minInventoryPercentage: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="occ-max">Max Occupancy % *</Label>
              <Input
                id="occ-max"
                type="number"
                min={0}
                max={100}
                value={form.maxInventoryPercentage}
                onChange={(e) =>
                  setForm({
                    ...form,
                    maxInventoryPercentage: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          {/* Adjustment type */}
          <div className="space-y-1">
            <Label htmlFor="occ-adj-type">Adjustment Type *</Label>
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
              <SelectTrigger id="occ-adj-type">
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
            <Label htmlFor="occ-adj-val">
              Adjustment Value{isFlat ? " (amount)" : " (%)"}  *
            </Label>
            <Input
              id="occ-adj-val"
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
              <Label htmlFor="occ-currency">Currency Code *</Label>
              <Select
                value={form.currencyCode ?? ""}
                onValueChange={(v) =>
                  setForm({ ...form, currencyCode: v as CurrencyCode })
                }
              >
                <SelectTrigger id="occ-currency">
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

          {/* Pricing type */}
          <div className="space-y-1">
            <Label htmlFor="occ-pricing-type">Pricing Type *</Label>
            <Select
              value={form.pricingType}
              onValueChange={(v) =>
                setForm({ ...form, pricingType: v as DynamicPricingType })
              }
            >
              <SelectTrigger id="occ-pricing-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="increase">Increase</SelectItem>
                <SelectItem value="decrease">Decrease</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Optional caps */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="occ-min-cap">Min Cap (optional)</Label>
              <Input
                id="occ-min-cap"
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
              <Label htmlFor="occ-max-cap">Max Cap (optional)</Label>
              <Input
                id="occ-max-cap"
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
            onClick={handleSubmit}
            disabled={isSaving || !form.roomId}
          >
            {isSaving ? "Saving..." : mode === "create" ? "Add Rule" : "Update Rule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
