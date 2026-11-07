import React, { useState, useRef, useEffect } from 'react';
import { Share2, Copy, Link as LinkIcon, Check } from 'lucide-react';
import { IconButton } from './IconButton';
import { GlassIconButton } from './Button';
import { useToast } from '../../context/ToastContext';
import { Language } from '../../types';

export interface ShareMenuProps {
  /** The text content to copy when "Text kopieren" is clicked */
  textToCopy: string;
  /** The URL to copy when "Link kopieren" is clicked (defaults to window.location.href) */
  urlToCopy?: string;
  language: Language;
  /** Optional custom trigger button class */
  className?: string;
  /** Label for trigger button */
  label?: string;
  /** Alignment of the dropdown menu */
  align?: 'left' | 'right';
  /** Direction the menu opens */
  direction?: 'up' | 'down';
  /** Optional callback after a successful copy */
  onShare?: () => void;
  /** Runder Glas-Knopf, nur im Seitenkopf (Glas-Regel in AGENTS.md) */
  glass?: boolean;
  /** 'ghost': runder Knopf ohne Rahmen, gleiche Größe wie der Merken-Knopf (Zitat-Karten) */
  variant?: 'outline' | 'ghost';
  /** Titel für das Teilen-Menü des Systems (navigator.share); Standard ist der Seitentitel */
  shareTitle?: string;
}

export const ShareMenu: React.FC<ShareMenuProps> = ({
  textToCopy,
  urlToCopy,
  language,
  className = '',
  label,
  align = 'left',
  direction = 'down',
  onShare,
  glass = false,
  variant = 'outline',
  shareTitle,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { showToast } = useToast();

  const isDe = language === 'de';
  const resolvedUrl = urlToCopy || (typeof window !== 'undefined' ? window.location.href : '');
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const closeAndRefocus = () => {
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  // Menu pattern: focus moves into the menu on open, so keyboard users land on the first item
  useEffect(() => {
    if (!isOpen) return;
    menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
  }, [isOpen]);

  const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);
    if (items.length === 0) return;
    const current = items.indexOf(document.activeElement as HTMLButtonElement);
    const step = e.key === 'ArrowDown' ? 1 : -1;
    items[(current + step + items.length) % items.length].focus();
  };

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    closeAndRefocus();
    try {
      await navigator.share({ title: shareTitle || document.title, url: resolvedUrl });
      onShare?.();
    } catch (err) {
      // AbortError = the person closed the system sheet; that is not a failure worth a message
      if ((err as Error)?.name !== 'AbortError') {
        showToast({ text: isDe ? 'Teilen fehlgeschlagen' : 'Sharing failed' });
      }
    }
  };

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAndRefocus();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleCopyText = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedText(true);
      showToast({ text: isDe ? 'Text kopiert' : 'Text copied' });
      onShare?.();
      setTimeout(() => setCopiedText(false), 1500);
    } catch {
      showToast({ text: isDe ? 'Kopieren fehlgeschlagen' : 'Failed to copy' });
    }
    closeAndRefocus();
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(resolvedUrl);
      setCopiedLink(true);
      showToast({ text: isDe ? 'Link kopiert' : 'Link copied' });
      onShare?.();
      setTimeout(() => setCopiedLink(false), 1500);
    } catch {
      showToast({ text: isDe ? 'Kopieren fehlgeschlagen' : 'Failed to copy' });
    }
    closeAndRefocus();
  };

  const triggerLabel = label || (isDe ? 'Teilen' : 'Share');

  return (
    <div className={`relative inline-block ${className}`} onClick={(e) => e.stopPropagation()}>
      {glass ? (
        <GlassIconButton
          ref={buttonRef}
          label={triggerLabel}
          icon={<Share2 className="w-[18px] h-[18px]" strokeWidth={1.9} />}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={isOpen}
        />
      ) : (
      <IconButton
        ref={buttonRef}
        label={triggerLabel}
        variant={variant}
        size="md"
        className={
          variant === 'ghost'
            ? 'shrink-0 w-[40px] h-[40px] min-w-[40px] min-h-[40px] rounded-full text-text-tertiary hover:text-text hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent'
            : 'shrink-0 min-w-[44px] min-h-[44px] text-text-secondary hover:text-text focus-visible:ring-2 focus-visible:ring-accent'
        }
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <Share2 className={variant === 'ghost' ? 'w-[16px] h-[16px]' : 'w-4 h-4'} />
      </IconButton>
      )}

      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={triggerLabel}
          onKeyDown={handleMenuKeyDown}
          className={`absolute z-50 min-w-[170px] py-1 glass-surface rounded-card border border-border shadow-2 animate-in fade-in zoom-in-95 duration-120 select-none ${
            direction === 'up' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          {canNativeShare && (
            <button
              type="button"
              role="menuitem"
              onClick={handleNativeShare}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-text hover:bg-surface-2 transition-colors cursor-pointer text-left min-h-[44px] focus-visible:bg-surface-2 focus-visible:outline-none"
            >
              <Share2 className="w-4 h-4 text-text-tertiary shrink-0" />
              <span>{isDe ? 'Teilen …' : 'Share …'}</span>
            </button>
          )}

          <button
            type="button"
            role="menuitem"
            onClick={handleCopyText}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-text hover:bg-surface-2 transition-colors cursor-pointer text-left min-h-[44px] focus-visible:bg-surface-2 focus-visible:outline-none"
          >
            {copiedText ? (
              <Check className="w-4 h-4 text-accent shrink-0" />
            ) : (
              <Copy className="w-4 h-4 text-text-tertiary shrink-0" />
            )}
            <span>{isDe ? 'Text kopieren' : 'Copy text'}</span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={handleCopyLink}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-text hover:bg-surface-2 transition-colors cursor-pointer text-left min-h-[44px] focus-visible:bg-surface-2 focus-visible:outline-none"
          >
            {copiedLink ? (
              <Check className="w-4 h-4 text-accent shrink-0" />
            ) : (
              <LinkIcon className="w-4 h-4 text-text-tertiary shrink-0" />
            )}
            <span>{isDe ? 'Link kopieren' : 'Copy link'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
