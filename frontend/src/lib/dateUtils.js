import { format } from 'date-fns';

/**
 * Safely format a date string or Date object
 * Returns formatted date or fallback text if date is invalid
 */
export const formatDate = (dateValue, formatStr = 'dd MMM yyyy', fallback = '-') => {
  if (!dateValue) return fallback;
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return fallback;
    return format(date, formatStr);
  } catch (error) {
    return fallback;
  }
};

/**
 * Safely format a datetime string
 */
export const formatDateTime = (dateValue, fallback = '-') => {
  return formatDate(dateValue, 'dd MMM yyyy HH:mm', fallback);
};
