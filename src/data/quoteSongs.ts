import { Language } from '../types';

export interface QuoteSongInfo {
  title: string;
  url: string;
  lang: 'de' | 'en';
}

export interface QuoteSongMapping {
  de?: QuoteSongInfo;
  en?: QuoteSongInfo;
}

/**
 * Verified mappings between Quotes in Junior Youth Hub and songs on Bahá'í Songs (bahaisongs.com).
 * Includes both German and English intonations.
 */
export const QUOTE_SONGS_MAP: Record<string, QuoteSongMapping> = {
  // Breezes of Confirmation
  'breezes-brother-selflessness': {
    de: {
      title: 'Selig ist wer seinen Bruder',
      url: 'https://www.bahaisongs.com/songs/selig-ist-wer-seinen-bruder',
      lang: 'de',
    },
  },
  'breezes-divine-helper': {
    de: {
      title: 'Gott hilft denjenigen Seelen',
      url: 'https://www.bahaisongs.com/songs/gott-hilft-denjenigen-seelen',
      lang: 'de',
    },
  },

  // Walking the Straight Path
  'straightpath-kindly-tongue': {
    de: {
      title: 'Eine freundliche Zunge',
      url: 'https://www.bahaisongs.com/songs/eine-freundliche-zunge',
      lang: 'de',
    },
  },
  'straightpath-loving-kindness': {
    de: {
      title: 'Lasst eure Herzen',
      url: 'https://www.bahaisongs.com/songs/lasst-eure-herzen',
      lang: 'de',
    },
    en: {
      title: 'Let Your Heart Burn',
      url: 'https://www.bahaisongs.com/songs/let-your-heart-burn',
      lang: 'en',
    },
  },
  'straightpath-two-wings': {
    en: {
      title: 'Two Wings',
      url: 'https://www.bahaisongs.com/songs/two-wings',
      lang: 'en',
    },
  },

  // Drawing on the Power of the Word
  'powerword-deeds-not-words': {
    de: {
      title: 'Die Besserung der Welt',
      url: 'https://www.bahaisongs.com/songs/die-besserung-der-welt',
      lang: 'de',
    },
  },
  'powerword-ocean-of-words': {
    en: {
      title: 'Hidden & Manifest',
      url: 'https://www.bahaisongs.com/songs/hidden-and-manifest',
      lang: 'en',
    },
  },

  // Glimmerings of Hope
  'glimmerings-peace-thought': {
    de: {
      title: 'Wenn ein Kriegsgedanke kommt',
      url: 'https://www.bahaisongs.com/songs/wenn-ein-kriegsgedanke-kommt',
      lang: 'de',
    },
    en: {
      title: 'Thought of Love',
      url: 'https://www.bahaisongs.com/songs/thought-of-love',
      lang: 'en',
    },
  },
  'glimmerings-light-unity': {
    de: {
      title: 'So So Machtvoll',
      url: 'https://www.bahaisongs.com/songs/so-so-machtvoll',
      lang: 'de',
    },
    en: {
      title: 'So So Powerful',
      url: 'https://www.bahaisongs.com/songs/so-so-powerful',
      lang: 'en',
    },
  },

  // Wellspring of Joy
  'wellspring-be-happy': {
    de: {
      title: 'Ich wünsche, dass Ihr glücklich seid',
      url: 'https://www.bahaisongs.com/songs/ich-wuensche-dass-ihr-gluecklich-seid',
      lang: 'de',
    },
  },
  'wellspring-all-times-happy': {
    de: {
      title: 'Wir sollten allezeit',
      url: 'https://www.bahaisongs.com/songs/wir-sollten-allezeit',
      lang: 'de',
    },
    en: {
      title: 'At All Times',
      url: 'https://www.bahaisongs.com/songs/at-all-times',
      lang: 'en',
    },
  },

  // Human Honor
  'honor-mine-gems': {
    de: {
      title: 'Betrachte',
      url: 'https://www.bahaisongs.com/songs/betrachte',
      lang: 'de',
    },
  },
  'honor-pure-radiant-heart': {
    de: {
      title: 'Mein Erster Rat',
      url: 'https://www.bahaisongs.com/songs/mein-erster-rat',
      lang: 'de',
    },
  },
  'honor-chaste-eye-hand': {
    de: {
      title: 'Lasst Eure Augen',
      url: 'https://www.bahaisongs.com/songs/lasst-eure-augen',
      lang: 'de',
    },
    en: {
      title: 'Olgu Sinu Silm Siivas',
      url: 'https://www.bahaisongs.com/songs/olgu-sinu-silm-siivas',
      lang: 'en',
    },
  },

  // Waves of One Sea
  'waves-fruits-one-tree': {
    de: {
      title: 'Früchte eines Baumes',
      url: 'https://www.bahaisongs.com/songs/fruechte-eines-baumes',
      lang: 'de',
    },
    en: {
      title: 'Ye Are the Fruits of One Tree',
      url: 'https://www.bahaisongs.com/songs/ye-are-the-fruits-of-one-tree',
      lang: 'en',
    },
  },
  'waves-earth-one-country': {
    de: {
      title: 'Die Erde ist nur ein Land',
      url: 'https://www.bahaisongs.com/songs/die-erde-ist-nur-ein-land',
      lang: 'de',
    },
  },
  'waves-diversity-garden': {
    en: {
      title: 'We Are Flowers of One Garden',
      url: 'https://www.bahaisongs.com/songs/we-are-flowers-of-one-garden',
      lang: 'en',
    },
    de: {
      title: 'We Are Flowers of One Garden',
      url: 'https://www.bahaisongs.com/songs/we-are-flowers-of-one-garden',
      lang: 'de',
    },
  },

  // Ruhi Book 5
  'ruhi5-truthfulness-foundation': {
    de: {
      title: 'Wahrhaftigkeit ist',
      url: 'https://www.bahaisongs.com/songs/wahrhaftigkeit-ist',
      lang: 'de',
    },
  },
  'ruhi5-tongue-honesty': {
    de: {
      title: 'Veredelt Eure Zunge',
      url: 'https://www.bahaisongs.com/songs/veredelt-eure-zunge',
      lang: 'de',
    },
  },
  'ruhi5-speak-no-evil': {
    de: {
      title: 'Sprich nichts Schlechtes',
      url: 'https://www.bahaisongs.com/songs/sprich-nichts-schlechtes',
      lang: 'de',
    },
  },

  // Prayers & Devotions
  'prayer-pure-heart': {
    de: {
      title: 'Ein reines Herz',
      url: 'https://www.bahaisongs.com/songs/ein-reines-herz',
      lang: 'de',
    },
  },
  'prayer-blessed-spot': {
    de: {
      title: 'Selig der Ort',
      url: 'https://www.bahaisongs.com/songs/selig-der-ort',
      lang: 'de',
    },
    en: {
      title: 'Blessed is the Spot',
      url: 'https://www.bahaisongs.com/songs/blessed-is-the-spot',
      lang: 'en',
    },
  },
  'prayer-god-sufficeth': {
    de: {
      title: 'Gott schenkt Genüge',
      url: 'https://www.bahaisongs.com/songs/gott-schenkt-genuege',
      lang: 'de',
    },
    en: {
      title: 'Say God Sufficeth',
      url: 'https://www.bahaisongs.com/songs/say-god-sufficeth',
      lang: 'en',
    },
  },
  'prayer-free-heart-attachment': {
    de: {
      title: 'Wahre Freiheit (True Freedom)',
      url: 'https://www.bahaisongs.com/songs/wahre-freiheit-true-freedom',
      lang: 'de',
    },
    en: {
      title: 'True Freedom',
      url: 'https://www.bahaisongs.com/songs/wahre-freiheit-true-freedom',
      lang: 'en',
    },
  },
};

/**
 * Returns the matching song info for a given quote ID and user language.
 * Falls back to the alternative language if the preferred language is not available.
 */
export function getQuoteSong(quoteId: string, language: Language): QuoteSongInfo | undefined {
  const mapping = QUOTE_SONGS_MAP[quoteId];
  if (!mapping) return undefined;

  if (language === 'de') {
    return mapping.de || mapping.en;
  }
  return mapping.en || mapping.de;
}
