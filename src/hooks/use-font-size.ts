import { useState, useEffect } from 'react';

export const useFontSize = () => {
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    const savedSize = localStorage.getItem('pushtak_font_size');
    if (savedSize) {
      const size = parseInt(savedSize, 10);
      setFontSize(size);
      document.documentElement.style.setProperty('--app-font-size', `${size}px`);
    } else {
      // Set default font size
      setFontSize(16);
      document.documentElement.style.setProperty('--app-font-size', '16px');
    }
  }, []);

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 2, 32);
    setFontSize(newSize);
    localStorage.setItem('pushtak_font_size', String(newSize));
    document.documentElement.style.setProperty('--app-font-size', `${newSize}px`);
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 2, 12);
    setFontSize(newSize);
    localStorage.setItem('pushtak_font_size', String(newSize));
    document.documentElement.style.setProperty('--app-font-size', `${newSize}px`);
  };

  const resetFontSize = () => {
    const savedSize = localStorage.getItem('pushtak_font_size');
    if (savedSize) {
      const size = parseInt(savedSize, 10);
      setFontSize(size);
      document.documentElement.style.setProperty('--app-font-size', `${size}px`);
    } else {
      setFontSize(16);
      document.documentElement.style.setProperty('--app-font-size', '16px');
    }
  };

  const updateFontSize = (newSize: number) => {
    const clampedSize = Math.max(12, Math.min(newSize, 72));
    setFontSize(clampedSize);
    localStorage.setItem('pushtak_font_size', String(clampedSize));
    document.documentElement.style.setProperty('--app-font-size', `${clampedSize}px`);
  };

  return {
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    updateFontSize,
  };
};