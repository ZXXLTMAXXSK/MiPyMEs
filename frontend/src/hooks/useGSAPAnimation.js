import { useEffect } from 'react';

export const useGSAPAnimation = (selector) => {
  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }, [selector]);
};