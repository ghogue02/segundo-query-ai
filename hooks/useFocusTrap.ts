'use client';

import { useEffect, useRef } from 'react';

/**
 * Focus Trap Hook for Modal Accessibility
 *
 * Manages focus within a modal dialog:
 * 1. Saves the currently focused element when modal opens
 * 2. Moves focus to the first focusable element in the modal
 * 3. Traps Tab/Shift+Tab within the modal
 * 4. Restores focus to the original element when modal closes
 * 5. Handles ESC key to close modal
 *
 * @param isOpen - Whether the modal is currently open
 * @param onClose - Callback to close the modal
 * @returns Ref to attach to the modal container element
 */
export function useFocusTrap(isOpen: boolean, onClose?: () => void) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save the currently focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Get all focusable elements within the modal
    const getFocusableElements = (): HTMLElement[] => {
      if (!modalRef.current) return [];

      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(', ');

      return Array.from(modalRef.current.querySelectorAll(focusableSelectors));
    };

    // Focus the first focusable element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Handle Tab and Shift+Tab to trap focus
    const handleTabKey = (e: KeyboardEvent) => {
      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Handle Tab key
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab: if focused on first element, move to last
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: if focused on last element, move to first
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }

      // Handle ESC key to close modal
      if (e.key === 'Escape' && onClose) {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleTabKey);

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleTabKey);

      // Restore focus to the previously focused element
      if (previousFocusRef.current && !isOpen) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  return modalRef;
}
