import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductCard from "@/components/ProductCard";
import { useOrderCart } from "@/hooks/useOrderCart";
import { ProductCategory, type Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const ProductCatalog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOption, setSortOption] = useState("name-asc");
  const { addItem } = useOrderCart();
  const { toast } = useToast();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Apply filters and sorting
  const filteredAndSortedProducts = [...products]
    // Filter by search query
    .filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    // Filter by category
    .filter(product => 
      categoryFilter === "all" || product.category === categoryFilter
    )
    // Sort products
    .sort((a, b) => {
      switch (sortOption) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return parseFloat(a.price.toString()) - parseFloat(b.price.toString());
        case "price-desc":
          return parseFloat(b.price.toString()) - parseFloat(a.price.toString());
        default:
          return 0;
      }
    });

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      productName: product.name,
      price: parseFloat(product.price.toString()),
      quantity: 1,
      unit: product.unit,
      total: parseFloat(product.price.toString())
    });

    toast({
      title: "Added to Order",
      description: `${product.name} has been added to your order.`,
    });
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-neutral-800">Fresh Produce Catalog</h1>
        <p className="text-neutral-600 mt-2">Browse our selection of fresh fruits and vegetables for bulk ordering</p>
      </div>
      
      {/* Product Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 h-4 w-4" />
          <Input 
            type="text" 
            className="pl-10 pr-3 py-2 w-full border border-neutral-300 rounded-md focus:ring-primary focus:border-primary" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Select
            value={categoryFilter}
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger className="border border-neutral-300 rounded-md py-2 px-3 focus:ring-primary focus:border-primary">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value={ProductCategory.Vegetables}>Vegetables</SelectItem>
              <SelectItem value={ProductCategory.Fruits}>Fruits</SelectItem>
              <SelectItem value={ProductCategory.LeafyGreens}>Leafy Greens</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={sortOption}
            onValueChange={setSortOption}
          >
            <SelectTrigger className="border border-neutral-300 rounded-md py-2 px-3 focus:ring-primary focus:border-primary">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="price-asc">Price (Low to High)</SelectItem>
              <SelectItem value="price-desc">Price (High to Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-[350px] animate-pulse">
              <div className="w-full h-48 bg-neutral-200"></div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="h-5 bg-neutral-200 rounded w-20 mb-2"></div>
                    <div className="h-4 bg-neutral-200 rounded w-16"></div>
                  </div>
                  <div className="h-5 bg-neutral-200 rounded w-14"></div>
                </div>
                <div className="h-4 bg-neutral-200 rounded w-full mt-3"></div>
                <div className="h-10 bg-neutral-200 rounded w-full mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredAndSortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={handleAddToCart} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <SlidersHorizontal className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700">No products found</h3>
          <p className="text-neutral-500 mt-2">Try adjusting your filters or search query</p>
        </div>
      )}
    </section>
  );
};

export default ProductCatalog;
