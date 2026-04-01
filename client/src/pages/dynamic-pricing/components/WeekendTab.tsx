import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Moon } from "lucide-react";
import toast from "react-hot-toast";
import Loader from "@/components/Loader/Loader";
import type { RoomTypes } from "@/pages/inventory/types";
import type {
  IWeekendDynamicPricing,
  ICWeekendDynamicPricingS,
  ICWeekendDynamicPricing,
  WeekEndDays,
} from "../interface";
import {
  createWeekendDynamicPricing,
  getWeekendPricingByRoomApiService,
  updateWeekendBasedDynamicPricing,
  deleteWeekendPricingApiService,
} from "../services";
import type { ILoader, IDialogState, IDeleteDialogState } from "./shared.types";
import WeekendDialog from "./WeekendDialog";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

// ─── Day label map ────────────────────────────────────────────────────────────
const DAY_LABEL: Record<WeekEndDays, string> = {
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface WeekendTabProps {
  propertyId: string;
  dynamicId: string;
  rooms: RoomTypes[];
  weekendDynamicPricings: IWeekendDynamicPricing[];
  refreshData: () => void;
}

export default function WeekendTab({
  propertyId,
  dynamicId,
  rooms,
  weekendDynamicPricings,
  refreshData
}: WeekendTabProps) {
  const [rules, setRules] = useState<IWeekendDynamicPricing[]>(
    weekendDynamicPricings,
  );
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [loader, setLoader] = useState<ILoader>({
    isLoading: false,
    message: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [dialog, setDialog] = useState<IDialogState<IWeekendDynamicPricing>>({
    open: false,
    mode: "create",
    item: null,
  });
  const [deleteDialog, setDeleteDialog] = useState<IDeleteDialogState>({
    open: false,
    id: null,
    label: "",
  });

  // ─── Fetch ───────────────────────────────────────────────────────────────
  const fetchRules = useCallback(async (roomId: string) => {
    if (!roomId) return;
    setLoader({ isLoading: true, message: "Loading weekend rules..." });
    try {
      const res = await getWeekendPricingByRoomApiService(roomId);
      if (res.success) {
        setRules(res.data ?? []);
      } else {
        toast.error(res.message ?? "Failed to load weekend rules");
      }
    } catch {
      toast.error("Failed to load weekend rules");
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  }, []);

  useEffect(() => {
    if (selectedRoomId) fetchRules(selectedRoomId);
    else setRules(weekendDynamicPricings);
  }, [selectedRoomId, weekendDynamicPricings, fetchRules]);

  // ─── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async (data: ICWeekendDynamicPricingS, id?: string) => {
    setIsSaving(true);
    try {
      let res;
      if (id) {
        const payload: ICWeekendDynamicPricing = {
          dynamicId,
          roomId: data.roomId,
          ruleName: data.ruleName,
          weekendDays: data.weekendDays,
          startDate: data.startDate,
          endDate: data.endDate,
          adjustmentType: data.adjustmentType,
          adjustmentValue: data.adjustmentValue,
          currencyCode: data.currencyCode,
          minCap: data.minCap,
          maxCap: data.maxCap,
        };
        res = await updateWeekendBasedDynamicPricing(id, payload);
      } else {
        res = await createWeekendDynamicPricing(propertyId, data);
      }
      if (res.success) {
        toast.success(res.message ?? "Rule saved successfully");
        setDialog({ open: false, mode: "create", item: null });
        fetchRules(selectedRoomId);
        refreshData();
      } else {
        toast.error(res.message ?? "Failed to save rule");
      }
    } catch {
      toast.error("Failed to save rule");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    setLoader({ isLoading: true, message: "Deleting rule..." });
    try {
      const res = await deleteWeekendPricingApiService(deleteDialog.id);
      if (res.success) {
        toast.success(res.message ?? "Rule deleted");
        setDeleteDialog({ open: false, id: null, label: "" });
        fetchRules(selectedRoomId);
        refreshData();
      } else {
        toast.error(res.message ?? "Failed to delete rule");
      }
    } catch {
      toast.error("Failed to delete rule");
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  const formatAdjustment = (rule: IWeekendDynamicPricing) =>
    rule.adjustmentType === "percentage"
      ? `${rule.adjustmentValue} %`
      : `${rule.adjustmentValue} ${rule.currencyCode ?? ""}`;

  const formatDate = (d: Date) => format(new Date(d), "dd MMM yyyy");

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex-1 max-w-xs">
          <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a room to view rules" />
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
        <Button
          onClick={() => setDialog({ open: true, mode: "create", item: null })}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Rule
        </Button>
      </div>

      {/* Loading */}
      {loader.isLoading && (
        <div className="flex justify-center py-12">
          <Loader text={loader.message} />
        </div>
      )}

      {/* Empty: no room */}
      {/* {!loader.isLoading  && rules.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Moon className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">Select a Room</h3>
            <p className="text-sm text-muted-foreground">
              Choose a room above to view or manage its weekend pricing rules.
            </p>
          </CardContent>
        </Card>
      )} */}

      {/* Empty: room selected, no rules */}
      {!loader.isLoading  && rules.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Moon className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No Weekend Rules Yet</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Create weekend pricing adjustments for Friday, Saturday, or
              Sunday.
            </p>
            <Button
              onClick={() =>
                setDialog({ open: true, mode: "create", item: null })
              }
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Rule
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Cards grid */}
      {!loader.isLoading && rules.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {rules.length} {rules.length === 1 ? "rule" : "rules"} for{" "}
            {rooms.find((r) => r.id === selectedRoomId)?.roomName ?? "All Rooms"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {rules.map((rule) => (
              <Card key={rule.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-tight">
                      {rule.ruleName}
                    </CardTitle>
                    <div className="flex gap-1 shrink-0">
                      {rule.weekendDays.map((d) => (
                        <Badge
                          key={d}
                          variant="secondary"
                          className="text-xs px-1.5"
                        >
                          {DAY_LABEL[d]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 pb-3">
                  <p className="text-xs text-muted-foreground">
                    {formatDate(rule.startDate)} → {formatDate(rule.endDate)}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {formatAdjustment(rule)}
                    </span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {rule.adjustmentType}
                    </Badge>
                  </div>
                  {(rule.minCap !== null || rule.maxCap !== null) && (
                    <p className="text-xs text-muted-foreground">
                      Cap: {rule.minCap !== null ? `min ${rule.minCap}` : ""}
                      {rule.minCap !== null && rule.maxCap !== null
                        ? " / "
                        : ""}
                      {rule.maxCap !== null ? `max ${rule.maxCap}` : ""}
                    </p>
                  )}
                  <div className="flex gap-1 pt-1 justify-end">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() =>
                        setDialog({ open: true, mode: "edit", item: rule })
                      }
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() =>
                        setDeleteDialog({
                          open: true,
                          id: rule.id,
                          label: rule.ruleName,
                        })
                      }
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Dialogs */}
      <WeekendDialog
        open={dialog.open}
        onOpenChange={(v) =>
          !v && setDialog({ open: false, mode: "create", item: null })
        }
        mode={dialog.mode}
        item={dialog.item}
        rooms={rooms}
        dynamicId={dynamicId}
        onSave={handleSave}
        isSaving={isSaving}
      />

      <DeleteConfirmDialog
        open={deleteDialog.open}
        label={deleteDialog.label}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, id: null, label: "" })}
        isDeleting={loader.isLoading}
      />
    </div>
  );
}
