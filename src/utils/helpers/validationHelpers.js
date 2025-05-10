/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result and message
 */
export const validatePassword = (password) => {
  const minLength = 8;

  if (!password || password.length < minLength) {
    return {
      isValid: false,
      message: `Password must be at least ${minLength} characters long`,
    };
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
    return {
      isValid: false,
      message:
        "Password must include uppercase, lowercase, number, and special character",
    };
  }

  return {
    isValid: true,
    message: "Password is strong",
  };
};

/**
 * Check if passwords match
 * @param {string} password - Primary password
 * @param {string} confirmPassword - Confirmation password
 * @returns {boolean} Whether passwords match
 */
export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

/**
 * Validate form field
 * @param {string} value - Field value
 * @param {string} fieldName - Field name for error message
 * @param {object} options - Validation options
 * @returns {Object} Validation result and message
 */
export const validateField = (value, fieldName, options = {}) => {
  const {
    required = true,
    minLength = 0,
    maxLength = Number.MAX_SAFE_INTEGER,
    pattern = null,
    customValidator = null,
  } = options;

  // Check if required
  if (required && (!value || value.trim() === "")) {
    return {
      isValid: false,
      message: `${fieldName} is required`,
    };
  }

  // Check min length
  if (value && value.length < minLength) {
    return {
      isValid: false,
      message: `${fieldName} must be at least ${minLength} characters long`,
    };
  }

  // Check max length
  if (value && value.length > maxLength) {
    return {
      isValid: false,
      message: `${fieldName} must not exceed ${maxLength} characters`,
    };
  }

  // Check pattern
  if (pattern && value && !pattern.test(value)) {
    return {
      isValid: false,
      message: `${fieldName} format is invalid`,
    };
  }

  // Run custom validator if provided
  if (customValidator && typeof customValidator === "function") {
    const customResult = customValidator(value);
    if (customResult !== true) {
      return {
        isValid: false,
        message: customResult || `${fieldName} is invalid`,
      };
    }
  }

  return {
    isValid: true,
    message: "",
  };
};
