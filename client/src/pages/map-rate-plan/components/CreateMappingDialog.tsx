import { useState } from "react";
import { toast } from "react-hot-toast";
import { Plus, X, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ICreateCharges, RatePlan, RoomTypes, IBaseGuestAmounts, IAdditionalGuestAmount, qualifyingAgeCode } from "../types";

interface CreateMappingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (mapping: ICreateCharges) => void;
    ratePlans: RatePlan[];
    roomTypes: RoomTypes[];
    filters: {
        ratePlanCode?: string;
        roomTypeCode?: string;
        startDate?: string;
        endDate?: string;
    };
}

export default function CreateMappingDialog({
    open,
    onOpenChange,
    onSave,
    ratePlans,
    roomTypes,
    filters,
}: CreateMappingDialogProps) {
    const [formData, setFormData] = useState<ICreateCharges>({
        ratePlanCode: filters.ratePlanCode || "",
        roomTypeCode: filters.roomTypeCode || "",
        startDate: filters.startDate || "",
        endDate: filters.endDate || "",
        currencyCode: "USD",
        baseByGuestAmounts: [{ numberOfGuests: 1, amountBeforeTax: "" }],
        additionalGuestAmounts: [],
    });

    const handleAddBaseGuestAmount = () => {
        const nextGuestNumber = formData.baseByGuestAmounts.length + 1;
        setFormData({
            ...formData,
            baseByGuestAmounts: [
                ...formData.baseByGuestAmounts,
                { numberOfGuests: nextGuestNumber, amountBeforeTax: "" },
            ],
        });
    };

    const handleRemoveBaseGuestAmount = (index: number) => {
        if (formData.baseByGuestAmounts.length <= 1) {
            toast.error("At least one base guest amount is required");
            return;
        }
        const updated = formData.baseByGuestAmounts.filter((_, i) => i !== index);
        setFormData({ ...formData, baseByGuestAmounts: updated });
    };

    const handleBaseGuestAmountChange = (index: number, field: keyof IBaseGuestAmounts, value: number) => {
        const updated = [...formData.baseByGuestAmounts];
        updated[index] = { ...updated[index], [field]: value };
        setFormData({ ...formData, baseByGuestAmounts: updated });
    };

    const handleAddAdditionalGuestAmount = () => {
        // Find the first available age code that hasn't been selected
        const availableOptions = ["10", "8", "5"];
        const usedCodes = formData.additionalGuestAmounts.map(item => item.ageQualifyingCode);
        const nextAvailableCode = (availableOptions.find(code => !usedCodes.includes(code as qualifyingAgeCode)) || "10") as qualifyingAgeCode;
        
        setFormData({   
            ...formData,
            additionalGuestAmounts: [
                ...formData.additionalGuestAmounts,
                { ageQualifyingCode: nextAvailableCode, amount: 0 },
            ],
        });
    };

    const handleRemoveAdditionalGuestAmount = (index: number) => {
        const updated = formData.additionalGuestAmounts.filter((_, i) => i !== index);
        setFormData({ ...formData, additionalGuestAmounts: updated });
    };

    const handleAdditionalGuestAmountChange = (
        index: number,
        field: keyof IAdditionalGuestAmount,
        value: string | number
    ) => {
        const updated = [...formData.additionalGuestAmounts];
        updated[index] = { ...updated[index], [field]: value };
        setFormData({ ...formData, additionalGuestAmounts: updated });
    };

    const handleSubmit = () => {
        // Validation
        if (!formData.ratePlanCode) {
            toast.error("Please select a rate plan");
            return;
        }
        if (!formData.roomTypeCode) {
            toast.error("Please select a room type");
            return;
        }
        if (!formData.startDate || !formData.endDate) {
            toast.error("Please select start and end dates");
            return;
        }
        if (formData.baseByGuestAmounts.length === 0) {
            toast.error("At least one base guest amount is required");
            return;
        }

        // Check if all amounts are valid
        const hasInvalidAmount = formData.baseByGuestAmounts.some((item) => parseFloat(item.amountBeforeTax) <= 0);
        if (hasInvalidAmount) {
            toast.error("All base guest amounts must be greater than 0");
            return;
        }

        onSave(formData);
        handleClose();
    };

    const handleClose = () => {
        setFormData({
            ratePlanCode: filters.ratePlanCode || "",
            roomTypeCode: filters.roomTypeCode || "",
            startDate: filters.startDate || "",
            endDate: filters.endDate || "",
            currencyCode: "USD",
            baseByGuestAmounts: [{ numberOfGuests: 1, amountBeforeTax: "" }],
            additionalGuestAmounts: [],
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Create New Mapping</DialogTitle>
                    <DialogDescription>
                        Map a rate plan to a room type and set pricing details
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Room Type *</Label>
                        <Select
                            value={formData.roomTypeCode}
                            onValueChange={(value) =>
                                setFormData({ ...formData, roomTypeCode: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select room type" />
                            </SelectTrigger>
                            <SelectContent>
                                {roomTypes.map((room) => (
                                    <SelectItem key={room.id} value={room.roomType}>
                                        {room.roomName} ({room.roomType})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                        <div className="space-y-2">
                            <Label>Rate Plan *</Label>
                            <Select
                                value={formData.ratePlanCode}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, ratePlanCode: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select rate plan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ratePlans.map((plan) => (
                                        <SelectItem key={plan.id} value={plan.ratePlanCode}>
                                            {plan.ratePlanName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>



                        <div className="space-y-2">
                            <Label>Start Date *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full h-11 justify-start text-left font-normal",
                                            !formData.startDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.startDate ? format(new Date(formData.startDate), "MMM dd, yyyy") : "Select start date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        className="rounded-md border"
                                        mode="single"
                                        selected={formData.startDate ? new Date(formData.startDate) : undefined}
                                        onSelect={(date) => {
                                            if (date) {
                                                const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                                                setFormData({ ...formData, startDate: formatted });
                                            }
                                        }}
                                        disabled={(date) => {
                                            const today = new Date(new Date().setHours(0, 0, 0, 0));
                                            return date < today;
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label>End Date *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full h-11 justify-start text-left font-normal",
                                            !formData.endDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.endDate ? format(new Date(formData.endDate), "MMM dd, yyyy") : "Select end date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        className="rounded-md border"
                                        mode="single"
                                        selected={formData.endDate ? new Date(formData.endDate) : undefined}
                                        onSelect={(date) => {
                                            if (date) {
                                                const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                                                setFormData({ ...formData, endDate: formatted });
                                            }
                                        }}
                                        disabled={(date) => {
                                            const today = new Date(new Date().setHours(0, 0, 0, 0));
                                            if (date < today) return true;
                                            if (formData.startDate && date < new Date(formData.startDate)) return true;
                                            return false;
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label>Currency Code</Label>
                            <Input
                                value={formData.currencyCode}
                                onChange={(e) =>
                                    setFormData({ ...formData, currencyCode: e.target.value })
                                }
                                placeholder="USD"
                            />
                        </div>
                    </div>

                    {/* Base Guest Amounts */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Base Guest Amounts *</CardTitle>
                            <CardDescription>
                                Set pricing based on the number of guests
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {formData.baseByGuestAmounts.map((item, index) => (
                                <div key={index} className="flex items-end gap-3">
                                    <div className="flex-1 space-y-2">
                                        <Label>Number of Guests</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.numberOfGuests}
                                            onChange={(e) =>
                                                handleBaseGuestAmountChange(
                                                    index,
                                                    "numberOfGuests",
                                                    parseInt(e.target.value) || 0
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Label>Amount ($)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.amountBeforeTax}
                                            onChange={(e) =>
                                                handleBaseGuestAmountChange(
                                                    index,
                                                    "amountBeforeTax",
                                                    parseFloat(e.target.value) || 0
                                                )
                                            }
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleRemoveBaseGuestAmount(index)}
                                        disabled={formData.baseByGuestAmounts.length <= 1}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddBaseGuestAmount}
                                className="w-full"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Guest Amount
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Additional Guest Amounts */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Additional Guest Amounts (Optional)</CardTitle>
                            <CardDescription>
                                Set pricing for additional guests by age category
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {formData.additionalGuestAmounts.map((item, index) => (
                                <div key={index} className="flex items-end gap-3">
                                    <div className="flex-1 space-y-2">
                                        <Label>Age Code</Label>
                                        <Select
                                            value={item.ageQualifyingCode}
                                            onValueChange={(value) =>
                                                handleAdditionalGuestAmountChange(index, "ageQualifyingCode", value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[
                                                    { value: "10", label: "Adult" },
                                                    { value: "8", label: "Child" },
                                                    { value: "5", label: "Infant" },
                                                ].filter((option) => {
                                                    // Show current selection or options not yet selected by other rows
                                                    return (
                                                        option.value === item.ageQualifyingCode ||
                                                        !formData.additionalGuestAmounts.some(
                                                            (guest, guestIndex) => 
                                                                guestIndex !== index && guest.ageQualifyingCode === option.value
                                                        )
                                                    );
                                                }).map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Label>Amount ($)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.amount}
                                            onChange={(e) =>
                                                handleAdditionalGuestAmountChange(
                                                    index,
                                                    "amount",
                                                    parseFloat(e.target.value) || 0
                                                )
                                            }
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleRemoveAdditionalGuestAmount(index)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddAdditionalGuestAmount}
                                className="w-full"
                                disabled={formData.additionalGuestAmounts.length >= 3}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Additional Guest Amount
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>Create Mapping</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
