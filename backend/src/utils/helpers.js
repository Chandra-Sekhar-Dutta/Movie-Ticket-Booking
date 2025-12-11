import { v4 as uuidv4 } from 'uuid';

export const generateBookingReference = () => {
  return `BMV${Date.now()}${Math.random().toString(36).substr(2, 2).toUpperCase()}`;
};

export const calculateSeatPrice = (seatType, priceStandard, pricePremium) => {
  const price = seatType === 'premium' ? pricePremium : priceStandard;
  // Ensure price is always a number
  return typeof price === 'number' ? price : parseFloat(price) || 0;
};

export const calculateTotalPrice = (seats, priceMap) => {
  return seats.reduce((total, seatId) => {
    const price = priceMap[seatId] || 0;
    return total + price;
  }, 0);
};

export const getCurrentTimestamp = () => {
  return new Date();
};

export const addMinutes = (date, minutes) => {
  return new Date(date.getTime() + minutes * 60000);
};

export const isBookingExpired = (createdAt, expiryMinutes) => {
  const now = new Date();
  const expiryTime = new Date(createdAt.getTime() + expiryMinutes * 60000);
  return now > expiryTime;
};

// Retry logic for transient errors
export const retryAsync = async (fn, maxRetries = 3, delayMs = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      // Check if error is a transient connection error
      const isTransient = error.code === 'ECONNRESET' || 
                          error.code === 'ECONNREFUSED' || 
                          error.code === 'ETIMEDOUT' ||
                          error.message?.includes('connection');
      
      if (!isTransient || attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      console.log(`⚠️  Connection error, retrying (attempt ${attempt}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }
};

