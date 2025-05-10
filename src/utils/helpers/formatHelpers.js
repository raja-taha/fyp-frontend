/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  };

  return new Date(date).toLocaleDateString(undefined, defaultOptions);
};

/**
 * Format time to readable string
 * @param {string|Date} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted time string
 */
export const formatTime = (date, options = {}) => {
  const defaultOptions = {
    hour: "numeric",
    minute: "2-digit",
    ...options,
  };

  return new Date(date).toLocaleTimeString(undefined, defaultOptions);
};

/**
 * Format date and time to readable string
 * @param {string|Date} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date, options = {}) => {
  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...options,
  };

  return new Date(date).toLocaleString(undefined, defaultOptions);
};

/**
 * Format number with commas (e.g. 1,000,000)
 * @param {number} number - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (number) => {
  return new Intl.NumberFormat().format(number);
};

/**
 * Format currency value
 * @param {number} value - Value to format
 * @param {string} currency - Currency code (e.g. 'USD')
 * @returns {string} Formatted currency
 */
export const formatCurrency = (value, currency = "USD") => {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(value);
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};
