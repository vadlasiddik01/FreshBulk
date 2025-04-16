// Format a date string to a more readable format
export const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Format a date string to include time
export const formatDateTime = (dateString: string | Date): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format a price to Indian Rupees
export const formatPrice = (price: number | string): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return `₹${numPrice.toFixed(2)}`;
};

// Format Order Number (ensure it follows FBO-XXXXX format)
export const formatOrderNumber = (orderNumber: string): string => {
  if (!orderNumber) return '';
  
  // If already formatted correctly, return as is
  if (orderNumber.startsWith('FBO-')) {
    return orderNumber;
  }
  
  // Otherwise, add the prefix
  return `FBO-${orderNumber}`;
};

// Create a truncated version of text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '…';
};
