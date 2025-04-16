import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Product, type OrderItem } from "@shared/schema";

interface AddItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItem: (item: OrderItem) => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ open, onOpenChange, onAddItem }) => {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  useEffect(() => {
    if (open) {
      // Reset form when modal opens
      setSelectedProductId("");
      setQuantity(1);
      setSelectedProduct(null);
    }
  }, [open]);

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    const product = products.find(p => p.id.toString() === productId) || null;
    setSelectedProduct(product);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const handleAddItem = () => {
    if (!selectedProduct || quantity < 1) return;

    const item: OrderItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      price: parseFloat(selectedProduct.price.toString()),
      quantity,
      unit: selectedProduct.unit,
      total: parseFloat(selectedProduct.price.toString()) * quantity
    };

    onAddItem(item);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-heading font-semibold">Add Item to Order</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="product">Product</Label>
            <Select
              value={selectedProductId}
              onValueChange={handleProductChange}
            >
              <SelectTrigger id="product">
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} (₹{product.price}/{product.unit})
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
            />
          </div>

          {selectedProduct && (
            <div className="text-sm text-right font-medium">
              Total: ₹{(parseFloat(selectedProduct.price.toString()) * quantity).toFixed(2)}
            </div>
          )}
        </div>
        
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            type="button" 
            disabled={!selectedProduct}
            onClick={handleAddItem}
          >
            Add to Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemModal;
