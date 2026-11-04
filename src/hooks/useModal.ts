import { RefObject, useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Module-level so nested modals cooperate: only the topmost one reacts to Escape/Tab, and the page
// stays scroll-locked until the last one closes (per-modal `overflow = ''` used to unlock too early).
const openStack: symbol[] = [];
let scrollLocks = 0;

/**
 * Modal behaviour for any overlay with role="dialog": moves focus inside on open (to the
 * `[data-autofocus]` element if there is one), traps Tab,
 * closes on Escape, locks page scroll and returns focus to the trigger on close.
 * `ref` must point at a focusable container (tabIndex={-1}).
 */
export function useModal(ref: RefObject<HTMLElement | null>, isOpen: boolean, onClose: () => void) {
  // Callers pass inline arrows; keeping the latest one in a ref stops the effect from re-running
  // (and re-stealing focus) on every parent render.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const id = Symbol('modal');
    openStack.push(id);
    // Read before anything inside takes focus. Modals mark their preferred first control with
    // data-autofocus rather than autoFocus, which would steal focus before this line runs.
    const trigger = document.activeElement as HTMLElement | null;

    if (scrollLocks++ === 0) document.body.style.overflow = 'hidden';

    // Defer so children (and their autoFocus) are mounted before we decide. setTimeout, not
    // requestAnimationFrame: rAF never fires in a background tab, leaving focus outside.
    const timer = setTimeout(() => {
      const el = ref.current;
      if (!el || el.contains(document.activeElement)) return;
      (el.querySelector<HTMLElement>('[data-autofocus]') ?? el).focus({ preventScroll: true });
    }, 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (openStack[openStack.length - 1] !== id) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      const el = ref.current;
      if (e.key !== 'Tab' || !el) return;
      const items = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null);
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === el)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !el.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', onKeyDown);
      openStack.splice(openStack.indexOf(id), 1);
      if (--scrollLocks === 0) document.body.style.overflow = '';
      if (trigger && document.contains(trigger)) trigger.focus({ preventScroll: true });
    };
  }, [isOpen, ref]);
}
