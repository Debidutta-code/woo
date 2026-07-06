import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    ISeasonalDynamicPricing,
    ISeasonalDynamicPricingS,
    SeasonalDynamicPricingEnumType,
} from "../interface";
import type { DiscountType } from "@/pages/tax-system/interface";
import type { CurrencyCode } from "@/components/currency-code/currency-code.type";
import { currencies } from "@/components/currency-code/cuurency";
import type { DynamicPricingType } from "../interface/occupancy.interface";


interface SeasonalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "create" | "edit";
    item: ISeasonalDynamicPricing | null;
    rooms: RoomTypes[];
    dynamicId: string;
    onSave: (data: ISeasonalDynamicPricingS, id?: string) => Promise<void>;
    isSaving: boolean;
}

const DEFAULT_FORM: ISeasonalDynamicPricingS = {
    roomId: "",
    ruleName: "",
    periodType: "season",
    startDate: new Date(),
    endDate: new Date(),
    adjustmentType: "percentage",
    adjustmentValue: 0,
    currencyCode: null,
    maxCap: null,
    minCap: null,
    pricingType: "increase",
};

export default function SeasonalDialog({
    open,
    onOpenChange,
    mode,
    item,
    rooms,
    dynamicId,
    onSave,
    isSaving,
}: SeasonalDialogProps) {
    const [form, setForm] = useState<ISeasonalDynamicPricingS>(DEFAULT_FORM);

    useEffect(() => {
        if (!open) return;
        if (mode === "edit" && item) {
            setForm({
                roomId: item.roomId,
                ruleName: item.ruleName,
                periodType: item.periodType,
                startDate: new Date(item.startDate),
                endDate: new Date(item.endDate),
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

    const isFlat = form.adjustmentType === "flat";
    const canSave =
        form.roomId && form.ruleName.trim() && form.startDate && form.endDate;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "create" ? "Add Seasonal Rule" : "Edit Seasonal Rule"}
                    </DialogTitle>
                    <DialogDescription>
                        Configure price adjustments for specific seasons or holidays.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-1">
                        <Label htmlFor="sea-room">Room *</Label>
                        <Select
                            value={form.roomId}
                            onValueChange={(v) => setForm({ ...form, roomId: v })}
                        >
                            <SelectTrigger id="sea-room">
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

                    <div className="space-y-1">
                        <Label htmlFor="sea-name">Rule Name *</Label>
                        <Input
                            id="sea-name"
                            placeholder="e.g., Summer Peak, Diwali Holiday"
                            value={form.ruleName}
                            onChange={(e) => setForm({ ...form, ruleName: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="sea-period">Period Type *</Label>
                        <Select
                            value={form.periodType}
                            onValueChange={(v) =>
                                setForm({ ...form, periodType: v as SeasonalDynamicPricingEnumType })
                            }
                        >
                            <SelectTrigger id="sea-period">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="season">Season</SelectItem>
                                <SelectItem value="holiday">Holiday</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Start Date *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !form.startDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {form.startDate ? format(form.startDate, "dd MMM yyyy") : "Pick date"}
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
                                            !form.endDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {form.endDate ? format(form.endDate, "dd MMM yyyy") : "Pick date"}
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

                    <div className="space-y-1">
                        <Label htmlFor="sea-adj-type">Adjustment Type *</Label>
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
                            <SelectTrigger id="sea-adj-type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                                <SelectItem value="flat">Flat Amount</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="sea-adj-val">
                            Adjustment Value {isFlat ? "(amount)" : "(%)"}  *
                        </Label>
                        <Input
                            id="sea-adj-val"
                            type="number"
                            min={0}
                            max={form.adjustmentType === "percentage" ? 100 : undefined}
                            value={form.adjustmentValue}
                            onChange={(e) =>
                                setForm({ ...form, adjustmentValue: Number(e.target.value) })
                            }
                        />
                    </div>

                    {isFlat && (
                        <div className="space-y-1">
                            <Label htmlFor="sea-currency">Currency Code *</Label>
                            <Select
                                value={form.currencyCode ?? ""}
                                onValueChange={(v) =>
                                    setForm({ ...form, currencyCode: v as CurrencyCode })
                                }
                            >
                                <SelectTrigger id="sea-currency">
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

                    <div className="space-y-1">
                        <Label htmlFor="sea-pricing-type">Pricing Type *</Label>
                        <Select
                            value={form.pricingType}
                            onValueChange={(v) =>
                                setForm({ ...form, pricingType: v as DynamicPricingType })
                            }
                        >
                            <SelectTrigger id="sea-pricing-type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="increase">Increase</SelectItem>
                                <SelectItem value="decrease">Decrease</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="sea-min-cap">Min Cap (optional)</Label>
                            <Input
                                id="sea-min-cap"
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
                            <Label htmlFor="sea-max-cap">Max Cap (optional)</Label>
                            <Input
                                id="sea-max-cap"
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
                        onClick={() => onSave(form, mode === "edit" && item ? item.id : undefined)}
                        disabled={isSaving || !canSave}
                    >
                        {isSaving ? "Saving..." : mode === "create" ? "Add Rule" : "Update Rule"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}