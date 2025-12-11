import type { BookingStatus } from '../types';

export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (timeString: string | undefined): string => {
  if (!timeString) return 'N/A';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const formatDateTime = (dateString: string | undefined, timeString: string | undefined): string => {
  if (!dateString || !timeString) return 'N/A';
  return `${formatDate(dateString)} at ${formatTime(timeString)}`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export const getBookingStatusColor = (status: BookingStatus): string => {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-green-100 text-green-800';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'FAILED':
      return 'bg-red-100 text-red-800';
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getBookingStatusIcon = (status: BookingStatus): string => {
  switch (status) {
    case 'CONFIRMED':
      return '✓';
    case 'PENDING':
      return '⏳';
    case 'FAILED':
      return '✗';
    case 'CANCELLED':
      return '—';
    default:
      return '?';
  }
};

export const calculateTotalAmount = (seats: string[], prices: Record<string, number>): number => {
  return seats.reduce((total, seatId) => {
    return total + (prices[seatId] || 0);
  }, 0);
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validatePasswordStrength = (password: string): {
  isStrong: boolean;
  message: string;
} => {
  if (password.length < 6) {
    return { isStrong: false, message: 'Password must be at least 6 characters' };
  }
  if (!/[a-z]/.test(password)) {
    return { isStrong: false, message: 'Password must contain lowercase letters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isStrong: false, message: 'Password must contain uppercase letters' };
  }
  if (!/[0-9]/.test(password)) {
    return { isStrong: false, message: 'Password must contain numbers' };
  }
  return { isStrong: true, message: 'Strong password' };
};

export const validatePhone = (phone: string): boolean => {
  return phone.length >= 10 && /^\d+$/.test(phone);
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};

export const getInitials = (name: string | undefined): string => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getTodayDate = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const getUpcomingDates = (days: number = 30): string[] => {
  const dates: string[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = addDays(today, i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
};

export const truncateText = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

export const generateRandomId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
