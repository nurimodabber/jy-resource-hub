import React from 'react';
import { Language } from '../../types';
import { tr } from '../tools/common';

/**
 * A blank with one short line per letter, so the gap shows how long the missing word is.
 * Hyphens and apostrophes inside a word stay visible ("Lawḥ-i-Ḥikmat" keeps its shape).
 */
export const LetterSlots: React.FC<{ text: string; language: Language }> = ({ text, language }) => {
  const chars = Array.from(text.normalize('NFC'));
  const letters = chars.filter((c) => /[\p{L}\p{N}]/u.test(c)).length;
  if (chars.length === 0) return null;
  return (
    <>
      {/* An empty inline-block sits with its bottom edge on the baseline, so the lines line up with
          real letters and any hyphen in between stays at its normal height. */}
      <span aria-hidden="true" className="whitespace-nowrap">
        {chars.map((c, i) =>
          /[\p{L}\p{N}]/u.test(c) ? (
            <span key={i} className="inline-block w-[0.46em] h-[0.6em] mx-[0.07em] border-b-2 border-current opacity-60" />
          ) : (
            c
          )
        )}
      </span>
      <span className="sr-only">{tr(language)(`Lücke, ${letters} Buchstaben`, `blank, ${letters} letters`)}</span>
    </>
  );
};
