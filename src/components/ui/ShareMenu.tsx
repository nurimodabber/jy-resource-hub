import React, { useState, useRef, useEffect } from 'react';
import { Share2, Copy, Link as LinkIcon, Check } from 'lucide-react';
import { IconButton } from './IconButton';
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
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { showToast } = useToast();

  const isDe = language === 'de';
  const resolvedUrl = urlToCopy || (typeof window !== 'undefined' ? window.location.href : '');

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
      if (e.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
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
    setIsOpen(false);
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
    setIsOpen(false);
  };

  const triggerLabel = label || (isDe ? 'Teilen' : 'Share');

  return (
    <div className={`relative inline-block ${className}`} onClick={(e) => e.stopPropagation()}>
      <IconButton
        ref={buttonRef}
        label={triggerLabel}
        variant="outline"
        size="md"
        className="shrink-0 min-w-[44px] min-h-[44px] text-text-secondary hover:text-text focus-visible:ring-2 focus-visible:ring-accent"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <Share2 className="w-4 h-4" />
      </IconButton>

      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={triggerLabel}
          className={`absolute z-50 min-w-[170px] py-1 glass-surface rounded-card border border-border shadow-2 animate-in fade-in zoom-in-95 duration-120 select-none ${
            direction === 'up' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleCopyText}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-text hover:bg-surface-2 transition-colors cursor-pointer text-left min-h-[40px] focus-visible:bg-surface-2 focus-visible:outline-none"
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
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-text hover:bg-surface-2 transition-colors cursor-pointer text-left min-h-[40px] focus-visible:bg-surface-2 focus-visible:outline-none"
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
