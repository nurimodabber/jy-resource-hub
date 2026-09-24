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
