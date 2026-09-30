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
      de: 'Werte & Gemeinschaft',
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
