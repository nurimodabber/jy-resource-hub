import { QuoteItem, Language } from '../types';
import { stripQuotes } from './random';

export interface GenerateQuoteImageOptions {
  theme?: 'dark' | 'light';
}

/**
 * Wraps text into lines that fit within maxTextWidth using canvas 2D measureText.
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Generates an elegant, high-resolution square image (1080x1080) of a sacred quote for WhatsApp/Instagram.
 */
export async function generateQuoteCardBlob(
  quote: QuoteItem,
  language: Language,
  options: GenerateQuoteImageOptions = {}
): Promise<Blob> {
  const isDark = options.theme !== 'light';
  const width = 1080;
  const height = 1080;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  // Palette
  const bg = isDark ? '#11161B' : '#FBFBFA';
  const surface = isDark ? '#182026' : '#FFFFFF';
  const border = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
  const textPrimary = isDark ? '#F5F7FA' : '#14181D';
  const textSecondary = isDark ? '#9BA7B4' : '#5E6B78';
  const accent = isDark ? '#6B9FFF' : '#2A6BF2';

  // Background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Inner card frame with generous margin (70px)
  const margin = 70;
  const cardW = width - margin * 2;
  const cardH = height - margin * 2;
  const radius = 28;

  ctx.fillStyle = surface;
  ctx.strokeStyle = border;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.roundRect(margin, margin, cardW, cardH, radius);
  ctx.fill();
  ctx.stroke();

  // Decorative subtle accent top notch
  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 40, margin);
  ctx.lineTo(width / 2 + 40, margin);
  ctx.stroke();

  // Header category / theme
  const themeText = (quote.theme[language] || '').toUpperCase();
  ctx.fillStyle = accent;
  ctx.font = '700 16px "Figtree", system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '2px';
  ctx.fillText(themeText, width / 2, margin + 65);

  // Quote Text
  const rawText = stripQuotes(language === 'de' ? quote.textDe : quote.textEn);
  const quoteMarkOpen = language === 'de' ? '„' : '“';
  const quoteMarkClose = language === 'de' ? '“' : '”';
  const fullText = `${quoteMarkOpen}${rawText}${quoteMarkClose}`;

  // Dynamically calculate font size based on length
  const maxContentW = cardW - 140;
  let fontSize: number;
  if (rawText.length < 80) fontSize = 48;
  else if (rawText.length < 160) fontSize = 42;
  else if (rawText.length < 280) fontSize = 36;
  else if (rawText.length < 420) fontSize = 31;
  else fontSize = 26;

  ctx.font = `400 ${fontSize}px "Lora", Georgia, serif`;
  ctx.letterSpacing = '0px';
  const lineHeight = Math.round(fontSize * 1.6);
  const lines = wrapText(ctx, fullText, maxContentW);

  // Center vertical layout
  const textBlockHeight = lines.length * lineHeight;
  const startY = (height / 2) - (textBlockHeight / 2) - 20;

  ctx.fillStyle = textPrimary;
  ctx.textAlign = 'center';

  lines.forEach((line, index) => {
    ctx.fillText(line, width / 2, startY + index * lineHeight);
  });

  // Author and source line below text
  const authorY = startY + textBlockHeight + 50;
  ctx.font = 'italic 500 24px "Lora", Georgia, serif';
  ctx.fillStyle = textSecondary;
  ctx.fillText(`— ${quote.source[language]}`, width / 2, authorY);

  if (quote.book && quote.book[language]) {
    ctx.font = '400 18px "Figtree", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = isDark ? '#7E8B99' : '#73808D';
    ctx.fillText(quote.book[language], width / 2, authorY + 32);
  }

  // Footer branding
  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(margin + 60, height - margin - 60);
  ctx.lineTo(width - margin - 60, height - margin - 60);
  ctx.stroke();

  ctx.font = '600 15px "Figtree", system-ui, -apple-system, sans-serif';
  ctx.fillStyle = isDark ? '#6B7885' : '#8A97A4';
  ctx.fillText('Junior Youth Hub', width / 2, height - margin - 32);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas export failed'));
    }, 'image/png');
  });
}

/**
 * Shares a sacred quote as an image file via Web Share API or triggers browser download.
 */
export async function shareQuoteAsImage(
  quote: QuoteItem,
  language: Language,
  options: GenerateQuoteImageOptions = {}
): Promise<'shared' | 'downloaded'> {
  const blob = await generateQuoteCardBlob(quote, language, options);
  const filename = `zitat-${quote.id}.png`;
  const file = new File([blob], filename, { type: 'image/png' });

  if (
    typeof navigator !== 'undefined' &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({
        files: [file],
        title: `${quote.theme[language]} – Junior Youth Hub`,
        text: `„${stripQuotes(language === 'de' ? quote.textDe : quote.textEn)}“ — ${quote.source[language]}`,
      });
      return 'shared';
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        return 'shared';
      }
      // fallback to download on other error
    }
  }

  // Fallback: browser download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return 'downloaded';
}
