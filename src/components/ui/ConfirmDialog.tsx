import React, { useCallback, useRef, useState } from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
}

/**
 * Promise-based replacement for window.confirm(), styled like the rest of the app and usable in
 * the installed PWA (where native dialogs look foreign or are suppressed).
 * Usage: `const [confirm, confirmDialog] = useConfirm();` render `{confirmDialog}`, then
 * `if (await confirm({...})) …`.
 */
export function useConfirm(): [(options: ConfirmOptions) => Promise<boolean>, React.ReactNode] {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);

  const confirm = useCallback((next: ConfirmOptions) => {
    resolver.current?.(false);
    setOptions(next);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = useCallback((ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setOptions(null);
  }, []);

  const element = (
    <Dialog isOpen={options !== null} onClose={() => settle(false)} title={options?.title} maxWidth="sm">
      {options?.message && <p className="text-sm text-text-secondary leading-relaxed mb-5">{options.message}</p>}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
        <Button variant="secondary" onClick={() => settle(false)} data-autofocus>
          {options?.cancelLabel}
        </Button>
        <Button variant="danger" onClick={() => settle(true)}>
          {options?.confirmLabel}
        </Button>
      </div>
    </Dialog>
  );

  return [confirm, element];
}
