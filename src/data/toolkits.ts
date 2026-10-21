import { EmpirePromptCategory, DiscussionCard, CampBestPractice } from '../types';

export const EMPIRE_PROMPTS: EmpirePromptCategory[] = [
  {
    id: 'ausreden-schlimmer',
    title: {
      de: 'Ausreden, die schlimmer sind als die Tat selbst',
      en: 'Excuses Worse Than the Crime'
    },
    description: {
      de: 'Jeder schreibt eine absurde, peinliche oder haarsträubende Ausrede auf.',
      en: 'Each person submits an absurd, embarrassing, or completely unbelievable excuse.'
    },
    exampleAnswers: {
      de: [
        '„Mein Hund hat die Hausaufgaben nicht gefressen, sondern korrigiert.“',
        '„Ich bin zu spät, weil ich erst nachdenken musste, ob Zeit real ist.“',
        '„Der Keks ist gestolpert und mir in den Mund gefallen.“'
      ],
      en: [
        '"My dog didn\'t eat my homework, he proofread and rejected it."',
        '"I am late because I had to reflect on whether time is a construct."',
        '"The cookie tripped and fell straight into my mouth."'
      ]
    }
  },
  {
    id: 'bodenlose-ausreden',
    title: {
      de: 'Bizarre Trennungsgründe',
      en: 'Bizarre Breakup Excuses'
    },
    description: {
      de: 'Kuriose oder unfreiwillig komische Begründungen für ein Beziehungsende.',
      en: 'Strange, petty, or unintentionally hilarious breakup justifications.'
    },
    exampleAnswers: {
      de: [
        '„Mein Horoskop meinte, deine Aura blockiert mein WLAN.“',
        '„Du atmest einfach zu dramatisch beim Essen.“',
        '„Meine Katze hat dich skeptisch gemustert.“'
      ],
      en: [
        '"My horoscope warned me that your aura is blocking my Wi-Fi."',
        '"You breathe too theatrically while chewing."',
        '"My cat looked at you with deep moral judgment."'
      ]
    }
  },
  {
    id: 'crazyste-lehrer',
    title: {
      de: 'Unvergessliche Lehrer-Sprüche',
      en: 'Unforgettable Teacher Quotes'
    },
    description: {
      de: 'Die typischen, manchmal absurden Sätze aus dem Schulalltag.',
      en: 'Classic, absurd, or legendary quotes heard around classroom hallways.'
    },
    exampleAnswers: {
      de: [
        '„Der Gong ist für mich, nicht für euch!“',
        '„Ich beende die Stunde, nicht die Physik!“',
        '„Wenn ihr so weitermacht, gebe ich mir selbst eine Sechs.“'
      ],
      en: [
        '"The bell dismisses you, not the laws of physics!"',
        '"I don\'t hear any studying happening over there."',
        '"If this noise continues, I will give myself detention."'
      ]
    }
  },
  {
    id: 'verboten-sein',
    title: {
      de: 'Dinge, die gesetzlich verboten gehören',
      en: 'Harmless Things That Should Be Illegal'
    },
    description: {
      de: 'Alltägliche Kleinigkeiten, die einen innerlich verzweifeln lassen.',
      en: 'Minor everyday irritations that drive people irrationally crazy.'
    },
    exampleAnswers: {
      de: [
        '„Socken, die im Schuh langsam nach vorne rutschen.“',
        '„Sprachnachrichten über 4 Minuten ohne Punkt und Komma.“',
        '„Leute, die genau vor der Rolltreppe abrupt stehen bleiben.“'
      ],
      en: [
        '"Socks that slowly slide down inside your shoe while walking."',
        '"Voice notes that exceed 4 minutes without a clear point."',
        '"People who stop abruptly right at the end of an escalator."'
      ]
    }
  },
  {
    id: 'minimal-stehlen',
    title: {
      de: 'Was würdest du stehlen, um jemanden nur minimal zu nerven?',
      en: 'What Would You Steal to Cause Minor Inconvenience?'
    },
    description: {
      de: 'Völlig harmlos, aber maximal lästig im Alltag.',
      en: 'Harmless items that cause peak psychological friction.'
    },
    exampleAnswers: {
      de: [
        '„Aus jedem Schuhpaar immer genau den linken Schnürsenkel.“',
        '„Alle Ladekabel im Haus um 10 Zentimeter kürzen.“',
        '„Den Haltegriff am Reißverschluss abknipsen.“'
      ],
      en: [
        '"The left shoelace from every pair of shoes in the house."',
        '"Cut 10 cm off every charging cable so it just barely misses the desk."',
        '"Snip the zipper pull-tab off their favorite jacket."'
      ]
    }
  },
  {
    id: 'date-ruinieren',
    title: {
      de: 'Sätze, die sofort jedes Treffen ruinieren',
      en: 'Phrases Guaranteed to Ruin a Meeting'
    },
    description: {
      de: 'Sätze, die man bei einer ersten Verabredung niemals hören möchte.',
      en: 'Uncomfortable things no one wants to hear upon first meeting someone.'
    },
    exampleAnswers: {
      de: [
        '„Meine Mutter hat mir verboten, mit Leuten ohne Zehnerkarte zu sprechen.“',
        '„Ich beurteile Charakterzüge primär nach Fußform.“',
        '„Ich hoffe du zahlst, meine Kontokarte ist seit drei Monaten gesperrt.“'
      ],
      en: [
        '"My mom insisted I ask for your credit score before ordering."',
        '"I categorize personalities primarily by earlobe shape."',
        '"I hope you are treating, my bank froze my card last month."'
      ]
    }
  }
];

