"use client";

import { useEffect } from 'react';

export default function SafetyShield() {
  useEffect(() => {
    const message = "This website and its content are protected. Inspecting or copying content is not permitted.";

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      alert(message);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        alert(message);
      }
      // Disable Ctrl+Shift+I
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
        alert(message);
      }
      // Disable Ctrl+Shift+J
      if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
          e.preventDefault();
          alert(message);
      }
      // Disable Ctrl+U
      if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
          e.preventDefault();
          alert(message);
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup function to remove event listeners
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null;
}
