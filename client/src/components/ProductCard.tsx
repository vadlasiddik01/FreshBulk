import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const handleAddToOrder = () => {
    onAddToCart(product);
  };

  const priceDisplay = `₹${product.price}/${product.unit}`;

  return (
    <Card className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="w-full h-48 overflow-hidden">
        <img
          src={product.imageUrl || "https://via.placeholder.com/300x200?text=No+Image"}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-heading font-semibold text-lg text-neutral-800">{product.name}</h3>
            <div className="mt-1 text-sm inline-block bg-neutral-100 text-neutral-600 px-2 py-1 rounded">
              {product.category}
            </div>
          </div>
          <div className="text-lg font-bold text-primary">{priceDisplay}</div>
        </div>
        <p className="mt-3 text-sm text-neutral-600">{product.description}</p>
        <Button 
          className="mt-4 w-full bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded transition-colors"
          onClick={handleAddToOrder}
        >
          Add to Order
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
