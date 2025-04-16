import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Product } from "@shared/schema";

interface DeleteProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

const DeleteProductDialog: React.FC<DeleteProductDialogProps> = ({ 
  open, 
  onOpenChange, 
  product 
}) => {
  const { toast } = useToast();

  const deleteProductMutation = useMutation({
    mutationFn: async () => {
      if (!product) return;
      await apiRequest("DELETE", `/api/products/${product.id}`, undefined);
    },
    onSuccess: () => {
      toast({
        title: "Product Deleted",
        description: `${product?.name} has been removed from the catalog.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete product: ${error}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteProductMutation.mutate();
  };

  if (!product) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <span className="font-medium">{product.name}</span> from the product catalog.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
            disabled={deleteProductMutation.isPending}
          >
            {deleteProductMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteProductDialog;
