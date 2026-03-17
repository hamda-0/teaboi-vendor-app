
// Email validation
export const isValidEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Password validation (min 8 chars, 1 number, 1 letter)
export const isValidPassword = (password: string) => {
  const regex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
  return regex.test(password);
};

// Required field
export const isRequired = (value: any) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

// Phone number (10–15 digits)
export const isValidPhone = (phone: string) => {
  const regex = /^\d{10,15}$/;
  return regex.test(phone);
};

// Username (letters, numbers, _ , 3–20 chars)
export const isValidUsername = (username: string) => {
  const regex = /^[a-zA-Z0-9_]{3,20}$/;
  return regex.test(username);
};

// Match two values (ex: password + confirm password)
export const isMatch = (value1: any, value2: any) => {
  return value1 === value2;
};
export  const formatCNIC = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    let formatted = cleaned;
    if (cleaned.length > 5) {
      formatted = cleaned.substring(0, 5) + '-' + cleaned.substring(5);
    }
    if (cleaned.length > 12) {
      formatted = formatted.substring(0, 13) + '-' + cleaned.substring(12, 13);
    }
    return formatted.substring(0, 15);
  };