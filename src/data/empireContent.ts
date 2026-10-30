export type LS = { de: string; en: string };
export type ContentStatus = 'draft';
export interface EmpireCategoryV2 {
  id: string; // kebab-case, unique, e.g. 'regentag-beste'
  prompt: LS; // the category as one line, e.g. "Das Beste an einem Regentag"
  hint: LS; // one short sentence telling players what to write on their slip
  examples: { de: string[]; en: string[] }; // exactly 3 short example answers each, WITHOUT any quotation marks
  mood: 'fun' | 'thoughtful' | 'calm';
  topic:
    | 'school'
    | 'food'
    | 'nature'
    | 'travel'
    | 'music'
    | 'everyday'
    | 'animals'
    | 'future'
    | 'tech'
    | 'community'
    | 'camp'
    | 'values';
  age: 'all' | '11-12' | '13-14';
  shy: boolean; // true = easy to answer without exposing yourself
  personal: boolean; // true ONLY if it names or targets real people in the room; keep almost all false
  status: ContentStatus; // always 'draft'
}
export interface StoryStarter {
  id: string;
  text: LS;
  genre: 'adventure' | 'mystery' | 'funny' | 'fantasy' | 'everyday';
  status: ContentStatus;
}
export type SortCategory = 'alltag' | 'zahlen' | 'sprache' | 'vorlieben';
export interface SortCriterion {
  id: string;
  text: LS;
  category: SortCategory;
  needsTalking: boolean;
  status: ContentStatus;
} // for a silent line-up game, e.g. "nach Geburtstag im Jahr"; needsTalking must be false for all (players sort silently)
export interface RuleIdea {
  id: string;
  text: LS;
  difficulty: 1 | 2 | 3;
  status: ContentStatus;
} // hidden rules for the game "Der Psychiater": one player leaves, group agrees on a rule, e.g. "Antworte so, als wärst du die Person links von dir"

