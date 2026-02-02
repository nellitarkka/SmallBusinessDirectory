// Shared form validation utilities for registration flows

export const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const validateEmail = (value: string): string => {
  if (!value) return "Email is required.";
  // simple email check (good enough for frontend)
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  return ok ? "" : "Please enter a valid email address.";
};

export const validatePassword = (value: string): string => {
  if (!value) return "Password is required.";
  if (!passwordPolicy.test(value))
    return "Min 8 chars + 1 uppercase + 1 lowercase + 1 number.";
  return "";
};

export const validateName = (value: string, label: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return `${label} is required.`;
  // letters (incl. accents) + space + apostrophe + hyphen
  const ok = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(trimmed);
  return ok ? "" : `${label} should not include numbers or special characters.`;
};

export const validateRequired = (value: string, label: string): string => {
  return value.trim() ? "" : `${label} is required.`;
};
