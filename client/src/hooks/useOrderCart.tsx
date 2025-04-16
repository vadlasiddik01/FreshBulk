import { useState, useEffect } from "react";
import { type OrderItem } from "@shared/schema";

// Custom hook for managing the order cart
export const useOrderCart = () => {
  // Load cart from localStorage if available
  const [items, setItems] = useState<OrderItem[]>(() => {
    const savedCart = localStorage.getItem("orderCart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Calculate total amount
  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("orderCart", JSON.stringify(items));
  }, [items]);

  // Add item to cart or update quantity if it already exists
  const addItem = (newItem: OrderItem) => {
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.productId === newItem.productId
      );

      if (existingItemIndex >= 0) {
        // If item already exists, update quantity and total
        const updatedItems = [...prevItems];
        const existingItem = updatedItems[existingItemIndex];
        
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + newItem.quantity,
          total: (existingItem.quantity + newItem.quantity) * existingItem.price
        };
        
        return updatedItems;
      } else {
        // Otherwise add new item
        return [...prevItems, newItem];
      }
    });
  };

  // Remove item from cart
  const removeItem = (index: number) => {
    setItems(prevItems => prevItems.filter((_, i) => i !== index));
  };

  // Update item quantity
  const updateQuantity = (index: number, quantity: number) => {
    setItems(prevItems => {
      const updatedItems = [...prevItems];
      const item = { ...updatedItems[index] };
      
      item.quantity = quantity;
      item.total = item.price * quantity;
      updatedItems[index] = item;
      
      return updatedItems;
    });
  };

  // Clear cart
  const clearCart = () => {
    setItems([]);
    localStorage.removeItem("orderCart");
  };

  return {
    items,
    totalAmount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  };
};
