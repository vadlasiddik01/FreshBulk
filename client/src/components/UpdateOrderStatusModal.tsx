import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { OrderStatus, type Order } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

interface UpdateOrderStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

const UpdateOrderStatusModal: React.FC<UpdateOrderStatusModalProps> = ({ 
  open, 
  onOpenChange,
  order 
}) => {
  const [status, setStatus] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const { toast } = useToast();

  // Reset form when modal opens
  const onOpenChangeWrapper = (newOpen: boolean) => {
    if (newOpen && order) {
      setStatus(order.status);
      setNotes("");
    }
    onOpenChange(newOpen);
  };

  const updateStatusMutation = useMutation({
    mutationFn: async () => {
      if (!order) return null;
      const response = await apiRequest("PATCH", `/api/orders/${order.id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: `Order ${order?.orderNumber} status changed to ${status}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update order status: ${error}`,
        variant: "destructive",
      });
    },
  });

  const handleUpdateStatus = () => {
    updateStatusMutation.mutate();
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChangeWrapper}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-heading font-semibold">Update Order Status</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div>
            <p className="text-sm text-neutral-600 mb-2">
              Current Order: <span className="font-semibold text-neutral-800">{order.orderNumber}</span>
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="order-status">Status</Label>
            <Select
              value={status}
              onValueChange={setStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={OrderStatus.Pending}>{OrderStatus.Pending}</SelectItem>
                <SelectItem value={OrderStatus.InProgress}>{OrderStatus.InProgress}</SelectItem>
                <SelectItem value={OrderStatus.Delivered}>{OrderStatus.Delivered}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="status-notes">Notes (Optional)</Label>
            <Textarea
              id="status-notes"
              placeholder="Add any notes about this status change"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            type="button" 
            onClick={handleUpdateStatus}
            disabled={updateStatusMutation.isPending || status === order.status}
          >
            {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateOrderStatusModal;
