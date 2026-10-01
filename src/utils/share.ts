export interface SharePayload {
  title: string;
  text: string;
  url: string;
}

export async function shareResource(payload: SharePayload): Promise<{ success: boolean; method: 'native' | 'clipboard' }> {
  // Try Web Share API (mobile native sheet)
  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare(payload)) {
    try {
      await navigator.share(payload);
      return { success: true, method: 'native' };
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') {
        return { success: false, method: 'native' };
      }
      // If native share fails, fallback to clipboard
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(`${payload.text}\n\n${payload.url}`);
    return { success: true, method: 'clipboard' };
  } catch {
    return { success: false, method: 'clipboard' };
  }
}

export function generateWhatsAppLink(text: string, url?: string): string {
  const fullText = url ? `${text}\n\n${url}` : text;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`;
}
