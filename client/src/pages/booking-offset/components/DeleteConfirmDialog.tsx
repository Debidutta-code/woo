import type { RatePlan } from "@/pages/tax-system/interface";

interface DeleteConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  showRatePlan?: boolean;
  ratePlans?: RatePlan[];
  ratePlanId?: string;
  onRatePlanChange?: (ratePlanId: string) => void;
  showDateRange?: boolean;
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
}

export default function DeleteConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
  showRatePlan = false,
  ratePlans = [],
  ratePlanId = "",
  onRatePlanChange,
  showDateRange = false,
  startDate = "",
  endDate = "",
  onStartDateChange,
  onEndDateChange,
}: DeleteConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full mx-4 p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground mt-2">{message}</p>
          </div>
          {(showRatePlan || showDateRange) && (
            <div
              className={`grid grid-cols-1 ${
                showRatePlan && showDateRange
                  ? "md:grid-cols-3"
                  : "md:grid-cols-2"
              } gap-4`}
            >
              {showRatePlan && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Rate Plan
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={ratePlanId}
                    onChange={(e) => onRatePlanChange?.(e.target.value)}
                  >
                    <option value="">Select a Rate Plan</option>
                    {ratePlans.map((ratePlan) => (
                      <option key={ratePlan.id} value={ratePlan.id}>
                        {ratePlan.ratePlanName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {showDateRange && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={startDate}
                    onChange={(e) => onStartDateChange?.(e.target.value)}
                  />
                </div>
              )}
              {showDateRange && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={endDate}
                    onChange={(e) => onEndDateChange?.(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
