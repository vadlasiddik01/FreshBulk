import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { type OrderItem } from "@shared/schema";

interface OrderItemsTableProps {
  items: OrderItem[];
  editable?: boolean;
  onUpdateQuantity?: (index: number, quantity: number) => void;
  onRemoveItem?: (index: number) => void;
  totalAmount: number;
}

const OrderItemsTable: React.FC<OrderItemsTableProps> = ({
  items,
  editable = false,
  onUpdateQuantity,
  onRemoveItem,
  totalAmount
}) => {
  const handleQuantityChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value > 0 && onUpdateQuantity) {
      onUpdateQuantity(index, value);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (onRemoveItem) {
      onRemoveItem(index);
    }
  };

  return (
    <div className="border border-neutral-300 rounded-md overflow-hidden">
      <Table>
        <TableHeader className="bg-neutral-100">
          <TableRow>
            <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Product</TableHead>
            <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Unit Price</TableHead>
            <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Quantity</TableHead>
            <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Total</TableHead>
            {editable && (
              <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Action</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white divide-y divide-neutral-200">
          {items.length > 0 ? (
            items.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="text-sm font-medium text-neutral-800">
                  {item.productName}
                </TableCell>
                <TableCell className="text-sm text-neutral-600">
                  ₹{item.price}/{item.unit}
                </TableCell>
                <TableCell>
                  {editable ? (
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, e)}
                      className="w-20 border border-neutral-300 rounded-md py-1 px-2 focus:ring-primary focus:border-primary"
                    />
                  ) : (
                    <div className="text-sm text-neutral-600">
                      {item.quantity} {item.unit}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-sm font-medium text-neutral-800">
                  ₹{item.total}
                </TableCell>
                {editable && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(index)}
                      className="text-[#F44336] hover:text-red-700 hover:bg-transparent"
                    >
                      <Trash className="h-5 w-5" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={editable ? 5 : 4} className="text-center py-4 text-sm text-neutral-500">
                No items in this order
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter className="bg-neutral-50">
          <TableRow>
            <TableCell colSpan={editable ? 3 : 3} className="text-right text-sm font-medium text-neutral-800">
              Total Order Value:
            </TableCell>
            <TableCell className="whitespace-nowrap">
              <div className="text-lg font-bold text-primary">₹{totalAmount}</div>
            </TableCell>
            {editable && <TableCell />}
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default OrderItemsTable;
