import { useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

type OverlayState = { overlay?: string } | null;

/**
 * Lets the browser/phone Back button close a full-screen overlay whose open state lives in the
 * component (timers, step index), not in the URL. Opening pushes a history entry tagged with
 * `name`; Back pops it and we close. Use the returned function for in-app close buttons so the
 * pushed entry is consumed instead of piling up.
 */
export function useBackToClose(isOpen: boolean, name: string, close: () => void): () => void {
  const location = useLocation();
  const navigate = useNavigate();
  const pushed = useRef(false);
  // Set once the pushed entry is actually current; before that "not tagged" just means the push
  // hasn't landed yet, not that Back was pressed.
  const confirmed = useRef(false);
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  }, [close]);

  const tagged = (location.state as OverlayState)?.overlay === name;

  // A tag left over from a reload (state survives, the overlay doesn't): drop it so a later
  // close doesn't navigate back past this page.
  useEffect(() => {
    if (tagged && !isOpen && !pushed.current) {
      navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    }
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isOpen && !pushed.current) {
      pushed.current = true;
      navigate(`${location.pathname}${location.search}`, { state: { overlay: name } });
    } else if (!isOpen) {
      pushed.current = false;
      confirmed.current = false;
    }
  }, [isOpen, name, navigate, location.pathname, location.search]);

  // Back was pressed: our entry is gone while the overlay is still open
  useEffect(() => {
    if (!isOpen || !pushed.current) return;
    if (tagged) {
      confirmed.current = true;
    } else if (confirmed.current) {
      pushed.current = false;
      confirmed.current = false;
      closeRef.current();
    }
  }, [isOpen, tagged]);

  return useCallback(() => {
    if (confirmed.current && tagged) {
      navigate(-1);
    } else {
      closeRef.current();
    }
  }, [navigate, tagged]);
}
