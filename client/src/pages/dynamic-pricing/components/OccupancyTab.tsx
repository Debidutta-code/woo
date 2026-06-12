import { useState, useEffect, useCallback } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, TrendingUp, MoreVertical } from "lucide-react";
import toast from "react-hot-toast";
import Loader from "@/components/Loader/Loader";
import type { RoomTypes } from "@/pages/inventory/types";
import type {
  IOccupancyBasedDynamicPricing,
  ICOccupancyBasedDynamicPricingS,
  ICOccupancyBasedDynamicPricing,
} from "../interface";
import {
  createOccupancyBasedDynamicPricing,
  getOccupancyByRoomApiService,
  updateOccupancyBasedDynamicPricing,
  deleteOccupancyApiService,
} from "../services";
import type { ILoader, IDialogState, IDeleteDialogState } from "./shared.types";
import OccupancyDialog from "./OccupancyDialog";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

// ─── Props ───────────────────────────────────────────────────────────────────
interface OccupancyTabProps {
  propertyId: string;
  dynamicId: string;
  rooms: RoomTypes[];
  occupancyBasedDynamicPricings:IOccupancyBasedDynamicPricing[];
  refreshData: () => void;
}

export default function OccupancyTab({
  propertyId,
  dynamicId,
  rooms,
  occupancyBasedDynamicPricings,
  refreshData
}: OccupancyTabProps) {
  const [rules, setRules] = useState<IOccupancyBasedDynamicPricing[]>(occupancyBasedDynamicPricings);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [loader, setLoader] = useState<ILoader>({ isLoading: false, message: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [dialog, setDialog] = useState<IDialogState<IOccupancyBasedDynamicPricing>>({
    open: false,
    mode: "create",
    item: null,
  });
  const [deleteDialog, setDeleteDialog] = useState<IDeleteDialogState>({
    open: false,
    id: null,
    label: "",
  });

  const fetchRules = useCallback(async (roomId: string) => {
    if (!roomId) return;
    setLoader({ isLoading: true, message: "Loading occupancy rules..." });
    try {
      const res = await getOccupancyByRoomApiService(roomId);
      if (res.success) {
        setRules(res.data ?? []);
      } else {
        toast.error(res.message ?? "Failed to load occupancy rules");
      }
    } catch {
      toast.error("Failed to load occupancy rules");
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  }, []);

  useEffect(() => {
    if (selectedRoomId) fetchRules(selectedRoomId);
    else setRules(occupancyBasedDynamicPricings);
  }, [selectedRoomId, occupancyBasedDynamicPricings, fetchRules]);

  const handleSave = async (
    data: ICOccupancyBasedDynamicPricingS,
    id?: string
  ) => {
    setIsSaving(true);
    try {
      let res;
      if (id) {
        const updatePayload: ICOccupancyBasedDynamicPricing = {
          dynamicId,
          roomId: data.roomId,
          minInventoryPercentage: data.minInventoryPercentage,
          maxInventoryPercentage: data.maxInventoryPercentage,
          adjustmentType: data.adjustmentType,
          adjustmentValue: data.adjustmentValue,
          currencyCode: data.currencyCode,
          pricingType: data.pricingType,
          minCap: data.minCap,
          maxCap: data.maxCap,
        };
        res = await updateOccupancyBasedDynamicPricing(id, updatePayload);
      } else {
        res = await createOccupancyBasedDynamicPricing(propertyId, data);
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

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    setLoader({ isLoading: true, message: "Deleting rule..." });
    try {
      const res = await deleteOccupancyApiService(deleteDialog.id);
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

  const formatAdjustment = (rule: IOccupancyBasedDynamicPricing) =>
    rule.adjustmentType === "percentage"
      ? `${rule.adjustmentValue} %`
      : `${rule.adjustmentValue} ${rule.currencyCode ?? ""}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-[560px] items-start sm:items-center">
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
          // disabled={!selectedRoomId}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Rule
        </Button>
      </div>

      {loader.isLoading && (
        <div className="flex justify-center py-12">
          <Loader text={loader.message} />
        </div>
      )}

      {!loader.isLoading && rules.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <TrendingUp className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No Rules Yet</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Add an occupancy-based pricing rule for this room.
            </p>
            <Button onClick={() => setDialog({ open: true, mode: "create", item: null })}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Rule
            </Button>
          </CardContent>
        </Card>
      )}

      {!loader.isLoading && rules.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Rules for{" "}
              {rooms.find((r) => r.id === selectedRoomId)?.roomName ?? "All Rooms"}
              <Badge variant="secondary" className="ml-2">
                {rules.length} {rules.length === 1 ? "rule" : "rules"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Occupancy Range</TableHead>
                  <TableHead>Pricing Type</TableHead>
                  <TableHead>Adjustment Type</TableHead>
                  <TableHead>Adjustment Value</TableHead>
                  <TableHead>Cap</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <Badge variant="outline">
                        {rule.minInventoryPercentage}% – {rule.maxInventoryPercentage}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={rule.pricingType === "increase" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {rule.pricingType}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{rule.adjustmentType}</TableCell>
                    <TableCell className="font-medium">{formatAdjustment(rule)}</TableCell>
                    <TableCell>
                      {(rule.minCap !== null || rule.maxCap !== null) ? (
                        <div className="text-xs text-muted-foreground">
                          {rule.minCap !== null ? `Min: ${rule.minCap}` : ""}
                          {rule.minCap !== null && rule.maxCap !== null ? <br /> : ""}
                          {rule.maxCap !== null ? `Max: ${rule.maxCap}` : ""}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              setDialog({ open: true, mode: "edit", item: rule })
                            }
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                id: rule.id,
                                label: `${rule.minInventoryPercentage}%–${rule.maxInventoryPercentage}% rule`,
                              })
                            }
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <OccupancyDialog
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
