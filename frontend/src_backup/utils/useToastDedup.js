import { useRef } from 'react';

export function useToastDedup() {
  const lastToastRef = useRef(null);

  function showToastOnce(toastFn, message, options) {
    if (lastToastRef.current === message) return;  // skip duplicate
    lastToastRef.current = message;

    toastFn(message, options);

    setTimeout(() => {
      if (lastToastRef.current === message) {
        lastToastRef.current = null;  // allow future repeats after 3 sec
      }
    }, 3000);
  }

  return showToastOnce;
}
