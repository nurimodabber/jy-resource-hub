import { ArtsPrompt } from '../types';

export const ARTS_PROMPTS_DATA: ArtsPrompt[] = [
  {
    id: 'breezes-two-roads-skit',
    kind: 'kunst',
    title: {
      de: 'Theater: Die Weggabelung der Bestätigungen',
      en: 'Drama: The Fork in the Road of Confirmation'
    },
    book: {
      de: 'Brise der Bestätigung',
      en: 'Breezes of Confirmation'
    },
    relatedBook: 'breezes',
    artForm: 'drama',
    duration: {
      de: '45–60 Min',
      en: '45–60 min'
    },
    durationMin: 45,
    durationMax: 60,
    groupSize: { min: 4, max: 20 },
    setting: 'drinnen',
    occasion: 'beides',
    theme: {
      de: 'Entscheidungen & Bestätigungen',
      en: 'Choices & Divine Confirmations'
    },
    description: {
      de: 'Ein kurzes Szenenspiel in zwei Akten: Wie verändert sich der Ausgang einer scheinbar unlösbaren Situation, wenn jemand aufgibt vs. wenn jemand mutig die ersten Schritte wagt und unerwartete Hilfe erfährt?',
      en: 'A two-act drama comparing outcomes: what transpires when a protagonist yields to helplessness versus when they step forward with courage and attract unseen support?'
    },
    materials: {
      de: ['Alltägliche Requisiten (Rucksack, Stuhl, Handy)', 'Kleines Glöckchen als Symbol für Bestätigung'],
      en: ['Everyday props (backpack, chair, notebook)', 'Small chime or bell signifying subtle confirmation']
    },
    guidingSteps: {
      de: [
        'Kleingruppen bilden (3–4 Personen) und eine reale Herausforderung wählen (z.B. Schulprüfung, Versöhnung zweier Freunde, Organisation eines Dienstprojekts).',
        'Akt 1 (Der Zweifel): Die Figur zweifelt, hört auf entmutigende Stimmen und resigniert.',
        'Akt 2 (Der Funke): Die Figur fasst einen Entschluss, spricht ein Gebet oder bittet um Rat, macht den ersten Schritt – und Verbündete tauchen unerwartet auf.',
        'Aufführung (jeweils 3 Minuten pro Gruppe) und Besprechung im Kreis.'
      ],
      en: [
        'Form trios/quartets and pick a relatable hurdle (e.g., preparing for a daunting exam, reconciling estranged friends, launching a neighborhood project).',
        'Act 1 (Doubt): The protagonist surrenders to discouragement and inner inertia.',
        'Act 2 (Action): The protagonist gathers resolve, recites a prayer or seeks counsel, takes the physical first step—and unexpected allies rally to assist.',
        'Perform 3-minute skits followed by a circle reflection.'
      ]
    },
    reflectionPrompts: {
      de: [
        'Warum kommen Bestätigungen oft erst *nachdem* man den ersten Schritt gewagt hat, und nicht vorher?',
        'Wie können wir einander in Momenten der Mutlosigkeit an die Bestätigungen erinnern?'
      ],
      en: [
        'Why do confirmations usually arrive *after* one takes the first leap of faith rather than beforehand?',
        'How can co-animators and group peers serve as agents of confirmation for one another during discouragement?'
      ]
    },
    animatorTips: {
      de: [
        "Ermutigt dazu, reale Situationen aus dem Alltag der Jugendlichen darzustellen.",
        "Wichtig ist nicht schauspielerische Perfektion, sondern die emotionale Ehrlichkeit der Figuren."
],
      en: [
        "Encourage youth to draw from actual experiences in their daily environments.",
        "Focus on emotional authenticity rather than theatrical perfection."
]
    }
  },
  {
    id: 'straight-path-stepping-stones-mural',
    kind: 'kunst',
    title: {
      de: 'Gemeinschafts-Wandbild: Trittsteine des geraden Pfades',
      en: 'Collaborative Mural: Stepping Stones of the Straight Path'
    },
    book: {
      de: 'Den geraden Pfad beschreiten',
      en: 'Walking the Straight Path'
    },
    relatedBook: 'straight-path',
    artForm: 'collaborative_mural',
    duration: {
      de: '60–90 Min',
      en: '60–90 min'
    },
    durationMin: 60,
    durationMax: 90,
    groupSize: { min: 4, max: 20 },
    setting: 'drinnen',
    occasion: 'camp',
    theme: {
      de: 'Wahrhaftigkeit & Geradlinigkeit',
      en: 'Truthfulness & Steadfastness'
    },
    description: {
      de: 'Die Gruppe gestaltet eine große Wand-Collage mit einem gewundenen Fluss und leuchtenden Trittsteinen, die Tugenden und moralische Entscheidungen symbolisieren.',
      en: 'The group paints an expansive collaborative mural depicting a rushing river crossed by luminous stepping stones representing virtues.'
    },
    materials: {
      de: ['Große Papierrolle / Packpapier (3–4 Meter)', 'Acrylfarben & Pinsel', 'Wachsmalstifte & Fineliner', 'Schablonen für Steine und Wasser'],
      en: ['Large craft butcher paper roll (3–4 meters)', 'Acrylic paints & wide brushes', 'Oil pastels & permanent markers', 'Cardboard stencils for river stones']
    },
    guidingSteps: {
      de: [
        'Hintergrund anlegen: Gemeinsam den Fluss (Herausforderungen, Versuchungen, Strömungen des Alltags) mit Blau- und Grautönen lavieren.',
        'Trittsteine gestalten: Jeder Jugendliche bemalt 2–3 Steine mit einer Tugend (z.B. Wahrhaftigkeit, Gerechtigkeit, Mut) und einem prägnanten Zitat.',
        'Die Steine so anordnen, dass sie einen sicheren Pfad über das Wasser bilden.',
        'Gemeinsame Signatur und Aufhängen im Gruppenraum.'
      ],
      en: [
        'Background wash: Paint the swirling river (symbolizing worldly distractions and turbulent pressures) using oceanic gradients.',
        'Individual stepping stones: Each youth designs 2–3 stones inscribed with a specific virtue (Truthfulness, Justice, Kindness) and a short quote.',
        'Pathway layout: Paste the stones across the canvas to form an unbroken bridge from shore to shore.',
        'Collective dedication and display in the meeting space.'
      ]
    },
    reflectionPrompts: {
      de: [
        'Was geschieht, wenn ein Trittstein (z.B. Wahrhaftigkeit) fehlt oder wackelig ist?',
        'Welche Tugend fällt dir persönlich am leichtesten, und welche erfordert die meiste Wachsamkeit?'
      ],
      en: [
        'What happens when a single stepping stone (e.g. truthfulness) is missing or unsteady beneath our feet?',
        'Which virtue comes most naturally to you, and which requires your highest daily vigilance?'
      ]
    },
    animatorTips: {
      de: [
        "Große Packpapierrolle auf dem Boden ausbreiten, damit alle gleichzeitig malen können.",
        "Zwischendurch Schritte zurücktreten und das Gesamtkunstwerk gemeinsam betrachten."
],
      en: [
        "Roll out large craft paper on the floor so everyone can work simultaneously.",
        "Take pauses to step back together and appreciate how individual stones connect."
]
    }
  },
  {
    id: 'power-word-rhythm-cypher',
    kind: 'kunst',
    title: {
      de: 'Wort-Kraft: Spoken Word & Percussion-Cypher',
      en: 'Power of the Word: Spoken Word & Percussion Cypher'
    },
    book: {
      de: 'Die Kraft des Wortes nutzen',
      en: 'Drawing on the Power of the Word'
    },
    relatedBook: 'power-of-word',
    artForm: 'music_poetry',
    duration: {
      de: '30–60 Min',
      en: '30–60 min'
    },
    durationMin: 30,
    durationMax: 60,
    groupSize: { min: 4, max: 25 },
    setting: 'beides',
    occasion: 'beides',
    theme: {
      de: 'Geistige Schöpferkraft der Sprache',
      en: 'The Transformative Potency of Language'
    },
    description: {
      de: 'Ein dynamischer Rhythmus-Kreis: Die Jugendlichen verweben Verse der Heiligen Schriften mit eigenen gereimten Zeilen über Schöpferkraft, Gedanken und Taten.',
      en: 'A rhythmic acoustic cypher weaving sacred scripture passages with original spoken word poetry on thought, speech, and noble action.'
    },
    materials: {
      de: ['Djemben, Cajóns oder Schreibtisch-Trommeln', 'Shaker & Body-Percussion', 'Schreibblöcke & Stifte'],
      en: ['Djembes, cajóns or tabletop beats', 'Egg shakers & body percussion', 'Writing pads & pens']
    },
    guidingSteps: {
      de: [
        'Einen einfachen, pulsierenden 4/4-Grundrhythmus mit Klatschen und Stampfen etablieren.',
        'Wort-Assoziationen: Jeder notiert 4 Zeilen, die ein gelerntes Zitat in die eigene Lebenswelt übersetzen.',
        'Im Kreis reihum die eigenen Zeilen rhythmisch auf den Takt rezitieren, während die Gruppe den Chor-Refrain des Zitats gemeinsam antwortet.',
        'Die Dynamik von Flüstern bis zu kraftvollem Crescendo steigern.'
      ],
      en: [
        'Establish a steady heart-rate 4/4 groove using snaps, taps, and chest resonance.',
        'Poetry prompt: Write four rhythmic bars that apply a memorized scripture verse directly to teen life.',
        'Circle recitation: Pass the microphone/spotlight around the circle, with the entire group speaking the sacred verse as the unifying hook.',
        'Modulate dynamics through whispered verses building into resonant full-group crescendos.'
      ]
    },
    reflectionPrompts: {
      de: [
        'Wie unterscheidet sich die Wirkung von Worten, wenn sie mit Rhythmus und voller Überzeugung gesprochen werden?',
        'Wie können wir unsere Worte im Alltag einsetzen, um andere aufzurichten statt zu verletzen?'
      ],
      en: [
        'How does vocal rhythm and authentic conviction amplify the emotional resonance of words?',
        'How can we train our daily speech to be a source of solace and healing rather than careless harm?'
      ]
    },
    animatorTips: {
      de: [
        "Einfacher Grundrhythmus (Klatschen / Tischklopfen) genügt völlig als Basis.",
        "Niemand muss reimen: Starke Schlüsselwörter im Takt rufen hat bereits enorme Wucht."
],
      en: [
        "A simple steady pulse of claps or table beats is all that is needed.",
        "Rhyming is optional: chanting powerful keywords in cadence has immense resonance."
]
    }
  },
  {
    id: 'tableau-living-sculptures',
    kind: 'kunst',
    title: {
      de: 'Standbilder: Lebendige Skulpturen von Tugenden',
      en: 'Living Sculptures: Frozen Tableaux of Virtues'
    },
    book: {
      de: 'Den geraden Pfad beschreiten',
      en: 'Walking the Straight Path'
    },
    relatedBook: 'straight-path',
    artForm: 'drama',
    duration: {
      de: '30–45 Min',
      en: '30–45 min'
    },
    durationMin: 30,
    durationMax: 45,
    groupSize: { min: 4, max: 25 },
    setting: 'beides',
    occasion: 'beides',
    theme: {
      de: 'Körpersprache & moralische Haltung',
      en: 'Body Language & Moral Posture'
    },
    description: {
      de: 'Ohne Worte stellen Gruppen durch ihre Körperhaltungen abstrakte Begriffe dar (z.B. Heuchelei vs. Aufrichtigkeit, Zwietracht vs. Eintracht). Die anderen Gruppen deuten die Skulptur.',
      en: 'Without speaking a word, youth sculpt their bodies into frozen emotional tableaux embodying spiritual contrasts (e.g. Gossip vs. Shielding, Despair vs. Radiance).'
    },
    materials: {
      de: ['Keine (reine Körper- und Raumübung)'],
      en: ['None required (pure kinetic physical theater)']
    },
    guidingSteps: {
      de: [
        'Zweierteams oder Vierergruppen bilden; jede Gruppe zieht geheim eine Karte mit zwei gegensätzlichen Zuständen.',
        'Die Gruppe „baut“ aus ihren eigenen Körpern auf Zählung „3-2-1-Freeze!“ ein völlig erstarrtes Standbild.',
        'Die Betrachter beschreiben: Was drückt der Blick aus? Wo liegt die Körperspannung? Welche Geschichte erzählt die Haltung?',
        'Auf ein Klatschen des Spielleiters erwacht die Skulptur für 5 Sekunden zum Leben und spricht einen einzigen Satz.'
      ],
      en: [
        'Form small groups; each quietly draws a card with contrasting states (e.g., Cynicism vs. Sincere Encouragement).',
        'On a countdown "3-2-1-Freeze!", players snap into a synchronized statuesque physical tableau.',
        'The audience analyzes: What does the gaze communicate? Where is physical weight centered? What moral conflict is visible?',
        'On a facilitator clap, the sculpture unlocks for 5 seconds of slow motion to deliver a single distilled sentence.'
      ]
    },
    reflectionPrompts: {
      de: [
        'Wie viel verrät unsere physische Haltung über unsere innere seelische Ausrichtung?',
        'Wie fühlt es sich an, von einer Haltung der Verschlossenheit in eine offene, dienende Haltung zu wechseln?'
      ],
      en: [
        'How deeply does our physical posture telegraph our inner spiritual state to those around us?',
        'What physical sensation occurs when transitioning from defensive isolation to open, humble service?'
      ]
    },
    animatorTips: {
      de: [
        "Kurzes Einfrieren für 10 Sekunden trainieren, damit der Raum zur Ruhe kommt.",
        "Die Zuschauenden beschreiben lassen, was sie sehen, bevor die Spielenden erklären."
],
      en: [
        "Practice freezing for 10 quiet seconds to build concentration.",
        "Invite observers to describe what they perceive before actors explain."
]
    }
  },
  {
    id: 'spirit-faith-clay-sculptures',
    kind: 'kunst',
    title: {
      de: 'Ton-Metaphern: Das Gefäß des reinen Herzens',
      en: 'Clay Metaphors: Vessel of a Pure Heart'
    },
    book: {
      de: 'Geist des Glaubens',
      en: 'Spirit of Faith'
    },
    relatedBook: 'spirit-of-faith',
    artForm: 'visual_arts',
    duration: {
      de: '45–75 Min',
      en: '45–75 min'
    },
    durationMin: 45,
    durationMax: 75,
    groupSize: { min: 3, max: 16 },
    setting: 'drinnen',
    occasion: 'beides',
    theme: {
      de: 'Reinheit des Herzens & Demut',
      en: 'Purity of Heart & Receptivity'
    },
    description: {
      de: 'Jeder Jugendliche formt aus lufttrocknendem Ton ein symbolisches Gefäß oder eine Schale, die darstellt, wie das menschliche Herz bereit wird, göttliches Licht aufzunehmen.',
      en: 'Each participant sculpts a symbolic clay vessel or chalice illustrating how the human heart becomes receptive to divine light and wisdom.'
    },
    materials: {
      de: ['Lufttrocknender Modellierton', 'Modellierwerkzeuge (Zahnstocher, Löffel)', 'Gold- oder Acrylfarbe', 'Stempel für Schriftzeichen'],
      en: ['Air-dry sculpting clay', 'Basic pottery tools / toothpicks', 'Gold or metallic acrylic paint', 'Lettering stamps']
    },
    guidingSteps: {
      de: [
        'Zitat rezitieren: „O Sohn des Geistes! Mein erstes Gebot an dich ist dieses: Besitze ein reines, gütiges und strahlendes Herz...“',
        'Stille Ton-Arbeit (25 Min): Eine Schale oder ein Gefäß formen. Das Innere sorgfältig glätten – als Symbol dafür, Staub und Ego abzutragen.',
        'Prägung: Ein kurzes Wort (z.B. „Licht“, „Frieden“, „Reinheit“) in den Rand prägen.',
        'Nach dem Trocknen das Innere des Gefäßes golden oder leuchtend weiß bemalen.'
      ],
      en: [
        'Contemplative reading: "O Son of Spirit! My first counsel is this: Possess a pure, kindly and radiant heart..."',
        'Silent clay work (25 min): Pinch and smooth a clay bowl. Polish the interior meticulously—symbolizing clearing the dust of self.',
        'Imprinting: Press an essential virtue into the rim with lettering tools.',
        'Finishing: Once hardened, paint the inner bowl with radiant gold or bright pearl hues.'
      ]
    },
    reflectionPrompts: {
      de: [
        'Was geschieht mit einem Gefäß, das bereits bis zum Rand mit Steinen oder Schmutz gefüllt ist?',
        'Wie können wir unser Herz im Alltag von Vorurteilen, Neid und Ablenkung freihalten?'
      ],
      en: [
        'What occurs when you pour precious water into a vessel already clogged with debris and stones?',
        'How do we practically empty our minds of prejudice, cynicism, and envy during ordinary school days?'
      ]
    },
    animatorTips: {
      de: [
        "Tisch mit Wachstuch oder Zeitung abdecken. Feuchte Tücher bereitstellen.",
        "Betonen, dass Skulpturen symbolisch sein dürfen und nicht naturalistisch sein müssen."
],
      en: [
        "Cover surfaces with craft paper or table cloths; keep damp cloths handy.",
        "Emphasize that forms can be purely symbolic and abstract."
]
    }
  },
  {
    id: 'drawing-miner-parable-comic',
    kind: 'kunst',
    title: {
      de: 'Graphic Novel: Der Bergmann und die verborgenen Edelsteine',
      en: 'Graphic Novel: The Miner & The Hidden Gems'
    },
    book: {
      de: 'Brise der Bestätigung',
      en: 'Breezes of Confirmation'
    },
    relatedBook: 'breezes',
    artForm: 'visual_arts',
    duration: {
      de: '45–75 Min',
      en: '45–75 min'
    },
    durationMin: 45,
    durationMax: 75,
    groupSize: { min: 3, max: 20 },
    setting: 'drinnen',
    occasion: 'treffen',
    theme: {
      de: 'Innewohnende Schätze des Menschen',
      en: 'Inherent Nobility & Hidden Gems'
    },
    description: {
      de: 'Gestaltung eines 4-Panel-Comics basierend auf dem berühmten Zitat: „Betrachte den Menschen als ein Bergwerk, reich an Edelsteinen von unschätzbarem Werte...“',
      en: 'Crafting a dynamic four-panel comic strip interpreting the classic scripture: "Regard man as a mine rich in gems of inestimable value..."'
    },
    materials: {
      de: ['Comic-Vorlagen (4 leere Panels auf Zeichenpapier)', 'Schwarze Fineliner (verschiedene Stärken)', 'Buntstifte & Marker'],
      en: ['Blank four-panel comic template boards', 'Fine-point waterproof black ink pens', 'Colored markers & pencils']
    },
    guidingSteps: {
      de: [
        'Panel 1: Eine Figur, die von anderen unterschätzt oder übersehen wird (unscheinbare Felswand).',
        'Panel 2: Ein geduldiger Förderer / Freund, der mit der Hacke der Liebe und Ermutigung zu graben beginnt.',
        'Panel 3: Ein glänzender Kristall oder Diamant (ein Talent, Großzügigkeit oder Weisheit) kommt ans Licht.',
        'Panel 4: Der Edelstein strahlt und erleuchtet das gesamte Umfeld.'
      ],
      en: [
        'Panel 1: An overlooked individual deemed ordinary or flawed (rough bedrock).',
        'Panel 2: An encouraging mentor or friend striking through stone with patience and love.',
        'Panel 3: An unpolished diamond of innate talent, generosity, or courage emerges into sunlight.',
        'Panel 4: The multifaceted gem radiates light across the whole community.'
      ]
    },
    reflectionPrompts: {
      de: [
        'Welche verborgenen Edelsteine schlummern in Menschen, die auf den ersten Blick schwierig oder abweisend wirken?',
        'Wie können wir als Gruppe wie Bergmänner handeln, die ineinander nach Schätzen suchen?'
      ],
      en: [
        'What hidden virtues lie buried within peers who appear prickly, aggressive, or defensive?',
        'How can our youth group operate like master miners committed to uncovering gems in one another?'
      ]
    },
    animatorTips: {
      de: [
        "Strichmännchen und einfache Symbole sind ausdrücklich erwünscht.",
        "Der Fokus liegt auf der Botschaft und inneren Wandlung der Figur."
],
      en: [
        "Stick figures and simple sketches are entirely welcome.",
        "Keep the focus on the protagonist’s inner moral shift."
]
    }
  },
  {
    id: 'interactive-songwriting-circle',
    kind: 'kunst',
    title: {
      de: 'Liederschmiede: Zitate vertonen mit Akustikgitarre',
      en: 'Songwriting Atelier: Setting Scripture to Acoustic Melody'
    },
    book: {
      de: 'Brise der Bestätigung & Den geraden Pfad beschreiten',
      en: 'Breezes of Confirmation & Walking the Straight Path'
    },
    relatedBook: 'breezes',
    artForm: 'music_poetry',
    duration: {
      de: '45–90 Min',
      en: '45–90 min'
    },
    durationMin: 45,
    durationMax: 90,
    groupSize: { min: 4, max: 25 },
    setting: 'beides',
    occasion: 'camp',
    theme: {
      de: 'Lied & Andacht',
      en: 'Music & Devotional Elevation'
    },
    description: {
      de: 'Gemeinsames Komponieren eines einfachen, eingängigen Liedes zu einem gelernten Zitat. Akkorde auf Gitarre oder Ukulele begleiten.',
      en: 'Collaborative songwriting workshop: crafting an accessible, memorable choral melody to carry a newly memorized scripture verse.'
    },
    materials: {
      de: ['Gitarre, Ukulele oder Keyboard', 'Aufnahmegerät / Smartphone', 'Großes Whiteboard für Akkorde und Text'],
      en: ['Acoustic guitar, ukulele, or keyboard', 'Voice recorder', 'Large easel board for chords and lyrics']
    },
    guidingSteps: {
      de: [
        'Textphrase auswählen (z.B. „Aufrichtigkeit ist das Fundament aller menschlichen Tugenden“).',
        'Die Sprachmelodie erforschen: Wie klingt der Satz, wenn man ihn natürlich und gefühlvoll spricht? Welche Silben betonen wir?',
        'Einfache Akkordfolge wählen (z.B. C – G – Am – F oder D – A – Bm – G).',
        'Reihum Melodievorschläge einsingen, bis die Gruppe sich auf eine berührende Melodie einigt.',
        'Das fertige Lied aufnehmen und in der nächsten Andacht anstimmen.'
      ],
      en: [
        'Text selection: Isolate an evocative quote line ("Truthfulness is the foundation of all human virtues").',
        'Natural speech cadence: Speak the sentence aloud together. Where do natural emotional accents land?',
        'Chord progression: Lay down an open cyclical chord vamp (e.g., C – G – Am – F or D – A – Bm – G).',
        'Melody iteration: Youth sing out melodic proposals until a resonant hook clicks with everyone.',
        'Record the live acoustic version to teach to family and peers.'
      ]
    },
    reflectionPrompts: {
      de: [
        'Warum fällt es uns oft zehnmal leichter, einen gesungenen Text über Jahre hinweg im Herzen zu behalten?',
        'Welche Rolle spielt Musik als Nahrung für die Seele?'
      ],
      en: [
        'Why does a melody lock sacred words into long-term memory far more effortlessly than dry repetition?',
        'In what way does wholesome, devotional music serve as spiritual sustenance for the soul?'
      ]
    },
    animatorTips: {
      de: [
        "Mit einem einfachen Refrain oder einer sich wiederholenden Textzeile beginnen.",
        "Aufnahme auf dem Handy machen, damit die Gruppe ihr eigenes Lied später anhören kann."
],
      en: [
        "Start with a simple repeated chorus phrase or quotation fragment.",
        "Record the collective rendition on a phone so youth can revisit their creation."
]
    }
  }
];
