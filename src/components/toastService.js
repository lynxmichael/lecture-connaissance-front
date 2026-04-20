// src/components/toastService.js

let toastCallback = null;

export const registerToast = (callback) => {
  toastCallback = callback;
};

export const showToast = (message, type = 'success') => {
  if (toastCallback) {
    toastCallback(message, type);
  }
};