export const DISCUSSION_CARDS: DiscussionCard[] = [
  {
    id: 'jugendzeit-erlesen',
    title: {
      de: 'Die erlesenste Zeit',
      en: 'The Choicest Season'
    },
    quoteSnippet: {
      de: '„Die Jugendzeit ist die erlesenste Zeit, denn sie ist die Epoche der Tatkraft und des Strebens.“',
      en: '"Youth is the choicest period of life, for it is the time of energy, enthusiasm and high aspiration."'
    },
    source: {
      de: '‘Abdu’l-Bahá',
      en: '‘Abdu’l-Bahá'
    },
    book: {
      de: 'Juniorjugendprogramm',
      en: 'Junior Youth Programme'
    },
    coreQuestion: {
      de: 'Wo und wie spürst du diese einzigartige Tatkraft ganz konkret in deinem eigenen Alltag?',
      en: 'Where and how do you directly experience this unique energy in your own daily life?'
    },
    deepeningQuestions: {
      de: [
        'Worin unterscheidet sich deine Sicht auf dein Umfeld heute von der vor zwei Jahren?',
        'Welche Talente oder Fähigkeiten möchtest du für deine Gemeinschaft einsetzen?',
        'Was hindert Jugendliche manchmal daran, ihre eigene Gestaltungsfähigkeit ernst zu nehmen?'
      ],
      en: [
        'How has your perspective on your surroundings evolved compared to two years ago?',
        'What talents or skills do you hope to place in service to your community?',
        'What sometimes holds young people back from recognizing their own capacity?'
      ]
    },
    theme: {
      de: 'Tatkraft & Jugend',
      en: 'Youth & Agency'
    }
  },
  {
    id: 'zweifache-bestimmung',
    title: {
      de: 'Zweifache Bestimmung',
      en: 'Twofold Moral Purpose'
    },
    quoteSnippet: {
      de: '„Der Mensch hat eine zweifache Bestimmung: die eigene Entwicklung und der Beitrag zum Wohl der Gemeinschaft.“',
      en: '"Every individual has a twofold purpose: developing one\'s own potential and contributing to the transformation of society."'
    },
    source: {
      de: 'Universales Haus der Gerechtigkeit',
      en: 'Universal House of Justice'
    },
    book: {
      de: 'Juniorjugendprogramm',
      en: 'Junior Youth Programme'
    },
    coreQuestion: {
      de: 'Wie hängen deine persönliche Entfaltung und dein Dienst an anderen unmittelbar zusammen?',
      en: 'How do your personal growth and your service to others strengthen each other?'
    },
    deepeningQuestions: {
      de: [
        'Gab es Momente, in denen du jemandem geholfen hast und dadurch selbst gewachsen bist?',
        'Warum führt reiner Eigennutz auf Dauer oft zu Unzufriedenheit?',
        'Wie können wir in unserer Gruppe beides gleichzeitig stärken?'
      ],
      en: [
        'Can you recall an instance where helping someone helped you grow personally?',
        'Why does living solely for self-interest eventually feel hollow?',
        'How can our group nurture both personal growth and community service?'
      ]
    },
    theme: {
      de: 'Sinn & Verantwortung',
      en: 'Purpose & Service'
    }
  },
  {
    id: 'lampe-und-licht',
    title: {
      de: 'Lampe und Licht',
      en: 'The Lamp and the Light'
    },
    quoteSnippet: {
      de: '„Der materielle Fortschritt ist wie der Lampenkörper, der geistige Fortschritt aber wie das Licht in der Lampe.“',
      en: '"Material progress is like unto the lamp, while spiritual progress is the light in the lamp."'
    },
    source: {
      de: '‘Abdu’l-Bahá (Ansprachen in Paris)',
      en: '‘Abdu’l-Bahá (Paris Talks)'
    },
    book: {
      de: 'Geist des Glaubens',
      en: 'Spirit of Faith'
    },
    coreQuestion: {
      de: 'Warum reicht materieller Wohlstand allein nicht aus, um ein erfülltes Leben zu führen?',
      en: 'Why is material prosperity alone insufficient to build a truly fulfilling life?'
    },
    deepeningQuestions: {
      de: [
        'Was nützt die schönste Lampe, wenn kein Licht in ihr scheint?',
        'Welche Tugenden (wie Aufrichtigkeit, Freundschaft, Mitgefühl) machen eine Gruppe erst lebendig?',
        'Wo begegnet uns in den sozialen Medien die Verwechslung von Äußerlichkeiten und echtem Wert?'
      ],
      en: [
        'What use is the finest lamp if it contains no light to illuminate the darkness?',
        'What virtues (such as sincerity, kindness, justice) bring life to a group?',
        'Where do we see social media confuse external appearance with genuine worth?'
      ]
    },
    theme: {
      de: 'Werte & Charakter',
      en: 'Values & Character'
    }
  },
  {
    id: 'protagonist-sein',
    title: {
      de: 'Protagonist des eigenen Lebens',
      en: 'Being a Protagonist'
    },
    quoteSnippet: {
      de: '„Seid nicht bloße Zuschauer auf der Bühne des Lebens, sondern aktive Gestalter eurer Umwelt.“',
      en: '"Be active participants in shaping your world rather than passive spectators on the sidelines."'
    },
    source: {
      de: 'Universales Haus der Gerechtigkeit',
      en: 'Universal House of Justice'
    },
    book: {
      de: 'Brise der Bestätigung',
      en: 'Breezes of Confirmation'
    },
    coreQuestion: {
      de: 'Wo in deinem persönlichen Umfeld möchtest du aktiver Gestalter sein, statt nur abzuwarten?',
      en: 'In what areas of your life do you want to take initiative rather than just being a spectator?'
    },
    deepeningQuestions: {
      de: [
        'Warum ist es manchmal bequemer, nur mitzuschwimmen, auch wenn man Dinge anders sieht?',
        'Was braucht es an Mut, um sich für Gerechtigkeit oder Inklusion einzusetzen?',
        'Wie können wir uns gegenseitig den Rücken stärken?'
      ],
      en: [
        'Why is it often tempting to go along with the crowd even when something feels wrong?',
        'What kind of courage is needed to stand up for inclusion or fairness?',
        'How can we support one another when taking a stand?'
      ]
    },
    theme: {
      de: 'Initiative & Mut',
      en: 'Courage & Agency'
    }
  },
  {
    id: 'digital-media-focus',
    title: {
      de: 'Digitale Welt & geistige Wachsamkeit',
      en: 'Digital Life & Moral Focus'
    },
    quoteSnippet: {
      de: '„Macht eure Augen zu Wächtern eures Geistes, damit nicht die Bilder der Vergänglichkeit euer inneres Sehvermögen trüben.“',
      en: '"Guard your inner vision against the endless torrent of fleeting illusions that scatter moral focus."'
    },
    source: {
      de: 'Aus den Bahá’í-Schriften',
      en: 'From the Bahá’í Writings'
    },
    book: {
      de: 'Juniorjugendprogramm',
      en: 'Junior Youth Programme'
    },
    coreQuestion: {
      de: 'Wann bereichert Technologie unser Leben und wo raubt sie uns heimlich Zeit, Ruhe und echte Verbindung?',
      en: 'Where does digital technology genuinely enrich our growth, and where does it stealthily steal our attention and deep peace?'
    },
    deepeningQuestions: {
      de: [
        'Wie fühlt sich dein Geist nach zwei Stunden endlosem Scrollen auf Social Media an – erfrischt oder leer?',
        'Wie können wir bewusste Grenzen setzen, um Herr über unsere Zeit zu bleiben statt ihr Gefangener?',
        'Wie können wir soziale Medien kreativ nutzen, um Positives und Geistiges zu teilen?'
      ],
      en: [
        'How does your mind truly feel after two continuous hours of social media feeds—uplifted or depleted?',
        'What disciplined habits help us remain conscious masters of our digital tools rather than their passive captives?',
        'How could our youth group leverage media to broadcast light, encouragement, and unity?'
      ]
    },
    theme: {
      de: 'Medien & Klarheit',
      en: 'Digital Clarity'
    }
  },
  {
    id: 'true-friendship-cliques',
    title: {
      de: 'Wahre Freundschaft vs. Grüppchenbildung',
      en: 'Noble Friendship vs. Exclusive Cliques'
    },
    quoteSnippet: {
      de: '„Ein wahrer Freund ist wie ein leuchtender Spiegel, der das Gute in deiner Seele widerspiegelt.“',
      en: '"A faithful friend is a strong defense: and he that hath found such a one hath found a treasure."'
    },
    source: {
      de: '‘Abdu’l-Bahá',
      en: '‘Abdu’l-Bahá'
    },
    book: {
      de: 'Den geraden Pfad beschreiten',
      en: 'Walking the Straight Path'
    },
    coreQuestion: {
      de: 'Woran erkennt man einen wahren Freund, der dich geistig aufrichtet, im Gegensatz zu bloßen Zweckbündnissen?',
      en: 'What distinguishes a noble companion who elevates your character from superficial alliances built on convenience?'
    },
    deepeningQuestions: {
      de: [
        'Warum neigen Cliquen in der Schule dazu, andere abzuwerten, um sich selbst stark zu fühlen?',
        'Wie können wir in unserer Gruppe eine Kultur leben, in der JEDER neue Gast sofort bedingungslos willkommen ist?',
        'Was tust du, wenn ein Freund dich zu etwas drängt, das gegen dein Gewissen spricht?'
      ],
      en: [
        'Why do school cliques often belittle outsiders to artificially manufacture belonging?',
        'How can our circle nurture an open-hearted culture where any newcomer feels warmly and instantly embraced?',
        'How do you respond when a companion pressures you into choices that violate your conscience?'
      ]
    },
    theme: {
      de: 'Freundschaft & Einheit',
      en: 'Noble Friendship'
    }
  },
  {
    id: 'constructive-speech',
    title: {
      de: 'Die Kraft der Zunge: Aufbauen statt Lästern',
      en: 'The Power of the Tongue: Building vs. Tearing Down'
    },
    quoteSnippet: {
      de: '„Die Zunge ist ein loderndes Feuer, und Mangel an Beherrschung ist wie tödliches Gift.“',
      en: '"The tongue is a smoldering fire, and an excess of speech a deadly poison."'
    },
    source: {
      de: 'Bahá\'u\'lláh (Botschaften aus Akka)',
      en: 'Bahá\'u\'lláh (Tablets of Bahá\'u\'lláh)'
    },
    book: {
      de: 'Die Kraft des Wortes nutzen',
      en: 'Drawing on the Power of the Word'
    },
    coreQuestion: {
      de: 'Warum ist Lästern (Hinterrücksreden) so ansteckend und wie vergiftet es das Vertrauen in einer Gruppe?',
      en: 'Why is gossip so casually contagious, and how does it silently corrode mutual trust within a community?'
    },
    deepeningQuestions: {
      de: [
        'Was bewirkt es in dir, wenn jemand in deiner Gegenwart schlecht über einen Abwesenden spricht?',
        'Welche sanften, aber klaren Sätze können wir sagen, um ein Gespräch sofort in eine positive Richtung zu lenken?',
        'Wie fühlt es sich an, zu wissen, dass die eigenen Freunde in Abwesenheit immer gut über einen sprechen?'
      ],
      en: [
        'What shifts in your gut when someone begins dismantling an absent peer\'s character in your presence?',
        'What gracious yet firm pivot phrases can we deploy to steer conversations back into clean air?',
        'How does it feel to know with absolute certainty that your group will defend your honor whenever you are absent?'
      ]
    },
    theme: {
      de: 'Wahrhaftigkeit & Sprache',
      en: 'Pure Speech'
    }
  },
  {
    id: 'overcoming-prejudice',
    title: {
      de: 'Schönheit der Vielfalt & Abbau von Vorurteilen',
      en: 'Harmony of Diversity & Overcoming Prejudice'
    },
    quoteSnippet: {
      de: '„Ihr seid die Früchte eines Baumes und die Blätter eines Zweiges. Verhaltet euch zueinander in größter Liebe und Eintracht.“',
      en: '"Ye are the fruits of one tree, and the leaves of one branch. Deal ye one with another with the utmost love and harmony."'
    },
    source: {
      de: 'Bahá\'u\'lláh (Ährenlese)',
      en: 'Bahá\'u\'lláh (Gleanings)'
    },
    book: {
      de: 'Brise der Bestätigung',
      en: 'Breezes of Confirmation'
    },
    coreQuestion: {
      de: 'Wie bereichert die Vielfalt an Herkunft, Persönlichkeiten und Gaben unsere Gruppe, statt Trennung zu erzeugen?',
      en: 'How does rich diversity of culture, temperaments, and backgrounds beautify a community rather than creating friction?'
    },
    deepeningQuestions: {
      de: [
        'Wo begegnen uns im Schulalltag subtile Vorurteile oder Stereotypen?',
        'Warum ist ein Garten mit verschiedenfarbigen Blumen schöner als ein Beet mit nur einer einzigen Blume?',
        'Wie können wir aktiv voneinander lernen und Brücken zwischen verschiedenen Welten bauen?'
      ],
      en: [
        'Where do subtle stereotypes or assumptions crop up in hallway chatter and social expectations?',
        'Why is a garden filled with vibrant, contrasting blossoms far more breathtaking than a monochrome lawn?',
        'How can we proactively inquire into one another\'s stories to dissolve invisible walls?'
      ]
    },
    theme: {
      de: 'Einheit der Menschheit',
      en: 'Unity in Diversity'
    }
  },
  {
    id: 'courage-peer-pressure',
    title: {
      de: 'Mut zur Integrität bei Gruppenzwang',
      en: 'Moral Courage Against Peer Pressure'
    },
    quoteSnippet: {
      de: '„Sei ein Licht für jene, die im Dunkeln wandeln, eine Freude für die Betrübten, ein Meer für die Dürstenden.“',
      en: '"Be an ornament to the countenance of truth, a crown to the brow of fidelity, a pillar of the temple of righteousness."'
    },
    source: {
      de: 'Bahá\'u\'lláh (Ährenlese)',
      en: 'Bahá\'u\'lláh (Gleanings)'
    },
    book: {
      de: 'Den geraden Pfad beschreiten',
      en: 'Walking the Straight Path'
    },
    coreQuestion: {
      de: 'Warum erfordert es oft Heldenmut, ruhig „Nein“ zu sagen, wenn alle anderen etwas Falsches tun?',
      en: 'Why does speaking a calm, unyielding "No" require supreme heroism when an entire crowd is surging backward?'
    },
    deepeningQuestions: {
      de: [
        'Welche Situationen fallen dir ein, in denen man Angst hat, uncool oder ein Außenseiter zu wirken?',
        'Wie können wir diese Angst vor Ablehnung überwinden und inneren Halt finden?',
        'Wie können wir andere ermutigen, die gerade alleine gegen den Strom schwimmen?'
      ],
      en: [
        'What social scenarios trigger the paralyzing anxiety of being labeled uncool or an outcast?',
        'How do we anchor our inner sense of worth in transcendent principles rather than fickle peer approval?',
        'How can we stand visibly alongside someone who is swimming alone against the tide?'
      ]
    },
    theme: {
      de: 'Mut & Integrität',
      en: 'Courage & Integrity'
    }
  },
  {
    id: 'service-joy-fountain',
    title: {
      de: 'Die Quelle echter Freude im Dienen',
      en: 'The Fountain of Joy in Service'
    },
    quoteSnippet: {
      de: '„Erfreut euch daran, den Kummer anderer zu lindern und Freude in die Herzen der Menschen zu bringen.“',
      en: '"Let your heart burn with loving kindness for all who may cross your path."'
    },
    source: {
      de: '‘Abdu’l-Bahá (Ansprachen in Paris)',
      en: '‘Abdu’l-Bahá (Paris Talks)'
    },
    book: {
      de: 'Brise der Bestätigung',
      en: 'Breezes of Confirmation'
    },
    coreQuestion: {
      de: 'Warum erzeugt das uneigennützige Dienen an anderen eine tiefere und nachhaltigere Freude als reiner Konsum?',
      en: 'Why does selfless service to others generate a luminous, abiding joy that mere entertainment or consumption can never replicate?'
    },
    deepeningQuestions: {
      de: [
        'Erinnerst du dich an einen Moment, in dem du völlig vergessen hast, was du selbst wolltest, weil du jemandem geholfen hast?',
        'Wie verändert das gemeinsame Anpacken für andere die Freundschaft innerhalb unserer Gruppe?',
        'Welche kleinen Dienste können wir schon morgen früh im Alltag unbemerkt tun?'
      ],
      en: [
        'Can you recall an instance where self-centered anxieties vanished because you were fully absorbed in lifting another?',
        'How does sweating shoulder-to-shoulder in service forge an unbreakable bond within our youth group?',
        'What unseen acts of service could each of us sprinkle quietly across our homes tomorrow morning?'
      ]
    },
    theme: {
      de: 'Dienst & Freude',
      en: 'Service & Joy'
    }
  },
  {
    id: 'liebe-zur-menschheit-breezes',
    status: 'draft',
    title: {
      de: 'Liebe zur gesamten Menschheit',
      en: 'Love for All Mankind'
    },
    quoteSnippet: {
      de: '„Ihr wurdet erschaffen, einander Liebe zu erzeigen und nicht Widerspenstigkeit und Groll. Seid nicht stolz auf die Liebe zu euch selbst, sondern auf die Liebe zur gesamten Menschheit.“',
      en: '"Ye were created to show love one to another and not perversity and rancour. Take pride not in love for yourselves but in love for all mankind."'
    },
    source: {
      de: 'Bahá\'u\'lláh (Botschaften aus Akka, Lawh-i-Maqsúd)',
      en: 'Bahá\'u\'lláh (Tablets of Bahá\'u\'lláh, Lawh-i-Maqsúd)'
    },
    book: {
      de: 'Brise der Bestätigung',
      en: 'Breezes of Confirmation'
    },
    coreQuestion: {
      de: 'Wie können wir unsere Liebe über den eigenen Freundeskreis hinaus auf Menschen ausdehnen, die ganz anders denken oder leben?',
      en: 'How can we expand our circle of care beyond familiar friends to embrace those from entirely different walks of life?'
    },
    deepeningQuestions: {
      de: [
        'Wo fällt es uns leicht, liebevoll zu sein – und wo spüren wir inneren Widerstand?',
        'Was bewirkt der Satz „Seid nicht stolz auf die Liebe zu euch selbst“ in einer Welt voller Selbstdarstellung?',
        'Wie kann unsere Juniorjugendgruppe zu einem Ort bedingungsloser Herzlichkeit werden?'
      ],
      en: [
        'Where does showing loving kindness feel natural, and where do we hit inner resistance?',
        'What challenge does "Take pride not in love for yourselves" pose in a culture fixated on self-promotion?',
        'How can our youth circle embody universal warmth toward any newcomer?'
      ]
    },
    theme: {
      de: 'Liebe & Menschheit',
      en: 'Love & Humanity'
    }
  },
  {
    id: 'hingabe-und-weltbuerger',
    status: 'draft',
    title: {
      de: 'Der wahre Mensch im Dienst',
      en: 'True Nobility in Service'
    },
    quoteSnippet: {
      de: '„Er ist ein wahrer Mensch, der sich heute dem Dienst an der gesamten Menschenrasse weiht.“',
      en: '"That one indeed is a man who, today, dedicateth himself to the service of the entire human race."'
    },
    source: {
      de: 'Bahá\'u\'lláh (Botschaften aus Akka, Worte des Paradieses)',
      en: 'Bahá\'u\'lláh (Tablets of Bahá\'u\'lláh, Words of Paradise)'
    },
    book: {
      de: 'Brise der Bestätigung',
      en: 'Breezes of Confirmation'
    },
    coreQuestion: {
      de: 'Was unterscheidet ein Leben im Dienst am Gemeinwohl von einem Leben, das nur um persönlichen Erfolg kreist?',
      en: 'What distinguishes a life dedicated to community uplift from one driven solely by personal advancement?'
    },
    deepeningQuestions: {
      de: [
        'Wer in deinem Umfeld oder in der Geschichte verkörpert diese Hingabe auf berührende Weise?',
        'Warum fühlt sich das Dienen manchmal anstrengend an, schenkt aber am Ende die größte Erfüllung?',
        'Welche kleinen Schritte können wir als Gruppe heute unternehmen, um diesen Geist zu leben?'
      ],
      en: [
        'Who in your neighborhood or world history exemplifies this selfless dedication?',
        'Why does genuine service sometimes demand sacrifice yet yield lasting peace?',
        'What concrete step could our group undertake today to live out this ideal?'
      ]
    },
    theme: {
      de: 'Dienst & Sinn',
      en: 'Purpose & Service'
    }
  },
  {
    id: 'reines-herz-eingennutz',
    status: 'draft',
    title: {
      de: 'Ein reines Herz ohne Eigennutz',
      en: 'A Pure Heart Free from Self-Interest'
    },
    quoteSnippet: {
      de: '„Das Herz soll rein sein von jeder Art von Eigennutz, so dass die Liebe Gottes ungehindert darin wohnen kann.“',
      en: '"The heart must be pure from every kind of self-interest, so that the love of God may find room therein."'
    },
    source: {
      de: '‘Abdu’l-Bahá',
      en: '‘Abdu’l-Bahá'
    },
    book: {
      de: 'Brise der Bestätigung',
      en: 'Breezes of Confirmation'
    },
    coreQuestion: {
      de: 'Wann tun wir Gutes aus reiner Herzensfreude, und wann schleichen sich Erwartungen an Lob oder Anerkennung ein?',
      en: 'When do we act purely from genuine goodwill, and when do expectations of praise or social validation sneak in?'
    },
    deepeningQuestions: {
      de: [
        'Wie fühlt es sich an, etwas Gutes im Verborgenen zu tun, ohne dass jemand anderes davon erfährt?',
        'Was trübt den Spiegel unseres Herzens im Schul- und Alltagsstress?',
        'Wie können wir einander helfen, die Motive unserer Handlungen rein zu halten?'
      ],
      en: [
        'How does it feel to perform a kind act in total secrecy without anyone else knowing?',
        'What influences cloud the mirror of our hearts amid daily school noise and peer pressure?',
        'How can friends support each other in keeping their intentions clear and sincere?'
      ]
    },
    theme: {
      de: 'Reinheit des Herzens',
      en: 'Purity of Heart'
    }
  },
  {
    id: 'bestaetigungen-im-handeln',
    status: 'draft',
    title: {
      de: 'Bestätigungen beim ersten Schritt',
      en: 'Confirmations in Action'
    },
    quoteSnippet: {
      de: '„Gott bestätigt diejenigen, die sich erheben, um Ihm zu dienen.“',
      en: '"God will confirm those who arise to serve Him."'
    },
    source: {
      de: '‘Abdu’l-Bahá',
      en: '‘Abdu’l-Bahá'
    },
    book: {
      de: 'Brise der Bestätigung',
      en: 'Breezes of Confirmation'
    },
    coreQuestion: {
      de: 'Hast du erlebt, dass du vor einer Aufgabe Angst hattest, aber nach dem ersten mutigen Schritt unerwartete Hilfe kam?',
      en: 'Have you ever felt daunted by an obstacle, but once you took the first bold step, unexpected support appeared?'
    },
    deepeningQuestions: {
      de: [
        'Warum kommen geistige Bestätigungen meist erst NACH dem Aufstehen und selten beim bloßen Abwarten auf dem Sofa?',
        'Wie können wir in Momenten der Mutlosigkeit einander an diese Kraft erinnern?',
        'Welches Projekt oder Vorhaben trauen wir uns gerade noch nicht ganz zu?'
      ],
      en: [
        'Why do confirmations usually arrive after we step into the arena rather than while waiting on the sidelines?',
        'How can we remind one another of unseen strength when discouragement creeps in?',
        'What ambitious community endeavor feels just beyond our comfort zone right now?'
      ]
    },
    theme: {
      de: 'Bestätigung & Vertrauen',
      en: 'Confirmation & Trust'
    }
  },
  {
    id: 'wahrhaftigkeit-grundlage',
    status: 'draft',
    title: {
      de: 'Das Fundament aller Tugenden',
      en: 'The Bedrock of All Virtues'
    },
    quoteSnippet: {
      de: '„Wahrhaftigkeit ist die Grundlage aller menschlichen Tugenden.“',
      en: '"Truthfulness is the foundation of all human virtues."'
    },
    source: {
      de: '‘Abdu’l-Bahá',
      en: '‘Abdu’l-Bahá'
    },
    book: {
      de: 'Den geraden Pfad beschreiten',
      en: 'Walking the Straight Path'
    },
    coreQuestion: {
      de: 'Warum stürzt jedes geistige Gebäude ein, wenn die Wahrhaftigkeit als Fundament bröckelt?',
      en: 'Why does any social or moral structure crumble if truthfulness is compromised at the foundation?'
    },
    deepeningQuestions: {
      de: [
        'Welche kleinen, scheinbar harmlosen Unwahrheiten begegnen uns täglich, und wie untergraben sie das Vertrauen?',
        'Was erfordert mehr Mut: Die Wahrheit zu sagen, auch wenn sie unbequem ist, oder eine Ausrede zu erfinden?',
        'Wie verändert sich eine Gruppe, wenn alle wissen, dass jedes Wort ehrlich gemeint ist?'
      ],
      en: [
        'What subtle "white lies" do we encounter daily, and how do they gradually erode trust?',
        'Which requires deeper bravery: speaking truth with humility when inconvenient, or inventing an excuse?',
        'How does a community flourish when its members know with certainty that words are genuinely meant?'
      ]
    },
    theme: {
      de: 'Wahrhaftigkeit & Fundament',
      en: 'Truthfulness & Foundation'
    }
  },
  {
    id: 'gerechtigkeit-eigenes-urteil',
    status: 'draft',
    title: {
      de: 'Mit eigenen Augen sehen',
      en: 'Seeing with Thine Own Eyes'
    },
    quoteSnippet: {
      de: '„Das Beliebteste von allem ist Mir die Gerechtigkeit... Dadurch wirst du mit deinen eigenen Augen sehen und nicht mit den Augen anderer.“',
      en: '"The best beloved of all things in My sight is Justice... by it thou shalt see with thine own eyes and not through the eyes of others."'
    },
    source: {
      de: 'Bahá\'u\'lláh (Die Verborgenen Worte, Arabisch Nr. 2)',
      en: 'Bahá\'u\'lláh (The Hidden Words, Arabic #2)'
    },
    book: {
      de: 'Den geraden Pfad beschreiten',
      en: 'Walking the Straight Path'
    },
    coreQuestion: {
      de: 'Wie gelingt es dir, Situationen und Menschen mit deinen eigenen Augen zu betrachten statt Meinungen ungeprüft zu übernehmen?',
      en: 'How do you cultivate the discipline of seeing situations and people with your own eyes rather than adopting popular opinions?'
    },
    deepeningQuestions: {
      de: [
        'Wo fällt es uns im Alltag schwer, unvoreingenommen zu bleiben, weil Freunde oder Medien ein bestimmtes Bild vorgeben?',
        'Warum ist Gerechtigkeit für Bahá’u’lláh das „Beliebteste von allem“?',
        'Wie können wir jemandem beistehen, der ungerecht beurteilt oder ausgegrenzt wird?'
      ],
      en: [
        'Where do we struggle to maintain fair judgment when peers or online feeds project a biased narrative?',
        'Why is justice described as the "best beloved of all things"?',
        'How can we stand in solidarity with someone facing unfair prejudice or exclusion?'
      ]
    },
    theme: {
      de: 'Gerechtigkeit & Fairness',
      en: 'Justice & Fairness'
    }
  },
  {
    id: 'freundliches-wort-magnet',
    status: 'draft',
    title: {
      de: 'Das freundliche Wort als Magnet',
      en: 'The Kindly Word as a Magnet'
    },
    quoteSnippet: {
      de: '„Ein freundliches Wort ist wie ein Magnet für die Herzen der Menschen. Es ist das Brot des Geistes, es kleidet die Worte mit Bedeutung.“',
      en: '"A kindly tongue is the lodestone of the hearts of men. It is the bread of the spirit, it clotheth the words with meaning."'
    },
    source: {
      de: 'Bahá\'u\'lláh (Botschaften aus Akka)',
      en: 'Bahá\'u\'lláh (Tablets of Bahá\'u\'lláh)'
    },
    book: {
      de: 'Den geraden Pfad beschreiten',
      en: 'Walking the Straight Path'
    },
    coreQuestion: {
      de: 'Welche Worte haben dir in einer traurigen oder schwierigen Stunde neuen Mut geschenkt?',
      en: 'What encouraging words have revived your spirits during a lonely or challenging moment?'
    },
    deepeningQuestions: {
      de: [
        'Warum haben verletzende Worte oft eine so lange Nachwirkung – und wie können wir stattdessen heilsame Worte wählen?',
        'Wie können wir in Konflikten einen freundlichen und ruhigen Ton bewahren?',
        'Wem in unserer Nachbarschaft oder Schule könnten wir heute ein aufrichtiges freundliches Wort schenken?'
      ],
      en: [
        'Why do careless words linger so painfully, and how can we consciously offer healing speech instead?',
        'How do we keep a calm, gentle tone when tension arises?',
        'Who in our school or family circle needs a warm, sincere word of encouragement today?'
      ]
    },
    theme: {
      de: 'Sprache & Freundlichkeit',
      en: 'Kindly Speech'
    }
  },
  {
    id: 'schoepferische-kraft-wort-gottes',
    status: 'draft',
    title: {
      de: 'Das Wort als Lebenselixier',
      en: 'The Word as the Elixir of Life'
    },
    quoteSnippet: {
      de: '„Jedes Wort, das aus dem Munde Gottes hervorgeht, ist mit solcher Schöpferkraft begabt, dass es jedem menschlichen Leibe neues Leben einflößen kann.“',
      en: '"Every single word that proceedeth from the mouth of God is endowed with such potency as can instil new life into every human frame."'
    },
    source: {
      de: 'Bahá\'u\'lláh (Ährenlese)',
      en: 'Bahá\'u\'lláh (Gleanings)'
    },
    book: {
      de: 'Die Kraft des Wortes nutzen',
      en: 'Drawing on the Power of the Word'
    },
    coreQuestion: {
      de: 'Wie spürst du den Unterschied zwischen alltäglichem Gerede und Worten, die die Seele tief berühren und aufrichten?',
      en: 'How do you discern the difference between fleeting chatter and words that deeply touch and renew the soul?'
    },
    deepeningQuestions: {
      de: [
        'Welche Verse oder Gedanken begleiten dich durch schwere Tage wie ein innerer Anker?',
        'Warum ist das Auswendiglernen von geistigen Zitaten eine praktische Stütze für das Leben?',
        'Wie können wir in unserer Gruppe eine Atmosphäre schaffen, in der geistige Worte lebendig werden?'
      ],
      en: [
        'Which sacred passages serve as an inner anchor during turbulent times?',
        'Why does committing inspiring words to memory serve as a living compass for daily choices?',
        'How can our meetings cultivate an atmosphere where spiritual words truly come alive?'
      ]
    },
    theme: {
      de: 'Geistige Worte & Kraft',
      en: 'The Creative Word'
    }
  },
  {
    id: 'beratung-und-konsultation-kraft',
    status: 'draft',
    title: {
      de: 'Beratung als Leuchtstern',
      en: 'Consultation as a Guiding Star'
    },
    quoteSnippet: {
      de: '„Beratung verleiht größeres Bewusstsein und verwandelt Vermutung in Gewissheit. Sie ist ein strahlendes Licht, das auf dunklem Pfad leuchtet.“',
      en: '"Consultation bestoweth greater awareness and transmuteth conjecture into certitude. It is a shining light which, in a dark world, leadeth the way and guideth."'
    },
    source: {
      de: 'Bahá\'u\'lláh',
      en: 'Bahá\'u\'lláh'
    },
    book: {
      de: 'Die Kraft des Wortes nutzen',
      en: 'Drawing on the Power of the Word'
    },
    coreQuestion: {
      de: 'Was unterscheidet gemeinsame Beratung (Konsultation) von einer Diskussion, in der jeder nur Recht behalten will?',
      en: 'What distinguishes genuine consultation from an argument where each participant merely defends personal pride?'
    },
    deepeningQuestions: {
      de: [
        'Wie fühlt es sich an, eine eigene Idee in die Mitte zu legen, sodass sie der gesamten Gruppe gehört?',
        'Was tun wir, wenn jemand in der Gruppe eine völlig andere Meinung äußert als die Mehrheit?',
        'Wie können wir bei der Planung unseres nächsten Dienstprojekts diese Kultur der Beratung leben?'
      ],
      en: [
        'How does it feel to offer an idea freely so that it belongs to the whole circle rather than yourself?',
        'How do we respond with respect when someone offers a perspective that challenges the majority?',
        'How can our youth group apply consultation principles when planning our next community initiative?'
      ]
    },
    theme: {
      de: 'Beratung & Einheit',
      en: 'Consultation & Unity'
    }
  },
  {
    id: 'bergwerk-edelsteine-bildung',
    status: 'draft',
    title: {
      de: 'Der Mensch als edles Bergwerk',
      en: 'A Mine Rich in Gems'
    },
    quoteSnippet: {
      de: '„Betrachtet den Menschen als ein Bergwerk, reich an Edelsteinen von unschätzbarem Wert. Nur die Erziehung kann bewirken, dass es seine Schätze enthüllt und die Menschheit daraus Nutzen zu ziehen vermag.“',
      en: '"Regard man as a mine rich in gems of inestimable value. Education can, alone, cause it to reveal its treasures, and enable mankind to benefit therefrom."'
    },
    source: {
      de: 'Bahá\'u\'lláh (Botschaften aus Akka, Lawh-i-Maqsúd)',
      en: 'Bahá\'u\'lláh (Tablets of Bahá\'u\'lláh, Lawh-i-Maqsúd)'
    },
    book: {
      de: 'Nach Vortrefflichkeit streben',
      en: 'Learning About Excellence'
    },
    coreQuestion: {
      de: 'Welche verborgenen Edelsteine (Tugenden, Begabungen, Einsichten) nimmst du in deinen Freunden wahr?',
      en: 'What hidden gems of character, talent, and insight do you recognize in the companions sitting beside you?'
    },
    deepeningQuestions: {
      de: [
        'Warum sehen wir bei manchen Menschen zuerst den „Schmutz des Gesteins“ statt die Edelsteine im Inneren?',
        'Welche Art von Erziehung und Begleitung hilft uns, unsere eigenen verborgenen Schätze freizulegen?',
        'Wie können wir einander ermutigen, diese Gaben nicht für Hochmut, sondern zum Nutzen aller einzusetzen?'
      ],
      en: [
        'Why are people often quick to notice rough exterior faults rather than the priceless gems beneath?',
        'What kind of patient education helps each person uncover their latent capacity?',
        'How can we celebrate our distinct gifts without slipping into rivalry or arrogance?'
      ]
    },
    theme: {
      de: 'Potenziale & Edelsteine',
      en: 'Human Nobility'
    }
  },
  {
    id: 'jeder-tag-besser-als-vorige',
    status: 'draft',
    title: {
      de: 'Jeden Tag besser als den vorigen',
      en: 'Each Day Better Than the Last'
    },
    quoteSnippet: {
      de: '„Lasst jeden Tag besser sein als den vorherigen und jeden Morgen reicher als den gestrigen Abend.“',
      en: '"Let each day be better than the one that came before, and each morning richer than the previous eve."'
    },
    source: {
      de: 'Bahá\'u\'lláh',
      en: 'Bahá\'u\'lláh'
    },
    book: {
      de: 'Nach Vortrefflichkeit streben',
      en: 'Learning About Excellence'
    },
    coreQuestion: {
      de: 'Was bedeutet stetiges geistiges Wachstum im Alltag, ohne in ungesunden Leistungsdruck oder Perfektionismus zu verfallen?',
      en: 'What does steady moral progress look like in daily life without succumbing to unhealthy perfectionism?'
    },
    deepeningQuestions: {
      de: [
        'Wie unterscheidet sich der Wunsch, heute besser zu sein als gestern, von dem Druck, besser sein zu müssen als andere?',
        'Welche kleinen täglichen Gewohnheiten helfen dir, innerlich ruhig und zielgerichtet zu bleiben?',
        'Wie gehen wir liebevoll mit eigenen Fehlern um, sodass sie zu Lernchancen werden?'
      ],
      en: [
        'How does striving to be better than yesterday differ from competing to outshine others?',
        'What small daily reflection habits keep your heart centered and purposeful?',
        'How do we treat our own mistakes with gentle honesty so they become stepping stones?'
      ]
    },
    theme: {
      de: 'Wachstum & Vortrefflichkeit',
      en: 'Excellence & Growth'
    }
  },
  {
    id: 'seele-himmlische-gemme',
    status: 'draft',
    title: {
      de: 'Die Seele als Zeichen Gottes',
      en: 'The Soul as a Sign of God'
    },
    quoteSnippet: {
      de: '„Wisse wahrlich, dass die Seele ein Zeichen Gottes ist, eine himmlische Gemme, deren Wirklichkeit die gelehrtesten Menschen nicht erfassen können.“',
      en: '"Thou hast asked Me concerning the nature of the soul. Know, verily, that the soul is a sign of God, a heavenly gem whose reality the most learned of men hath failed to grasp."'
    },
    source: {
      de: 'Bahá\'u\'lláh (Ährenlese)',
      en: 'Bahá\'u\'lláh (Gleanings)'
    },
    book: {
      de: 'Geist des Glaubens',
      en: 'Spirit of Faith'
    },
    coreQuestion: {
      de: 'Wer bist du in deinem tiefsten Kern, wenn du Körper, Kleidung, Noten und Social-Media-Profile für einen Moment ausblendest?',
      en: 'Who are you in your innermost reality when you set aside physical appearance, test scores, and social profiles?'
    },
    deepeningQuestions: {
      de: [
        'Wie verändert das Wissen um die ewige Natur der Seele den Blick auf alltägliche Sorgen und Krisen?',
        'Was nährt die Seele im Alltag (Stille, Gebet, Musik, Dienen) – und was hungert sie aus?',
        'Wie können wir einander so begegnen, dass wir die Seele des anderen ansprechen?'
      ],
      en: [
        'How does understanding the timeless reality of the soul reshape our perspective on short-term troubles?',
        'What truly feeds our spiritual capacity (quiet prayer, art, selfless service), and what starves it?',
        'How can companions interact so as to acknowledge the sacred soul within each person?'
      ]
    },
    theme: {
      de: 'Die Natur der Seele',
      en: 'Nature of the Soul'
    }
  },
  {
    id: 'hoffnung-in-pruefungen-sturm',
    status: 'draft',
    title: {
      de: 'Hoffnungsschimmer im Sturm',
      en: 'A Glimmer of Hope Amid Storms'
    },
    quoteSnippet: {
      de: '„Seid nicht bekümmert ob der Prüfungen und Heimsuchungen, denn sie sind das Feuer, das das reine Gold von der Schlacke trennt.“',
      en: '"Grieve not over tests and trials; for they are like unto the fire that purgeth pure gold from dross."'
    },
    source: {
      de: '‘Abdu’l-Bahá',
      en: '‘Abdu’l-Bahá'
    },
    book: {
      de: 'Hoffnungsschimmer',
      en: 'Glimmerings of Hope'
    },
    coreQuestion: {
      de: 'Welche schwere Phase in deinem Leben hat dich im Nachhinein stärker, mitfühlender oder weiser gemacht?',
      en: 'What challenging experience in your past has ultimately deepened your empathy, resilience, or insight?'
    },
    deepeningQuestions: {
      de: [
        'Warum fällt es uns mitten im Schmerz oft schwer zu glauben, dass daraus etwas Gutes entstehen kann?',
        'Was gibt dir in dunklen Momenten Hoffnung, dass das Licht wiederkehrt?',
        'Wie können wir als Freunde da sein, wenn jemand in unserer Gruppe eine schwere Zeit durchmacht?'
      ],
      en: [
        'Why is it difficult in the midst of adversity to perceive that strength is being forged?',
        'What anchors your hope when circumstances seem overwhelmingly bleak?',
        'How can our youth circle stand faithfully alongside a friend navigating deep hardship?'
      ]
    },
    theme: {
      de: 'Hoffnung & Widerstandskraft',
      en: 'Hope & Resilience'
    }
  },
  {
    id: 'edel-erschuf-ich-dich',
    status: 'draft',
    title: {
      de: 'Die angeborene Würde des Menschen',
      en: 'Inherent Nobility'
    },
    quoteSnippet: {
      de: '„O Sohn des Geistes! Edel erschuf Ich dich; wie kannst du dich erniedrigen? Erhebe dich zu dem, wozu du erschaffen bist.“',
      en: '"O Son of Spirit! Noble have I created thee, yet thou hast abased thyself. Rise up then unto that whereunto thou wast created."'
    },
    source: {
      de: 'Bahá\'u\'lláh (Die Verborgenen Worte, Arabisch Nr. 22)',
      en: 'Bahá\'u\'lláh (The Hidden Words, Arabic #22)'
    },
    book: {
      de: 'Juniorjugendprogramm',
      en: 'Junior Youth Programme'
    },
    coreQuestion: {
      de: 'Wo spürst du den Ruf, dich edel und wahrhaftig zu verhalten, wenn dein Umfeld dich zu etwas Kleinem verleiten will?',
      en: 'Where do you feel the summons to act with nobility when cultural habits tempt you to settle for petty, degrading behavior?'
    },
    deepeningQuestions: {
      de: [
        'Was bedeutet es ganz praktisch im Schulalltag, sich „edel“ zu verhalten, ohne arrogant zu wirken?',
        'Welche Reize und Medien versuchen uns einzureden, wir seien nur oberflächliche Konsumenten?',
        'Wie können wir uns gegenseitig an unsere angeborene geistige Würde erinnern?'
      ],
      en: [
        'What does practicing true nobility look like in school hallways without appearing haughty?',
        'What modern commercial messages try to reduce us to mere materialistic consumers?',
        'How can we hold up a clean mirror to one another to reflect our shared spiritual dignity?'
      ]
    },
    theme: {
      de: 'Würde & Edelmut',
      en: 'Inherent Nobility'
    }
  },
  {
    id: 'taten-statt-worte',
    title: {
      de: 'Taten statt Worte',
      en: 'Deeds Not Words'
    },
    quoteSnippet: {
      de: '„Lasst Taten, nicht Worte euer Schmuck sein.“',
      en: '"Let deeds, not words, be your adorning."'
    },
    source: {
      de: 'Bahá\'u\'lláh (Verborgene Worte, Persisch 5)',
      en: 'Bahá\'u\'lláh (The Hidden Words, Persian 5)'
    },
    book: {
      de: 'Hoffnungsvolle Funken',
      en: 'Drawing on the Power of the Word'
    },
    coreQuestion: {
      de: 'Wie können wir dafür sorgen, dass unsere guten Absichten nicht bloß Worte bleiben, sondern zu greifbaren Taten werden?',
      en: 'How can we ensure our noble intentions do not remain mere words, but translate into tangible actions?'
    },
    deepeningQuestions: {
      de: [
        'Wo fällt es uns leicht, große Versprechen zu machen, und wo wird es schwer, sie verlässlich einzuhalten?',
        'Welche Wirkung hat ein Mensch auf dich, der leise bleibt, aber verlässlich handelt?',
        'Welche kleine konkrete Tat kannst du diese Woche für jemanden tun, ohne vorher darüber zu sprechen?'
      ],
      en: [
        'Where is it easy to make broad promises, and where does it become challenging to reliably follow through?',
        'What impact does a person have on you who speaks quietly, but consistently demonstrates reliability?',
        'What small, concrete act of service can you perform this week without talking about it beforehand?'
      ]
    },
    theme: {
      de: 'Wahrhaftigkeit & Tatkraft',
      en: 'Integrity & Deeds'
    },
    status: 'draft'
  },
  {
    id: 'zwei-fluegel-vogel',
    title: {
      de: 'Die zwei Schwingen',
      en: 'The Two Wings'
    },
    quoteSnippet: {
      de: '„Die Menschheit ist wie ein Vogel mit zwei Schwingen: die eine ist die Frau, die andere der Mann. Erst wenn beide Schwingen gleich stark sind, kann der Vogel in die Lüfte aufsteigen.“',
      en: '"The world of humanity has two wings—one is women and the other men. Not until both wings are equally developed can the bird fly."'
    },
    source: {
      de: '‘Abdu’l-Bahá (Ansprachen in Paris)',
      en: '‘Abdu’l-Bahá (Paris Talks)'
    },
    book: {
      de: 'Den geraden Pfad gehen',
      en: 'Walking the Straight Path'
    },
    coreQuestion: {
      de: 'Wie verändert sich eine Gemeinschaft, wenn Mädchen und Jungen ihre Gaben gleichberechtigt und auf Augenhöhe einbringen?',
      en: 'How does a community flourish when girls and boys contribute their unique capacities with equal honor and standing?'
    },
    deepeningQuestions: {
      de: [
        'Wo begegnen dir im Alltag noch veraltete Vorurteile über Rollen von Mädchen oder Jungen?',
        'Wie können wir in unserer Gruppe Vorbild dafür sein, dass jede Stimme gleichermaßen Gewicht hat?',
        'Warum leidet die gesamte Gesellschaft, wenn ein Teil an seiner freien Entfaltung gehindert wird?'
      ],
      en: [
        'Where in everyday culture do you still encounter outdated assumptions about expectations for girls or boys?',
        'How can our group set an example where every perspective is heard with equal dignity?',
        'Why does society as a whole suffer whenever one portion is held back from reaching its full potential?'
      ]
    },
    theme: {
      de: 'Gleichwertigkeit & Gerechtigkeit',
      en: 'Equality & Justice'
    },
    status: 'draft'
  },
  {
    id: 'gedanke-des-friedens',
    title: {
      de: 'Gedanken des Friedens',
      en: 'Thoughts of Peace'
    },
    quoteSnippet: {
      de: '„Wenn der Gedanke des Krieges kommt, setzt ihm den Gedanken des Friedens entgegen, der stärker ist. Der Gedanke des Hasses muss durch den Gedanken der Liebe überwunden werden.“',
      en: '"When a thought of war comes, oppose it by a stronger thought of peace. A thought of hatred must be destroyed by a more powerful thought of love."'
    },
    source: {
      de: '‘Abdu’l-Bahá (Ansprachen in Paris)',
      en: '‘Abdu’l-Bahá (Paris Talks)'
    },
    book: {
      de: 'Hoffnungsvolle Funken',
      en: 'Drawing on the Power of the Word'
    },
    coreQuestion: {
      de: 'Wie schaffen wir es, aufkeimenden Streit oder Ärger im Kopf zu stoppen, bevor er zu verletzenden Worten wird?',
      en: 'How can we catch brewing resentment in our minds before it hardens into hurtful words or actions?'
    },
    deepeningQuestions: {
      de: [
        'Was passiert in einem Konflikt, wenn eine Seite bewusst mit Freundlichkeit statt Gegenangriff reagiert?',
        'Wie können wir lernen, unsere eigenen Gedanken achtsam wahrzunehmen und zu steuern?',
        'Welche Friedensgedanken können wir in unserem Viertel ganz praktisch säen?'
      ],
      en: [
        'What happens in a tense dispute when one person consciously responds with calm kindness instead of retaliation?',
        'How can we train ourselves to notice our inner dialogue and steer our thoughts with intention?',
        'What practical seeds of peace can we plant within our own families and neighborhood?'
      ]
    },
    theme: {
      de: 'Frieden & Gedankenkraft',
      en: 'Peace & Mindful Thought'
    },
    status: 'draft'
  },
  {
    id: 'baeume-und-fruechte',
    title: {
      de: 'Fruchtbare Bäume',
      en: 'Fruitful Trees'
    },
    quoteSnippet: {
      de: '„Der Mensch ist gleich einem Baum. Seine Früchte sind seine edlen Eigenschaften, seine lobenswerten Taten und sein aufrichtiger Dienst.“',
      en: '"Man is like unto a tree. Its fruits are noble character, praiseworthy deeds, and sincere service."'
    },
    source: {
      de: 'Bahá\'u\'lláh (Tafeln von Bahá\'u\'lláh, Kalimát-i-Firdawsíyyih)',
      en: 'Bahá\'u\'lláh (Tablets of Bahá\'u\'lláh, Words of Paradise)'
    },
    book: {
      de: 'Brisen der Bestätigung',
      en: 'Breezes of Confirmation'
    },
    coreQuestion: {
      de: 'Welche inneren Nährstoffe braucht ein Mensch, um heranzuwachsen und gute Früchte für andere tragen zu können?',
      en: 'What inner nourishment does an individual need in order to grow deeply rooted and bear generous fruit for others?'
    },
    deepeningQuestions: {
      de: [
        'Was unterscheidet einen Baum, der nur Blätter trägt, von einem, der Schatten spendet und nährt?',
        'Welche Menschen in deinem Umfeld sind für dich Vorbilder eines fruchtbaren Lebens?',
        'Welche Frucht möchtest du in den nächsten Monaten in deinem eigenen Charakter pflegen?'
      ],
      en: [
        'What distinguishes a tree that only produces foliage from one that offers nourishing fruit and sheltering shade?',
        'Who in your life exemplifies a fruitful, generous presence that uplifts those around them?',
        'Which quality of character do you wish to cultivate intentionally in your own life over the coming months?'
      ]
    },
    theme: {
      de: 'Wachstum & Taten',
      en: 'Growth & Fruitfulness'
    },
    status: 'draft'
  },
  {
    id: 'fehler-verzeihen',
    title: {
      de: 'Das Auge des Verzeihens',
      en: 'The Eye of Forgiveness'
    },
    quoteSnippet: {
      de: '„Verschließt eure Augen vor den Fehlern anderer und blickt mit dem Auge der Nachsicht und des Verständnisses.“',
      en: '"Breathe not the sins of others so long as thou art thyself a sinner. Look with the eye of forgiveness upon the shortcomings of your fellows."'
    },
    source: {
      de: 'Bahá\'u\'lláh (Verborgene Worte, Persisch 26)',
      en: 'Bahá\'u\'lláh (The Hidden Words, Persian 26)'
    },
    book: {
      de: 'Den geraden Pfad gehen',
      en: 'Walking the Straight Path'
    },
    coreQuestion: {
      de: 'Warum fällt es uns oft so leicht, Fehler bei anderen zu entdecken, und wie können wir unseren Blick auf das Gute richten?',
      en: 'Why is it often tempting to fixate on the faults of others, and how can we train our eyes to search for the good?'
    },
    deepeningQuestions: {
      de: [
        'Wie fühlst du dich, wenn dir jemand nach einem Fehler eine zweite Chance gibt, ohne nachtragend zu sein?',
        'Was passiert mit der Atmosphäre einer Gruppe, wenn hinter dem Rücken über Fehler geredet wird?',
        'Wie können wir einander helfen, Schwächen zu überwinden, ohne einander zu verurteilen?'
      ],
      en: [
        'How does it feel when someone extends a sincere second chance without holding lingering grudges?',
        'How does the trust in a group erode when small shortcomings are amplified behind each other\'s backs?',
        'How can we support one another in outgrowing faults with genuine warmth rather than condemnation?'
      ]
    },
    theme: {
      de: 'Nachsicht & Vergebung',
      en: 'Forgiveness & Seeing Good'
    },
    status: 'draft'
  },
  {
    id: 'freude-fluegel',
    title: {
      de: 'Freude verleiht Flügel',
      en: 'Joy Gives Wings'
    },
    quoteSnippet: {
      de: '„Freude verleiht uns Flügel! Wenn wir fröhlich sind, ist unsere Kraft lebendiger, unser Verstand wacher und unsere Einsicht klarer.“',
      en: '"Joy gives us wings! In times of joy our strength is more vital, our intellect keener, and our understanding less clouded."'
    },
    source: {
      de: '‘Abdu’l-Bahá (Ansprachen in Paris)',
      en: '‘Abdu’l-Bahá (Paris Talks)'
    },
    book: {
      de: 'Der Quell der Freude',
      en: 'Wellspring of Joy'
    },
    coreQuestion: {
      de: 'Wie unterscheidet sich tiefe, geistige Freude von bloßer oberflächlicher Unterhaltung oder Ablenkung?',
      en: 'How does genuine inner joy differ from fleeting entertainment or passive distraction?'
    },
    deepeningQuestions: {
      de: [
        'In welchen Momenten hast du schon einmal gespürt, dass Freude dir neue Energie für schwere Aufgaben geschenkt hat?',
        'Wie können wir in unserer Gruppe eine Fröhlichkeit leben, die niemanden ausschließt oder auf Kosten anderer lacht?',
        'Was hilft dir persönlich an Tagen, an denen die Stimmung trüb ist, wieder Licht zu sehen?'
      ],
      en: [
        'When have you experienced joyful enthusiasm giving you renewed energy to tackle a demanding task?',
        'How can we cultivate a warm sense of fun that includes everyone and never laughs at another\'s expense?',
        'What helps you reconnect with hope and inner light on days when things feel heavy?'
      ]
    },
    theme: {
      de: 'Freude & Hoffnung',
      en: 'Joy & Inner Light'
    },
    status: 'draft'
  },
  {
    id: 'geschenk-des-verstandes',
    title: {
      de: 'Die Gabe des Verstandes',
      en: 'The Gift of Intellect'
    },
    quoteSnippet: {
      de: '„Der Verstand ist die höchste Gabe und der größte Segen, den die göttliche Schöpferkraft dem Menschen verliehen hat.“',
      en: '"The intellect is the most precious gift bestowed by the Divine Creator upon humankind."'
    },
    source: {
      de: '‘Abdu’l-Bahá (Das Geheimnis der göttlichen Kultur)',
      en: '‘Abdu’l-Bahá (The Secret of Divine Civilization)'
    },
    book: {
      de: 'Denkende Geister',
      en: 'Thinking Minds'
    },
    coreQuestion: {
      de: 'Wofür tragen wir Verantwortung, wenn wir die Fähigkeit besitzen, selbstständig und kritisch nachzudenken?',
      en: 'What responsibility comes with the capacity to think independently and seek truth with our own minds?'
    },
    deepeningQuestions: {
      de: [
        'Warum ist es gefährlich, unüberlegt Meinungen anderer zu übernehmen, ohne sie selbst zu prüfen?',
        'Wie können wir unseren Verstand schärfen wie ein Werkzeug, das der Gemeinschaft dient?',
        'Wo ergänzen sich wissenschaftliche Erkenntnis und geistige Werte im täglichen Leben?'
      ],
      en: [
        'Why is it risky to absorb popular opinions without examining whether they align with truth and justice?',
        'How can we refine our minds like well-tuned instruments dedicated to the service of others?',
        'Where do reasoned insight and spiritual values reinforce each other in everyday decision-making?'
      ]
    },
    theme: {
      de: 'Erkenntnis & Vernunft',
      en: 'Intellect & Perception'
    },
    status: 'draft'
  },
  {
    id: 'ehrfurcht-vor-der-natur',
    title: {
      de: 'Im Spiegel der Natur',
      en: 'The Mirror of Nature'
    },
    quoteSnippet: {
      de: '„Die Natur in ihrer Wesenheit ist die Verkörperung des göttlichen Willens in und durch die geschaffene Welt.“',
      en: '"Nature in its essence is the embodiment of the divine Will in and through the world of being."'
    },
    source: {
      de: 'Bahá\'u\'lláh (Tafeln von Bahá\'u\'lláh, Lawh-i-Hikmat)',
      en: 'Bahá\'u\'lláh (Tablets of Bahá\'u\'lláh, Tablet of Wisdom)'
    },
    book: {
      de: 'Gewohnheiten eines geordneten Verstandes',
      en: 'Observation and Insight'
    },
    coreQuestion: {
      de: 'Was lehrt uns der aufmerksame Blick in die Natur über Harmonie, Vielfalt und gegenseitige Abhängigkeit?',
      en: 'What does attentive observation of nature teach us about harmony, interdependence, and care?'
    },
    deepeningQuestions: {
      de: [
        'Welche Pflicht haben wir Menschen gegenüber Pflanzen, Tieren und den Ressourcen unseres Planeten?',
        'Wann warst du das letzte Mal ganz still in der Natur, und was hast du dabei empfunden?',
        'Welches konkrete Umwelt- oder Pflegeprojekt können wir in unserem Stadtteil anpacken?'
      ],
      en: [
        'What moral duty do we bear toward the living ecosystems and resources entrusted to our generation?',
        'When were you last completely still outdoors, and what inner stillness did that bring?',
        'What hands-on ecological care project could our group undertake in our immediate surroundings?'
      ]
    },
    theme: {
      de: 'Natur & Schöpfung',
      en: 'Nature & Stewardship'
    },
    status: 'draft'
  },
  {
    id: 'reines-strahlendes-herz',
    title: {
      de: 'Das strahlende Herz',
      en: 'The Radiant Heart'
    },
    quoteSnippet: {
      de: '„Besitze ein reines, gütiges und strahlendes Herz, auf dass dir eine Herrschaft zuteilwerde, die ewig ist und unvergänglich.“',
      en: '"Possess a pure, kindly and radiant heart, that thine may be a sovereignty ancient, imperishable and everlasting."'
    },
    source: {
      de: 'Bahá\'u\'lláh (Verborgene Worte, Arabisch 1)',
      en: 'Bahá\'u\'lláh (The Hidden Words, Arabic 1)'
    },
    book: {
      de: 'Ein edles Erbe',
      en: 'A Noble Heritage'
    },
    coreQuestion: {
      de: 'Was bedeutet es für dich ganz praktisch im Umgang mit Freunden, ein „reines und gütiges Herz“ zu bewahren?',
      en: 'What does it look like in real relationships to maintain a pure, compassionate, and transparent heart?'
    },
    deepeningQuestions: {
      de: [
        'Was trübt unser Herz im Alltag – und wie können wir es wieder rein und frei machen?',
        'Warum ist Güte niemals ein Zeichen von Schwäche, sondern die größte innere Stärke?',
        'Wie strahlt ein Mensch aus, der ohne Hintergedanken und Eitelkeit anderen begegnet?'
      ],
      en: [
        'What habits cloud our inner clarity, and how can we keep our intentions sincere and untainted?',
        'Why is genuine kindness never a weakness, but a sign of quiet inner fortitude?',
        'What atmosphere surrounds someone who approaches others without pretense or selfish motives?'
      ]
    },
    theme: {
      de: 'Aufrichtigkeit & Herz',
      en: 'Purity & Sincerity'
    },
    status: 'draft'
  },
  {
    id: 'worte-schoepferkraft',
    title: {
      de: 'Die schöpferische Kraft der Rede',
      en: 'The Potency of Speech'
    },
    quoteSnippet: {
      de: '„Ein jedes Wort, das aus dem Munde hervorgeht, hat seinen Atem und wirkt seine Wirkung.“',
      en: '"Every word that proceedeth from the mouth of God is endowed with such potency as can instill new life into every human frame."'
    },
    source: {
      de: 'Bahá\'u\'lláh (Botschaften aus Akka, Lawh-i-Maqsúd)',
      en: 'Bahá\'u\'lláh (Tablets of Bahá\'u\'lláh, Tablet of Maqsúd)'
    },
    book: {
      de: 'Hoffnungsvolle Funken',
      en: 'Drawing on the Power of the Word'
    },
    coreQuestion: {
      de: 'Wie können wir unsere Sprache als heilendes, aufbauendes Werkzeug statt als Waffe nutzen?',
      en: 'How can we harness our words as instruments of healing and encouragement rather than harm?'
    },
    deepeningQuestions: {
      de: [
        'Welche Worte von anderen haben dich in deinem Leben am tiefsten ermutigt oder geprägt?',
        'Wie schnell ist ein unbedachtes Wort im Chat geschrieben, und welche Spuren hinterlässt es?',
        'Wie können wir uns angewöhnen, vor dem Sprechen kurz innezuhalten und den Wert unserer Worte zu prüfen?'
      ],
      en: [
        'Which words spoken by someone else have given you the deepest confidence or guidance in life?',
        'How quickly is a careless remark sent in a group chat, and what hidden ripples does it leave?',
        'How can we build the habit of pausing before speaking to reflect on the uplifting power of our words?'
      ]
    },
    theme: {
      de: 'Worte & Verantwortung',
      en: 'The Power of Speech'
    },
    status: 'draft'
  },
  {
    id: 'hinter-dem-ruecken',
    title: {
      de: 'Vertrauen schützen',
      en: 'Shielding Trust'
    },
    quoteSnippet: {
      de: '„Üble Nachrede löscht das Leuchten des Herzens aus und erstickt das Leben der Seele.“',
      en: '"Backbiting quencheth the light of the heart, and extinguisheth the life of the soul."'
    },
    source: {
      de: 'Bahá\'u\'lláh (Tafeln von Bahá\'u\'lláh)',
      en: 'Bahá\'u\'lláh (Tablets of Bahá\'u\'lláh)'
    },
    book: {
      de: 'Den geraden Pfad gehen',
      en: 'Walking the Straight Path'
    },
    coreQuestion: {
      de: 'Warum zersetzt Lästern das Vertrauen in einer Gruppe – selbst bei denen, die nur stumm zuhören?',
      en: 'Why does gossip erode mutual trust within a group, even among those who only listen quietly?'
    },
    deepeningQuestions: {
      de: [
        'Was kannst du konkret sagen oder tun, wenn jemand in deiner Anwesenheit anfängt, über Abwesende herzuziehen?',
        'Warum reden Menschen manchmal schlecht über andere – und was suchen sie eigentlich dabei?',
        'Wie fühlt sich ein Raum an, in dem du absolut sicher weißt, dass niemand hinter deinem Rücken lästert?'
      ],
      en: [
        'What can you gently say or do when conversation shifts toward criticizing someone who isn\'t present?',
        'Why do people sometimes default to gossip, and what insecurity are they often trying to soothe?',
        'How liberating does it feel to belong to a space where you know your dignity is safeguarded when you leave?'
      ]
    },
    theme: {
      de: 'Würde & Vertrauen',
      en: 'Trust & Backbiting'
    },
    status: 'draft'
  },
  {
    id: 'vortrefflichkeit-charakter',
    title: {
      de: 'Der höchste Grad an Reife',
      en: 'The Highest Degree of Maturity'
    },
    quoteSnippet: {
      de: '„Bemüht euch mit ganzem Herzen, damit ihr euch durch eure Lebensführung und euren Charakter von anderen abhebt.“',
      en: '"Exert yourselves that ye may become the signs of unity and the banners of harmony amongst humanity."'
    },
    source: {
      de: '‘Abdu’l-Bahá (Briefe und Botschaften)',
      en: '‘Abdu’l-Bahá (Selections from the Writings of \'Abdu\'l-Bahá)'
    },
    book: {
      de: 'Überlegungen und Handeln',
      en: 'Learning About Excellence'
    },
    coreQuestion: {
      de: 'Was bedeutet wahre Vortrefflichkeit im Gegensatz zu bloßem Leistungsdruck oder egoistischem Ehrgeiz?',
      en: 'What is the difference between genuine moral excellence and stressful, competitive ambition?'
    },
    deepeningQuestions: {
      de: [
        'In welchen Situationen verlangt es echten Mut, seinen Prinzipien treu zu bleiben, auch wenn alle anderen mit dem Strom schwimmen?',
        'Wie können wir uns gegenseitig anfeuern, ohne in ungesunde Konkurrenz zu verfallen?',
        'Welche Gewohnheit hat dir geholfen, beständiger und gewissenhafter zu werden?'
      ],
      en: [
        'When does it require true bravery to stand by your ethical convictions when peers go with the crowd?',
        'How can we cheer each other on toward growth without falling into petty comparison or jealousy?',
        'Which personal routine has helped you develop consistency, discipline, and quiet maturity?'
      ]
    },
    theme: {
      de: 'Wachstum & Reife',
      en: 'Excellence of Character'
    },
    status: 'draft'
  },
  {
    id: 'ubuntu-wir-sind',
    title: {
      de: 'Ubuntu: Ich bin, weil wir sind',
      en: 'Ubuntu: I Am Because We Are'
    },
    quoteSnippet: {
      de: '„Umuntu ngumuntu ngabantu – Ein Mensch ist ein Mensch durch andere Menschen.“',
      en: '"Umuntu ngumuntu ngabantu—A person is a person through other persons."'
    },
    source: {
      de: 'Südafrikanische Philosophie (Ubuntu)',
      en: 'Southern African Philosophy (Ubuntu)'
    },
    coreQuestion: {
      de: 'Wie sind mein eigenes Wohlbefinden und das Glück meiner Mitmenschen untrennbar miteinander verwoben?',
      en: 'How is my personal flourishing inextricably intertwined with the dignity and well-being of those around me?'
    },
    deepeningQuestions: {
      de: [
        'Wo im Alltag verhalten wir uns manchmal so, als wären wir voneinander unabhängige Einzelkämpfer?',
        'Was gewinnt eine Gruppe, wenn der Erfolg eines Einzelnen als Freude für alle gefeiert wird?',
        'Wie können wir diesen Geist des Ubuntu in unserer Schule oder Nachbarschaft lebendig machen?'
      ],
      en: [
        'Where in modern life do we slip into acting like isolated islands rather than connected threads?',
        'What happens to a group\'s spirit when the breakthrough of one member is shared as a victory for everyone?',
        'How can we embody the spirit of Ubuntu in our school hallways, team sports, and neighborhood?'
      ]
    },
    theme: {
      de: 'Gemeinschaft & Verbundenheit',
      en: 'Interconnectedness & Community'
    },
    status: 'draft'
  },
  {
    id: 'viele-kleine-leute',
    title: {
      de: 'Viele kleine Schritte',
      en: 'Many Small Steps'
    },
    quoteSnippet: {
      de: '„Wenn viele kleine Leute an vielen kleinen Orten viele kleine Schritte tun, können sie das Gesicht der Welt verändern.“',
      en: '"When many humble people in many small places take many modest steps, they can transform the face of the earth."'
    },
    source: {
      de: 'Afrikanisches Sprichwort',
      en: 'African Proverb'
    },
    coreQuestion: {
      de: 'Warum unterschätzen wir oft die gewaltige Kraft kleiner, beharrlicher Taten für unsere Umgebung?',
      en: 'Why do we so often underestimate the quiet, compound power of small, consistent actions for our neighborhood?'
    },
    deepeningQuestions: {
      de: [
        'Welche kleine Veränderung in deiner Nachbarschaft hat einmal ganz unscheinbar begonnen?',
        'Was hält Menschen oft davon ab, mit einem Dienstprojekt anzufangen, und wie überwinden wir diese Hürde?',
        'Welchen konkreten kleinen Schritt können wir als Juniorjugendgruppe heute gemeinsam beschließen?'
      ],
      en: [
        'What meaningful improvement in your community started with just one or two individuals taking action?',
        'What causes hesitation when initiating a service idea, and how do we overcome that initial reluctance?',
        'What small, practical initiative can our group resolve to carry out together this coming month?'
      ]
    },
    theme: {
      de: 'Initiative & Weltveränderung',
      en: 'Collective Agency & Hope'
    },
    status: 'draft'
  },
  {
    id: 'zwei-ohren-ein-mund',
    title: {
      de: 'Zwei Ohren, ein Mund',
      en: 'Two Ears, One Tongue'
    },
    quoteSnippet: {
      de: '„Die Natur hat uns zwei Ohren, aber nur einen Mund gegeben, damit wir doppelt so viel zuhören wie reden.“',
      en: '"Nature gave us two ears but only one tongue, so that we may listen twice as much as we speak."'
    },
    source: {
      de: 'Epiktet (Stoizismus)',
      en: 'Epictetus (Stoic Wisdom)'
    },
    coreQuestion: {
      de: 'Was bedeutet es, jemandem wirklich mit offenem Herzen zuzuhören, anstatt nur auf die eigene Redepause zu warten?',
      en: 'What does it truly mean to listen with a receptive heart rather than just waiting for our turn to speak?'
    },
    deepeningQuestions: {
      de: [
        'Wann hast du dich das letzte Mal von jemandem bedingungslos und ohne Unterbrechung verstanden gefühlt?',
        'Welche Fragen im Gespräch helfen, tiefer zu verstehen, statt vorschnell Ratschläge zu verteilen?',
        'Wie können wir in unserer Runde sicherstellen, dass auch die Leisen und Schüchternen Raum bekommen?'
      ],
      en: [
        'When did you last feel genuinely heard without being rushed, judged, or interrupted?',
        'Which thoughtful questions invite deeper exploration rather than hasty advice?',
        'How can our circle ensure that quieter voices find ample warmth and space to contribute?'
      ]
    },
    theme: {
      de: 'Zuhören & Empathie',
      en: 'Mindful Listening & Humility'
    },
    status: 'draft'
  },
  {
    id: 'kintsugi-goldene-narben',
    title: {
      de: 'Kintsugi: Aus Scherben wächst Stärke',
      en: 'Kintsugi: Golden Strength from Broken Pieces'
    },
    quoteSnippet: {
      de: '„Wenn eine Schale zerbricht, wird sie mit Goldlack gefügt. Die Risse werden nicht versteckt, sondern erzählen von Reife und Beständigkeit.“',
      en: '"When a bowl is broken, Japanese master craftspeople mend it with gold. The scars are not hidden, but celebrated as marks of resilience and depth."'
    },
    source: {
      de: 'Japanische Kintsugi-Philosophie',
      en: 'Japanese Kintsugi Tradition'
    },
    coreQuestion: {
      de: 'Wie können Fehler, Rückschläge und schwere Zeiten uns weiser, einfühlsamer und stärker machen?',
      en: 'How can our missteps, setbacks, and difficult moments deepen our empathy, wisdom, and inner grit?'
    },
    deepeningQuestions: {
      de: [
        'Aus welchem eigenen Missgeschick hast du rückblickend am meisten für dein Leben gelernt?',
        'Warum versuchen Menschen in den sozialen Medien oft, ein künstlich makelloses Leben vorzutäuschen?',
        'Wie können wir einer Freundin oder einem Freund beistehen, wenn gerade etwas gründlich schiefgegangen ist?'
      ],
      en: [
        'Looking back, which apparent failure taught you the most indispensable lesson of your youth?',
        'Why do social platforms pressure people to project flawless lives, and why does that feel so exhausting?',
        'How can we support a friend through a crushing mistake without pity, but with genuine belief in their renewal?'
      ]
    },
    theme: {
      de: 'Resilienz & Fehlerkultur',
      en: 'Resilience & Renewal'
    },
    status: 'draft'
  },
  {
    id: 'allein-schnell-zusammen-weit',
    title: {
      de: 'Zusammen kommen wir weiter',
      en: 'Farther Together'
    },
    quoteSnippet: {
      de: '„Wenn du schnell gehen willst, geh allein. Wenn du weit gehen willst, geh gemeinsam.“',
      en: '"If you want to go fast, go alone. If you want to go far, go together."'
    },
    source: {
      de: 'Afrikanisches Sprichwort',
      en: 'African Proverb'
    },
    coreQuestion: {
      de: 'Warum erreichen wir bei großen Vorhaben gemeinsam viel mehr, als wenn jeder für sich allein kämpft?',
      en: 'Why do long-term transformations require patient collective effort rather than solitary rushing?'
    },
    deepeningQuestions: {
      de: [
        'Wo ist Zusammenarbeit manchmal anstrengender als Alleingang – und warum lohnt sie sich trotzdem?',
        'Wie gehen wir in unserer Gruppe damit um, wenn jemand ein anderes Tempo hat als der Rest?',
        'Welches Ziel möchten wir als Gruppe erreichen, das keiner von uns alleine schaffen könnte?'
      ],
      en: [
        'Where is collaboration harder than acting alone, and why does the collective harvest outlast quick solo wins?',
        'How do we accommodate different paces in our group without leaving anyone behind or becoming frustrated?',
        'What worthwhile goal could our group accomplish that no single one of us could pull off alone?'
      ]
    },
    theme: {
      de: 'Zusammenhalt & Teamgeist',
      en: 'Cooperation & Endurance'
    },
    status: 'draft'
  },
  {
    id: 'baeume-pflanzen-schatten',
    title: {
      de: 'Bäume für künftige Generationen',
      en: 'Planting for Future Shade'
    },
    quoteSnippet: {
      de: '„Eine Gesellschaft wird dann großartig, wenn weise Menschen Bäume pflanzen, in deren Schatten sie selbst niemals sitzen werden.“',
      en: '"A society grows great when wise people plant trees in whose shade they shall never sit."'
    },
    source: {
      de: 'Griechische Weisheit',
      en: 'Greek Proverb'
    },
    coreQuestion: {
      de: 'Was bedeutet es, Verantwortung für Menschen zu übernehmen, die wir vielleicht nie persönlich kennenlernen werden?',
      en: 'What does it mean to take responsibility for generations whose faces we may never personally see?'
    },
    deepeningQuestions: {
      de: [
        'Welche Dinge in unserer heutigen Welt genießen wir, die Menschen vor 50 oder 100 Jahren selbstlos für uns aufgebaut haben?',
        'Wie verändert sich unsere Motivation, wenn wir nicht für schnelles Lob handeln, sondern für eine bleibende Wirkung?',
        'Was können wir heute tun, wovon jüngere Kinder in unserem Viertel in fünf Jahren profitieren?'
      ],
      en: [
        'What public goods, clean spaces, or rights do we enjoy today because previous generations sacrificed for them?',
        'How does our motivation transform when we serve not for quick applause, but for enduring goodness?',
        'What can our group build or start now that younger children in our neighborhood will appreciate years from now?'
      ]
    },
    theme: {
      de: 'Selbstlosigkeit & Zukunft',
      en: 'Selflessness & Stewardship'
    },
    status: 'draft'
  },
  {
    id: 'fuer-das-leben-lernen',
    title: {
      de: 'Nicht für die Noten, für das Leben',
      en: 'Learning for Life, Not Just for Marks'
    },
    quoteSnippet: {
      de: '„Non scholae, sed vitae discimus – Nicht für die Schule, sondern für das Leben lernen wir.“',
      en: '"Non scholae, sed vitae discimus—We do not learn for school, but for life."'
    },
    source: {
      de: 'Seneca (Römischer Philosoph)',
      en: 'Seneca (Roman Philosopher)'
    },
    coreQuestion: {
      de: 'Wie finden wir die Freude am Lernen wieder, wenn Schule oft nur auf Noten und Prüfungsdruck reduziert wird?',
      en: 'How do we reclaim genuine curiosity when education is reduced to test anxiety and letter grades?'
    },
    deepeningQuestions: {
      de: [
        'Was war die wertvollste Sache, die du im letzten Jahr gelernt hast, die in keinem Zeugnis steht?',
        'Wie können wir uns in unserer Gruppe gegenseitig helfen, Dinge wirklich tief zu begreifen statt nur auswendig zu lernen?',
        'Welche Fähigkeiten werden für deine Zukunft als gestaltender Mensch am wichtigsten sein?'
      ],
      en: [
        'What is the most meaningful insight or skill you gained this past year that never appears on a report card?',
        'How can our circle help each other deeply understand ideas rather than merely memorizing facts for an exam?',
        'Which qualities of character will matter most for your future as an active, conscious contributor to society?'
      ]
    },
    theme: {
      de: 'Bildung & Echtes Verstehen',
      en: 'Lifelong Learning & Discernment'
    },
    status: 'draft'
  },
  {
    id: 'steter-tropfen',
    title: {
      de: 'Steter Tropfen höhlt den Stein',
      en: 'Continuous Drops Hollow the Stone'
    },
    quoteSnippet: {
      de: '„Gutta cavat lapidem, non vi sed saepe cadendo – Der Tropfen höhlt den Stein, nicht durch Kraft, sondern durch stetes Fallen.“',
      en: '"A drop of water hollows out stone, not through sheer force, but through steadfast falling."'
    },
    source: {
      de: 'Ovid (Römische Spruchweisheit)',
      en: 'Ovid (Ancient Wisdom)'
    },
    coreQuestion: {
      de: 'Warum sind kleine tägliche Gewohnheiten auf lange Sicht viel wirkungsvoller als seltene, hektische Kraftakte?',
      en: 'Why do modest, daily habits produce vastly deeper transformations than rare, chaotic bursts of willpower?'
    },
    deepeningQuestions: {
      de: [
        'Welche gute Gewohnheit (z. B. Lesen, Ordnung, Nachdenken) möchtest du wie stete Tropfen in deinen Alltag einbauen?',
        'Was tun wir, wenn die Motivation nach ein paar Tagen nachlässt – wie bleiben wir trotzdem dran?',
        'Welches scheinbar unlösbare Problem in unserer Gemeinschaft braucht vor allem Geduld und Ausdauer?'
      ],
      en: [
        'Which constructive routine would you love to anchor into your mornings or evenings with steadfast consistency?',
        'What mental shift helps us keep going when early excitement wanes and progress feels imperceptible?',
        'Which tough community challenge requires patient, unyielding persistence rather than quick fixes?'
      ]
    },
    theme: {
      de: 'Geduld & Beharrlichkeit',
      en: 'Patience & Perseverance'
    },
    status: 'draft'
  },
  {
    id: 'drei-tore-der-rede',
    title: {
      de: 'Die drei Tore der Rede',
      en: 'The Three Gates of Speech'
    },
    quoteSnippet: {
      de: '„Bevor du sprichst, lasse deine Worte durch drei Tore schreiten: Ist es wahr? Ist es notwendig? Ist es freundlich?“',
      en: '"Before speaking, let your words pass through three gates: Is it true? Is it necessary? Is it kind?"'
    },
    source: {
      de: 'Persische Spruchweisheit',
      en: 'Persian Traditional Wisdom'
    },
    coreQuestion: {
      de: 'Was würde sich in unseren Chats und Gesprächen verändern, wenn wir diesen dreifachen Test anwenden?',
      en: 'How would our online chats and daily conversations shift if every message passed through these three filters?'
    },
    deepeningQuestions: {
      de: [
        'Warum reicht es nicht aus, dass eine Aussage „wahr“ ist, wenn sie verletzend oder völlig unnötig ist?',
        'Welches der drei Tore fällt dir im Alltag am schwersten – Wahrheit, Notwendigkeit oder Freundlichkeit?',
        'Wie können wir Ehrlichkeit und Taktgefühl so verbinden, dass andere durch unsere Worte aufgerichtet werden?'
      ],
      en: [
        'Why is mere technical accuracy not an excuse to share something that is cruel, humiliating, or unnecessary?',
        'Which of the three gates do you find most challenging to guard when emotions run high?',
        'How can we combine candor and gentleness so that our honest feedback leaves others strengthened?'
      ]
    },
    theme: {
      de: 'Achtsamkeit & Sprache',
      en: 'The Three Gates of Speech'
    },
    status: 'draft'
  },
  {
    id: 'reise-tausend-meilen',
    title: {
      de: 'Der erste Schritt',
      en: 'The First Step of a Thousand Miles'
    },
    quoteSnippet: {
      de: '„Eine Reise von tausend Meilen beginnt mit einem einzigen Schritt.“',
      en: '"A journey of a thousand miles begins with a single step."'
    },
    source: {
      de: 'Laozi (Daodejing)',
      en: 'Laozi (Daodejing)'
    },
    coreQuestion: {
      de: 'Warum zögern wir oft vor großen Aufgaben, und was hilft uns, heute den mutigen ersten Schritt zu tun?',
      en: 'Why do we freeze before grand ambitions, and what grants us the bravery to take that first humble stride?'
    },
    deepeningQuestions: {
      de: [
        'Welches Vorhaben schiebst du schon länger vor dir her, weil dir der ganze Weg zu unüberwindbar erscheint?',
        'Wie können wir eine riesige Aufgabe in so kleine Häppchen zerlegen, dass der Anfang kinderleicht wird?',
        'Wie kann die Gruppe dir helfen, bei deinem nächsten ersten Schritt nicht allein zu sein?'
      ],
      en: [
        'What project or conversation have you been postponing because the entire journey feels overwhelming?',
        'How can we break an intimidating goal into bite-sized milestones where starting feels natural?',
        'How can our circle encourage you so you never feel alone when stepping out of your comfort zone?'
      ]
    },
    theme: {
      de: 'Anfangen & Mut',
      en: 'Beginning with Courage'
    },
    status: 'draft'
  },
  {
    id: 'wurzeln-und-fluegel',
    title: {
      de: 'Wurzeln und Flügel',
      en: 'Roots and Wings'
    },
    quoteSnippet: {
      de: '„Es gibt zwei bleibende Geschenke, die wir unseren Kindern mitgeben können: Das eine sind feste Wurzeln, das andere sind starke Flügel.“',
      en: '"There are two lasting bequests we can give our youth: one is deep roots, the other is strong wings."'
    },
    source: {
      de: 'Traditionelles Sprichwort',
      en: 'Traditional Proverb'
    },
    coreQuestion: {
      de: 'Was gibt dir in deinem Leben festen Halt (Wurzeln) und was schenkt dir den Mut, Neues zu wagen (Flügel)?',
      en: 'What provides solid grounding in your values (roots), and what empowers you to explore and pioneer (wings)?'
    },
    deepeningQuestions: {
      de: [
        'Was passiert mit einem Baum, der nur Flügel hat, aber keine Wurzeln – oder der nur Wurzeln hat, aber nie austreibt?',
        'Welche Werte deiner Familie oder Gemeinschaft möchtest du dein Leben lang als Wurzeln bewahren?',
        'Wohin möchtest du deine Flügel in den nächsten Jahren ausstrecken?'
      ],
      en: [
        'What happens when someone seeks total freedom without moral grounding, or clings to habit without daring to grow?',
        'Which core principles from your upbringing do you want to keep rooted in your character for a lifetime?',
        'Toward which frontiers of learning and service do you hope to spread your wings in the years ahead?'
      ]
    },
    theme: {
      de: 'Identität & Freiheit',
      en: 'Roots and Wings'
    },
    status: 'draft'
  },
  {
    id: 'goldene-regel',
    title: {
      de: 'Die Goldene Regel',
      en: 'The Golden Rule'
    },
    quoteSnippet: {
      de: '„Wünsche deinem Nächsten, was du dir selbst wünschst, und füge niemandem zu, was du selbst nicht erleiden möchtest.“',
      en: '"Wish for thy brother what thou wishest for thyself, and do not unto others what thou wouldst not have done unto thee."'
    },
    source: {
      de: 'Universelles Weltethos / Bahá\'u\'lláh',
      en: 'Universal Ethic / Bahá\'u\'lláh'
    },
    coreQuestion: {
      de: 'Warum ist die Goldene Regel in fast allen Kulturen der Erde das Fundament für ein friedliches Miteinander?',
      en: 'Why is the Golden Rule recognized across virtually every civilization as the bedrock of moral maturity?'
    },
    deepeningQuestions: {
      de: [
        'Wie hilft uns die Frage „Wie würde ich mich an seiner Stelle fühlen?“, bevor wir eine Entscheidung treffen?',
        'In welchen Situationen ist es besonders schwer, nach dieser Regel zu handeln (z. B. wenn jemand unfreundlich zu uns war)?',
        'Wie können wir diesen Grundsatz zur goldenen Richtschnur für die Kultur unserer gesamten Gruppe machen?'
      ],
      en: [
        'How does pausing to ask "How would I feel in their shoes?" prevent careless injustice?',
        'In which situations is this rule hardest to live by (e.g. when someone has treated us unfairly)?',
        'How can we make this reciprocal care the unshakeable foundation for our group\'s code of conduct?'
      ]
    },
    theme: {
      de: 'Gerechtigkeit & Mitgefühl',
      en: 'The Golden Rule & Empathy'
    },
    status: 'draft'
  }
];

