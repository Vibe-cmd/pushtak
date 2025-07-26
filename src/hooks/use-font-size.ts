import { useState, useEffect, useCallback } from 'react';

export const useFontSize = () => {
  const [fontSize, setFontSize] = useState<number>(20);

  useEffect(() => {
    // Load font size from localStorage on mount
    const savedSize = localStorage.getItem('writeaid_font_size');
    if (savedSize) {
      const size = Number(savedSize);
      setFontSize(size);
      updateCSSVariable(size);
    } else {
      // Try to get from CSS variable, strip 'px' if present
      const currentSize = getComputedStyle(document.documentElement)
        .getPropertyValue('--app-font-size')
        .replace('px', '')
        .trim();
      if (currentSize && !isNaN(Number(currentSize))) {
        setFontSize(Number(currentSize));
      }
    }
  }, []);

  const updateCSSVariable = useCallback((size: number) => {
    document.documentElement.style.setProperty('--app-font-size', `${size}px`);
  }, []);

  const updateFontSize = useCallback((newSize: number) => {
    setFontSize(newSize);
    updateCSSVariable(newSize);
    localStorage.setItem('writeaid_font_size', String(newSize));
  }, [updateCSSVariable]);

  const getCurrentFontSize = useCallback(() => {
    const savedSize = localStorage.getItem('writeaid_font_size');
    if (savedSize) {
      return Number(savedSize);
    }
    // Try to get from CSS variable, strip 'px' if present
    const currentSize = getComputedStyle(document.documentElement)
      .getPropertyValue('--app-font-size')
      .replace('px', '')
      .trim();
    return currentSize && !isNaN(Number(currentSize)) ? Number(currentSize) : 20;
  }, []);

  return {
    fontSize,
    updateFontSize,
    getCurrentFontSize,
  };
};