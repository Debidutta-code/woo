import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Pencil, Plus, Trash2, MapPin, Image, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import type { IExplorDestination, ICExplorDestination } from "../types";
import {
  createExplorDestinationService,
  getExplorDestinationsService,
  updateExplorDestinationService,
  deleteExplorDestinationService,
} from "../services/explor-destinations.services";
import ImageUploadModal from "@/components/property/ImageUploadModal";



export default function ExplorDestination() {
  const [destinations, setDestinations] = useState<IExplorDestination[]>([]);
  const [loading, setLoading] = useState(false);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Image upload modal state — separate for create vs edit
  const [isCreateImageModalOpen, setIsCreateImageModalOpen] = useState(false);
  const [isEditImageModalOpen, setIsEditImageModalOpen] = useState(false);

  const [createForm, setCreateForm] = useState<ICExplorDestination>({
    destinationImage:"",
    destinationName:"",
    slNo:0
  });
  const [editForm, setEditForm] = useState<ICExplorDestination>({
    destinationImage:"",
    destinationName:"",
    slNo:0
  });
  const [selectedDestination, setSelectedDestination] =
    useState<IExplorDestination | null>(null);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    setLoading(true);
    const response = await getExplorDestinationsService();
    if (response?.success) {
      setDestinations(response.data);
    } else {
      toast.error(response?.message || "Failed to fetch destinations");
    }
    setLoading(false);
  };

  const sortedDestinations = useMemo(() => {
    return [...destinations].sort((a, b) => a.slNo - b.slNo);
  }, [destinations]);

  // ─── Create ───────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!createForm.destinationName.trim()) {
      toast.error("Destination name is required");
      return;
    }
    const response = await createExplorDestinationService(createForm);
    if (response?.success) {
      toast.success("Destination created successfully");
      await fetchDestinations();
      setCreateForm({
        destinationImage:"",
        destinationName:"",
        slNo:0
      });
      setIsCreateDialogOpen(false);
    } else {
      toast.error(response?.message || "Failed to create destination");
    }
  };

  // ─── Edit ─────────────────────────────────────────────────────────────────
  const openEditDialog = (dest: IExplorDestination) => {
    setSelectedDestination(dest);
    setEditForm({
      destinationName: dest.destinationName,
      destinationImage: dest.destinationImage,
      slNo: dest.slNo,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedDestination?.id) {
      toast.error("No destination selected");
      return;
    }
    if (!editForm.destinationName.trim()) {
      toast.error("Destination name is required");
      return;
    }
    const response = await updateExplorDestinationService(
      selectedDestination.id,
      editForm,
    );
    if (response?.success) {
      toast.success("Destination updated successfully");
      await fetchDestinations();
      setIsEditDialogOpen(false);
      setSelectedDestination(null);
      setEditForm({
        destinationImage:"",
        destinationName:"",
        slNo:0
      });
    } else {
      toast.error(response?.message || "Failed to update destination");
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    const response = await deleteExplorDestinationService(id);
    if (response?.success) {
      toast.success("Destination deleted successfully");
      await fetchDestinations();
    } else {
      toast.error(response?.message || "Failed to delete destination");
    }
  };

  // ─── Shared form fields renderer ──────────────────────────────────────────
  const renderFormFields = (
    form: ICExplorDestination,
    onChange: (field: keyof ICExplorDestination, value: string | number) => void,
    onOpenImageModal: () => void,
  ) => (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="destinationName">Destination Name *</Label>
        <Input
          id="destinationName"
          value={form.destinationName}
          onChange={(e) => onChange("destinationName", e.target.value)}
          placeholder="e.g., Maldives"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Destination Image</Label>
        {form.destinationImage ? (
          <div className="relative">
            <img
              src={form.destinationImage}
              alt="Destination preview"
              className="h-36 w-full rounded-md object-cover border"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <button
              type="button"
              onClick={() => onChange("destinationImage", "")}
              className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
              aria-label="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onOpenImageModal}
              className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-xs px-2 py-1 rounded-md hover:bg-black/80 transition-colors flex items-center gap-1"
            >
              <Upload className="h-3 w-3" /> Change
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenImageModal}
            className="w-full h-32 rounded-md border-2 border-dashed border-gray-300 hover:border-gray-400 flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-gray-600 transition-colors"
          >
            <Upload className="h-6 w-6" />
            <span className="text-sm">Click to upload image</span>
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slNo">Serial / Sort Order</Label>
        <Input
          id="slNo"
          type="number"
          min={0}
          value={form.slNo}
          onChange={(e) => onChange("slNo", Number(e.target.value))}
          placeholder="0"
        />
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Explor Destinations</CardTitle>
            <CardDescription>
              Manage destinations shown in the explore section
            </CardDescription>
          </div>

          {/* ── Create Dialog ── */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Destination
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Destination</DialogTitle>
                <DialogDescription>
                  Create a new destination for the explore section
                </DialogDescription>
              </DialogHeader>

              {renderFormFields(
                createForm,
                (field, value) => setCreateForm((prev) => ({ ...prev, [field]: value })),
                () => setIsCreateImageModalOpen(true),
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setCreateForm({
                      destinationImage:"",
                      destinationName:"",
                      slNo:0
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreate}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="w-full text-center py-12 text-gray-500">
            Loading destinations...
          </div>
        ) : sortedDestinations.length === 0 ? (
          <div className="w-full text-center py-12 text-gray-500">
            No destinations found. Add your first destination to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedDestinations.map((dest) => (
              <div
                key={dest.id}
                className="relative rounded-lg border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Image */}
                {dest.destinationImage ? (
                  <img
                    src={dest.destinationImage}
                    alt={dest.destinationName}
                    className="h-36 w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="h-36 w-full flex items-center justify-center bg-muted">
                    <Image className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}

                {/* Content */}
                <div className="p-3">
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium text-sm truncate">
                        {dest.destinationName}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      #{dest.slNo}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 mt-2 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:text-blue-600"
                      onClick={() => openEditDialog(dest)}
                      aria-label={`Edit ${dest.destinationName}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:text-red-500"
                      onClick={() => handleDelete(dest.id)}
                      aria-label={`Delete ${dest.destinationName}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Edit Dialog ── */}
        <Dialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) {
              setSelectedDestination(null);
              setEditForm({
                destinationImage:"",
                destinationName:"",
                slNo:0
              });
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Destination</DialogTitle>
              <DialogDescription>
                Update the selected destination details
              </DialogDescription>
            </DialogHeader>

            {renderFormFields(
              editForm,
              (field, value) => setEditForm((prev) => ({ ...prev, [field]: value })),
              () => setIsEditImageModalOpen(true),
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedDestination(null);
                  setEditForm({
                    destinationImage:"",
                    destinationName:"",
                    slNo:0
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdate}>Update</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Image Upload Modals ── */}
        <ImageUploadModal
          isOpen={isCreateImageModalOpen}
          onClose={() => setIsCreateImageModalOpen(false)}
          onUploadSuccess={(urls) => {
            if (urls[0]) setCreateForm((prev) => ({ ...prev, destinationImage: urls[0] }));
          }}
        />
        <ImageUploadModal
          isOpen={isEditImageModalOpen}
          onClose={() => setIsEditImageModalOpen(false)}
          onUploadSuccess={(urls) => {
            if (urls[0]) setEditForm((prev) => ({ ...prev, destinationImage: urls[0] }));
          }}
        />
      </CardContent>
    </Card>
  );
}