export const CAMP_BEST_PRACTICES: CampBestPractice[] = [
  {
    id: 'haltung',
    title: {
      de: 'Die innere Haltung des Animators',
      en: 'The Mentor’s Posture'
    },
    area: {
      de: 'Haltung & Vorbild',
      en: 'Posture & Modeling'
    },
    quoteOrMotto: {
      de: 'Echtes Vertrauen entsteht durch Zugewandtheit und gelebte Verlässlichkeit.',
      en: 'Genuine trust grows through humble presence and consistent care.'
    },
    keyInsights: {
      de: [
        'Dienstorientierte Haltung: Es geht im Raum nie um das Prestige des Leiters, sondern um die Entfaltung der Jugendlichen.',
        'Körpersprache und Tonfall: Ruhige Ausstrahlung, offener Blickkontakt und Geduld schaffen emotionale Sicherheit.',
        'Vorleben statt Belehren: Bei Spielen und Übungen selbst mit ganzer Energie mitmachen, ohne sich über die Gruppe zu stellen.'
      ],
      en: [
        'Service-oriented mindset: Focus on the potential of the youth rather than personal authority.',
        'Paraverbal signals: A steady tone, open posture, and patience foster psychological safety.',
        'Participation over preaching: Fully engage in activities and challenges alongside the participants.'
      ]
    }
  },
  {
    id: 'einheit-team',
    title: {
      de: 'Einheit im Leiter-Team vor der Gruppe',
      en: 'Team Unity Before the Group'
    },
    area: {
      de: 'Zusammenarbeit im Team',
      en: 'Co-Facilitation'
    },
    quoteOrMotto: {
      de: 'Einheit im Team ist das Fundament, auf dem die Jugendlichen Vertrauen schöpfen.',
      en: 'Facilitator unity is the cornerstone of group security.'
    },
    keyInsights: {
      de: [
        'Entscheidungen gemeinsam tragen: Ein Beschluss der Beratung wird von allen Teamern getragen.',
        'Diskretion bei Uneinigkeit: Kritik an anderen Leitern niemals vor der Gruppe äußern, sondern immer im geschützten Teamkreis besprechen.',
        'Räume für leisere Stimmen schaffen: Dafür sorgen, dass sich alle Gruppenmitglieder gleichberechtigt einbringen können.'
      ],
      en: [
        'Collective ownership: Decisions reached through consultation are supported by all co-leaders.',
        'Address friction privately: Never critique or contradict a fellow leader in front of the participants.',
        'Nurture quieter voices: Actively create conversational space for more reserved participants.'
      ]
    }
  },
  {
    id: 'praxistauglichkeit',
    title: {
      de: 'Klarheit statt kognitiver Überfrachtung',
      en: 'Clarity Over Academic Complexity'
    },
    area: {
      de: 'Programmgestaltung',
      en: 'Program Design'
    },
    quoteOrMotto: {
      de: 'Abläufe müssen unmittelbar verständlich und ohne Reibung anwendbar sein.',
      en: 'Activities must be immediately actionable without unnecessary cognitive friction.'
    },
    keyInsights: {
      de: [
        'Einfache Sprache: Aufgeblasene Formulierungen und Fachbegriffe vermeiden; Regeln in 30 Sekunden am Beispiel demonstrieren.',
        'Kurze Übergänge: Zitate und Spiele nicht mit langen Monologen ankündigen, sondern direkt ins Tun übergehen.',
        'Sorgfältige Vorbereitung: Das beste Programm ist jenes, das für die Jugendlichen spürbar durchdacht und vorbereitet wurde.'
      ],
      en: [
        'Direct language: Avoid convoluted jargon; demonstrate rules by visual example in 30 seconds.',
        'Crisp transitions: Move smoothly into activities rather than bogging down in lengthy preamble.',
        'Thoughtful preparation: Smooth flow comes from quiet, loving preparation behind the scenes.'
      ]
    }
  }
];