export const EMPIRE_CATEGORIES_V2: EmpireCategoryV2[] = [
  {
    id: 'ausreden-zuspaet',
    prompt: {
      de: 'Ausreden fürs Zuspätkommen',
      en: 'Excuses for being late',
    },
    hint: {
      de: 'Schreib die kreativste Ausrede auf, die dir einfällt.',
      en: 'Write the most creative excuse you can think of.',
    },
    examples: {
      de: [
        'Der Bus hat Urlaub gemacht',
        'Meine Socken waren verschwunden',
        'Ein Igel saß auf dem Fahrrad',
      ],
      en: ['The bus took a vacation', 'My socks went missing', 'A hedgehog sat on my bike'],
    },
    mood: 'fun',
    topic: 'school',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'rucksack-nie-gebraucht',
    prompt: {
      de: 'Dinge im Rucksack, die man nie gebraucht hat',
      en: "Things in your backpack you've never used",
    },
    hint: {
      de: 'Schreib etwas auf, das garantiert ewig im Rucksack liegt.',
      en: 'Write something that is sure to sit in a backpack forever.',
    },
    examples: {
      de: ['Ein einzelner Handschuh', 'Zerdrückte Bananenreste', 'Ein Lineal ohne Zahlen'],
      en: ['A single glove', 'Squashed banana leftovers', 'A ruler with no numbers'],
    },
    mood: 'fun',
    topic: 'school',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'schulfach-erfinden',
    prompt: {
      de: 'Schulfächer, die es unbedingt geben sollte',
      en: 'School subjects that should definitely exist',
    },
    hint: {
      de: 'Erfinde ein Schulfach, in das du gern gehen würdest.',
      en: 'Invent a school subject you would love to attend.',
    },
    examples: {
      de: ['Hüttenbauen', 'Ausreden erfinden', 'Pausenbrot-Kunde'],
      en: ['Fort building', 'Inventing excuses', 'Snack science'],
    },
    mood: 'fun',
    topic: 'school',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'schultag-besser',
    prompt: {
      de: 'Dinge, die einen Schultag besser machen',
      en: 'Things that make a school day better',
    },
    hint: {
      de: 'Schreib etwas auf, das dir einen Schultag schöner macht.',
      en: 'Write something that makes your school day nicer.',
    },
    examples: {
      de: ['Ein ausgefallener Test', 'Warmer Kakao', 'Ein Witz in der Pause'],
      en: ['A cancelled test', 'Hot cocoa', 'A joke at break'],
    },
    mood: 'calm',
    topic: 'school',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'unsichtbar-lernen',
    prompt: {
      de: 'Dinge, die man in der Schule lernt, ohne dass sie im Stundenplan stehen',
      en: "Things you learn at school that aren't on the timetable",
    },
    hint: {
      de: 'Schreib etwas auf, das du nebenbei in der Schule gelernt hast.',
      en: 'Write something you picked up at school on the side.',
    },
    examples: {
      de: ['Warten können', 'Neue Freunde finden', 'Mit Streit umgehen'],
      en: ['Waiting patiently', 'Making new friends', 'Handling an argument'],
    },
    mood: 'thoughtful',
    topic: 'school',
    age: '11-12',
    shy: false,
    personal: false,
    status: 'draft',
  },
  {
    id: 'freistunde-ideen',
    prompt: {
      de: 'Was man mit einer überraschenden Freistunde anfangen könnte',
      en: 'What you could do with a surprise free period',
    },
    hint: {
      de: 'Schreib auf, was du mit einer geschenkten Stunde machen würdest.',
      en: "Write what you'd do with a surprise free hour.",
    },
    examples: {
      de: ['Draußen Fangen spielen', 'Einen Kuchen backen', 'Mit Freunden Karten spielen'],
      en: ['Play tag outside', 'Bake a cake', 'Play cards with friends'],
    },
    mood: 'fun',
    topic: 'school',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'comfort-food',
    prompt: {
      de: 'Essen, das sich wie eine Umarmung anfühlt',
      en: 'Food that feels like a hug',
    },
    hint: {
      de: 'Schreib ein Essen auf, das dich warm und zufrieden macht.',
      en: 'Write a food that makes you feel warm and content.',
    },
    examples: {
      de: ['Nudeln mit Soße', 'Heiße Suppe', 'Frisches Brot'],
      en: ['Pasta with sauce', 'Hot soup', 'Fresh bread'],
    },
    mood: 'calm',
    topic: 'food',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'pizza-belag-wild',
    prompt: {
      de: 'Verrückte Pizzabeläge, die man mal testen könnte',
      en: 'Wild pizza toppings worth trying',
    },
    hint: {
      de: 'Erfinde einen Belag, der schräg, aber vielleicht lecker ist.',
      en: 'Invent a topping that is odd but maybe tasty.',
    },
    examples: {
      de: ['Gummibärchen', 'Gurke mit Honig', 'Spaghetti'],
      en: ['Gummy bears', 'Cucumber with honey', 'Spaghetti'],
    },
    mood: 'fun',
    topic: 'food',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'lustige-essnamen',
    prompt: {
      de: 'Wörter, die beim Aussprechen lustig klingen',
      en: 'Words that sound funny when you say them',
    },
    hint: {
      de: 'Schreib ein Wort auf, bei dem du schmunzeln musst.',
      en: 'Write a word that makes you smile when you say it.',
    },
    examples: {
      de: ['Quietschbunt', 'Schnickschnack', 'Kuddelmuddel'],
      en: ['Kerfuffle', 'Bumblebee', 'Hullabaloo'],
    },
    mood: 'fun',
    topic: 'food',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'gewuerze-duft',
    prompt: {
      de: 'Düfte, bei denen man Hunger bekommt',
      en: 'Smells that make you hungry',
    },
    hint: {
      de: 'Schreib einen Duft auf, der dir das Wasser im Mund zusammenlaufen lässt.',
      en: 'Write a smell that makes your mouth water.',
    },
    examples: {
      de: ['Frisch gebackene Brötchen', 'Zimt', 'Gebratene Zwiebeln'],
      en: ['Fresh bread rolls', 'Cinnamon', 'Frying onions'],
    },
    mood: 'calm',
    topic: 'food',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'kochen-fehler',
    prompt: {
      de: 'Was beim Kochen schiefgehen kann',
      en: 'What can go wrong when cooking',
    },
    hint: {
      de: 'Schreib ein kleines Küchen-Malheur auf.',
      en: 'Write a small kitchen mishap.',
    },
    examples: {
      de: ['Die Milch kocht über', 'Salz statt Zucker', 'Der Reis ist Brei'],
      en: ['The milk boils over', 'Salt instead of sugar', 'The rice is mush'],
    },
    mood: 'fun',
    topic: 'food',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'lieblings-gericht-oma',
    prompt: {
      de: 'Gerichte, die zu Hause besonders gut schmecken',
      en: 'Dishes that taste especially good at home',
    },
    hint: {
      de: 'Schreib ein Essen auf, das für dich nach Zuhause schmeckt.',
      en: 'Write a dish that tastes like home to you.',
    },
    examples: {
      de: ['Kartoffelsuppe', 'Reispfanne', 'Pfannkuchen'],
      en: ['Potato soup', 'Rice skillet', 'Pancakes'],
    },
    mood: 'thoughtful',
    topic: 'food',
    age: '11-12',
    shy: false,
    personal: false,
    status: 'draft',
  },
  {
    id: 'regentag-beste',
    prompt: {
      de: 'Das Beste an einem Regentag',
      en: 'The best thing about a rainy day',
    },
    hint: {
      de: 'Schreib auf, was einen Regentag schön macht.',
      en: 'Write what makes a rainy day nice.',
    },
    examples: {
      de: ['Pfützen springen', 'Kakao und Decke', 'Das Trommeln auf dem Dach'],
      en: ['Jumping in puddles', 'Cocoa and a blanket', 'Rain drumming on the roof'],
    },
    mood: 'calm',
    topic: 'nature',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'bach-bauen',
    prompt: {
      de: 'Was man an einem Bach alles machen kann',
      en: 'What you can do at a stream',
    },
    hint: {
      de: 'Schreib auf, was man am Wasser spielen oder bauen kann.',
      en: 'Write what you can play or build by the water.',
    },
    examples: {
      de: ['Einen Staudamm bauen', 'Steine flitschen', 'Mit Blättern Schiffchen fahren lassen'],
      en: ['Build a dam', 'Skip stones', 'Sail leaf boats'],
    },
    mood: 'fun',
    topic: 'nature',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'orte-mit-freunden',
    prompt: {
      de: 'Orte, die ich mit Freunden entdecken möchte',
      en: "Places I'd like to discover with friends",
    },
    hint: {
      de: 'Schreib einen Ort auf, den du gern mit Freunden besuchen würdest.',
      en: "Write a place you'd like to visit with friends.",
    },
    examples: {
      de: ['Eine große Höhle', 'Ein Freizeitpark', 'Ein Strand am Meer'],
      en: ['A big cave', 'An amusement park', 'A beach by the sea'],
    },
    mood: 'thoughtful',
    topic: 'travel',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'reise-gepaeck',
    prompt: {
      de: 'Dinge, die man auf eine Reise mitnehmen sollte',
      en: 'Things to pack for a trip',
    },
    hint: {
      de: 'Schreib etwas auf, das auf keiner Reise fehlen darf.',
      en: 'Write something no trip should go without.',
    },
    examples: {
      de: ['Ein gutes Buch', 'Ein Ladekabel', 'Eine Wasserflasche'],
      en: ['A good book', 'A charger', 'A water bottle'],
    },
    mood: 'calm',
    topic: 'travel',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'urlaub-fehler',
    prompt: {
      de: 'Was im Urlaub schiefgehen kann',
      en: 'What can go wrong on vacation',
    },
    hint: {
      de: 'Schreib ein kleines Urlaubs-Missgeschick auf.',
      en: 'Write a small vacation mishap.',
    },
    examples: {
      de: ['Der Koffer ist weg', 'Sonnenbrand am ersten Tag', 'Falscher Bus'],
      en: ['Lost suitcase', 'Sunburn on day one', 'The wrong bus'],
    },
    mood: 'fun',
    topic: 'travel',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'sprachen-hallo',
    prompt: {
      de: 'Wörter, die man in jedem Land lernen sollte',
      en: 'Words to learn in any country',
    },
    hint: {
      de: 'Schreib ein Wort auf, das man im Ausland sofort braucht.',
      en: 'Write a word you immediately need abroad.',
    },
    examples: {
      de: ['Danke', 'Bitte', 'Wo ist die Toilette'],
      en: ['Thank you', 'Please', 'Where is the bathroom'],
    },
    mood: 'thoughtful',
    topic: 'travel',
    age: '11-12',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'verkehrsmittel',
    prompt: {
      de: 'Verrückte Verkehrsmittel',
      en: 'Unusual ways to get around',
    },
    hint: {
      de: 'Schreib ein Fahrzeug auf, mit dem man selten fährt.',
      en: 'Write a vehicle you rarely ride.',
    },
    examples: {
      de: ['Eine Seilbahn', 'Ein Tretboot', 'Ein Heißluftballon'],
      en: ['A cable car', 'A pedal boat', 'A hot air balloon'],
    },
    mood: 'fun',
    topic: 'travel',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'musik-stimmung',
    prompt: {
      de: 'Lieder, die gute Laune machen',
      en: 'Songs that put you in a good mood',
    },
    hint: {
      de: 'Schreib einen Liedtyp oder ein Thema auf, bei dem du lächelst.',
      en: 'Write a type of song that makes you smile.',
    },
    examples: {
      de: ['Ein Geburtstagslied', 'Ein Sommerhit', 'Ein Lagerfeuerlied'],
      en: ['A birthday song', 'A summer hit', 'A campfire song'],
    },
    mood: 'fun',
    topic: 'music',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'geraeusche-melodie',
    prompt: {
      de: 'Alltagsgeräusche, die wie Musik klingen',
      en: 'Everyday sounds that are like music',
    },
    hint: {
      de: 'Schreib ein Geräusch auf, das du gern hörst.',
      en: 'Write a sound you like listening to.',
    },
    examples: {
      de: ['Regen am Fenster', 'Eine Kaffeemaschine', 'Vogelgezwitscher'],
      en: ['Rain on the window', 'A coffee machine', 'Birdsong'],
    },
    mood: 'calm',
    topic: 'music',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'laut-leise-lied',
    prompt: {
      de: 'Wann man Musik am liebsten hört',
      en: 'When you like listening to music most',
    },
    hint: {
      de: 'Schreib eine Situation auf, in der Musik gut passt.',
      en: 'Write a situation where music fits well.',
    },
    examples: {
      de: ['Beim Aufräumen', 'Im Bus', 'Vor dem Einschlafen'],
      en: ['While tidying up', 'On the bus', 'Before falling asleep'],
    },
    mood: 'calm',
    topic: 'music',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'talent-gern-haben',
    prompt: {
      de: 'Ein Talent, das ich gern hätte',
      en: "A talent I'd love to have",
    },
    hint: {
      de: 'Schreib auf, was du gern richtig gut könntest.',
      en: "Write what you'd love to be really good at.",
    },
    examples: {
      de: ['Perfekt Gitarre spielen', 'Auf den Händen laufen', 'Zehn Sprachen sprechen'],
      en: ['Playing guitar perfectly', 'Walking on my hands', 'Speaking ten languages'],
    },
    mood: 'thoughtful',
    topic: 'music',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'stille-moment',
    prompt: {
      de: 'Momente, in denen Stille schön ist',
      en: 'Moments when silence is nice',
    },
    hint: {
      de: 'Schreib einen Moment auf, in dem es gut ist, wenn es still ist.',
      en: 'Write a moment when quiet is welcome.',
    },
    examples: {
      de: ['Früh am Morgen', 'Im Wald', 'Nach einem langen Tag'],
      en: ['Early morning', 'In the woods', 'After a long day'],
    },
    mood: 'calm',
    topic: 'music',
    age: '11-12',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'nuetzliche-superkraft',
    prompt: {
      de: 'Superkräfte, die im Alltag wirklich nützlich wären',
      en: 'Superpowers that would really help in everyday life',
    },
    hint: {
      de: 'Schreib eine Superkraft auf, die ganz praktisch ist.',
      en: 'Write a superpower that is actually practical.',
    },
    examples: {
      de: ['Nie verschlafen', 'Alles sofort finden', 'Hausaufgaben im Kopf rechnen'],
      en: ['Never oversleeping', 'Finding anything instantly', 'Doing homework in my head'],
    },
    mood: 'fun',
    topic: 'everyday',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'kleine-dinge-gute-laune',
    prompt: {
      de: 'Kleine Dinge, die gute Laune machen',
      en: 'Small things that put you in a good mood',
    },
    hint: {
      de: 'Schreib etwas Kleines auf, das dich fröhlich macht.',
      en: 'Write a little thing that cheers you up.',
    },
    examples: {
      de: ['Ein warmer Pulli', 'Ein freier Platz im Bus', 'Frisch duftende Wäsche'],
      en: ['A warm sweater', 'A free seat on the bus', 'Fresh laundry smell'],
    },
    mood: 'calm',
    topic: 'everyday',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'nervige-kleine-dinge',
    prompt: {
      de: 'Kleine Dinge, die nerven',
      en: 'Little things that annoy you',
    },
    hint: {
      de: 'Schreib etwas Harmloses auf, das dich kurz nervt.',
      en: 'Write something harmless that mildly annoys you.',
    },
    examples: {
      de: ['Ein Schnürsenkel geht auf', 'Leerer Akku', 'Eine klemmende Tür'],
      en: ['An untied shoelace', 'A dead battery', 'A sticking door'],
    },
    mood: 'fun',
    topic: 'everyday',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'zuhause-gemuetlich',
    prompt: {
      de: 'Was einen Raum gemütlich macht',
      en: 'What makes a room cozy',
    },
    hint: {
      de: 'Schreib etwas auf, das ein Zimmer gemütlich macht.',
      en: 'Write something that makes a room cozy.',
    },
    examples: {
      de: ['Eine Kerze', 'Kissen', 'Eine Lichterkette'],
      en: ['A candle', 'Cushions', 'String lights'],
    },
    mood: 'calm',
    topic: 'everyday',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'ohne-handy-tag',
    prompt: {
      de: 'Was man an einem Tag ohne Handy machen könnte',
      en: 'What you could do on a day without a phone',
    },
    hint: {
      de: 'Schreib auf, was dir ohne Handy einfallen würde.',
      en: "Write what you'd do without a phone.",
    },
    examples: {
      de: ['Ein Buch lesen', 'Radfahren', 'Ein Brettspiel spielen'],
      en: ['Read a book', 'Ride a bike', 'Play a board game'],
    },
    mood: 'thoughtful',
    topic: 'everyday',
    age: '11-12',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'warteschlange',
    prompt: {
      de: 'Was man beim Warten in einer Schlange machen kann',
      en: 'What to do while waiting in line',
    },
    hint: {
      de: 'Schreib ein Spiel oder eine Idee fürs Warten auf.',
      en: 'Write a game or idea for waiting.',
    },
    examples: {
      de: ['Dinge zählen', 'Ein Spiel im Kopf', 'Leute freundlich anlächeln'],
      en: ['Counting things', 'A game in my head', 'Smiling kindly at people'],
    },
    mood: 'fun',
    topic: 'everyday',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'tiere-superkraefte',
    prompt: {
      de: 'Tiere, deren Fähigkeit ich gern hätte',
      en: "Animals whose ability I'd love to have",
    },
    hint: {
      de: 'Schreib ein Tier und seine Fähigkeit auf.',
      en: 'Write an animal and its ability.',
    },
    examples: {
      de: ['Adler: sehr weit sehen', 'Delfin: super tauchen', 'Eichhörnchen: klettern'],
      en: ['Eagle: seeing far', 'Dolphin: diving', 'Squirrel: climbing'],
    },
    mood: 'fun',
    topic: 'animals',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'berufe-in-30-jahren',
    prompt: {
      de: 'Berufe, die es in 30 Jahren geben könnte',
      en: 'Jobs that might exist in 30 years',
    },
    hint: {
      de: 'Erfinde einen Beruf der Zukunft.',
      en: 'Invent a job of the future.',
    },
    examples: {
      de: ['Roboter-Trainer', 'Mars-Gärtner', 'Wetter-Designer'],
      en: ['Robot trainer', 'Mars gardener', 'Weather designer'],
    },
    mood: 'fun',
    topic: 'future',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'erfindung-zukunft',
    prompt: {
      de: 'Erfindungen, die es bald geben sollte',
      en: 'Inventions that should exist soon',
    },
    hint: {
      de: 'Schreib eine Erfindung auf, die dir den Alltag erleichtern würde.',
      en: 'Write an invention that would make life easier.',
    },
    examples: {
      de: ['Selbstaufräumendes Zimmer', 'Ein Regenschirm, der fliegt', 'Hausaufgaben-Roboter'],
      en: ['A self-tidying room', 'A flying umbrella', 'A homework robot'],
    },
    mood: 'fun',
    topic: 'future',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'stadt-der-zukunft',
    prompt: {
      de: 'Was in einer Stadt der Zukunft anders sein könnte',
      en: 'What could be different in a future city',
    },
    hint: {
      de: 'Schreib etwas auf, das es in der Zukunftsstadt gibt.',
      en: 'Write something found in a future city.',
    },
    examples: {
      de: ['Gärten auf den Dächern', 'Fahrzeuge ohne Lärm', 'Spielplätze überall'],
      en: ['Rooftop gardens', 'Silent vehicles', 'Playgrounds everywhere'],
    },
    mood: 'thoughtful',
    topic: 'future',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'kapsel-zeit',
    prompt: {
      de: 'Dinge, die in eine Zeitkapsel gehören',
      en: 'Things that belong in a time capsule',
    },
    hint: {
      de: 'Schreib auf, was man in 50 Jahren finden sollte.',
      en: 'Write what should be found in 50 years.',
    },
    examples: {
      de: ['Ein Foto von der Klasse', 'Meine Lieblingsmusik', 'Ein Brief an das Ich von später'],
      en: ['A class photo', 'My favorite music', 'A letter to my future self'],
    },
    mood: 'thoughtful',
    topic: 'future',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'in-zehn-jahren',
    prompt: {
      de: 'Was ich in zehn Jahren gern können möchte',
      en: "What I'd like to be able to do in ten years",
    },
    hint: {
      de: 'Schreib eine Fähigkeit auf, die du lernen willst.',
      en: 'Write a skill you want to learn.',
    },
    examples: {
      de: ['Auto fahren', 'Gut kochen', 'Eine Sprache fließend sprechen'],
      en: ['Driving', 'Cooking well', 'Speaking a language fluently'],
    },
    mood: 'thoughtful',
    topic: 'future',
    age: '13-14',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'schule-der-zukunft',
    prompt: {
      de: 'Wie die Schule in 30 Jahren aussehen könnte',
      en: 'What school could look like in 30 years',
    },
    hint: {
      de: 'Schreib etwas auf, das in der Schule der Zukunft anders ist.',
      en: 'Write something different in a future school.',
    },
    examples: {
      de: ['Unterricht im Garten', 'Jeder hat einen Lernroboter', 'Pausen so lang wie Mittag'],
      en: ['Lessons in the garden', 'Everyone has a learning robot', 'Breaks as long as lunch'],
    },
    mood: 'fun',
    topic: 'future',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'lieblings-zukunftstraum',
    prompt: {
      de: 'Ein Ort, an dem ich später gern leben würde',
      en: "A place I'd like to live someday",
    },
    hint: {
      de: 'Schreib einen Ort auf, den du dir vorstellen kannst.',
      en: 'Write a place you can picture.',
    },
    examples: {
      de: ['Am Meer', 'In den Bergen', 'In einer großen Stadt'],
      en: ['By the sea', 'In the mountains', 'In a big city'],
    },
    mood: 'calm',
    topic: 'future',
    age: '11-12',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'tech-ohne-strom',
    prompt: {
      de: 'Was man ohne Strom machen kann',
      en: 'What you can do without electricity',
    },
    hint: {
      de: 'Schreib etwas auf, das auch ohne Strom geht.',
      en: 'Write something that works without power.',
    },
    examples: {
      de: ['Kerzen anzünden', 'Ein Buch lesen', 'Mit Karten spielen'],
      en: ['Lighting candles', 'Reading a book', 'Playing cards'],
    },
    mood: 'calm',
    topic: 'tech',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'tech-erfinde-app',
    prompt: {
      de: 'Apps, die es geben sollte',
      en: 'Apps that should exist',
    },
    hint: {
      de: 'Erfinde eine App, die dein Leben leichter macht.',
      en: 'Invent an app that makes life easier.',
    },
    examples: {
      de: [
        'Eine App, die meine Socken findet',
        'Hausaufgaben-Erinnerung mit Witzen',
        'Eine Wetter-App für Mut',
      ],
      en: [
        'An app that finds my socks',
        'Homework reminder with jokes',
        'A weather app for courage',
      ],
    },
    mood: 'fun',
    topic: 'tech',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'tech-nervige-sachen',
    prompt: {
      de: 'Technik-Probleme, die jeder kennt',
      en: 'Tech troubles everyone knows',
    },
    hint: {
      de: 'Schreib ein typisches Technik-Problem auf.',
      en: 'Write a typical tech problem.',
    },
    examples: {
      de: ['Das WLAN fällt aus', 'Der Akku ist leer', 'Ein Update dauert ewig'],
      en: ['The Wi-Fi drops', 'The battery dies', 'An update takes forever'],
    },
    mood: 'fun',
    topic: 'tech',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'tech-auszeit',
    prompt: {
      de: 'Gute Gründe, das Handy mal wegzulegen',
      en: 'Good reasons to put the phone down',
    },
    hint: {
      de: 'Schreib einen Grund auf, wann man es weglegen sollte.',
      en: 'Write a reason to put the phone away.',
    },
    examples: {
      de: ['Beim Essen', 'Beim Gespräch mit Freunden', 'Draußen im Wald'],
      en: ['At dinner', 'When talking to friends', 'Out in the woods'],
    },
    mood: 'thoughtful',
    topic: 'tech',
    age: '11-12',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'freundliche-gesten',
    prompt: {
      de: 'Kleine freundliche Gesten, die einen Tag besser machen',
      en: 'Small kind gestures that brighten a day',
    },
    hint: {
      de: 'Schreib eine kleine Geste auf, die jemand anderem gut tut.',
      en: 'Write a small gesture that does someone else good.',
    },
    examples: {
      de: ['Die Tür aufhalten', 'Ein Lächeln', 'Etwas Süßes teilen'],
      en: ['Holding the door', 'A smile', 'Sharing a treat'],
    },
    mood: 'thoughtful',
    topic: 'community',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'gemeinsam-bauen',
    prompt: {
      de: 'Was man zusammen leichter schafft als allein',
      en: 'What is easier together than alone',
    },
    hint: {
      de: 'Schreib etwas auf, das zu mehreren besser klappt.',
      en: 'Write something that works better with more people.',
    },
    examples: {
      de: ['Ein Zelt aufbauen', 'Ein Lied singen', 'Einen Berg Wäsche falten'],
      en: ['Pitching a tent', 'Singing a song', 'Folding a pile of laundry'],
    },
    mood: 'thoughtful',
    topic: 'community',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'willkommen-gefuehl',
    prompt: {
      de: 'Was sich beim Ankommen in einer neuen Gruppe gut anfühlt',
      en: 'What feels good when joining a new group',
    },
    hint: {
      de: 'Schreib etwas auf, das Neue willkommen heißt.',
      en: 'Write something that welcomes newcomers.',
    },
    examples: {
      de: ['Jemand fragt nach meinem Namen', 'Ein Platz wird frei gemacht', 'Ein Lächeln'],
      en: ['Someone asks my name', 'A seat is made free', 'A smile'],
    },
    mood: 'thoughtful',
    topic: 'community',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'gute-nachrichten-teilen',
    prompt: {
      de: 'Gute Nachrichten, die man weitergeben kann',
      en: 'Good news worth sharing',
    },
    hint: {
      de: 'Schreib eine gute Neuigkeit auf, die alle freut.',
      en: 'Write a piece of good news everyone would enjoy.',
    },
    examples: {
      de: ['Eine bestandene Prüfung', 'Ein neuer Spielplatz', 'Ein Welpe im Haus'],
      en: ['A passed exam', 'A new playground', 'A puppy at home'],
    },
    mood: 'calm',
    topic: 'community',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'gemeinsam-feiern',
    prompt: {
      de: 'Dinge, die ein Fest schöner machen',
      en: 'Things that make a party better',
    },
    hint: {
      de: 'Schreib etwas auf, das zu einem Fest dazugehört.',
      en: 'Write something every party needs.',
    },
    examples: {
      de: ['Luftballons', 'Alle dürfen mitspielen', 'Musik'],
      en: ['Balloons', 'Everybody can join in', 'Music'],
    },
    mood: 'fun',
    topic: 'community',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'danke-sagen-wofuer',
    prompt: {
      de: 'Wofür man sich mal bedanken könnte',
      en: 'Things you could say thank you for',
    },
    hint: {
      de: 'Schreib etwas auf, wofür man Danke sagen kann.',
      en: 'Write something to thank someone for.',
    },
    examples: {
      de: ['Ein ehrliches Wort', 'Wer den Müll rausbringt', 'Jemand wartet auf dich'],
      en: ['An honest word', 'Someone taking out the trash', 'Someone waiting for you'],
    },
    mood: 'thoughtful',
    topic: 'community',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'gemeinsames-projekt',
    prompt: {
      de: 'Projekte, die eine Gruppe von Jugendlichen starten könnte',
      en: 'Projects a youth group could start',
    },
    hint: {
      de: 'Schreib ein kleines Projekt auf, das anderen hilft.',
      en: 'Write a small project that helps others.',
    },
    examples: {
      de: ['Einen Garten anlegen', 'Einen Flohmarkt veranstalten', 'Spielzeug reparieren'],
      en: ['Planting a garden', 'Hosting a flea market', 'Fixing toys'],
    },
    mood: 'thoughtful',
    topic: 'community',
    age: '11-12',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'zelt-schiefgehen',
    prompt: {
      de: 'Dinge, die beim Zelten schiefgehen können',
      en: 'Things that can go wrong while camping',
    },
    hint: {
      de: 'Schreib ein kleines Zelt-Malheur auf.',
      en: 'Write a small camping mishap.',
    },
    examples: {
      de: ['Die Heringe fehlen', 'Regen läuft ins Zelt', 'Die Luftmatratze ist platt'],
      en: ['The tent pegs are missing', 'Rain gets in the tent', 'The air mattress is flat'],
    },
    mood: 'fun',
    topic: 'camp',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'camp-spiele',
    prompt: {
      de: 'Spiele, die man im Wald spielen kann',
      en: 'Games you can play in the woods',
    },
    hint: {
      de: 'Schreib ein Spiel auf, das man im Freien spielt.',
      en: 'Write a game for playing outdoors.',
    },
    examples: {
      de: ['Schnitzeljagd', 'Räuber und Gendarm', 'Verstecken'],
      en: ['Treasure hunt', 'Cops and robbers', 'Hide and seek'],
    },
    mood: 'fun',
    topic: 'camp',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'camp-packliste',
    prompt: {
      de: 'Was auf jede Packliste fürs Camp gehört',
      en: 'What belongs on every camp packing list',
    },
    hint: {
      de: 'Schreib etwas auf, das man auf jeden Fall mitnimmt.',
      en: 'Write something you definitely bring.',
    },
    examples: {
      de: ['Eine Taschenlampe', 'Dicke Socken', 'Eine Trinkflasche'],
      en: ['A flashlight', 'Warm socks', 'A water bottle'],
    },
    mood: 'calm',
    topic: 'camp',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'camp-hausregeln',
    prompt: {
      de: 'Regeln, die alle im Camp gut finden',
      en: 'Rules everyone at camp likes',
    },
    hint: {
      de: 'Schreib eine Regel auf, mit der es allen besser geht.',
      en: 'Write a rule that helps everyone.',
    },
    examples: {
      de: ['Jeder kommt zu Wort', 'Ordnung am Zelt', 'Gemeinsam essen'],
      en: ['Everybody gets a turn to talk', 'Tidy tent areas', 'Eating together'],
    },
    mood: 'thoughtful',
    topic: 'camp',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'bewundere-eigenschaft',
    prompt: {
      de: 'Eine Eigenschaft, für die ich jemanden bewundere',
      en: 'A quality I admire in someone',
    },
    hint: {
      de: 'Schreib eine Eigenschaft auf, ohne einen Namen zu nennen.',
      en: 'Write a quality, without naming anyone.',
    },
    examples: {
      de: ['Immer geduldig', 'Bleibt ehrlich', 'Hilft, ohne etwas zu wollen'],
      en: ['Always patient', 'Stays honest', 'Helps without wanting anything back'],
    },
    mood: 'thoughtful',
    topic: 'values',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'freundschaft-macht',
    prompt: {
      de: 'Was eine Freundschaft stark macht',
      en: 'What makes a friendship strong',
    },
    hint: {
      de: 'Schreib etwas auf, das Freunde füreinander tun.',
      en: 'Write something friends do for each other.',
    },
    examples: {
      de: ['Zuhören', 'Geheimnisse bewahren', 'Gemeinsam lachen'],
      en: ['Listening', 'Keeping secrets', 'Laughing together'],
    },
    mood: 'thoughtful',
    topic: 'values',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'dankbar-fuer',
    prompt: {
      de: 'Kleine Dinge, für die man dankbar sein kann',
      en: 'Small things to be grateful for',
    },
    hint: {
      de: 'Schreib etwas Kleines auf, das dich dankbar macht.',
      en: 'Write a small thing that makes you grateful.',
    },
    examples: {
      de: ['Ein warmes Bett', 'Sauberes Wasser', 'Mittagessen mit Freunden'],
      en: ['A warm bed', 'Clean water', 'Lunch with friends'],
    },
    mood: 'calm',
    topic: 'values',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'entschuldigung-wirkt',
    prompt: {
      de: 'Was bei einer guten Entschuldigung dazugehört',
      en: 'What a good apology includes',
    },
    hint: {
      de: 'Schreib auf, was in einer ehrlichen Entschuldigung stecken sollte.',
      en: 'Write what an honest apology should include.',
    },
    examples: {
      de: ['Ich war unfair', 'Es tut mir leid', 'Wie kann ich es wiedergutmachen'],
      en: ['I was unfair', "I'm sorry", 'How can I make it right'],
    },
    mood: 'thoughtful',
    topic: 'values',
    age: '11-12',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'zuhoeren-gut',
    prompt: {
      de: 'Was gutes Zuhören ausmacht',
      en: 'What makes good listening',
    },
    hint: {
      de: 'Schreib auf, wie man zeigt, dass man zuhört.',
      en: "Write how you show that you're listening.",
    },
    examples: {
      de: ['Anschauen', 'Nachfragen', 'Nicht unterbrechen'],
      en: ['Looking at them', 'Asking questions', 'Not interrupting'],
    },
    mood: 'thoughtful',
    topic: 'values',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'freundlich-zu-fremden',
    prompt: {
      de: 'Wie man zu Fremden freundlich sein kann',
      en: 'How to be kind to strangers',
    },
    hint: {
      de: 'Schreib eine kleine freundliche Geste für Fremde auf.',
      en: 'Write a small kind gesture for strangers.',
    },
    examples: {
      de: ['Danke sagen', 'Platz anbieten', 'Wegbeschreibung geben'],
      en: ['Saying thanks', 'Offering a seat', 'Giving directions'],
    },
    mood: 'thoughtful',
    topic: 'values',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'mut-fuer-andere',
    prompt: {
      de: 'Wie man für jemanden einstehen kann, ohne laut zu werden',
      en: 'How to stand up for someone without being loud',
    },
    hint: {
      de: 'Schreib eine ruhige Art auf, jemandem beizustehen.',
      en: 'Write a quiet way to stand by someone.',
    },
    examples: {
      de: ['Sich neben ihn setzen', 'Nein zu einem Witz sagen', 'Hinterher fragen, wie es geht'],
      en: ['Sitting next to them', 'Saying no to a joke', 'Asking afterwards how they are'],
    },
    mood: 'thoughtful',
    topic: 'values',
    age: '11-12',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'gut-gelaunt-geben',
    prompt: {
      de: 'Was man anderen geben kann, das nichts kostet',
      en: 'What you can give others that costs nothing',
    },
    hint: {
      de: 'Schreib etwas auf, das man gratis schenken kann.',
      en: 'Write something you can give for free.',
    },
    examples: {
      de: ['Zeit', 'Aufmerksamkeit', 'Ein gutes Wort'],
      en: ['Time', 'Attention', 'A kind word'],
    },
    mood: 'thoughtful',
    topic: 'values',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'alltag-stehlen',
    prompt: {
      de: 'Dinge, die man stehlen könnte, um jemandem den Alltag subtil zu ruinieren',
      en: 'Things you could steal to subtly ruin someone’s day',
    },
    hint: {
      de: 'Schreib etwas Kleines auf, dessen Fehlen extrem nervt.',
      en: 'Write something tiny whose disappearance causes maximum annoyance.',
    },
    examples: {
      de: ['Alle linken Socken', 'Den Lautstärkeknopf', 'Das Ladekabel, das funktioniert'],
      en: ['All left socks', 'The volume knob', 'The one charging cable that works'],
    },
    mood: 'fun',
    topic: 'everyday',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'geschmack-verbrechen',
    prompt: {
      de: 'Essenkombinationen, die ein Verbrechen gegen den Geschmackssinn sind',
      en: 'Food combinations that are a crime against taste',
    },
    hint: {
      de: 'Kombiniere zwei Essensdinge, die niemals zusammen auf einen Teller gehören.',
      en: 'Combine two foods that should never ever meet on a plate.',
    },
    examples: {
      de: ['Kaviar auf Schokopudding', 'Ketchup auf der Wassermelone', 'Zahnpasta auf Toast'],
      en: ['Caviar on chocolate pudding', 'Ketchup on watermelon', 'Toothpaste on toast'],
    },
    mood: 'fun',
    topic: 'food',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'zugfahrt-snacks-grauen',
    prompt: {
      de: 'Die schlimmsten Snacks für eine lange Zugfahrt im vollen Abteil',
      en: 'The worst snacks to open on a packed long-distance train',
    },
    hint: {
      de: 'Schreib ein Essen auf, das alle Mitreisenden sofort in die Flucht schlägt.',
      en: 'Write a food that makes all fellow passengers want to flee.',
    },
    examples: {
      de: ['Hartgekochte Eier mit Knoblauch', 'Dosenfisch', 'Krümelkuchen ohne Teller'],
      en: ['Hard-boiled garlic eggs', 'Canned sardines', 'Extremely crumbly dry pastry'],
    },
    mood: 'fun',
    topic: 'food',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'nobelrestaurant-rauswurf',
    prompt: {
      de: 'Handlungen, die einen sofort aus einem Nobelrestaurant befördern',
      en: 'Actions that will immediately get you kicked out of a fancy restaurant',
    },
    hint: {
      de: 'Schreib ein Verhalten auf, das der Chefkellner gar nicht lustig findet.',
      en: 'Write a behavior that would mortify the head waiter.',
    },
    examples: {
      de: [
        'Nach Ketchup für das Trüffelsteak fragen',
        'Suppe laut aus der Schüssel schlürfen',
        'Eigene Tupperdose auspacken',
      ],
      en: [
        'Asking for ketchup on truffle steak',
        'Loudly slurping soup from the bowl',
        'Unpacking your own lunchbox',
      ],
    },
    mood: 'fun',
    topic: 'food',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'bewerbung-absage',
    prompt: {
      de: 'Antworten bei einem Vorstellungsgespräch, die zur sofortigen Absage führen',
      en: 'Job interview answers guaranteed to get you rejected instantly',
    },
    hint: {
      de: 'Schreib die schlechteste Antwort auf eine typische Vorstellungsfrage auf.',
      en: 'Write the worst possible answer to a job interview question.',
    },
    examples: {
      de: [
        'Meine größte Schwäche? Pünktlichkeit.',
        'Ich bin nur wegen der Kaffeepausen hier',
        'Arbeiten andere hier auch?',
      ],
      en: [
        'My biggest weakness? Punctuality.',
        'I am only here for the free coffee',
        'Do other people actually work here?',
      ],
    },
    mood: 'fun',
    topic: 'everyday',
    age: '13-14',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'alltag-verboten-gehoeren',
    prompt: {
      de: 'Dinge im Alltag, die eigentlich gesetzlich unter Strafe stehen sollten',
      en: 'Everyday things that should honestly be made illegal',
    },
    hint: {
      de: 'Schreib eine Alltagssünde auf, die dich tierisch aufregt.',
      en: 'Write an everyday nuisance that drives you crazy.',
    },
    examples: {
      de: [
        'Leere Milchpackung zurück in den Kühlschrank stellen',
        'Mitten im Weg plötzlich stehen bleiben',
        'Im Kino laut kauen',
      ],
      en: [
        'Putting empty milk carton back in the fridge',
        'Stopping dead in the middle of a doorway',
        'Chewing loudly at the cinema',
      ],
    },
    mood: 'fun',
    topic: 'everyday',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'lehrer-sprueche-klassiker',
    prompt: {
      de: 'Klassische Lehrersätze, die jede Klasse mindestens einmal gehört hat',
      en: 'Classic teacher quotes heard in every classroom at least once',
    },
    hint: {
      de: 'Schreib einen Spruch auf, den du aus der Schule in- und auswendig kennst.',
      en: 'Write a phrase you know by heart from school.',
    },
    examples: {
      de: [
        'Der Gong beendet den Unterricht, nicht ihr!',
        'Ich beende die Stunde, nicht die Uhr',
        'Darf ich mitlachen oder ist das privat?',
      ],
      en: [
        'The bell dismisses you, not the clock!',
        'Are you going to share the joke with the class?',
        'I can wait, I have all day.',
      ],
    },
    mood: 'fun',
    topic: 'school',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
  {
    id: 'handy-panik',
    prompt: {
      de: 'Momente, in denen einem kurz das Herz stehen bleibt',
      en: 'Moments when your heart skips a beat for one terrifying second',
    },
    hint: {
      de: 'Schreib eine alltägliche Schrecksekunde auf.',
      en: 'Write an everyday second of sheer panic.',
    },
    examples: {
      de: [
        'Handy nicht in der Jackentasche fühlen',
        'Auf die falsche Chat-Gruppe tippen',
        'Schritt ins Leere auf der Treppe',
      ],
      en: [
        'Patting your pocket and feeling no phone',
        'Accidentally tapping send in the wrong group',
        'Missing the bottom stair in the dark',
      ],
    },
    mood: 'fun',
    topic: 'everyday',
    age: 'all',
    shy: true,
    personal: false,
    status: 'draft',
  },
];

export const STORY_STARTERS: StoryStarter[] = [
  {
    id: 'karte-im-buch',
    text: {
      de: 'In einem alten Buch aus der Bibliothek fanden wir eine Karte, auf der ein Ort mit unserem Schulnamen eingezeichnet war.',
      en: "In an old library book we found a map with a spot marked using our school's name.",
    },
    genre: 'mystery',
    status: 'draft',
  },
  {
    id: 'neue-nachbarn',
    text: {
      de: 'Am Montag zog eine neue Familie ein, und ihr Umzugswagen war voller seltsamer Kisten mit der Aufschrift Nicht schütteln.',
      en: 'On Monday a new family moved in, and their moving van was full of strange boxes marked Do not shake.',
    },
    genre: 'everyday',
    status: 'draft',
  },
  {
    id: 'zug-ohne-halt',
    text: {
      de: 'Der Zug fuhr an unserer Haltestelle einfach vorbei, und niemand im Wagen schien sich darüber zu wundern.',
      en: 'The train simply rushed past our stop, and nobody in the carriage seemed surprised.',
    },
    genre: 'adventure',
    status: 'draft',
  },
  {
    id: 'verschwundene-glocke',
    text: {
      de: 'Seit heute früh fehlt die Glocke vom Kirchturm, aber auf dem Boden lagen nur kleine Fußspuren.',
      en: 'Since this morning the bell is missing from the tower, but there were only tiny footprints on the ground.',
    },
    genre: 'mystery',
    status: 'draft',
  },
  {
    id: 'pizza-lieferung',
    text: {
      de: 'Der Pizzabote klingelte, aber wir hatten gar nichts bestellt, und der Karton war warm und zitterte.',
      en: 'The delivery guy rang the bell, but we had not ordered anything, and the warm box was trembling.',
    },
    genre: 'funny',
    status: 'draft',
  },
  {
    id: 'zauberstift',
    text: {
      de: 'Alles, was ich mit dem neuen Stift zeichnete, wurde nachts lebendig, und gestern hatte ich einen Elefanten gemalt.',
      en: 'Whatever I drew with the new pen came alive at night, and yesterday I had drawn an elephant.',
    },
    genre: 'fantasy',
    status: 'draft',
  },
  {
    id: 'bus-pause',
    text: {
      de: 'Der Bus blieb mitten auf der Landstraße stehen, und der Fahrer sagte, wir müssten jetzt alle zusammen eine Lösung finden.',
      en: 'The bus stopped in the middle of a country road and the driver said we all had to find a solution together.',
    },
    genre: 'everyday',
    status: 'draft',
  },
  {
    id: 'tauschhandel-roboter',
    text: {
      de: 'Mein Roboter hat meine Hausaufgaben gemacht, aber leider alle Antworten als Reime aufgeschrieben.',
      en: 'My robot did my homework but unfortunately wrote every answer as a rhyme.',
    },
    genre: 'funny',
    status: 'draft',
  },
  {
    id: 'sternenbibliothek',
    text: {
      de: 'In der Sternenbibliothek durfte jeder ein Buch ausleihen, aber nur, wenn er dafür eine gute Tat mitbrachte.',
      en: 'In the star library anybody could borrow a book, but only by bringing a good deed in exchange.',
    },
    genre: 'fantasy',
    status: 'draft',
  },
  {
    id: 'neuer-in-der-klasse',
    text: {
      de: 'Am ersten Schultag kam ein Junge in die Klasse, der kein Wort unserer Sprache sprach, aber ein Spiel dabeihatte.',
      en: 'On the first school day a boy joined the class who did not speak our language but had brought a game.',
    },
    genre: 'everyday',
    status: 'draft',
  },
  {
    id: 'raetsel-in-der-dose',
    text: {
      de: 'In einer rostigen Dose unter der Schaukel lag ein Zettel mit nur einem Satz: Such weiter.',
      en: 'In a rusty tin under the swing there was a note with just one sentence: Keep looking.',
    },
    genre: 'mystery',
    status: 'draft',
  },
  {
    id: 'stromausfall',
    text: {
      de: 'Das ganze Viertel hatte Stromausfall, und plötzlich saßen alle Nachbarn auf der Straße und redeten.',
      en: 'The whole neighborhood lost power and suddenly all the neighbors sat in the street talking.',
    },
    genre: 'everyday',
    status: 'draft',
  },
  {
    id: 'fahrrad-reparatur',
    text: {
      de: 'Wir wollten ein kaputtes Fahrrad für ein Kind aus der Nachbarschaft reparieren, aber uns fehlte ein wichtiges Teil.',
      en: 'We wanted to repair a broken bike for a child in the neighborhood, but a key part was missing.',
    },
    genre: 'everyday',
    status: 'draft',
  },
  {
    id: 'unterwegs-gepaeck',
    text: {
      de: 'Am Flughafen vertauschten wir versehentlich Koffer, und in dem fremden lag eine Karte mit einem roten X.',
      en: 'At the airport we swapped suitcases by accident, and the other one contained a map with a red X.',
    },
    genre: 'adventure',
    status: 'draft',
  },
  {
    id: 'hausaufgaben-ausrede',
    text: {
      de: 'Meine Ausrede für die fehlenden Hausaufgaben war so unglaublich, dass die Lehrerin sie unbedingt überprüfen wollte.',
      en: 'My excuse for the missing homework was so unbelievable that the teacher insisted on checking it out.',
    },
    genre: 'funny',
    status: 'draft',
  },
];

export const SORT_CRITERIA: SortCriterion[] = [
  {
    id: 'geburtstag',
    text: {
      de: 'nach Geburtstag im Jahr (Januar bis Dezember)',
      en: 'by birthday in the year (January to December)',
    },
    category: 'zahlen',
    needsTalking: false,
    status: 'draft',
  },
  {
    id: 'schuhgroesse',
    text: {
      de: 'nach Schuhgröße',
      en: 'by shoe size',
    },
    category: 'zahlen',
    needsTalking: false,
    status: 'draft',
  },
  {
    id: 'vorname-alphabet',
    text: {
      de: 'nach dem Anfangsbuchstaben des Vornamens (A bis Z)',
      en: 'by the first letter of your first name (A to Z)',
    },
    category: 'sprache',
    needsTalking: false,
    status: 'draft',
  },
  {
    id: 'anzahl-geschwister',
    text: {
      de: 'nach Zahl der Geschwister',
      en: 'by number of siblings',
    },
    category: 'zahlen',
    needsTalking: false,
    status: 'draft',
  },
  {
    id: 'schulweg-dauer',
    text: {
      de: 'nach Dauer des Schulwegs',
      en: 'by length of your trip to school',
    },
    category: 'alltag',
    needsTalking: false,
    status: 'draft',
  },
  {
    id: 'aufsteh-zeit',
    text: {
      de: 'nach der Uhrzeit, zu der du morgens aufstehst',
      en: 'by the time you get up in the morning',
    },
    category: 'alltag',
    needsTalking: false,
    status: 'draft',
  },
  {
    id: 'haarlaenge',
    text: {
      de: 'nach Haarlänge, kurz bis lang',
      en: 'by hair length, short to long',
    },
    category: 'zahlen',
    needsTalking: false,
    status: 'draft',
  },
  {
    id: 'nachname-laenge',
    text: {
      de: 'nach der Zahl der Buchstaben im Nachnamen',
      en: 'by the number of letters in your last name',
    },
    category: 'sprache',
    needsTalking: false,
    status: 'draft',
  },
  {
    id: 'wohnort-entfernung',
    text: {
      de: 'nach Entfernung deines Wohnorts vom Treffpunkt',
      en: 'by how far your home is from here',
    },
    category: 'zahlen',
    needsTalking: false,
    status: 'draft',
  },
  {
    id: 'sprachen',
    text: {
      de: 'nach Zahl der Sprachen, die du sprichst',
      en: 'by number of languages you speak',
    },
    category: 'sprache',
    needsTalking: false,
    status: 'draft',
  },
  {
    id: 'schlaf-stunden',
    text: {
      de: 'nach der Zahl der Stunden, die du letzte Nacht geschlafen hast',
      en: 'by the hours you slept last night',
    },
    category: 'alltag',
    needsTalking: false,
    status: 'draft',
  },
  {
    id: 'kuehl-heiss',
    text: {
      de: 'nach der Temperatur, bei der du dich am wohlsten fühlst',
      en: 'by the temperature you feel best in',
    },
    category: 'vorlieben',
    needsTalking: false,
    status: 'draft',
  },
  {
    id: 'kleidung-farbe',
    text: {
      de: 'nach der Farbe deiner Kleidung, von hell bis dunkel',
      en: 'by the color of your clothes, light to dark',
    },
    category: 'vorlieben',
    needsTalking: false,
    status: 'draft',
  },
  {
    id: 'lieblings-essen-alphabet',
    text: {
      de: 'nach dem Anfangsbuchstaben deines Lieblingsessens (A bis Z)',
      en: 'by the first letter of your favorite food (A to Z)',
    },
    category: 'sprache',
    needsTalking: false,
    status: 'draft',
  },
  {
    id: 'bett-zeit',
    text: {
      de: 'nach der Uhrzeit, zu der du abends ins Bett gehst',
      en: 'by the time you go to bed',
    },
    category: 'alltag',
    needsTalking: false,
    status: 'draft',
  },
];

export const PSYCHIATRIST_RULES: RuleIdea[] = [
  {
    id: 'links-person',
    text: {
      de: 'Antworte so, als wärst du die Person links von dir.',
      en: 'Answer as if you were the person on your left.',
    },
    difficulty: 1,
    status: 'draft',
  },
  {
    id: 'nur-ja-nein',
    text: {
      de: 'Jede Antwort beginnt mit dem Wort Ja oder Nein, abwechselnd.',
      en: 'Every answer starts with Yes or No, alternating.',
    },
    difficulty: 1,
    status: 'draft',
  },
  {
    id: 'namensanfang',
    text: {
      de: 'Jede Antwort beginnt mit dem Anfangsbuchstaben des Namens der Person, die gerade fragt.',
      en: 'Every answer starts with the first letter of the name of the person asking.',
    },
    difficulty: 2,
    status: 'draft',
  },
  {
    id: 'laenge-saetze',
    text: {
      de: 'Antworte immer in genau drei Wörtern.',
      en: 'Always answer in exactly three words.',
    },
    difficulty: 2,
    status: 'draft',
  },
  {
    id: 'gegenteil',
    text: {
      de: 'Sag immer das Gegenteil von dem, was du meinst.',
      en: 'Always say the opposite of what you mean.',
    },
    difficulty: 2,
    status: 'draft',
  },
  {
    id: 'frage-spiegel',
    text: {
      de: 'Antworte mit einer Gegenfrage, die zum Thema passt.',
      en: 'Answer with a question that fits the topic.',
    },
    difficulty: 1,
    status: 'draft',
  },
  {
    id: 'reim',
    text: {
      de: 'Deine Antwort muss sich auf die Frage reimen.',
      en: 'Your answer must rhyme with the last word of the question.',
    },
    difficulty: 3,
    status: 'draft',
  },
  {
    id: 'zeitreise',
    text: {
      de: 'Antworte so, als kämst du aus dem Jahr 1900.',
      en: 'Answer as if you came from the year 1900.',
    },
    difficulty: 2,
    status: 'draft',
  },
  {
    id: 'ortsregel',
    text: {
      de: 'Antworte so, als wärst du an einem Ort, den die Gruppe vorher festlegt, zum Beispiel am Strand.',
      en: 'Answer as if you were at a place the group decides on, such as the beach.',
    },
    difficulty: 2,
    status: 'draft',
  },
  {
    id: 'zwei-saetze',
    text: {
      de: 'Jede Antwort besteht aus genau zwei Sätzen.',
      en: 'Every answer is exactly two sentences.',
    },
    difficulty: 1,
    status: 'draft',
  },
  {
    id: 'alphabet-kette',
    text: {
      de: 'Das erste Wort deiner Antwort beginnt mit dem Buchstaben, mit dem das letzte Wort der Frage endet.',
      en: 'The first word of your answer starts with the letter the last word of the question ends with.',
    },
    difficulty: 3,
    status: 'draft',
  },
  {
    id: 'nur-uebertreiben',
    text: {
      de: 'Antworte immer maßlos übertrieben.',
      en: 'Always answer wildly exaggerated.',
    },
    difficulty: 1,
    status: 'draft',
  },
  {
    id: 'zwei-personen',
    text: {
      de: 'Antworte abwechselnd wie die Person links und wie die Person rechts von dir.',
      en: 'Alternate answering like the person on your left and the person on your right.',
    },
    difficulty: 3,
    status: 'draft',
  },
  {
    id: 'reihenfolge-gegen',
    text: {
      de: 'Beantworte immer die Frage, die vor der aktuellen gestellt wurde.',
      en: 'Always answer the question that was asked before the current one.',
    },
    difficulty: 3,
    status: 'draft',
  },
  {
    id: 'gleiche-buchstaben',
    text: {
      de: 'Alle Wörter deiner Antwort beginnen mit demselben Buchstaben.',
      en: 'All words of your answer start with the same letter.',
    },
    difficulty: 3,
    status: 'draft',
  },
];
