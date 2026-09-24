import { QuoteMethod } from '../types';

export const QUOTE_METHODS_DATA: QuoteMethod[] = [
  {
    id: 'verschwindende-tafel',
    name: {
      de: 'Die verschwindende Tafel',
      en: 'The Disappearing Board'
    },
    phase: 1,
    modality: 'visual',
    materials: {
      de: ['Tafel, Whiteboard oder die integrierte interaktive Tafel'],
      en: ['Chalkboard, whiteboard, or the built-in interactive board']
    },
    durationMinutes: '10–15 Min',
    summary: {
      de: 'Das Zitat steht vollständig an der Tafel. Nach jedem gemeinsamen Durchlauf werden Schlüsselwörter weggewischt, bis der Text frei aus dem Kopf gesprochen wird.',
      en: 'The quote is written on the board. After each unison reading, words are erased until the group recites entirely from memory.'
    },
    idea: {
      de: 'Das geschriebene Schriftbild wird schrittweise durch das innere Gedächtnis ersetzt. Weil alle im Chor sprechen, wird niemand bloßgestellt.',
      en: 'The written word is gradually replaced by mental recall. Because recitation is communal, no individual feels put on the spot.'
    },
    steps: [
      {
        name: {
          de: 'Gemeinsames Lesen',
          en: 'Unison Reading'
        },
        description: {
          de: 'Das Zitat steht vollständig an der Wand. Die Gruppe liest den Text zweimal laut im Unisono-Chor, um Rhythmus und Sprachmelodie zu etablieren.',
          en: 'The complete quote is visible. The group reads the passage twice aloud together to establish natural cadence and rhythm.'
        }
      },
      {
        name: {
          de: 'Erste Auslöschung',
          en: 'Initial Erasure'
        },
        description: {
          de: 'Ein Jugendlicher wischt 2–3 sinntragende Hauptwörter weg. An ihrer Stelle bleibt nur ein Strich.',
          en: 'A participant erases 2–3 key nouns. A blank line remains in their place.'
        }
      },
      {
        name: {
          de: 'Chor-Rekonstruktion',
          en: 'Choral Recall'
        },
        description: {
          de: 'Die Gruppe rezitiert das Zitat erneut im Takt. Die fehlenden Lücken müssen im Chor flüssig aus dem Kopf ergänzt werden.',
          en: 'The group recites the passage again. The missing words must be filled in smoothly from memory.'
        }
      },
      {
        name: {
          de: 'Vollständige Reduktion',
          en: 'Complete Redaction'
        },
        description: {
          de: 'In weiteren Runden werden auch Bindewörter entfernt, bis die Wand leer ist.',
          en: 'Remaining connectors are erased in subsequent passes until the board is completely clear.'
        }
      }
    ],
    successCriteria: {
      de: 'Die Gruppe spricht das vollständige Zitat flüssig vor der leeren Tafel, ohne dass jemand zögert.',
      en: 'The group recites the full quote smoothly before the cleared board without pauses.'
    },
    whyItWorks: {
      de: 'Das Gehirn wird sanft an den aktiven Abruf herangeführt. Die visuelle Erinnerung an die Lückenpositionen stützt den Lernprozess.',
      en: 'Gently transitions the brain into active recall. Visualizing the positions of the blanks supports memory retention.'
    },
    animatorTips: {
      de: [
        'Lasst die Jugendlichen selbst nach vorne kommen und Wörter auswählen, die sie löschen möchten.',
        'Haltet die Pausen zwischen den Runden kurz, damit der Sprechrhythmus nicht abreißt.'
      ],
      en: [
        'Invite youth forward to choose which words they want to erase.',
        'Keep pauses between rounds brief to maintain acoustic momentum.'
      ]
    }
  },
  {
    id: 'kollektiver-herzschlag',
    name: {
      de: 'Der rhythmische Takt',
      en: 'Rhythmic Beat'
    },
    phase: 1,
    modality: 'rhythm',
    materials: {
      de: ['Keine'],
      en: ['None']
    },
    durationMinutes: '8–12 Min',
    summary: {
      de: 'Ein gleichmäßiger Body-Percussion-Takt (Schenkelklopfen, Klatschen) synchronisiert die Gruppe und verankert die Silben im Rhythmusgefühl.',
      en: 'A steady body percussion rhythm (knee taps, hand claps) synchronizes the room and anchors syllables musically.'
    },
    idea: {
      de: 'Sprachmelodie und metrische Betonung aktivieren das auditorische Gedächtnis weit stärker als monotones Vorlesen.',
      en: 'Vocal melody and metrical cadence engage auditory memory far more deeply than dry reading.'
    },
    steps: [
      {
        name: {
          de: 'Takt etablieren',
          en: 'Establish the Beat'
        },
        description: {
          de: 'Die Gruppe etabliert einen gleichmäßigen 4er-Takt (Schenkel, Schenkel, Klatschen, Pause), bis alle synchron klingen.',
          en: 'The group begins a steady four-count rhythm (lap, lap, clap, pause) until unison is achieved.'
        }
      },
      {
        name: {
          de: 'Text überlagern',
          en: 'Layer Text'
        },
        description: {
          de: 'Das Zitat wird Silbe für Silbe passgenau auf die Schläge gelegt. Wörter folgen strikt dem Grundrhythmus.',
          en: 'The quote is articulated syllable by syllable strictly onto the beats.'
        }
      },
      {
        name: {
          de: 'Tempo variieren',
          en: 'Tempo Variations'
        },
        description: {
          de: 'Die Spielleitung beschleunigt oder verlangsamt das Tempo über Handzeichen, während der Chor präzise beieinander bleibt.',
          en: 'The facilitator modulates the tempo faster or slower; the choir remains tightly locked in sync.'
        }
      }
    ],
    successCriteria: {
      de: 'Das gesamte Zitat wird synchron im Takt gesprochen, ohne dass einzelne Stimmen vorauseilen oder nachhinken.',
      en: 'The entire passage is spoken in cadence without individuals rushing or dragging behind.'
    },
    whyItWorks: {
      de: 'Rhythmus verbindet motorische und kognitive Areale im Gehirn und verhindert vorschnelles Abdriften der Konzentration.',
      en: 'Rhythm connects motor and cognitive pathways, preventing concentration from drifting.'
    },
    animatorTips: {
      de: [
        'Besonders wirksam bei Zitaten mit parallelem Satzbau oder Gegensätzen (z. B. Wahrhaftigkeit, Taten statt Worte).'
      ],
      en: [
        'Particularly effective for quotes with parallel structures or contrasting phrases.'
      ]
    }
  },
  {
    id: 'wort-ball',
    name: {
      de: 'Der Wort-Ball (Kreis-Pass)',
      en: 'Word Ball Pass'
    },
    phase: 2,
    modality: 'movement',
    materials: {
      de: ['Ein weicher handlicher Ball (Tennisball oder Softball)'],
      en: ['A soft, easy-to-catch ball']
    },
    durationMinutes: '10–15 Min',
    space: {
      de: 'Weiter Kreis mit 2 Metern Abstand',
      en: 'Spacious circle'
    },
    summary: {
      de: 'Ein Ball wird quer durch den Kreis geworfen. Beim Werfen ruft man sein Wort, der Fänger muss innerhalb von 2 Sekunden das nächste Wort nennen.',
      en: 'A ball is tossed across the circle. On release the thrower speaks their word; the catcher has 2 seconds to speak the next.'
    },
    idea: {
      de: 'Kombiniert Hand-Auge-Koordination, Blickkontakt und schnellen sprachlichen Abruf unter leichter Zeitspannung.',
      en: 'Combines hand-eye coordination, direct eye contact, and rapid retrieval under mild time pressure.'
    },
    steps: [
      {
        name: {
          de: 'Aufstellung',
          en: 'Setup'
        },
        description: {
          de: 'Alle stehen im weiten Kreis. Eine Person hält den Ball und nimmt Blickkontakt zu einem Mitspieler auf.',
          en: 'Everyone stands in a wide circle. One person holds the ball and makes clear eye contact.'
        }
      },
      {
        name: {
          de: 'Pass und Sprache',
          en: 'Pass and Call'
        },
        description: {
          de: 'Person A ruft das erste Wort und wirft den Ball kontrolliert zu Person B auf der gegenüberliegenden Seite.',
          en: 'Person A calls the first word and passes across the circle to Person B.'
        }
      },
      {
        name: {
          de: 'Fließender Übergang',
          en: 'Continuous Flow'
        },
        description: {
          de: 'Person B fängt, nennt sofort das nächste Wort und passt unverzüglich weiter. Länger als 2 Sekunden halten stoppt den Fluss.',
          en: 'Person B catches, calls the next word immediately, and redirects the ball within 2 seconds.'
        }
      }
    ],
    successCriteria: {
      de: 'Das Zitat wandert in flüssigem Wurfrhythmus ohne Unterbrechung durch den Raum.',
      en: 'The entire quote travels across the room in a seamless throwing rhythm.'
    },
    resetRule: {
      de: 'Fällt der Ball zu Boden oder stockt die Kette, wandert der Ball zum Start und es beginnt bei Wort 1.',
      en: 'If the ball drops or the sequence stalls, the ball returns to start at word 1.'
    },
    whyItWorks: {
      de: 'Die Bereitschaft, den Ball fangen zu müssen, hält alle Beteiligten mental voll wach.',
      en: 'The physical readiness required to catch keeps every mind alert and present.'
    },
    animatorTips: {
      de: [
        'Regel: Nur quer durch den Kreis werfen, niemals zum direkten Nachbarn.'
      ],
      en: [
        'Enforce passing strictly across the circle rather than to immediate neighbors.'
      ]
    }
  },
  {
    id: 'kollektives-tafelschreiben',
    name: {
      de: 'Kollektiver Schreib-Staffellauf',
      en: 'Collaborative Board Relay'
    },
    phase: 2,
    modality: 'movement',
    materials: {
      de: ['Tafel / Flipchart', 'Stifte oder Kreide'],
      en: ['Board or flipchart', 'Markers or chalk']
    },
    durationMinutes: '12–18 Min',
    summary: {
      de: 'Staffellauf zur Tafel: Jeder Läufer schreibt genau ein Wort an die Wand, während die wartende Gruppe die bisherigen Wörter laut skandiert.',
      en: 'Relay race to the board: Each runner writes one word while the waiting group chants the cumulative sentence aloud.'
    },
    idea: {
      de: 'Verbindet Sprint, Rechtschreibung und akustische Begleitung. Die wartenden Jugendlichen sind als Begleitchor aktiv eingebunden.',
      en: 'Blends physical sprinting with orthographic focus and acoustic chanting so waiting participants remain fully engaged.'
    },
    steps: [
      {
        name: {
          de: 'Startaufstellung',
          en: 'Relay Line'
        },
        description: {
          de: 'Die Gruppe steht an einer Startlinie 5 Meter vor der Tafel. Ein Stift liegt bereit.',
          en: 'The group stands at a line 5 meters from the board with writing markers ready.'
        }
      },
      {
        name: {
          de: 'Schreib-Sprint',
          en: 'Writing Sprint'
        },
        description: {
          de: 'Person 1 rennt vor, schreibt Wort 1 leserlich an die Wand, sprintet zurück und klatscht Person 2 ab.',
          en: 'Person 1 sprints, writes word 1 clearly, returns, and tags Person 2.'
        }
      },
      {
        name: {
          de: 'Der Begleitchor',
          en: 'Chanting Squad'
        },
        description: {
          de: 'Während gelaufen wird, muss die wartende Gruppe ununterbrochen alle Wörter laut im Takt aufsagen, die bereits an der Wand stehen.',
          en: 'While teammates sprint, the waiting group continuously recites all words currently on the board.'
        }
      }
    ],
    successCriteria: {
      de: 'Das Zitat steht fehlerfrei an der Wand, während der Schlusschor punktgenau mit dem letzten Stiftstrich endet.',
      en: 'The complete quote is written correctly with punctuation as the group speaks the final word.'
    },
    whyItWorks: {
      de: 'Weil die Gruppe durchgehend laut spricht, entsteht keine Wartezeit oder Langeweile.',
      en: 'Because the line chants continuously, there is zero passive downtime.'
    },
    animatorTips: {
      de: [
        'Bei Gruppen ab 10 Personen können zwei Teams gegeneinander antreten.'
      ],
      en: [
        'With groups of 10 or more, divide into two parallel relay teams for healthy friendly competition.'
      ]
    }
  },
  {
    id: 'menschen-satzbau',
    name: {
      de: 'Stumme Satzbau-Sortierung',
      en: 'Silent Human Sentence Chain'
    },
    phase: 2,
    modality: 'visual',
    materials: {
      de: ['A4-Blätter mit je einem Wort des Zitats in großer Druckschrift'],
      en: ['Sheets with one word each in large bold letters']
    },
    durationMinutes: '10–15 Min',
    summary: {
      de: 'Jeder erhält ein Wortblatt. Auf Signal muss sich die Gruppe in absoluter Stille und in Rekordzeit in der richtigen Reihenfolge aufstellen.',
      en: 'Each person holds one word sheet. On signal, the group must arrange themselves in order in total silence against the clock.'
    },
    idea: {
      de: 'Verlangt logisches Satzverständnis, räumliche Koordination und nonverbale Verständigung.',
      en: 'Requires syntactic understanding, spatial positioning, and nonverbal cooperation.'
    },
    steps: [
      {
        name: {
          de: 'Ausgabe',
          en: 'Distribution'
        },
        description: {
          de: 'Jeder erhält ein Blatt mit einem Wort auf die Hand oder Brust.',
          en: 'Each participant receives one word card.'
        }
      },
      {
        name: {
          de: 'Schweigegebot',
          en: 'Silence Order'
        },
        description: {
          de: 'Mit dem Startsignal gilt absolutes Sprechverbot. Nur Blicke, Gestik und Zeigen sind erlaubt.',
          en: 'Absolute silence takes effect. Only gestures and nodding are permitted.'
        }
      },
      {
        name: {
          de: 'Sortierung & Auflösung',
          en: 'Ordering and Resolution'
        },
        description: {
          de: 'Die Jugendlichen stellen sich nebeneinander auf. Steht die Kette, liest jeder von links nach rechts sein Wort laut vor.',
          en: 'Participants align in a horizontal line. When settled, each person calls out their word from left to right.'
        }
      }
    ],
    successCriteria: {
      de: 'Die Reihe steht beim ersten Durchlesen zu 100 % in der richtigen Grammatik.',
      en: 'The sentence reads 100% grammatically correct on the first readout.'
    },
    whyItWorks: {
      de: 'Macht Satzbau und grammatikalische Bezüge physisch begreifbar.',
      en: 'Makes sentence architecture tangible through bodily movement.'
    },
    animatorTips: {
      de: [
        'Stoppt die Zeit: „Können wir den Rekord von 25 Sekunden brechen?“'
      ],
      en: [
        'Time the attempt: "Can we beat our initial run of 25 seconds?"'
      ]
    }
  },
  {
    id: 'wort-mind',
    name: {
      de: 'Wort-Mind (Stummes Zitate-Sprechen)',
      en: 'Word Mind (Silent Quoting)'
    },
    phase: 3,
    modality: 'focus',
    materials: {
      de: ['Keine'],
      en: ['None']
    },
    durationMinutes: '10–15 Min',
    summary: {
      de: 'Die Gruppe rezitiert das Zitat mit geschlossenen Augen Wort für Wort. Niemand weiß, wer als nächstes spricht. Sprechen zwei gleichzeitig: Neustart.',
      en: 'The group recites the quote word-by-word with eyes closed. No sequence or speaking cues. If two speak together: restart.'
    },
    idea: {
      de: 'Basiert auf der Mechanik von „The Mind“. Erfordert höchste Konzentration, Einfühlungsvermögen und Resonanz.',
      en: 'Inspired by "The Mind" game mechanics. Demands deep presence, collective intuition, and shared stillness.'
    },
    steps: [
      {
        name: {
          de: 'Fokus & Augen schließen',
          en: 'Close Eyes'
        },
        description: {
          de: 'Alle sitzen im Kreis und schließen die Augen vollständig.',
          en: 'Everyone sits in a circle and closes their eyes completely.'
        }
      },
      {
        name: {
          de: 'Start',
          en: 'Opening'
        },
        description: {
          de: 'Irgendeine Person beginnt und spricht Wort 1 laut und deutlich aus.',
          en: 'Any person initiates by speaking word 1 clearly.'
        }
      },
      {
        name: {
          de: 'Der unberechenbare Fluss',
          en: 'Unbroken Sequence'
        },
        description: {
          de: 'Eine andere Person steuert Wort 2 bei, eine dritte Wort 3. Niemand darf zwei aufeinanderfolgende Wörter nennen.',
          en: 'Another person adds word 2, followed by word 3. No one may speak two consecutive words.'
        }
      }
    ],
    successCriteria: {
      de: 'Das gesamte Zitat wird fehlerfrei ohne Doppelung von Anfang bis Ende gesprochen.',
      en: 'The complete quote is spoken from start to finish without overlaps or gaps.'
    },
    resetRule: {
      de: 'Sprechen zwei Personen auch nur eine Silbe zeitgleich, bricht der Versuch ab. Neustart bei Wort 1.',
      en: 'If two individuals speak at the same instant, the attempt halts. Reset to word 1.'
    },
    whyItWorks: {
      de: 'Schafft ein tiefes Gemeinschaftsgefühl, wenn die Gruppe es nach mehreren Anläufen gemeinsam meistert.',
      en: 'Creates a profound sense of shared triumph when achieved after collective patience.'
    },
    animatorTips: {
      de: [
        'Erst einsetzen, wenn der Text durch Phase 1 oder 2 bereits gut bekannt ist.'
      ],
      en: [
        'Deploy only once the text has been established through Phase 1 or 2.'
      ]
    }
  },
  {
    id: 'klick-ersatz',
    name: {
      de: 'Der Klick-Ersatz',
      en: 'Sound Substitution'
    },
    phase: 3,
    modality: 'rhythm',
    materials: {
      de: ['Keine'],
      en: ['None']
    },
    durationMinutes: '8–12 Min',
    summary: {
      de: 'Bestimmte Wörter erhalten ein Sprechverbot und werden durch ein synchrones Geräusch (Klatschen, Schnipsen) ersetzt.',
      en: 'Designated words are banned from speech and must be replaced by a unison acoustic cue (clap, snap, stomp).'
    },
    idea: {
      de: 'Trainiert den kognitiven Filter: Das Gehirn muss das Wort mental abrufen, darf es aber verbal nicht aussprechen.',
      en: 'Sharpens cognitive inhibition: the brain processes the word internally while withholding speech.'
    },
    steps: [
      {
        name: {
          de: 'Codierung',
          en: 'Code Definition'
        },
        description: {
          de: 'Die Gruppe legt 1–2 Codewörter fest (z. B. „und“ = einmal Klatschen, „Menschheit“ = Schnipsen).',
          en: 'Assign sounds to 1–2 words (e.g. "and" = one clap, "virtues" = snap).'
        }
      },
      {
        name: {
          de: 'Rezitation',
          en: 'Recitation'
        },
        description: {
          de: 'Das Zitat wird flüssig gesprochen. An den Codestellen bleibt der Raum stumm – nur das vereinbarte Signal ertönt punktgenau.',
          en: 'The quote is spoken in cadence. At coded words, the room stays verbally silent and executes the sound in sync.'
        }
      }
    ],
    successCriteria: {
      de: 'Der Text läuft flüssig durch, ohne dass jemand das verbotene Wort versehentlich ausspricht.',
      en: 'The recitation flows uninterrupted with zero accidental spoken words.'
    },
    whyItWorks: {
      de: 'Durchbricht die Routine und verlangt hohe Geistesgegenwart.',
      en: 'Breaks mechanical repetition and demands acute mental presence.'
    },
    animatorTips: {
      de: [
        'Hervorragend, um Verbindungswörter oder zentrale Tugendbegriffe hervorzuheben.'
      ],
      en: [
        'Effective for drawing attention to subtle transition words or central virtue concepts.'
      ]
    }
  }
];
