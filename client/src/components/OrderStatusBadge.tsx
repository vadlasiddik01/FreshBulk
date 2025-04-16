import { OrderStatus, type OrderStatusType } from "@shared/schema";

interface OrderStatusBadgeProps {
  status: OrderStatusType;
  size?: "sm" | "md" | "lg";
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, size = "md" }) => {
  let bgColor = "";
  
  switch (status) {
    case OrderStatus.Pending:
      bgColor = "bg-[#FFC107] text-white";
      break;
    case OrderStatus.InProgress:
      bgColor = "bg-[#2196F3] text-white";
      break;
    case OrderStatus.Delivered:
      bgColor = "bg-[#4CAF50] text-white";
      break;
    default:
      bgColor = "bg-neutral-400 text-white";
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base"
  };

  return (
    <span className={`inline-flex items-center ${sizeClasses[size]} rounded-full font-medium ${bgColor}`}>
      {status}
    </span>
  );
};

export default OrderStatusBadge;
