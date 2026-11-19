import { Game } from '../types';

export const GAMES_DATA: Game[] = [
  // =========================================================================
  // 1. KOOPERATIVE SPIELE (TEAMBUILDING, VERTRAUEN & ZUSAMMENARBEIT) - 17 SPIELE
  // =========================================================================
  // 10. Menschlicher Knoten
  {
    id: 'menschlicher-knoten',
    title: {
      de: 'Der menschliche Knoten',
      en: 'Human Knot'
    },
    purpose: 'zusammenarbeit',
    category: 'cooperative',
    energyLevel: 'medium',
    groupSize: { min: 6, max: 16 },
    prepLevel: 'instant',
    materials: {
      de: ['Keine'],
      en: ['None']
    },
    durationMinutes: '10–20 Min',
    durationMin: 10,
    durationMax: 20,
    space: {
      de: 'Freie Stehfläche',
      en: 'Open standing area'
    },
    summary: {
      de: 'Alle greifen sich kreuz und quer an den Händen und müssen das Gewirr durch Drehen und Steigen entknoten, ohne loszulassen.',
      en: 'Participants reach across a circle to grab random hands and must untangle themselves into an open circle without letting go.'
    },
    idea: {
      de: 'Übt Geduld und klare Absprachen, wenn alle gleichzeitig handeln wollen.',
      en: 'Practises patience and clear agreements when everyone wants to act at once.'
    },
    rules: {
      de: [
        'Alle stehen in einem engen Kreis und strecken beide Hände in die Mitte.',
        'Jeder greift zwei Hände von zwei verschiedenen Personen (nicht vom direkten Nachbarn).',
        'Aufgabe: Den Knoten so entwirren, dass am Ende ein sauberer Kreis entsteht.',
        'Die Hände dürfen niemals losgelassen werden (Griffe dürfen sich nur drehen oder anpassen).',
        'Es entsteht entweder ein großer Kreis oder zwei ineinander verschlungene Kreise.'
      ],
      en: [
        'Stand in a close circle and reach both hands into the center.',
        'Grab the hands of two different individuals (neither may be your immediate neighbor).',
        'Objective: Untangle the resulting knot into a wide open circle.',
        'Hands must remain joined at all times (shifting grips is allowed, breaking contact is not).',
        'The result will either be one single large circle or two interlocked rings.'
      ]
    },
    safety: {
      de: ['Wer Schmerzen im Handgelenk spürt, sagt sofort „Stopp“. Dann lockern alle kurz den Griff.'],
      en: ['Anyone who feels pain in their wrist says "stop" at once. Then everyone loosens their grip for a moment.']
    },
    reflection: {
      de: ['Was hat geholfen, als ihr festgesteckt habt?', 'Wie hat es sich angefühlt, als der Knoten aufging?'],
      en: ['What helped when you were stuck?', 'How did it feel when the knot came undone?']
    },
    animatorTips: {
      de: [
        'Auf sanftes Vorgehen achten: Nicht zerren, sondern schrittweise über Arme steigen oder sich durch Lücken bücken.',
        'Wenn die Gruppe feststeckt, darf die Spielleitung genau einen Handgriff kurz lösen und neu verbinden („Knoten-Chirurg“).'
      ],
      en: [
        'Emphasize gentle coordination: avoid pulling or twisting violently.',
        'If hopelessly tangled, the facilitator may perform one "surgical cut", temporarily disconnecting and reconnecting a single grip.'
      ]
    }
  },

  // 13. Gemeinsam Zählen (The Mind)
  {
    id: 'gemeinsam-zaehlen',
    title: {
      de: 'Gemeinsam Zählen',
      en: 'Silent Counting'
    },
    subtitle: {
      de: 'The Mind',
      en: 'The Mind'
    },
    purpose: 'ruhe',
    category: 'cooperative',
    energyLevel: 'calm',
    groupSize: { min: 6, max: 25 },
    prepLevel: 'instant',
    materials: {
      de: ['Keine'],
      en: ['None']
    },
    durationMinutes: '10–15 Min',
    durationMin: 10,
    durationMax: 15,
    space: {
      de: 'Ruhiger Sitzkreis',
      en: 'Quiet seated circle'
    },
    summary: {
      de: 'Die Gruppe zählt mit geschlossenen Augen von 1 bis 20 – ohne Absprachen oder feste Reihenfolge. Sprechen zwei gleichzeitig: Neustart.',
      en: 'The group counts from 1 to 20 with eyes closed—no designated sequence, no signals. If two speak together: reset.'
    },
    idea: {
      de: 'Übt Zuhören und Geduld. Die Gruppe lernt, Stille auszuhalten.',
      en: 'Practises listening and patience. The group learns to sit with silence.'
    },
    rules: {
      de: [
        'Alle sitzen im Kreis und schließen die Augen oder richten den Blick auf den Boden.',
        'Das Ziel ist es, gemeinsam von 1 bis 20 zu zählen.',
        'Jeder darf jederzeit eine Zahl nennen. Niemand darf zwei aufeinanderfolgende Zahlen sagen.',
        'Es gibt keine vorherige Absprache (wie etwa im Uhrzeigersinn).',
        'Sobald zwei Personen zeitgleich dieselbe Zahl anstimmen, bricht der Versuch ab: Kurzes Durchatmen, Neustart bei 1.'
      ],
      en: [
        'Everyone sits in a circle and closes their eyes or looks down at the floor.',
        'The objective is to count collaboratively from 1 to 20.',
        'Anyone can call out a number at any time. No one can say two consecutive numbers.',
        'No predetermined systems (such as going clockwise) are allowed.',
        'If two people begin a number at the same moment, the round pauses: a breath together, then restart at 1.'
      ]
    },
    variants: {
      de: ['Mit offenen Augen, aber alle schauen auf den Boden.', 'Ziel höher setzen, wenn 20 geklappt hat.'],
      en: ['With eyes open, but everyone looks at the floor.', 'Raise the target once 20 has worked.']
    },
    animatorTips: {
      de: [
        'Ideal geeignet vor Andachten oder Zitate-Einheiten, um den Raum von wilder Energie in fokussierte Stille zu überführen.',
        'Ermutigt die Gruppe nach Fehlschlägen: „Wir lernen gerade, das Tempo der anderen wahrzunehmen.“'
      ],
      en: [
        'Ideal before devotions or study sessions to channel physical energy into deep focus.',
        'Encourage the group after resets: "We are learning to sense each other’s breathing and cadence."'
      ]
    },
    isFavoriteDefault: true
  },

  // 14. Minenfeld (Blindes Führen)
  {
    id: 'minenfeld',
    title: {
      de: 'Das Minenfeld',
      en: 'The Minefield'
    },
    subtitle: {
      de: 'Blindes Führen',
      en: 'Blind Guidance'
    },
    purpose: 'zusammenarbeit',
    category: 'cooperative',
    energyLevel: 'medium',
    groupSize: { min: 6, max: 24 },
    prepLevel: 'low_prep',
    materials: {
      de: ['Augenbinden oder Tücher', 'Hindernisse (Flaschen, Kissen, Hütchen, Bälle)'],
      en: ['Blindfolds', 'Obstacles (bottles, cones, cushions, balls)']
    },
    durationMinutes: '15–25 Min',
    durationMin: 15,
    durationMax: 25,
    space: {
      de: 'Größerer Raum oder Rasenfläche',
      en: 'Large room or lawn'
    },
    summary: {
      de: 'Eine Person muss mit verbundenen Augen ein Hindernisfeld durchqueren – geleitet rein durch die präzisen Zurufe eines Partners.',
      en: 'A blindfolded participant must navigate across an obstacle field guided purely by the vocal directions of a partner.'
    },
    idea: {
      de: 'Übt Vertrauen und genaue Anweisungen, auch wenn es laut ist.',
      en: 'Practises trust and precise directions, even when it is noisy.'
    },
    rules: {
      de: [
        'Im Raum werden diverse Gegenstände als „Minen“ verteilt.',
        'Die Gruppe teilt sich in Paare: Eine Person bekommt die Augen verbunden, die andere ist Lotse.',
        'Der Lotse steht außerhalb des Feldes und darf die blinde Person nicht berühren.',
        'Der Lotse gibt präzise verbale Anweisungen (z. B. „Drei kleine Schritte vorwärts, Stopp, 90 Grad nach rechts“).',
        'Wird ein Hindernis berührt, erhält das Paar einen Strafpunkt oder startet von vorn. Danach Rollentausch.'
      ],
      en: [
        'Scatter various non-dangerous objects across the floor as "mines".',
        'Divide into pairs: one is blindfolded (traveler), one is the navigator.',
        'Navigators remain along the perimeter and may not physically touch their partner.',
        'Guide using clear directional commands (e.g. "Three steps straight, stop, turn 45 degrees left").',
        'If a mine is touched, the pair takes a penalty or resets. Switch roles once crossing.'
      ]
    },
    variants: {
      de: ['Die blinde Person sammelt unterwegs einen bestimmten Gegenstand ein.', 'Statt Worten nur Geräusche, die das Paar vorher vereinbart.'],
      en: ['The blindfolded person collects a certain object on the way.', 'Instead of words, only sounds the pair agreed on beforehand.']
    },
    reflection: {
      de: ['Wie war es, sich ganz auf eine Stimme zu verlassen?', 'Welche Anweisungen waren am hilfreichsten?'],
      en: ['How was it to rely completely on one voice?', 'Which instructions were most helpful?']
    },
    animatorTips: {
      de: [
        'Sicherheit geht vor: Entfernt scharfkantige Gegenstände.',
        'Spannende Steigerung: Mehrere Paare gleichzeitig durch das Feld schicken – erfordert selektives Heraushören der eigenen Lotsenstimme.'
      ],
      en: [
        'Safety first: clear all sharp edges or tripping hazards.',
        'Challenge extension: have multiple pairs cross simultaneously, forcing travelers to filter out other voices.'
      ]
    }
  },

  // 15. Gemeinsame Geschichte (Ein-Wort- oder Ein-Satz-Geschichte)
  {
    id: 'ein-wort-geschichte',
    title: {
      de: 'Wortgeschichte',
      en: 'One-Word or One-Sentence Story'
    },
    subtitle: {
      de: 'Gemeinsame Geschichtenkette',
      en: 'Collaborative Story Chain'
    },
    purpose: 'kennenlernen',
    category: 'cooperative',
    energyLevel: 'calm',
    groupSize: { min: 4, max: 20 },
    prepLevel: 'instant',
    materials: {
      de: ['Keine'],
      en: ['None']
    },
    durationMinutes: '10–15 Min',
    durationMin: 10,
    durationMax: 15,
    space: {
      de: 'Sitzkreis',
      en: 'Seated circle'
    },
    summary: {
      de: 'Die Gruppe erfindet gemeinsam eine lebendige Geschichte im Kreis – entweder steuert jede Person genau ein Wort bei (schnell und überraschend) oder immer einen ganzen Satz (tiefer und erzählerischer).',
      en: 'The group collaboratively weaves a narrative in the circle – either each person adds exactly one word (brisk and unpredictable) or one full sentence (richer storytelling).'
    },
    idea: {
      de: 'Übt Zuhören und Spontaneität. Alle bauen auf dem auf, was andere sagen, statt die Geschichte an sich zu ziehen.',
      en: 'Practises listening and spontaneity. Everyone builds on what others say instead of taking over the story.'
    },
    rules: {
      de: [
        'Alle sitzen im Kreis. Die Spielleitung legt fest, welche Spielart gilt: „Wort für Wort“ oder „Satz für Satz“.',
        'Variante A (Wort für Wort): Reihum steuert jede Person genau ein einzelnes Wort bei, das grammatikalisch und sinnvoll an das vorherige anschließt.',
        'Variante B (Satz für Satz): Jede Person formuliert genau einen vollständigen Satz, der das Geschehen weitererzählt.',
        'Das Tempo sollte zügig sein: Nicht lange grübeln, sondern spontan auf den Gedanken der Vorgängerperson aufbauen.',
        'Ziel ist ein gemeinsamer roter Faden mit Einleitung, Höhepunkt und rundem Abschluss.'
      ],
      en: [
        'Sit in a circle. The facilitator announces the format: "Word by Word" or "Sentence by Sentence".',
        'Variant A (Word by Word): Going in sequence, each person contributes exactly one word connecting grammatically and semantically to the last.',
        'Variant B (Sentence by Sentence): Each person adds one full sentence advancing the storyline.',
        'Keep momentum brisk: react spontaneously without second-guessing.',
        'The shared goal is a coherent narrative arc with introduction, turning point, and resolution.'
      ]
    },
    animatorTips: {
      de: [
        'Zieht mit dem Web-Begleiter einen inspirierenden Geschichtenanfang als Startfunke.',
        '„Satz für Satz“ eignet sich wunderbar für tiefere, nachdenklichere Geschichten; „Wort für Wort“ sorgt für Lachen und blitzschnelle Konzentration.'
      ],
      en: [
        'Draw an inspiring opening line from the web companion to spark momentum.',
        '"Sentence by sentence" is ideal for deeper, thoughtful narratives; "word by word" brings laughter and lightning-fast focus.'
      ]
    }
  },

  // 16. Helium Stick
  {
    id: 'helium-stick',
    title: {
      de: 'Der schwebende Stab',
      en: 'Helium Stick'
    },
    subtitle: {
      de: 'Die schwebende Stange',
      en: 'Floating Rod'
    },
    purpose: 'zusammenarbeit',
    category: 'cooperative',
    energyLevel: 'calm',
    groupSize: { min: 8, max: 16 },
    prepLevel: 'materials_needed',
    materials: {
      de: ['Eine sehr leichte lange Stange (z. B. Bambusrohr oder leichte Zeltstange)'],
      en: ['A very light thin pole or bamboo stick']
    },
    durationMinutes: '15–25 Min',
    durationMin: 15,
    durationMax: 25,
    space: {
      de: 'Ausreichend Stehfläche',
      en: 'Enough room for two parallel standing lines'
    },
    summary: {
      de: 'Eine leichte Stange liegt auf den Zeigefingern aller Teilnehmer. Das Ziel: sie gemeinsam abzulegen. Doch der unwillkürliche Druck lässt sie nach oben steigen.',
      en: 'A lightweight stick rests across everyone’s index fingers. The goal is to lower it together, yet collective tension makes it rise.'
    },
    idea: {
      de: 'Zeigt, dass es nur klappt, wenn alle ruhig werden und sich aufeinander abstimmen.',
      en: 'Shows that it only works when everyone calms down and moves in step.'
    },
    rules: {
      de: [
        'Zwei Reihen stehen sich frontal gegenüber. Jeder streckt beide Zeigefinger waagerecht auf Brusthöhe aus.',
        'Die Stange wird auf die ausgestreckten Finger gelegt.',
        'Bedingung: Jeder Finger muss die Stange zu jeder Sekunde von unten berühren. Greifen ist verboten.',
        'Aufgabe: Die Stange bis auf den Boden absenken, ohne den Kontakt zu verlieren.',
        'Weil jeder unbewusst den Kontakt sichern möchte, wandert die Stange fast immer zuerst nach oben.'
      ],
      en: [
        'Two rows stand facing each other, pointing both index fingers horizontally at chest level.',
        'The stick is placed on top of all outstretched fingers.',
        'Rule: Every finger must stay in contact with the stick at all times. Pinching or grabbing is strictly forbidden.',
        'Objective: Lower the stick to the floor while maintaining continuous contact.',
        'Because each person subconsciously exerts slight upward force to keep contact, the stick inevitably ascends.'
      ]
    },
    animatorTips: {
      de: [
        'Verratet vorab nicht, dass die Stange nach oben steigen wird – die eigene Entdeckung ist der Schlüssel zum Lerneffekt.',
        'Hervorragender Einstieg für Reflexionsgespräche über kollektive Verantwortung und Geduld.'
      ],
      en: [
        'Never tell the group beforehand that the stick will rise—let them discover the paradox themselves.',
        'A great bridge for discussions on collective patience and letting go of individual control.'
      ]
    },
    isFavoriteDefault: true
  },

  // 17. Stand Up
  {
    id: 'stand-up-ruecken',
    title: {
      de: 'Gemeinsam aufstehen',
      en: 'Back-to-Back Stand Up'
    },
    subtitle: {
      de: 'Rücken an Rücken aufstehen',
      en: 'Stand up back to back'
    },
    purpose: 'energie',
    category: 'cooperative',
    energyLevel: 'high',
    groupSize: { min: 2, max: 40 },
    prepLevel: 'instant',
    materials: {
      de: ['Keine'],
      en: ['None']
    },
    durationMinutes: '10–15 Min',
    durationMin: 10,
    durationMax: 15,
    space: {
      de: 'Ebener Boden mit Bewegungsfreiheit',
      en: 'Flat ground with open space'
    },
    summary: {
      de: 'Zwei Personen sitzen Rücken an Rücken und müssen ohne Hände aufstehen. Danach zu viert, zu acht – bis die gesamte Gruppe synchron aufsteht.',
      en: 'Two players sit back-to-back and stand up without using their hands. Expand to quartets, then eight, until the whole group rises as one.'
    },
    idea: {
      de: 'Übt gegenseitiges Stützen und gleichzeitiges Handeln. Allein fällt man um, zusammen klappt es.',
      en: 'Practises supporting each other and moving together. Alone you fall over, together it works.'
    },
    rules: {
      de: [
        'Zwei Personen setzen sich Rücken an Rücken auf den Boden, die Ellenbogen ineinander verhakt.',
        'Aufgabe: Gemeinsam aufstehen, ohne mit den Händen den Boden zu berühren.',
        'Beide müssen gleichzeitig kräftig mit dem Rücken gegeneinander drücken und die Beine beugen.',
        'Klappt es zu zweit? Verdoppeln auf vier Personen, dann acht Personen.',
        'Das Finale: Gelingt es dem gesamten Kreis aller Jugendlichen gleichzeitig?'
      ],
      en: [
        'Two participants sit on the floor back-to-back, elbows interlocked.',
        'Objective: Rise to a full standing posture without using hands on the floor.',
        'Both must press firmly against each other while bending their knees in unison.',
        'Once mastered, double to 4 players, then 8 players.',
        'Final challenge: Can the entire circle of participants rise simultaneously?'
      ]
    },
    animatorTips: {
      de: [
        'Auf rutschfeste Socken oder Schuhe achten.',
        'Den Start-Countdown („3, 2, 1, Druck!“) laut und synchron vorgeben.'
      ],
      en: [
        'Ensure non-slip shoes or socks.',
        'Give a clear, loud countdown ("3, 2, 1, push!") so movement occurs at the exact same instant.'
      ]
    }
  },

  // 18. Schweigend sortieren (Stumme Reihe)
  {
    id: 'stumme-reihe',
    title: {
      de: 'Schweigend sortieren',
      en: 'Silent Sort'
    },
    subtitle: {
      de: 'Die stumme Reihe',
      en: 'Silent Lineup'
    },
    purpose: 'kennenlernen',
    category: 'cooperative',
    energyLevel: 'calm',
    groupSize: { min: 6, max: 35 },
    prepLevel: 'instant',
    materials: {
      de: ['Keine'],
      en: ['None']
    },
    durationMinutes: '10–15 Min',
    durationMin: 10,
    durationMax: 15,
    space: {
      de: 'Ausreichend Raumlänge',
      en: 'Room length for a single file line'
    },
    summary: {
      de: 'Die Gruppe muss sich nach einem Kriterium (z. B. Geburtstag, Hausnummer oder Schuhgröße) in einer Reihe aufstellen – ohne ein einziges Wort zu sprechen.',
      en: 'The group must order themselves in a single line by a specific metric (e.g. birthday, house number, or shoe size) without speaking a single word.'
    },
    idea: {
      de: 'Übt Verständigung ohne Worte, mit Gesten und Blicken.',
      en: 'Practises communicating without words, using gestures and eye contact.'
    },
    rules: {
      de: [
        'Die Spielleitung wählt ein Sortierkriterium (z. B. mit dem Web-Begleiter nach Geburtstag, Hausnummer, Schuhgröße oder Schlafdauer).',
        'Mit dem Startsignal gilt absolutes Sprechverbot. Auch Lippenlesen oder Flüstern ist untersagt.',
        'Die Gruppe darf nur über Zeichensprache, Gesten und Fingerzeichen kommunizieren.',
        'Sobald alle in einer geraden Reihe stehen, wird von vorne nach hinten laut aufgelöst und kontrolliert.'
      ],
      en: [
        'The facilitator announces the sorting criteria (e.g. with the web companion by birthday, house number, shoe size, or sleep hours).',
        'Upon the signal, absolute silence begins. No whispering or overt lip-reading.',
        'Participants communicate strictly via hand gestures, finger counting, and body language.',
        'Once the line settles, players announce their numbers sequentially from front to back to verify accuracy.'
      ]
    },
    variants: {
      de: ['Mit geschlossenen Augen: Ihr sortiert euch nur durch Berührung, zum Beispiel nach Körpergröße.'],
      en: ['With eyes closed: sort yourselves by touch only, for example by height.']
    },
    reflection: {
      de: ['Welche Zeichen habt ihr erfunden, und wer hat sie zuerst verstanden?'],
      en: ['Which signs did you invent, and who understood them first?']
    },
    animatorTips: {
      de: [
        'Nutze den Web-Begleiter („Jetzt spielen“), um Kriterien nach Kategorien (Zahlen, Alltag, Sprache, Vorlieben) zu ziehen.',
        'Stoppt die Zeit: „Schaffen wir es unter 60 Sekunden fehlerfrei?“',
        'Steigerung für Fortgeschrittene: Alle stehen auf einer Bank oder einer Linie und dürfen beim Sortieren den Boden daneben nicht berühren.'
      ],
      en: [
        'Use the web companion ("Play now") to draw criteria sorted by categories (numbers, daily life, language, preferences).',
        'Time the attempt: "Can we achieve a flawless line in under 60 seconds?"',
        'Advanced variation: Have the group stand on a narrow bench or tape line without stepping off.'
      ]
    }
  },

  // 19. Eisschollen-Rettung
  {
    id: 'eisschollen-rettung',
    title: {
      de: 'Eisschollen-Rettung',
      en: 'Ice Flow Crossing'
    },
    subtitle: {
      de: 'Flussüberquerung',
      en: 'River Crossing'
    },
    purpose: 'zusammenarbeit',
    category: 'cooperative',
    energyLevel: 'high',
    groupSize: { min: 6, max: 20 },
    prepLevel: 'low_prep',
    materials: {
      de: ['A4-Blätter, Teppichfliesen oder Kissen (weniger Schollen als Personen!)'],
      en: ['Sheets of paper, carpet tiles, or mats (fewer tiles than people)']
    },
    durationMinutes: '15–20 Min',
    durationMin: 15,
    durationMax: 20,
    space: {
      de: 'Raum mit 8–10 Metern Länge',
      en: 'Room or lawn 8–10 meters wide'
    },
    summary: {
      de: 'Die Gruppe muss einen Fluss überqueren, hat aber weniger Trittflächen als Personen. Bleibt eine Scholle unberührt, schmilzt sie weg.',
      en: 'The group must cross an open expanse with fewer stepping platforms than people. Leave a tile empty, and it vanishes.'
    },
    idea: {
      de: 'Übt Planen mit wenig Mitteln und enges Zusammenarbeiten.',
      en: 'Practises planning with few resources and working closely together.'
    },
    rules: {
      de: [
        'Start- und Ziellinie liegen ca. 8 Meter auseinander.',
        'Die Gruppe erhält Trittflächen (z. B. 6 Blätter für 10 Personen).',
        'Eine Trittfläche bleibt nur im Spiel, solange mindestens ein Fuß darauf steht. Ist sie unberührt, nimmt die Leitung sie weg.',
        'Ziel: Alle Gruppenmitglieder erreichen die Ziellinie unversehrt.',
        'Tritt jemand auf den Boden, muss die gesamte Gruppe zurück an den Start.'
      ],
      en: [
        'A start and finish line are marked approximately 8 meters apart.',
        'The team is given stepping tiles (e.g. 6 sheets for 10 players).',
        'A tile only stays in play while at least one foot touches it. If left unattended for a second, it melts away.',
        'Objective: Transport every member across the finish line safely.',
        'If any foot touches the open ground, the group returns to start.'
      ]
    },
    intro: {
      de: 'Das Eis bricht. Nur auf den Schollen kommt ihr ans rettende Ufer, und sie treiben weg, sobald niemand darauf steht.',
      en: 'The ice is breaking. Only the floes can carry you to the safe shore, and they drift away as soon as nobody stands on them.'
    },
    variants: {
      de: ['Zwei Personen dürfen nicht sprechen.', 'Eine Person hat die Augen verbunden und wird von den anderen geführt.'],
      en: ['Two people may not speak.', 'One person is blindfolded and guided by the others.']
    },
    reflection: {
      de: ['Wie habt ihr darauf geachtet, dass niemand zurückbleibt?'],
      en: ['How did you make sure nobody was left behind?']
    },
    animatorTips: {
      de: [
        'Die Gruppe begreift schnell, dass man Schollen nach vorne durchreichen und sich gegenseitig stützen muss.',
        'Auf rutschfeste Unterlagen achten.'
      ],
      en: [
        'Teams quickly realize they must pass unused tiles forward while balancing together.',
        'Ensure the floor surface is safe and non-slippery.'
      ]
    }
  },

  // 20. Lebender Balltransport (Pipelines)
  {
    id: 'lebender-balltransport',
    title: {
      de: 'Kugelbahn',
      en: 'Pipelines'
    },
    subtitle: {
      de: 'Der lebende Balltransport',
      en: 'Living Ball Transport'
    },
    purpose: 'zusammenarbeit',
    category: 'cooperative',
    energyLevel: 'high',
    groupSize: { min: 8, max: 25 },
    prepLevel: 'materials_needed',
    materials: {
      de: ['Halbierte Rohrstücke oder gefaltete A4-Pappen', 'Ein Tischtennis- oder Golfball', 'Zielbehälter'],
      en: ['Half-pipe tubes or folded cardstock', 'A ping pong or golf ball', 'Target cup']
    },
    durationMinutes: '15–25 Min',
    durationMin: 15,
    durationMax: 25,
    space: {
      de: 'Flur, Saal oder Wiese',
      en: 'Long hallway, hall, or lawn'
    },
    summary: {
      de: 'Ein rollender Ball muss über eine lange Strecke transportiert werden, indem die Spieler ihre kurzen Rohrstücke blitzschnell neu aneinanderreihen.',
      en: 'A rolling ball must travel across a long distance by players sprinting to recombine short gutter pipes.'
    },
    idea: {
      de: 'Übt saubere Übergaben und Einsatz für das gemeinsame Ziel. Alle müssen immer wieder nach vorn laufen.',
      en: 'Practises clean handovers and effort for the shared goal. Everyone keeps running to the front.'
    },
    rules: {
      de: [
        'Jede Person hält eine kurze Rinne in beiden Händen.',
        'Der Ball wird am Start in die erste Rinne gelegt und rollt los.',
        'Bedingungen: Der Ball darf weder stoppen noch rückwärts rollen oder mit Händen berührt werden.',
        'Sobald der Ball die eigene Rinne verlassen hat, muss man sofort ans vordere Ende der Kette sprinten, um die Pipeline zu verlängern.',
        'Ziel: Den Ball unversehrt im 15 Meter entfernten Zielbecher versenken.'
      ],
      en: [
        'Each player holds a short gutter channel with both hands.',
        'The ball is released into the first channel at the start line.',
        'Rules: The ball may not stop, roll backward, or be touched by hands.',
        'As soon as the ball clears your channel, sprint immediately to the front of the line to extend the pipe.',
        'Objective: Safely deposit the ball into the target bucket 15 meters away.'
      ]
    },
    animatorTips: {
      de: [
        'Alternative ohne Material: Der Ball muss mit flachen Händen weitergegeben werden, ohne dass er fällt.',
        'Ein Gefälle einbauen, um das Roll-Tempo zu steuern.'
      ],
      en: [
        'No-equipment variation: Pass the ball hand-to-hand with flat palms without grasping.',
        'Adjust the slope of the channels to manage the ball’s rolling speed.'
      ]
    }
  },

  // 21. Blindes Quadrat
  {
    id: 'blindes-quadrat',
    title: {
      de: 'Das blinde Quadrat',
      en: 'The Blind Square'
    },
    purpose: 'zusammenarbeit',
    category: 'cooperative',
    energyLevel: 'calm',
    groupSize: { min: 6, max: 18 },
    prepLevel: 'materials_needed',
    materials: {
      de: ['Ein langes Seil (10–15 Meter, verknotet)', 'Augenbinden für alle'],
      en: ['A long knotted rope (10–15 meters)', 'Blindfolds for all']
    },
    durationMinutes: '15–25 Min',
    durationMin: 15,
    durationMax: 25,
    space: {
      de: 'Freie Raumfläche',
      en: 'Open floor space'
    },
    summary: {
      de: 'Die Gruppe hält ein langes Seil und muss mit verbundenen Augen ein geometrisch exaktes Quadrat mit rechten Winkeln auf dem Boden formen.',
      en: 'Blindfolded participants holding a loop of rope must coordinate to shape it into a geometrically precise square on the floor.'
    },
    idea: {
      de: 'Übt Absprachen ohne Sicht. Zeigt, wer führt und wie die anderen mitgehen.',
      en: 'Practises agreeing without sight. Shows who leads and how the others follow.'
    },
    rules: {
      de: [
        'Alle stehen im Kreis und halten das Seil mit beiden Händen.',
        'Alle setzen die Augenbinden auf (oder schließen fest die Augen).',
        'Aufgabe: Das Seil so bewegen und ausrichten, dass ein Quadrat mit vier gleichen Seiten und rechten Winkeln entsteht.',
        'Die Hände dürfen das Seil entlanggleiten, aber der Kontakt zum Seil darf nie ganz verloren gehen.',
        'Erst wenn die Gruppe einstimmig beschließt, fertig zu sein, wird das Seil abgelegt und die Binden abgenommen.'
      ],
      en: [
        'Everyone stands in a circle holding the rope with both hands.',
        'All participants put on blindfolds or close eyes tightly.',
        'Objective: Move and align into a square with four equal sides and right angles.',
        'Hands may slide along the rope, but contact must never be broken.',
        'Only when the group unanimously agrees they are finished do they lay the rope down and take off blindfolds.'
      ]
    },
    variants: {
      de: ['Statt eines Quadrats ein Dreieck oder einen Stern legen.', 'Nur eine Person darf sprechen. Die Gruppe wählt sie vorher.'],
      en: ['Make a triangle or a star instead of a square.', 'Only one person may speak. The group chooses them beforehand.']
    },
    safety: {
      de: ['Sorge dafür, dass niemand mit verbundenen Augen rückwärts gegen Wand oder Möbel läuft.'],
      en: ['Make sure nobody blindfolded walks backwards into a wall or furniture.']
    },
    reflection: {
      de: ['Wie seid ihr zu einer Entscheidung gekommen?', 'Wer hat viel gesagt, wer wenig, und warum?'],
      en: ['How did you reach a decision?', 'Who said a lot, who said little, and why?']
    },
    animatorTips: {
      de: [
        'Achtet darauf, ob eine Person das Kommando übernimmt oder ob Ideen konstruktiv zusammenfließen.',
        'Nachher reflektieren: Wie haben wir die Ecken gefunden?'
      ],
      en: [
        'Observe how leadership emerges: does one voice dominate or do ideas synthesize constructively?',
        'Debrief afterwards: How did we locate and define the four corner points?'
      ]
    }
  },

  // 22. Decke wenden
  {
    id: 'decke-wenden',
    title: {
      de: 'Decke wenden',
      en: 'Turn the Tarp'
    },
    subtitle: {
      de: 'Der fliegende Teppich',
      en: 'Flying Carpet'
    },
    purpose: 'zusammenarbeit',
    category: 'cooperative',
    energyLevel: 'medium',
    groupSize: { min: 6, max: 16 },
    prepLevel: 'materials_needed',
    materials: {
      de: ['Eine Decke, Plane oder großes Tuch'],
      en: ['A blanket, tarp, or large sheet']
    },
    durationMinutes: '12–20 Min',
    durationMin: 12,
    durationMax: 20,
    space: {
      de: 'Fester Boden',
      en: 'Solid flat floor'
    },
    summary: {
      de: 'Die gesamte Gruppe steht auf einer ausgebreiteten Decke und muss diese auf die Unterseite wenden, ohne dass jemand den Boden daneben berührt.',
      en: 'The entire group stands on a blanket and must flip it completely over to its reverse side without anyone stepping off.'
    },
    idea: {
      de: 'Übt Festhalten und Rücksicht auf engem Raum.',
      en: 'Practises holding on to each other and taking care in a tight space.'
    },
    rules: {
      de: [
        'Die Decke liegt flach auf dem Boden. Alle Teilnehmenden stellen sich darauf.',
        'Der Boden außerhalb des Stoffs ist tabu.',
        'Aufgabe: Die Decke komplett umdrehen, sodass am Ende die Unterseite oben liegt.',
        'Durch schrittweises Zusammenrücken, Huckepacknehmen und Umschlagen der Kanten arbeitet sich das Team voran.',
        'Berührt ein Fuß den Boden außerhalb der Decke, beginnt der Versuch von vorn.'
      ],
      en: [
        'Spread the blanket flat. All participants stand completely on top of it.',
        'The floor surrounding the fabric is strictly off-limits.',
        'Objective: Flip the blanket entirely over so the original underside faces up.',
        'Participants shuffle, lift one another, and fold corners underneath their feet.',
        'If any foot touches the floor outside the fabric, the attempt resets.'
      ]
    },
    animatorTips: {
      de: [
        'Die Decke so wählen, dass alle Personen gerade so bequem darauf Platz finden.',
        'Auf vorsichtige Bewegungen achten, um Umknicken zu vermeiden.'
      ],
      en: [
        'Choose a blanket sized so the group just fits comfortably without excess margin.',
        'Emphasize slow, steady weight transfers to avoid tripping.'
      ]
    }
  },

  // 23. 100-Schläge-Ball
  {
    id: '100-schlaege-ball',
    title: {
      de: '100-Schläge-Ball',
      en: 'Keep It Up'
    },
    subtitle: {
      de: 'Ball in der Luft',
      en: '100 Hits'
    },
    purpose: 'energie',
    category: 'cooperative',
    energyLevel: 'high',
    groupSize: { min: 6, max: 30 },
    prepLevel: 'materials_needed',
    materials: {
      de: ['Ein leichter Softball, Volleyball oder Luftballon'],
      en: ['A light foam ball, volleyball, or balloon']
    },
    durationMinutes: '10–15 Min',
    durationMin: 10,
    durationMax: 15,
    space: {
      de: 'Freie Raumhöhe',
      en: 'Room with open ceiling or lawn'
    },
    summary: {
      de: 'Die Gruppe hält einen Ball durch Schlagen gemeinsam in der Luft, bis eine Zielmarke (z. B. 50 oder 100 Kontakte) erreicht ist.',
      en: 'The group keeps a ball airborne through consecutive taps until reaching a shared goal (e.g. 50 or 100 touches).'
    },
    idea: {
      de: 'Bringt Bewegung in die Gruppe. Alle arbeiten auf eine gemeinsame Zahl hin.',
      en: 'Gets the group moving. Everyone works towards a shared number.'
    },
    rules: {
      de: [
        'Alle stehen verteilt im Raum.',
        'Ein Ball wird in die Luft geworfen. Die Gruppe zählt jeden Schlag laut mit.',
        'Niemand darf den Ball zweimal hintereinander berühren.',
        'Idealerweise muss jeder mindestens einmal beteiligt sein, bevor jemand ein zweites Mal schlägt.',
        'Berührt der Ball den Boden oder die Wand, wird der Zähler auf Null zurückgesetzt.'
      ],
      en: [
        'Scatter comfortably around the room.',
        'Toss the ball in the air. The group counts each successful tap aloud together.',
        'No person may hit the ball twice consecutively.',
        'Ideally, all participants should contribute a touch before repeats occur.',
        'If the ball touches the floor or walls, the counter resets to zero.'
      ]
    },
    animatorTips: {
      de: [
        'Mit 30 Kontakten starten und die Zielmarke schrittweise steigern.',
        'Drinnen auf Deckenlampen achten; mit weichen Softbällen spielen.'
      ],
      en: [
        'Set an initial milestone of 30 hits and gradually elevate the bar.',
        'Use soft foam balls indoors to protect ceiling fixtures.'
      ]
    }
  },

  // 24. Blindes Sortieren nach Zahlen
  {
    id: 'blindes-zahlen-sortieren',
    title: {
      de: 'Blindes Sortieren nach Zahlen',
      en: 'Blind Number Sequence'
    },
    purpose: 'zusammenarbeit',
    category: 'cooperative',
    energyLevel: 'medium',
    groupSize: { min: 8, max: 25 },
    prepLevel: 'low_prep',
    materials: {
      de: ['Zettel mit Zahlen (z. B. 1–100, unregelmäßig vergeben)', 'Klebeband'],
      en: ['Slips with numbers (e.g. 1–100, non-consecutive)', 'Tape']
    },
    durationMinutes: '12–18 Min',
    durationMin: 12,
    durationMax: 18,
    space: {
      de: 'Freie Raumfläche',
      en: 'Open floor space'
    },
    summary: {
      de: 'Jeder hat eine geheime Zahl auf Stirn oder Rücken, kennt aber nur die Zahlen der anderen. Ohne Worte muss eine aufsteigende Reihe gebildet werden.',
      en: 'Each person wears a number they cannot see, visible only to others. In silence, they must organize themselves in ascending order.'
    },
    idea: {
      de: 'Du siehst nur die Zahlen der anderen. Es klappt nur, wenn alle einander helfen, den richtigen Platz zu finden.',
      en: 'You only see the others’ numbers. It only works if everyone helps each other find the right place.'
    },
    rules: {
      de: [
        'Jede Person bekommt verdeckt eine Zahl auf die Stirn oder den Rücken geklebt.',
        'Niemand kennt die eigene Zahl, sieht aber die Nummern aller Mitspieler.',
        'Sprechen ist strengstens verboten.',
        'Durch stummes Dirigieren, Zeigen und gegenseitiges Führen ordnet die Gruppe alle Personen in eine aufsteigende Reihe.',
        'Am Ende liest jeder seine Zahl von klein nach groß vor – fehlerfrei?'
      ],
      en: [
        'Tape a number card to each participant’s forehead or back.',
        'No one knows their own number, but everyone sees everyone else’s.',
        'Speaking is strictly prohibited.',
        'Using silent guiding and gestures, participants arrange each other in an ascending sequence.',
        'At the end, players reveal their numbers from lowest to highest to check.'
      ]
    },
    animatorTips: {
      de: [
        'Verwendet nicht-fortlaufende Zahlen (z. B. 3, 14, 27, 42, 88), damit man logisch vergleichen muss.',
        'Schöne Reflexionsbrücke: „Wie fühlt es sich an, wenn andere einen an den richtigen Platz führen?“'
      ],
      en: [
        'Use non-consecutive numbers (e.g. 4, 17, 29, 63, 91) to require comparative logic.',
        'Great reflection question: "How does it feel to rely on others to show you your place?"'
      ]
    }
  },

  // 25. Der elektrische Zaun
  {
    id: 'elektrischer-zaun',
    title: {
      de: 'Der elektrische Zaun',
      en: 'The Electric Fence'
    },
    purpose: 'zusammenarbeit',
    category: 'cooperative',
    energyLevel: 'medium',
    groupSize: { min: 8, max: 18 },
    prepLevel: 'materials_needed',
    materials: {
      de: ['Ein Seil oder Flatterband, gespannt auf 1,00 bis 1,20 m Höhe'],
      en: ['A rope or ribbon tensioned at 1.0 to 1.2 meters height']
    },
    durationMinutes: '20–30 Min',
    durationMin: 20,
    durationMax: 30,
    space: {
      de: 'Draußen / Turnhalle',
      en: 'Outdoor lawn or gymnasium'
    },
    summary: {
      de: 'Die gesamte Gruppe muss ein Seil auf Brusthöhe überwinden. Untendurch ist verboten. Berührt jemand das Seil, müssen alle zurück.',
      en: 'The entire team must cross over a chest-high rope without touching it or going underneath.'
    },
    idea: {
      de: 'Übt Vertrauen, Heben und Sichern. Alle sind für die Sicherheit der anderen verantwortlich.',
      en: 'Practises trust, lifting and spotting. Everyone is responsible for the others’ safety.'
    },
    rules: {
      de: [
        'Ein Seil wird zwischen zwei Bäumen oder Pfosten auf ca. 1,10 m gespannt.',
        'Aufgabe: Alle Gruppenmitglieder müssen auf die andere Seite des Zauns gelangen.',
        'Bedingungen: Niemand darf unter dem Seil durch. Niemand darf das Seil mit Körper oder Kleidung berühren. An den Pfosten vorbeigehen ist tabu.',
        'Die Gruppe muss Strategien entwickeln: Wen hebt man zuerst rüber? Wer fängt auf der anderen Seite auf? Und wie kommt die letzte Person alleine hinüber?'
      ],
      en: [
        'Tension a rope between two trees or posts at roughly 1.1 meters.',
        'Objective: Transport all group members to the other side of the fence.',
        'Rules: No passing underneath. No touching the rope with body or clothing. No walking around posts.',
        'The team devises spotting strategies: who is lifted first, who catches on the other side, and how the final person crosses.'
      ]
    },
    animatorTips: {
      de: [
        'Sicherheit hat oberste Priorität! Klare Instruktion: Wer gehoben wird, wird von mindestens vier Händen gesichert. Nicht auf den Kopf stürzen lassen.',
        'Bei Bedarf die Höhe an das Alter der Jugendlichen anpassen.'
      ],
      en: [
        'Safety is absolute priority: ensure dedicated spotters with hands up ready to support lifted participants.',
        'Adjust rope height appropriately for younger adolescents.'
      ]
    }
  },

  // 27. Säuresee
  {
    id: 'saeuresee',
    title: {
      de: 'Der Säuresee',
      en: 'The Acid River'
    },
    subtitle: {
      de: 'Schwebender Transport',
      en: 'Suspended Transport'
    },
    purpose: 'zusammenarbeit',
    category: 'cooperative',
    energyLevel: 'calm',
    groupSize: { min: 6, max: 16 },
    prepLevel: 'materials_needed',
    materials: {
      de: ['Lange Schnüre oder Seile', 'Ein voller Wasserbecher oder Holzklotz', 'Bodenmarkierung für den Kreis'],
      en: ['Long ropes or strings', 'A cup of water or wooden block', 'Rope/chalk boundary']
    },
    durationMinutes: '20–30 Min',
    durationMin: 20,
    durationMax: 30,
    space: {
      de: 'Freie Bodenfläche (min. 5x5 Meter)',
      en: 'Floor area (at least 5x5 meters)'
    },
    summary: {
      de: 'Ein Gegenstand steht in der Mitte einer 4 Meter breiten Sperrzone und muss rein über Seilzüge geborgen werden, ohne den Boden zu betreten.',
      en: 'An object rests inside an off-limits zone and must be recovered purely using tensioned ropes without stepping inside.'
    },
    idea: {
      de: 'Übt gemeinsames Planen. Ruhige Absprachen bringen mehr als Hektik.',
      en: 'Practises planning together. Calm agreement helps more than rushing.'
    },
    rules: {
      de: [
        'Ein Kreis mit 3–4 Metern Durchmesser wird markiert – dieser Bereich darf von niemandem betreten werden.',
        'In der Mitte steht ein Becher oder Gegenstand.',
        'Die Gruppe erhält Seile, die sie außerhalb des Kreises führen und verknoten darf.',
        'Ziel: Den Becher anheben und unversehrt über den Rand transportieren.',
        'Fällt der Gegenstand oder betritt jemand den Kreis, beginnt der Versuch von vorn.'
      ],
      en: [
        'A circle of 3–4 meters diameter is marked out—no one may touch the ground inside.',
        'In the center sits a cup of water or targeted object.',
        'The team receives ropes that they may hold, loop, or knot strictly from outside the boundary.',
        'Objective: Lift the item and guide it across the perimeter safely.',
        'If the item spills or someone touches inside the circle, the team resets.'
      ]
    },
    animatorTips: {
      de: [
        'Gebt der Gruppe vorab 3 Minuten reine Beratungszeit, in der noch kein Seil berührt werden darf.',
        'Nach der Übung reflektieren: Wie wurden Ideen gesammelt? Wurden alle Stimmen gehört?'
      ],
      en: [
        'Give the group 3 minutes of uninterrupted consultation before touching any equipment.',
        'Debrief afterwards: How were ideas evaluated? Did quieter voices get heard?'
      ]
    },
    isFavoriteDefault: true
  },

  // 28. Stille Matrix
  {
    id: 'stille-matrix',
    title: {
      de: 'Die stille Matrix',
      en: 'The Silent Matrix'
    },
    subtitle: {
      de: 'Das unsichtbare Labyrinth',
      en: 'Invisible Maze'
    },
    purpose: 'ruhe',
    category: 'cooperative',
    energyLevel: 'calm',
    groupSize: { min: 6, max: 20 },
    prepLevel: 'low_prep',
    materials: {
      de: ['Kreide oder Seile für ein 4x4-Raster auf dem Boden', 'Geheimer Plan für die Spielleitung'],
      en: ['Chalk or ropes for a 4x4 floor grid', 'Secret path map for the facilitator']
    },
    durationMinutes: '20–30 Min',
    durationMin: 20,
    durationMax: 30,
    space: {
      de: 'Freie Bodenfläche',
      en: 'Open floor space'
    },
    summary: {
      de: 'Die Gruppe muss ein unsichtbares Labyrinth auf einem Bodenraster durchqueren. Falsche Schritte lösen ein Signal aus – der Pfad erschließt sich rein aus dem kollektiven Gedächtnis.',
      en: 'The team crosses an invisible maze on a floor grid. Wrong steps trigger a buzzer sound; the correct path is uncovered purely via collective memory.'
    },
    idea: {
      de: 'Übt Beobachten und Merken. Jeder Fehler zeigt allen den Weg.',
      en: 'Practises watching and remembering. Every mistake shows everyone the way.'
    },
    rules: {
      de: [
        'Ein 4x4- oder 5x5-Raster wird am Boden markiert. Nur die Spielleitung kennt die geheime, zusammenhängende Route von Start nach Ziel.',
        'Eine Person betritt das erste Feld. Ist es richtig, nickt die Leitung stumm. Ist es falsch, ertönt ein Signalton („Piep!“).',
        'Bei einem Fehler muss die Person das Raster verlassen und sich hinten anstellen.',
        'Die nächste Person startet von vorn. Ab dem Betreten gilt absolutes Sprechverbot.',
        'Ziel: Die gesamte Gruppe gelangt nacheinander auf dem fehlerfreien Pfad auf die andere Seite.'
      ],
      en: [
        'A 4x4 or 5x5 grid is marked on the floor. Only the facilitator possesses the secret valid path.',
        'A player steps onto an entry tile. If correct, the leader nods silently. If incorrect, a buzzer sound is made.',
        'On an error, the player steps off the grid and returns to the back of the queue.',
        'The next player starts from the beginning. Total silence is observed while someone is on the grid.',
        'Objective: Guide every member across the maze along the discovered route.'
      ]
    },
    animatorTips: {
      de: [
        'Das Sprechverbot während des Gehens zwingt alle zum aufmerksamen Zuschauen.',
        'Ermutigt die Gruppe: Fehler sind keine Niederlagen, sondern wichtige Wegweiser.'
      ],
      en: [
        'The silence rule during crossing forces everyone to watch intently.',
        'Reinforce the mindset that mistakes are valuable signposts for the whole team.'
      ]
    }
  },

  // 29. Die schrumpfende Insel
  {
    id: 'schrumpfende-insel',
    title: {
      de: 'Die schrumpfende Insel',
      en: 'The Shrinking Island'
    },
    purpose: 'zusammenarbeit',
    category: 'cooperative',
    energyLevel: 'medium',
    groupSize: { min: 6, max: 20 },
    prepLevel: 'low_prep',
    materials: {
      de: ['Eine Plane, Seile oder Kreide zur Flächenbegrenzung'],
      en: ['Tarp, ropes, or chalk boundary']
    },
    durationMinutes: '10–15 Min',
    durationMin: 10,
    durationMax: 15,
    space: {
      de: 'Bodenfläche',
      en: 'Floor area'
    },
    summary: {
      de: 'Die gesamte Gruppe muss auf einer Bodenfläche stehen, die nach jeder erfolgreichen Runde halbiert wird. Erfordert Stützen, Tragen und Zusammenhalt.',
      en: 'The entire group stands on a defined ground space that shrinks by half after each round, requiring mutual support and balance.'
    },
    idea: {
      de: 'Übt Halten und Helfen auf engem Raum.',
      en: 'Practises holding and helping each other in a small space.'
    },
    rules: {
      de: [
        'Alle stehen auf einer markierten Fläche (z. B. eine ausgebreitete Plane).',
        'Die Gruppe muss 5 Sekunden lang ohne Bodenberührung außerhalb der Insel stabil stehen.',
        'Nach jedem erfolgreichen Durchgang wird die Plane halbiert (zusammengefaltet).',
        'Die Jugendlichen müssen sich gegenseitig stützen, tragen oder Huckepack nehmen, um das Gleichgewicht aller zu sichern.',
        'Wie klein kann die Insel werden, bevor jemand den Boden berührt?'
      ],
      en: [
        'Everyone stands inside a marked area (e.g. an unfolded tarp).',
        'The group must hold their balance for 5 seconds without anyone touching the floor outside.',
        'After each successful round, fold the tarp in half.',
        'Participants hold on to one another, balance on one leg, or piggyback to keep everyone aloft.',
        'How small can the island become while still holding everyone safely?'
      ]
    },
    animatorTips: {
      de: [
        'Auf Sicherheit achten: Sanftes Stützen, keine gefährlichen Sprünge.',
        'Schafft sofort eine fröhliche, gelöste Camp-Atmosphäre.'
      ],
      en: [
        'Prioritize safety: gentle balance, no dangerous acrobatics.',
        'Quickly creates a warm, connected atmosphere in the group.'
      ]
    }
  },

  // =========================================================================
  // 2. ENERGIZER & DYNAMISCHES AUFWÄRMEN - 2 SPIELE
  // =========================================================================
  // 7. Schnick Schnack Schnuck Evolution
  {
    id: 'ssp-evolution',
    title: {
      de: 'Schnick-Schnack-Schnuck Evolution',
      en: 'Rock Paper Scissors Evolution'
    },
    purpose: 'energie',
    category: 'energizer',
    energyLevel: 'high',
    groupSize: { min: 8, max: 60 },
    prepLevel: 'instant',
    materials: {
      de: ['Keine'],
      en: ['None']
    },
    durationMinutes: '5–10 Min',
    durationMin: 5,
    durationMax: 10,
    space: {
      de: 'Freie Fläche (drinnen oder draußen)',
      en: 'Open space (indoor or outdoor)'
    },
    summary: {
      de: 'Alle beginnen auf Stufe 1 am Boden und steigen durch gewonnene Duelle über Huhn und Affe bis zum aufrechten Menschen auf.',
      en: 'Everyone begins crouching on level 1, advancing through duels from egg to chicken, ape, and upright human.'
    },
    idea: {
      de: 'Ein schneller Einstieg mit Bewegung. Alle kommen sofort miteinander ins Spiel.',
      en: 'A quick start with movement. Everyone plays with everyone right away.'
    },
    rules: {
      de: [
        'Alle starten auf Stufe 1 als „Ei“ (in der Hocke watschelnd).',
        'Man sucht sich ein anderes Ei und spielt eine Runde Schere-Stein-Papier.',
        'Wer gewinnt, steigt eine Entwicklungsstufe auf: Ei ➔ Huhn (mit den Armen gackernd) ➔ Affe (hüpfend) ➔ Mensch (aufrecht, gibt die Hand).',
        'Wer verliert, bleibt auf der Stufe und sucht sofort einen neuen Spielpartner auf gleicher Stufe.',
        'Wer als Mensch das Duell gewinnt, hat die Evolution gemeistert und feuert die anderen an.'
      ],
      en: [
        'Everyone starts at level 1 as an "Egg" (waddling in a low crouch).',
        'Find another egg and play one round of Rock-Paper-Scissors.',
        'The winner advances one stage: Egg ➔ Chicken (flapping elbows) ➔ Ape (hopping) ➔ Human (standing tall, shaking hands).',
        'The player who does not win stays on their current stage and immediately looks for another player at the same level.',
        'Humans who win their duel have completed the evolution and step to the side to cheer.'
      ]
    },
    animatorTips: {
      de: [
        'Gruppenleiter sollten die Haltungen und Laute selbst mit Humor vormachen – das nimmt den Jugendlichen sofort die Befangenheit.',
        'Darauf achten, dass immer nur Spieler auf derselben Stufe gegeneinander antreten.'
      ],
      en: [
        'Facilitators should enthusiastically demonstrate the movement styles—this immediately relieves self-consciousness.',
        'Ensure participants only challenge peers on the exact same developmental stage.'
      ]
    },
    isFavoriteDefault: true
  },

  // 26. Das synchronisierte Klatschen (Impuls-Kreis)
  {
    id: 'impuls-kreis',
    title: {
      de: 'Der Impuls-Kreis',
      en: 'Synchronized Clapping Circle'
    },
    subtitle: {
      de: 'Synchron-Klatschen',
      en: 'Impulse Pass'
    },
    purpose: 'energie',
    category: 'energizer',
    energyLevel: 'high',
    groupSize: { min: 6, max: 30 },
    prepLevel: 'instant',
    materials: {
      de: ['Keine'],
      en: ['None']
    },
    durationMinutes: '5–10 Min',
    durationMin: 5,
    durationMax: 10,
    space: {
      de: 'Kreis',
      en: 'Circle'
    },
    summary: {
      de: 'Ein Klatsch-Impuls wandert blitzschnell im Kreis, indem zwei benachbarte Personen immer absolut synchron in die Hände klatschen.',
      en: 'A clapping impulse travels around the circle: two neighbors make direct eye contact and clap simultaneously.'
    },
    idea: {
      de: 'Übt Blickkontakt, Rhythmus und schnelle Reaktion.',
      en: 'Practises eye contact, rhythm and quick reactions.'
    },
    rules: {
      de: [
        'Alle stehen im geschlossenen Kreis.',
        'Person A dreht sich zu Person B; beide schauen sich in die Augen und klatschen exakt im selben Augenblick synchron in die Hände.',
        'Sofort dreht sich B zu C um und klatscht synchron mit C.',
        'Ziel: Der Impuls wandert ohne Stocken flüssig um den gesamten Kreis.',
        'Variante: Tempo steigern, Richtung wechseln oder zwei Impulse gleichzeitig starten.'
      ],
      en: [
        'Stand in a closed circle.',
        'Player A turns to Player B; making firm eye contact, both clap simultaneously in the exact same microsecond.',
        'Player B immediately turns to Player C and claps in unison with C.',
        'Objective: Send the clapping wave around the circle without hesitation or pause.',
        'Variations: accelerate speed, reverse direction, or launch two opposing impulses.'
      ]
    },
    animatorTips: {
      de: [
        'Stoppt die Rundenzeit: Schafft die Gruppe die Runde unter 5 Sekunden?',
        'Hervorragend als 3-Minuten-Wachmacher.'
      ],
      en: [
        'Time the round: can the group complete a full circuit in under 5 seconds?',
        'Superb 3-minute energizer between sitting periods.'
      ]
    }
  },

  // =========================================================================
  // 3. ROLLEN, TÄUSCHUNG & SOCIAL DEDUCTION - 6 SPIELE
  // =========================================================================
  // 1. Wer bin ich
  {
    id: 'wer-bin-ich',
    title: {
      de: 'Wer bin ich?',
      en: 'Who Am I?'
    },
    purpose: 'raten',
    category: 'social_deduction',
    energyLevel: 'calm',
    groupSize: { min: 4, max: 25 },
    prepLevel: 'low_prep',
    materials: {
      de: ['Haftnotizen (Post-its)', 'Stifte'],
      en: ['Sticky notes', 'Pens']
    },
    durationMinutes: '15–25 Min',
    durationMin: 15,
    durationMax: 25,
    space: {
      de: 'Sitzkreis',
      en: 'Seated circle'
    },
    summary: {
      de: 'Jeder trägt den Namen einer bekannten Persönlichkeit oder eines Begriffs auf der Stirn und muss durch geschickte Ja/Nein-Fragen die eigene Identität erraten.',
      en: 'Each person wears the name of a character or object on their forehead, deducing their identity using strictly yes/no questions.'
    },
    idea: {
      de: 'Übt genaues Fragen und logisches Ausschließen.',
      en: 'Practises asking precise questions and ruling things out.'
    },
    rules: {
      de: [
        'Jeder schreibt geheim eine bekannte Persönlichkeit, Figur oder einen Gegenstand auf einen Klebezettel und klebt ihn seinem Nachbarn auf die Stirn.',
        'Niemand darf den Zettel auf der eigenen Stirn vorher sehen.',
        'Reihum stellt jeder genau eine Frage, die die Gruppe nur mit „Ja“ oder „Nein“ beantworten darf (z. B. „Lebe ich noch?“, „Bin ich ein Mensch?“).',
        'Lautet die Antwort „Ja“, darf man sofort eine weitere Frage stellen. Bei „Nein“ wechselt der Zug im Uhrzeigersinn.',
        'Wer seine Identität errät, darf den Zettel abnehmen und hilft den anderen beim Raten.'
      ],
      en: [
        'Each player secretly writes a well-known figure, character, or object on a sticky note and attaches it to their neighbor’s forehead.',
        'No one may look at the note on their own forehead.',
        'Taking turns, each player asks one question that the group can only answer with "Yes" or "No" (e.g. "Am I alive?", "Am I fictional?").',
        'If the answer is "Yes", the player may ask one more question. On "No", the turn passes clockwise.',
        'Once a player deduces their identity, they remove their note and assist remaining players.'
      ]
    },
    animatorTips: {
      de: [
        'Für Jugendgruppen funktioniert es am besten mit historischen Persönlichkeiten, Tugenden oder Figuren aus Geschichten.',
        'Ermutigt die Jugendlichen, von groben Kategorien (z. B. lebendig/fiktiv) zu spezifischen Merkmalen zu fragen.'
      ],
      en: [
        'Works exceptionally well when themed around historical figures, virtues, or storybook characters.',
        'Encourage youth to start with broad binary categories before guessing specific names.'
      ]
    }
  },

  // 2. Werwolf
  {
    id: 'werwolf',
    title: {
      de: 'Die Werwölfe vom Düsterwald',
      en: 'Werewolf'
    },
    purpose: 'raten',
    category: 'social_deduction',
    energyLevel: 'medium',
    groupSize: { min: 8, max: 25 },
    prepLevel: 'low_prep',
    materials: {
      de: ['Werwolf-Karten oder beschriftete Zettel'],
      en: ['Role cards or written slips']
    },
    durationMinutes: '25–45 Min',
    durationMin: 25,
    durationMax: 45,
    space: {
      de: 'Ruhiger Raum mit Sitzkreis',
      en: 'Quiet room with seated circle'
    },
    summary: {
      de: 'Dorfbewohner versuchen heimliche Werwölfe in ihren Reihen zu entlarven, bevor das Dorf überrannt wird.',
      en: 'Villagers work to deduce and eliminate secret werewolves lurking among them before it is too late.'
    },
    idea: {
      de: 'Übt Beobachten und Argumentieren in der Gruppe.',
      en: 'Practises observing and arguing in a group.'
    },
    rules: {
      de: [
        'Jeder erhält geheim eine Rollenkarte (z. B. Dorfbewohner, Werwolf, Seherin, Hexe).',
        'Nachtphase: Alle schließen die Augen. Die Spielleitung ruft nacheinander die Sonderrollen auf. Die Werwölfe einigen sich stumm auf ein Opfer.',
        'Tagphase: Das Dorf erwacht. Die Spielleitung berichtet vom nächtlichen Vorfall.',
        'Die Gruppe diskutiert und stimmt demokratisch ab, wer verdächtigt und aus dem Dorf verbannt wird.',
        'Die Dorfbewohner gewinnen, wenn alle Wölfe enttarnt sind; die Wölfe gewinnen bei Parität.'
      ],
      en: [
        'Each participant secretly draws a role card (e.g. Villager, Werewolf, Seer, Witch).',
        'Night Phase: Everyone closes their eyes. The narrator wakes special roles in sequence. The werewolves silently pick a victim.',
        'Day Phase: The village awakens. The narrator describes the event.',
        'The village engages in open debate and holds a vote to eliminate one suspected player.',
        'Villagers win when all wolves are eliminated; wolves win if they reach parity with villagers.'
      ]
    },
    animatorTips: {
      de: [
        'Schafft eine stimmungsvolle Atmosphäre mit gedämpftem Licht und ruhiger Moderation.',
        'Ausgeschiedene Spieler agieren als stumme Geister, um keine Hinweise zu verraten.'
      ],
      en: [
        'Create atmosphere with ambient lighting and immersive narration.',
        'Remind eliminated players to remain completely silent observers so mystery remains intact.'
      ]
    },
    isFavoriteDefault: true
  },

  // 3. Spion
  {
    id: 'spion',
    title: {
      de: 'Spion',
      en: 'Spyfall'
    },
    subtitle: {
      de: 'Spyfall',
      en: 'Spyfall'
    },
    purpose: 'raten',
    category: 'social_deduction',
    energyLevel: 'medium',
    groupSize: { min: 5, max: 12 },
    prepLevel: 'low_prep',
    materials: {
      de: ['Zettel mit Ort für jeden Mitspieler, einer davon als „Spion“ markiert'],
      en: ['Location slips for everyone, one marked "Spy"']
    },
    durationMinutes: '15–20 Min',
    durationMin: 15,
    durationMax: 20,
    space: {
      de: 'Sitzkreis',
      en: 'Seated circle'
    },
    summary: {
      de: 'Alle kennen den geheimen Ort (z. B. Bibliothek, U-Boot, Flughafen), nur der Spion nicht. Durch geschickte Fragen muss er enttarnt werden.',
      en: 'Everyone knows the secret location (e.g. library, submarine, airport)—except the spy, who must bluff and deduce the location.'
    },
    idea: {
      de: 'Übt genaue Sprache und schnelles Mitdenken.',
      en: 'Practises precise language and quick thinking.'
    },
    rules: {
      de: [
        'Jeder zieht verdeckt eine Karte. Alle zeigen denselben Ort, nur eine einzige sagt „SPION“.',
        'Reihum stellt ein Spieler einem anderen eine freie Frage (z. B. „Trägt man an diesem Ort spezielle Kleidung?“).',
        'Die Antwort muss so gewählt sein, dass Eingeweihte den Ort erkennen, der Spion ihn aber nicht errät.',
        'Nach 8 Minuten stimmt die Runde ab, wer der Spion ist. Erkennt der Spion vorher den Ort, siegt er sofort.'
      ],
      en: [
        'Each player secretly receives a card. All cards have the same location; one card reads "SPY".',
        'In turn, a player asks another player a question (e.g. "Do people wear uniforms here?").',
        'Answers must be subtle enough that insiders confirm knowledge without tipping off the spy.',
        'After 8 minutes, the group votes on the spy’s identity. If the spy deduces the location first, they win instantly.'
      ]
    },
    animatorTips: {
      de: [
        'Hervorragend für Jugendliche, weil niemand vorzeitig ausscheidet und alle durchgehend mitdenken.',
        'Wählt Orte aus dem Alltag der Jugendlichen oder thematisch passend zum Camp.'
      ],
      en: [
        'Great for teenagers because no one is eliminated early and everyone remains mentally engaged.',
        'Choose relatable everyday locations or themes connected to your camp setting.'
      ]
    }
  },

  // 4. Psychiater
  {
    id: 'psychiater',
    title: {
      de: 'Der Psychiater',
      en: 'The Psychiatrist'
    },
    purpose: 'raten',
    category: 'social_deduction',
    energyLevel: 'calm',
    groupSize: { min: 6, max: 20 },
    prepLevel: 'instant',
    materials: {
      de: ['Keine'],
      en: ['None']
    },
    durationMinutes: '15–25 Min',
    durationMin: 15,
    durationMax: 25,
    space: {
      de: 'Sitzkreis',
      en: 'Seated circle'
    },
    summary: {
      de: 'Ein Ermittler verlässt den Raum. Die Gruppe vereinbart ein gemeinsames Antwortmuster, das durch geschickte Fragen durchschaut werden muss.',
      en: 'An investigator leaves the room. The group agrees on a shared behavioral code that must be diagnosed through questioning.'
    },
    idea: {
      de: 'Ein lustiges Denkspiel. Übt, Muster zu erkennen und genau zu beobachten.',
      en: 'A funny thinking game. Practises spotting patterns and observing closely.'
    },
    rules: {
      de: [
        'Ein Freiwilliger verlässt den Raum, sodass er nichts hört.',
        'Die Gruppe vereinbart ein klares Muster (z. B. „Jeder antwortet so, als wäre er sein linker Sitznachbar“).',
        'Der Ermittler kommt zurück und stellt beliebige persönliche Fragen in die Runde.',
        'Fällt einem Mitspieler auf, dass sein Nachbar falsch geantwortet hat, ruft er „PSYCHIATER!“ – woraufhin alle panisch die Plätze tauschen.',
        'Ziel ist es, das dahinterliegende System zu benennen.'
      ],
      en: [
        'One volunteer steps completely out of earshot.',
        'The group agrees on a consistent answer rule (e.g. "Answer as if you are the person to your left").',
        'The investigator returns and poses questions around the circle.',
        'If a participant notices someone answered incorrectly on their behalf, they shout "PSYCHIATRIST!", triggering a seat scramble.',
        'The goal is to accurately diagnose the hidden answering pattern.'
      ]
    },
    animatorTips: {
      de: [
        'Die Regel „Ich antworte für meinen linken Nachbarn“ ist der beste und bewährteste Einstieg.',
        'Niemand wird bloßgestellt, da alle als Team das Muster aufrechterhalten.'
      ],
      en: [
        'Answering as the person to one’s left is the most reliable and humorous starting variation.',
        'No participant feels singled out, as the entire room upholds the code together.'
      ]
    }
  },

  // 5. Empire
  {
    id: 'empire',
    title: {
      de: 'Empire',
      en: 'Empire'
    },
    subtitle: {
      de: 'Das geheime Königreich',
      en: 'The Secret Kingdom'
    },
    purpose: 'kennenlernen',
    category: 'social_deduction',
    energyLevel: 'medium',
    groupSize: { min: 8, max: 30 },
    prepLevel: 'low_prep',
    materials: {
      de: ['Kleine Zettel', 'Stifte', 'Optional: Empire-Werkzeug auf dieser Seite'],
      en: ['Paper slips', 'Pens', 'Optional: Empire tool on this site']
    },
    durationMinutes: '20–40 Min',
    durationMin: 20,
    durationMax: 40,
    space: {
      de: 'Sitzkreis in einem Raum',
      en: 'Indoor seated circle'
    },
    summary: {
      de: 'Jeder schreibt geheim einen Begriff oder Namen zu einem Thema auf. Wer die Identitäten errät, gliedert die Spieler in das eigene Reich ein.',
      en: 'Each person writes down a secret identity or phrase. Players guess who submitted what, absorbing members into expanding empires.'
    },
    idea: {
      de: 'Übt Merken und Beobachten. Mit eigenen Themenkarten lässt es sich an die Gruppe anpassen.',
      en: 'Practises memory and observation. Your own topic cards adapt it to the group.'
    },
    rules: {
      de: [
        'Jeder erhält einen Zettel und notiert verdeckt einen Begriff zu einer gewählten Kategorie (z. B. „Schlechteste Ausreden“).',
        'Die Spielleitung sammelt alle Zettel ein und liest alle genannten Begriffe zweimal deutlich vor.',
        'Reihum fragt ein Spieler einen anderen: „Bist du [Begriff]?“.',
        'Bei einem Treffer schließt sich die erratene Person dem Team des Fragenden an. Der Fragende darf weiterraten.',
        'Liegt man falsch, ist der nächste Spieler im Kreis an der Reihe.',
        'Wird der König eines Reiches erraten, wechselt dessen gesamtes Gefolge zum neuen Besitzer über.'
      ],
      en: [
        'Everyone receives a slip and privately writes a concept from the chosen category (e.g. "Terrible Excuses").',
        'The host collects all slips and reads the complete list twice clearly to the room.',
        'Taking turns around the circle, Player A asks Player B: "Are you [Alias]?".',
        'If correct, Player B joins Player A’s kingdom. Player A continues guessing.',
        'If incorrect, the turn passes to the next person in the circle.',
        'If a reigning King is correctly identified, their entire empire joins the guesser’s kingdom.'
      ]
    },
    animatorTips: {
      de: [
        'Nutzt den interaktiven Modus „Jetzt spielen“ direkt hier auf der Spieleseite – so muss die Liste nicht ständig wiederholt werden.',
        'Die Mitglieder eines Reiches dürfen ihren König leise beraten, aber nur der König spricht die Vermutung laut aus.'
      ],
      en: [
        'Use the interactive "Play now" mode right here on this game page to display names on screen without constant interruptions.',
        'Empire subjects may quietly consult their king, but only the king states the official guess.'
      ]
    },
    isFavoriteDefault: true
  },

  // 9. Mord in der Disco
  {
    id: 'schlafmuetze-moerder',
    title: {
      de: 'Mord in der Disco',
      en: 'Wink Murder'
    },
    subtitle: {
      de: 'Zwinkern, Händedruck oder im Dunkeln',
      en: 'Winking, handshake or dark variant'
    },
    purpose: 'raten',
    category: 'social_deduction',
    energyLevel: 'calm',
    groupSize: { min: 8, max: 25 },
    prepLevel: 'low_prep',
    materials: {
      de: ['Spielkarten oder Zettel zur Rollenvergabe'],
      en: ['Playing cards or secret slips for role distribution']
    },
    durationMinutes: '15–20 Min',
    durationMin: 15,
    durationMax: 20,
    space: {
      de: 'Sitzkreis mit gutem Blickkontakt',
      en: 'Seated circle with clear sightlines'
    },
    summary: {
      de: 'Ein geheimer Täter schaltet Mitspieler durch unauffälliges Zuzwinkern aus. Ein Detektiv (oder die Gruppe) muss ihn überführen.',
      en: 'A secret culprit eliminates players by discreetly winking at them while a detective tries to catch them.'
    },
    idea: {
      de: 'Übt Blickkontakt, Körpersprache und ruhiges Beobachten.',
      en: 'Practises eye contact, body language and calm observation.'
    },
    rules: {
      de: [
        'Alle ziehen verdeckt eine Karte. Eine Person zieht das As (Täter), alle anderen sind Zivilisten.',
        'Variante mit Detektiv: Ein Detektiv steht in der Mitte des Kreises.',
        'Alle Spieler schauen sich im Kreis in die Augen. Der Täter versucht, Personen unbemerkt zuzuzwinkern.',
        'Wem zugezwinkert wurde, zählt innerlich bis drei und scheidet dann dramatisch aus.',
        'Der Detektiv hat 3 Versuche, den Täter zu entlarven. Schafft der Täter es, die Mehrheit auszuschalten, gewinnt er.'
      ],
      en: [
        'Each player draws a secret card. One card is the Ace (Culprit), all others are civilians.',
        'Detective variation: One detective stands in the center of the circle.',
        'Everyone makes continuous eye contact around the circle. The culprit tries to wink at players without getting caught.',
        'When winked at, a player waits three seconds before dramatically collapsing or stepping out.',
        'The detective has 3 guesses to identify the winker before too many players fall.'
      ]
    },
    animatorTips: {
      de: [
        'Wichtig: Die Spieler dürfen nicht sofort nach dem Zwinkern umfallen, sondern müssen 2–3 Sekunden verzögern, um es spannend zu halten.',
        'Toll als entspannter Einstieg oder zur Konzentrationssammlung.'
      ],
      en: [
        'Crucial rule: Victims must delay their reaction by 2–3 seconds so the culprit’s identity is not immediately obvious.',
        'Great as a low-energy bridge activity to regain shared focus.'
      ]
    }
  },

  // =========================================================================
  // 4. WETTKAMPF & DUELLE (REAKTION, LAUTSTÄRKE & FUN) - 4 SPIELE
  // =========================================================================
  // 6. Schere Stein Papier Showdown
  {
    id: 'ssp-showdown',
    title: {
      de: 'Schere-Stein-Papier Fankurve',
      en: 'Rock Paper Scissors Cheering Train'
    },
    purpose: 'energie',
    category: 'competitive',
    energyLevel: 'high',
    groupSize: { min: 10, max: 80 },
    prepLevel: 'instant',
    materials: {
      de: ['Keine'],
      en: ['None']
    },
    durationMinutes: '7–12 Min',
    durationMin: 7,
    durationMax: 12,
    space: {
      de: 'Überall möglich',
      en: 'Any open space'
    },
    summary: {
      de: 'Jeder Verlierer eines Duells schließt sich sofort als Fan hinter dem Gewinner an, bis zwei riesige Fangruppen im Finale aufeinandertreffen.',
      en: 'Every player who loses a duel joins as a fan behind the winner, building massive cheering trains that collide in a dramatic finale.'
    },
    idea: {
      de: 'Niemand scheidet wirklich aus. Wer verliert, feuert weiter an.',
      en: 'Nobody is really out. Whoever loses keeps cheering.'
    },
    rules: {
      de: [
        'Jeder sucht sich einen Partner und spielt eine Runde Schere-Stein-Papier.',
        'Die unterlegene Person stellt sich sofort hinter den Sieger und feuert ihn mit Namen an.',
        'Der Sieger (nun mit Gefolge) fordert einen anderen Spieler heraus, der ebenfalls Fans hinter sich hat.',
        'Die Schlangen wachsen bei jedem Duell, bis sich im großen Finale zwei Chöre gegenüberstehen.'
      ],
      en: [
        'Pair up with anyone nearby and play a single round of Rock-Paper-Scissors.',
        'The player who does not win immediately steps behind the winner, cheering their name.',
        'The winner (now leading a chain) challenges another leader who also has a cheering squad.',
        'Chains merge and grow with every duel, culminating in an epic two-sided championship clash.'
      ]
    },
    animatorTips: {
      de: [
        'Ermutigt die Jugendlichen, lautstark den Namen ihres Champions zu rufen.',
        'Hervorragend geeignet als Wachmacher nach langen Sitzphasen oder zu Beginn eines Camps.'
      ],
      en: [
        'Encourage youth to chant the name of their champion with genuine volume.',
        'Ideal as a wake-up activity after quiet reflection or opening a camp day.'
      ]
    },
    isFavoriteDefault: true
  },

  // 8. Salad Bowl
  {
    id: 'salad-bowl',
    title: {
      de: 'Begriffe-Schüssel',
      en: 'Salad Bowl'
    },
    subtitle: {
      de: 'Wörter-Staffel',
      en: 'Three-Round Catchphrase'
    },
    purpose: 'raten',
    category: 'competitive',
    energyLevel: 'high',
    groupSize: { min: 6, max: 24 },
    prepLevel: 'low_prep',
    materials: {
      de: ['Eine Schüssel', 'Zettel & Stifte', 'Timer'],
      en: ['Bowl', 'Paper slips & pens', 'Timer']
    },
    durationMinutes: '25–40 Min',
    durationMin: 25,
    durationMax: 40,
    space: {
      de: 'Sitzgelegenheiten für zwei Teams',
      en: 'Seating for two teams'
    },
    summary: {
      de: 'Dieselbe Sammlung von Begriffen wird über drei Runden erraten: Erst normale Erklärung, dann nur 1 einziges Wort, dann reine Pantomime.',
      en: 'The exact same pool of concepts is guessed across three escalating rounds: full verbal clues, a single word, and pure pantomime.'
    },
    idea: {
      de: 'Die Begriffe sind ab der zweiten Runde bekannt. Darum wird es schneller und lustiger.',
      en: 'From round two the words are known. So it gets faster and funnier.'
    },
    rules: {
      de: [
        'Jeder schreibt 3 Begriffe auf Zettel und wirft sie in die Schüssel.',
        'Zwei Teams spielen abwechselnd mit 60 Sekunden Zeit pro Durchgang.',
        'Runde 1: Freie sprachliche Umschreibung (ohne Wortteile zu nennen).',
        'Runde 2: Alle Zettel kommen zurück. Der Erklärer darf nur genau EIN einziges Wort sagen.',
        'Runde 3: Alle Zettel kommen erneut zurück. Reines Pantomimespiel ohne Sprache oder Geräusche.',
        'Das Team mit den meisten Gesamtpunkten gewinnt.'
      ],
      en: [
        'Each player contributes 3 concepts onto slips and places them in the bowl.',
        'Two teams take alternating 60-second turns to guess as many slips as possible.',
        'Round 1: Open verbal description (no rhyming or root words).',
        'Round 2: All slips return to the bowl. The clue-giver may only speak ONE single word.',
        'Round 3: All slips return again. Pure pantomime with absolute silence.',
        'The team with the highest cumulative total across three rounds wins.'
      ]
    },
    animatorTips: {
      de: [
        'Ermutigt die Jugendlichen, auch gemeinsame Camp-Erlebnisse oder Insider-Begriffe aufzuschreiben.',
        'Ein klarer Timer auf dem Smartphone sorgt für Transparenz und Spannung.'
      ],
      en: [
        'Encourage youth to include shared camp memories or inside jokes on their slips.',
        'Display a visible smartphone countdown timer for fair competition.'
      ]
    },
    isFavoriteDefault: true
  },

  // 11. Hi Ha Ho
  {
    id: 'hi-ha-ho',
    title: {
      de: 'Hi – Ha – Ho',
      en: 'Hi – Ha – Ho'
    },
    subtitle: {
      de: 'Rhythmus-Duell',
      en: 'Rhythm Duel'
    },
    purpose: 'energie',
    category: 'competitive',
    energyLevel: 'high',
    groupSize: { min: 6, max: 20 },
    prepLevel: 'instant',
    materials: {
      de: ['Keine'],
      en: ['None']
    },
    durationMinutes: '10–15 Min',
    durationMin: 10,
    durationMax: 15,
    space: {
      de: 'Fester Stehkreis',
      en: 'Standing circle'
    },
    summary: {
      de: 'Schnelles Reaktionsspiel im Kreis mit festen Lauten und Handbewegungen wie Schwerthiebe.',
      en: 'Fast reaction game in a circle with fixed calls and hand movements like sword strokes.',
    },
    idea: {
      de: 'Macht in kurzer Zeit wach. Übt Merken und schnelle Reaktion.',
      en: 'Wakes everyone up quickly. Practises memory and quick reactions.'
    },
    rules: {
      de: [
        'Alle stehen im Kreis. Person A faltet die Hände über dem Kopf, schlägt in Richtung Person B und ruft laut „HI!“.',
        'Person B hebt sofort die Arme über den Kopf in Abwehrhaltung. Die beiden direkten Nachbarn von B müssen blitzschnell einen Schnitt auf Bs Bauch ausführen und laut „HA!“ rufen.',
        'Person B schlägt nun sofort wieder auf eine andere Person im Kreis mit „HO!“.',
        'Wer zögert, das falsche Wort ruft oder seinen Einsatz verpasst, scheidet aus oder macht eine kurze sportliche Revanche.'
      ],
      en: [
        'Stand in a circle. Player A raises hands overhead and slashes toward Player B shouting "HI!".',
        'Player B immediately raises their hands in defense. Both immediate neighbors of B must execute horizontal slashes toward B shouting "HA!".',
        'Player B immediately redirects energy toward a new player shouting "HO!".',
        'Anyone who hesitates, calls the wrong syllable, or misses their cue steps out or performs a quick exercise.'
      ]
    },
    animatorTips: {
      de: [
        'Startet in moderatem Tempo und zieht nach 2 Minuten das Tempo radikal an.',
        'Die Jugendlichen lieben die dynamischen Posen und die hohe Lautstärke.'
      ],
      en: [
        'Start at a moderate pace to establish familiarity, then dramatically accelerate after 2 minutes.',
        'Youth love the dynamic movement stances and the room’s rising volume.'
      ]
    }
  },

  // 12. Ninja
  {
    id: 'ninja',
    title: {
      de: 'Ninja',
      en: 'Ninja'
    },
    purpose: 'energie',
    category: 'competitive',
    energyLevel: 'high',
    groupSize: { min: 4, max: 18 },
    prepLevel: 'instant',
    materials: {
      de: ['Keine'],
      en: ['None']
    },
    durationMinutes: '10–15 Min',
    durationMin: 10,
    durationMax: 15,
    space: {
      de: 'Ausreichend Bewegungsradius',
      en: 'Open space with ample movement room'
    },
    summary: {
      de: 'Rundenbasiertes Reaktionsspiel im Kreis mit festen Posen. Versuche in einer fließenden Bewegung die Hand deines Nachbarn abzuschlagen.',
      en: 'Turn-based reaction game in a circle with frozen stances. In one fluid motion, strike toward an opponent’s hand.'
    },
    idea: {
      de: 'Braucht kein Material. Übt Reaktion und Körperbeherrschung.',
      en: 'Needs no materials. Practises reaction and body control.'
    },
    rules: {
      de: [
        'Alle stehen im Kreis. Auf das Signal „3, 2, 1, NINJA!“ springen alle zurück in eine Kampfpose.',
        'Reihum darf jeder genau eine fließende Bewegung ausführen (einen Angriff auf eine Hand oder eine Positionsänderung).',
        'Der Angegriffene darf in derselben Sekunde mit einer einzigen Ausweichbewegung reagieren.',
        'Nach der Bewegung verharrt man wie eingefroren in der neuen Haltung.',
        'Wird eine Hand berührt, wandert der Arm hinter den Rücken. Wer beide Hände verliert, scheidet als Schiedsrichter aus.'
      ],
      en: [
        'All players stand in a circle. On the count "3, 2, 1, NINJA!", everyone jumps back into a frozen stance.',
        'Taking turns clockwise, each player makes exactly one fluid motion (a strike at someone’s hand or repositioning).',
        'The defender may make one dodging motion in direct reaction.',
        'Once the motion finishes, both players freeze in their resulting postures.',
        'If a hand is tapped, that arm moves behind the player’s back. Losing both hands transitions the player to referee.'
      ]
    },
    animatorTips: {
      de: [
        'Auf klare, sanfte Berührungen achten – es geht um Präzision, nicht um Kraft.',
        'Schiedsrichter-Aufgabe für Ausgeschiedene sorgt dafür, dass alle eingebunden bleiben.'
      ],
      en: [
        'Emphasize light, precise taps—the focus is agility and balance, not force.',
        'Assign eliminated players to act as line judges to keep them actively involved.'
      ]
    }
  },
  {
    id: 'billy-billy-bob',
    status: 'draft',
    title: {
      de: 'Billy Billy Bob',
      en: 'Billy Billy Bob'
    },
    purpose: 'energie',
    category: 'energizer',
    energyLevel: 'high',
    groupSize: { min: 8, max: 25 },
    prepLevel: 'instant',
    materials: {
      de: ['Keine'],
      en: ['None']
    },
    durationMinutes: '5–15 Min',
    durationMin: 5,
    durationMax: 15,
    space: {
      de: 'Platz für einen Stehkreis',
      en: 'Room for a standing circle'
    },
    summary: {
      de: 'Die Mitte ruft eine Figur und zeigt auf jemanden. Diese Person und ihre zwei Nachbarn müssen sie sofort zu dritt darstellen. Wer zu spät ist, wechselt in die Mitte.',
      en: 'The middle calls a figure and points at someone. That person and their two neighbours have to act it out together straight away. Whoever is too late swaps into the middle.'
    },
    idea: {
      de: 'Ein lustiger Energizer für Konzentration und schnelle Reaktion.',
      en: 'A fun energizer for focus and quick reactions.'
    },
    rules: {
      de: [
        'Alle stehen im Kreis. Die Spielleitung steht zuerst in der Mitte und zeigt die Figuren vor.',
        'Die Person in der Mitte zeigt auf jemanden im Kreis und nennt eine Figur. Die gezeigte Person (M) und ihre linke (L) und rechte Nachbarperson (R) stellen die Figur sofort dar.',
        'Wer zu langsam ist oder einen Fehler macht, geht in die Mitte.',
        'Toaster: L und R fassen sich an den Händen und bilden den Toaster. M ist die Scheibe Brot, geht in die Hocke und schnellt mit einem „Pling“ nach oben.',
        'Känguru: L und R halten die Hände wie einen Beutel vor M. M beugt sich darüber und spielt, dass M übel ist.',
        'James Bond: M posiert mit den Händen als Pistole. L und R sinken neben M auf die Knie und schauen bewundernd hoch.',
        'Waschmaschine: L und R bilden mit den Armen ein Viereck um M, das Gehäuse. M ist die Trommel und lässt den Kopf kreisen.'
      ],
      en: [
        'Everyone stands in a circle. The game leader starts in the middle and demonstrates the figures.',
        'The person in the middle points at someone and calls a figure. That person (M) and their left (L) and right (R) neighbours act it out at once.',
        'Whoever is too slow or makes a mistake goes to the middle.',
        'Toaster: L and R hold hands and form the toaster. M is the slice of bread, crouches down and pops up with a "ping".',
        'Kangaroo: L and R hold their hands like a pouch in front of M. M leans over it and acts as if feeling sick.',
        'James Bond: M poses with their hands as a pistol. L and R sink to their knees next to M and look up in admiration.',
        'Washing machine: L and R form a square around M with their arms, the casing. M is the drum and rolls their head in circles.'
      ]
    },
    animatorTips: {
      de: [
        'Statt zu zeigen, kannst du den Namen der Person rufen. So wird das Spiel zugleich eine Kennenlernübung.',
        'Erst mit zwei Figuren beginnen und die übrigen nach und nach einführen.'
      ],
      en: [
        'Instead of pointing, call the person by name. This turns the game into a name game as well.',
        'Start with two figures and add the others one by one.'
      ]
    }
  },
  // =========================================================================
  // Angeregt vom NEVEREST-Methodarium (neverest.at/methodarium), eigene Texte, Entwürfe
  // =========================================================================
  {
    id: 'obstsalat',
    status: 'draft',
    title: { de: 'Obstsalat', en: 'Fruit Salad' },
    purpose: 'energie',
    category: 'energizer',
    energyLevel: 'high',
    groupSize: { min: 8, max: 30 },
    prepLevel: 'low_prep',
    materials: { de: ['Ein Stuhl pro Person, einer weniger als Mitspielende'], en: ['One chair per person, one fewer than players'] },
    durationMinutes: '5–15 Min',
    durationMin: 5,
    durationMax: 15,
    space: { de: 'Stuhlkreis', en: 'Circle of chairs' },
    summary: {
      de: 'Jede Person ist eine Obstsorte. Wird deine Sorte gerufen, suchst du schnell einen neuen Stuhl. Einer fehlt immer.',
      en: 'Everyone is a type of fruit. When your fruit is called, you rush to a new chair. One chair is always missing.'
    },
    idea: {
      de: 'Bringt Bewegung in den Raum und mischt die Sitzordnung durch. Gut nach einer langen Sitzphase.',
      en: 'Gets everyone moving and mixes up who sits next to whom. Good after a long time sitting.'
    },
    rules: {
      de: [
        'Alle sitzen im Stuhlkreis. Eine Person steht ohne Stuhl in der Mitte.',
        'Gib reihum drei oder vier Obstsorten aus, zum Beispiel Apfel, Banane, Kirsche.',
        'Die Person in der Mitte ruft eine Sorte, zum Beispiel „Bananen“. Alle Bananen stehen auf und suchen sich einen anderen Stuhl.',
        'Auch die Person in der Mitte versucht, einen Stuhl zu bekommen. Wer übrig bleibt, ruft als Nächstes.',
        'Bei „Obstsalat“ tauschen alle ihren Platz.'
      ],
      en: [
        'Everyone sits in a circle of chairs. One person stands in the middle without a chair.',
        'Go round and hand out three or four fruits, for example apple, banana, cherry.',
        'The person in the middle calls a fruit, for example "bananas". All bananas stand up and find a different chair.',
        'The person in the middle also tries to get a chair. Whoever is left standing calls next.',
        'On "fruit salad", everyone changes places.'
      ]
    },
    variants: {
      de: [
        'Statt Obst ruft die Mitte Sätze wie „Alle, die Geschwister haben“. So lernt ihr euch nebenbei kennen.',
        'Kein Platz direkt neben dem alten Stuhl.'
      ],
      en: [
        'Instead of fruit, the middle calls sentences like "Everyone who has siblings". You get to know each other on the side.',
        'No sitting in the seat right next to your old one.'
      ]
    },
    safety: {
      de: ['Sag vorher: gehen, nicht rennen, und niemanden vom Stuhl schubsen.'],
      en: ['Say it before you start: walk, do not run, and do not push anyone off a chair.']
    },
    animatorTips: {
      de: ['Wer dreimal in der Mitte war, darf sich eine Sorte für die nächste Runde aussuchen und sich dann setzen.'],
      en: ['Anyone who has been in the middle three times picks a fruit for the next round and sits down.']
    }
  },
  {
    id: 'namensball',
    status: 'draft',
    title: { de: 'Namensball', en: 'Name Ball' },
    purpose: 'kennenlernen',
    category: 'cooperative',
    energyLevel: 'medium',
    groupSize: { min: 6, max: 16 },
    prepLevel: 'low_prep',
    materials: { de: ['Zwei bis vier weiche Bälle in verschiedenen Farben'], en: ['Two to four soft balls in different colours'] },
    durationMinutes: '10–15 Min',
    durationMin: 10,
    durationMax: 15,
    space: { de: 'Platz für einen Stehkreis', en: 'Room for a standing circle' },
    summary: {
      de: 'Ein Ball fliegt durch den Kreis, und wer wirft, ruft den Namen der fangenden Person. Nach und nach kommen weitere Bälle mit eigenen Regeln dazu.',
      en: 'A ball flies across the circle and the thrower calls the catcher’s name. More balls with their own rules join one by one.'
    },
    idea: {
      de: 'Nach ein paar Minuten kennen alle die Namen, und keiner hat dafür still sitzen müssen.',
      en: 'After a few minutes everyone knows the names, and nobody had to sit still to learn them.'
    },
    rules: {
      de: [
        'Alle stehen im Kreis. Gebt einen Ball einmal herum, und jede Person sagt dabei ihren Namen.',
        'Ball 1: Du wirfst ihn jemandem zu und rufst dabei den Namen der Person, die fängt.',
        'Wenn das läuft, kommt Ball 2 dazu: Vor dem Wurf Blickkontakt, und du rufst deinen eigenen Namen.',
        'Ball 3 wird nur nach rechts weitergereicht. Dabei nennt jede Person eine Farbe, die noch nicht dran war.',
        'Fällt ein Ball, hebt ihn jemand auf, und es geht einfach weiter.'
      ],
      en: [
        'Everyone stands in a circle. Pass one ball around once, and each person says their name.',
        'Ball 1: throw it to someone and call the catcher’s name.',
        'Once that works, add ball 2: make eye contact first, then call your own name as you throw.',
        'Ball 3 is only handed on to the right. Each person names a colour that has not come up yet.',
        'If a ball drops, someone picks it up and play goes on.'
      ]
    },
    variants: {
      de: [
        'Ein Ball wird nur mit dem Fuß gespielt.',
        'Statt Farben zählt ihr gemeinsam weiter. Schafft ihr es bis 100?'
      ],
      en: [
        'One ball may only be passed with the feet.',
        'Instead of colours, count up together. Can you reach 100?'
      ]
    },
    animatorTips: {
      de: ['Bring einen neuen Ball erst ins Spiel, wenn der vorige sicher läuft.'],
      en: ['Only add a new ball once the previous one runs smoothly.']
    }
  },
  {
    id: 'ball-jonglage',
    status: 'draft',
    title: { de: 'Gruppen-Jonglage', en: 'Group Juggling' },
    purpose: 'zusammenarbeit',
    category: 'cooperative',
    energyLevel: 'medium',
    groupSize: { min: 7, max: 16 },
    prepLevel: 'low_prep',
    materials: { de: ['Mehrere weiche Bälle, etwas weniger als Mitspielende'], en: ['Several soft balls, a few fewer than players'] },
    durationMinutes: '10–20 Min',
    durationMin: 10,
    durationMax: 20,
    space: { de: 'Platz für einen Stehkreis', en: 'Room for a standing circle' },
    summary: {
      de: 'Die Gruppe legt eine feste Wurfreihenfolge fest und hält dann immer mehr Bälle gleichzeitig in der Luft.',
      en: 'The group sets a fixed throwing order and then keeps more and more balls in the air at once.'
    },
    idea: {
      de: 'Klappt nur, wenn alle aufmerksam sind und sich gegenseitig ansehen. Jeder Fehler ist sofort wieder gutzumachen.',
      en: 'Only works if everyone pays attention and looks at each other. Every mistake is easy to put right.'
    },
    rules: {
      de: [
        'Alle stehen im Kreis, etwa eine Armlänge auseinander, und heben eine Hand.',
        'Der erste Ball geht quer durch den Kreis. Wer ihn gefangen hat, nimmt die Hand herunter und wirft weiter, bis alle einmal dran waren und der Ball zurück am Anfang ist.',
        'Jede Person merkt sich nur zwei Dinge: Von wem kommt der Ball, und zu wem wirfst du ihn.',
        'Spielt die Runde noch einmal. Dann bringst du nach und nach weitere Bälle in dieselbe Reihenfolge.',
        'Fällt ein Ball, hebt ihn die Person auf, die ihn fangen sollte, und wirft weiter.'
      ],
      en: [
        'Everyone stands in a circle, about an arm’s length apart, and raises one hand.',
        'The first ball goes across the circle. Whoever catches it lowers their hand and throws on, until everyone has had it once and the ball is back at the start.',
        'Each person only remembers two things: who throws to you, and who you throw to.',
        'Play the round once more. Then add more balls one by one in the same order.',
        'If a ball drops, the person who should have caught it picks it up and throws on.'
      ]
    },
    variants: {
      de: [
        'Rückwärts: Auf ein Zeichen geht der Ball den Weg andersherum.',
        'Beim ersten Durchgang sagt jede Person beim Fangen ihren Namen.'
      ],
      en: [
        'Backwards: on a signal the balls travel the route in reverse.',
        'In the first round, each person says their name when they catch.'
      ]
    },
    reflection: {
      de: [
        'Was hat geholfen, dass weniger Bälle heruntergefallen sind?',
        'Wo im Alltag hängt es auch davon ab, dass jede Person ihren Teil gut übergibt?'
      ],
      en: [
        'What helped fewer balls drop?',
        'Where in daily life does it also depend on everyone passing their part on well?'
      ]
    },
    animatorTips: {
      de: ['Zählt laut, wie viele Bälle gleichzeitig unterwegs sind. Das motiviert für die nächste Runde.'],
      en: ['Count out loud how many balls are moving at once. It motivates the next round.']
    }
  },
  {
    id: 'spaghetti-turm',
    status: 'draft',
    title: { de: 'Spaghetti-Turm', en: 'Spaghetti Tower' },
    purpose: 'zusammenarbeit',
    category: 'cooperative',
    energyLevel: 'medium',
    groupSize: { min: 4, max: 20 },
    prepLevel: 'materials_needed',
    materials: {
      de: ['Pro Team: 20 ungekochte Spaghetti, 1 m Klebeband, 1 m Schnur, ein Marshmallow', 'Maßband, Uhr'],
      en: ['Per team: 20 dry spaghetti, 1 m of tape, 1 m of string, one marshmallow', 'Tape measure, timer']
    },
    durationMinutes: '20–30 Min',
    durationMin: 20,
    durationMax: 30,
    space: { de: 'Ein Tisch pro Team', en: 'One table per team' },
    summary: {
      de: 'Kleine Teams bauen mit wenig Material einen freistehenden Turm. Ganz oben muss ein Marshmallow sitzen.',
      en: 'Small teams build a free-standing tower from very little material. A marshmallow has to sit on top.'
    },
    idea: {
      de: 'Zeigt schnell, wie ein Team plant, ausprobiert und mit einem Einsturz umgeht.',
      en: 'Quickly shows how a team plans, tries things and deals with a collapse.'
    },
    rules: {
      de: [
        'Bildet Teams zu drei bis fünf Personen. Jedes Team bekommt dasselbe Material.',
        'Aufgabe: einen möglichst hohen Turm bauen, der von allein steht. Das Marshmallow sitzt ganz oben.',
        'Die Teams haben 15 Minuten. Das Material darf zerbrochen und geteilt werden.',
        'Am Ende messt ihr vom Tisch bis zum Marshmallow. Der Turm muss beim Messen stehen bleiben.'
      ],
      en: [
        'Form teams of three to five. Every team gets the same material.',
        'Task: build the tallest tower that stands on its own. The marshmallow sits at the very top.',
        'Teams have 15 minutes. The material may be broken and divided.',
        'At the end, measure from the table to the marshmallow. The tower has to stay standing while you measure.'
      ]
    },
    reflection: {
      de: [
        'Wie seid ihr gestartet: erst geplant oder gleich gebaut?',
        'Was habt ihr gemacht, als etwas eingestürzt ist?',
        'Wurden alle Ideen im Team gehört?'
      ],
      en: [
        'How did you start: planning first or building straight away?',
        'What did you do when something collapsed?',
        'Were everyone’s ideas heard in your team?'
      ]
    },
    animatorTips: {
      de: ['Sag nach 10 Minuten die Restzeit an. Viele Teams setzen das Marshmallow zu spät auf und merken erst dann, wie schwer es ist.'],
      en: ['Announce the time left after 10 minutes. Many teams put the marshmallow on too late and only then notice how heavy it is.']
    }
  },
  {
    id: 'roboterspiel',
    status: 'draft',
    title: { de: 'Roboter steuern', en: 'Robot Steering' },
    purpose: 'zusammenarbeit',
    category: 'cooperative',
    energyLevel: 'medium',
    groupSize: { min: 4, max: 20 },
    prepLevel: 'instant',
    materials: { de: ['Keine', 'Augenbinden (für die schwerere Variante)'], en: ['None', 'Blindfolds (for the harder variant)'] },
    durationMinutes: '10–15 Min',
    durationMin: 10,
    durationMax: 15,
    space: { de: 'Freier Raum ohne Stolperfallen', en: 'Open space without trip hazards' },
    summary: {
      de: 'Zu zweit: Eine Person ist der Roboter, die andere lenkt ihn nur durch Antippen an Schultern und Rücken durch den Raum.',
      en: 'In pairs: one person is the robot, the other steers them around the room only by tapping shoulders and back.'
    },
    idea: {
      de: 'Übt klare Zeichen und Verantwortung für eine andere Person. Der Roboter lernt, sich anzuvertrauen.',
      en: 'Practises clear signals and responsibility for someone else. The robot learns to trust.'
    },
    rules: {
      de: [
        'Bildet Paare. Der Roboter steht vorn, die steuernde Person dahinter.',
        'Legt die Zeichen fest: rechte Schulter antippen heißt rechts drehen, linke Schulter links drehen, Rücken antippen losgehen, Kopf berühren stehen bleiben.',
        'Auf dein Startsignal laufen alle Paare gleichzeitig durch den Raum. Gesprochen wird nicht.',
        'Nach ein paar Minuten tauschen die Rollen.'
      ],
      en: [
        'Form pairs. The robot stands in front, the steering person behind.',
        'Agree on the signals: tap the right shoulder to turn right, the left shoulder to turn left, the back to walk, touch the head to stop.',
        'On your start signal all pairs move through the room at the same time. Nobody speaks.',
        'After a few minutes, swap roles.'
      ]
    },
    variants: {
      de: [
        'Der Roboter schließt die Augen.',
        'Der Raum wird mit der Zeit kleiner, zum Beispiel mit Stühlen als Grenze.',
        'Jedes Paar erfindet eigene Zeichen.'
      ],
      en: [
        'The robot closes their eyes.',
        'The space gets smaller over time, for example with chairs as a border.',
        'Each pair invents its own signals.'
      ]
    },
    safety: {
      de: [
        'Antippen heißt sanft berühren, nie schlagen oder schubsen.',
        'Die steuernde Person sorgt dafür, dass der Roboter nirgends anstößt.'
      ],
      en: [
        'Tapping means a gentle touch, never hitting or pushing.',
        'The steering person makes sure the robot does not bump into anything.'
      ]
    },
    reflection: {
      de: ['Wie war es, gesteuert zu werden?', 'Was hat es leichter gemacht, der anderen Person zu vertrauen?'],
      en: ['How did it feel to be steered?', 'What made it easier to trust the other person?']
    },
    animatorTips: {
      de: ['Frag vorher, ob alle mit Berührung an Schultern und Rücken einverstanden sind. Wer nicht möchte, steuert mit Worten.'],
      en: ['Ask first whether everyone is fine with touch on shoulders and back. Anyone who is not steers with words instead.']
    }
  },
  {
    id: 'eierfall',
    status: 'draft',
    title: { de: 'Der große Eierfall', en: 'The Great Egg Drop' },
    purpose: 'zusammenarbeit',
    category: 'cooperative',
    energyLevel: 'medium',
    groupSize: { min: 6, max: 16 },
    prepLevel: 'materials_needed',
    materials: {
      de: ['Ein rohes Ei pro Team', 'Draußen: Naturmaterial, etwas Schnur', 'Drinnen: etwa 30 Strohhalme und Klebeband pro Team'],
      en: ['One raw egg per team', 'Outdoors: natural materials, some string', 'Indoors: about 30 straws and tape per team']
    },
    durationMinutes: '30–45 Min',
    durationMin: 30,
    durationMax: 45,
    space: { de: 'Draußen oder drinnen, eine Stelle zum Fallenlassen', en: 'Outdoors or indoors, a spot to drop from' },
    summary: {
      de: 'Teams bauen eine Hülle, die ein rohes Ei bei einem Sturz schützt. Runde für Runde geht es höher.',
      en: 'Teams build a casing that protects a raw egg from a fall. Round by round the drop gets higher.'
    },
    idea: {
      de: 'Ein Bauauftrag mit echtem Risiko: Alle sind gespannt, und jede Idee im Team zählt.',
      en: 'A building task with real stakes: everyone is excited, and every idea in the team counts.'
    },
    intro: {
      de: 'Dieses Ei ist das letzte einer seltenen Vogelart. Es muss heil unten ankommen. Ihr seid das Rettungsteam.',
      en: 'This egg is the last of a rare bird species. It has to arrive safely. You are the rescue team.'
    },
    rules: {
      de: [
        'Bildet Teams zu zwei bis vier Personen. Jedes Team bekommt ein rohes Ei.',
        'In 25 Minuten baut jedes Team eine Konstruktion, die das Ei schützt. Draußen sammelt ihr dafür Material, aber nur Totholz und Abgefallenes.',
        'Dann lässt je eine Person pro Team die Konstruktion aus derselben Höhe fallen.',
        'Teams mit heilem Ei kommen in die nächste Runde, und die Höhe steigt.'
      ],
      en: [
        'Form teams of two to four. Each team gets a raw egg.',
        'In 25 minutes, each team builds something that protects the egg. Outdoors you collect material, but only dead wood and fallen things.',
        'Then one person per team drops the construction from the same height.',
        'Teams with an unbroken egg go on to the next round, and the height goes up.'
      ]
    },
    reflection: {
      de: [
        'Wie habt ihr euch auf eine Idee geeinigt?',
        'Was konnte jede Person beitragen?',
        'Wie seid ihr damit umgegangen, wenn etwas nicht geklappt hat?'
      ],
      en: [
        'How did you agree on one idea?',
        'What could each person contribute?',
        'How did you deal with it when something did not work?'
      ]
    },
    animatorTips: {
      de: ['Leg eine Zeitung oder Plane unter die Fallstelle. Das erspart das Putzen.'],
      en: ['Put newspaper or a tarp under the drop zone. It saves cleaning up.']
    }
  },
  {
    id: 'delfin-training',
    status: 'draft',
    title: { de: 'Delfin-Training', en: 'Dolphin Training' },
    purpose: 'zusammenarbeit',
    category: 'cooperative',
    energyLevel: 'calm',
    groupSize: { min: 5, max: 30 },
    prepLevel: 'instant',
    materials: { de: ['Keine'], en: ['None'] },
    durationMinutes: '15–30 Min',
    durationMin: 15,
    durationMax: 30,
    space: { de: 'Ein Raum mit einer Tür', en: 'A room with a door' },
    summary: {
      de: 'Eine Person soll eine geheime Aufgabe finden. Die Gruppe hilft nur mit Klatschen, wenn es in die richtige Richtung geht.',
      en: 'One person has to find a secret task. The group only helps by clapping when they move in the right direction.'
    },
    idea: {
      de: 'Zeigt, wie stark Ermutigung wirkt, und dass Umwege zum Ziel dazugehören.',
      en: 'Shows how powerful encouragement is, and that detours are part of reaching a goal.'
    },
    rules: {
      de: [
        'Eine freiwillige Person geht kurz vor die Tür.',
        'Die Gruppe legt eine Aufgabe fest, zum Beispiel: zum Fenster gehen und die linke Hand heben.',
        'Die Person kommt zurück und probiert einfach Dinge aus. Geht es in die richtige Richtung, klatscht die Gruppe. Sonst bleibt sie still.',
        'Ist die Aufgabe geschafft, gibt es großen Applaus. Dann ist die nächste Person dran.'
      ],
      en: [
        'One volunteer steps outside for a moment.',
        'The group picks a task, for example: walk to the window and raise the left hand.',
        'The person comes back and simply tries things. When they move in the right direction, the group claps. Otherwise it stays quiet.',
        'When the task is done, there is big applause. Then it is the next person’s turn.'
      ]
    },
    reflection: {
      de: [
        'Wie hat es sich angefühlt, wenn lange kein Klatschen kam?',
        'Wem in eurem Umfeld könntet ihr öfter ein „Klatschen“ schenken?'
      ],
      en: [
        'How did it feel when there was no clapping for a long time?',
        'Who around you could use more "clapping" from you?'
      ]
    },
    animatorTips: {
      de: [
        'Sag der ratenden Person: Hauptsache, du tust etwas. Falsch gibt es nicht.',
        'Bitte die Gruppe, schon bei kleinen Schritten in die richtige Richtung zu klatschen.'
      ],
      en: [
        'Tell the guessing person: just keep doing something. There is no wrong.',
        'Ask the group to clap even for small steps in the right direction.'
      ]
    }
  },
  {
    id: 'hexenhaus',
    status: 'draft',
    title: { de: 'Das Seilhaus', en: 'Rope House' },
    purpose: 'zusammenarbeit',
    category: 'cooperative',
    energyLevel: 'medium',
    groupSize: { min: 8, max: 16 },
    prepLevel: 'low_prep',
    materials: { de: ['Ein langes Seil (etwa 15 bis 20 m)'], en: ['One long rope (about 15 to 20 m)'] },
    durationMinutes: '15–20 Min',
    durationMin: 15,
    durationMax: 20,
    space: { de: 'Freie Fläche', en: 'Open floor space' },
    summary: {
      de: 'Alle halten ein langes Seil und legen damit gemeinsam das Haus vom Nikolaus, ohne loszulassen.',
      en: 'Everyone holds one long rope and together they lay out the classic "house in one stroke" drawing without letting go.'
    },
    idea: {
      de: 'Nur mit Plan und guter Absprache klappt die Form. Gut zu beobachten, wer führt und wer mitzieht.',
      en: 'The shape only works with a plan and good communication. You can see who leads and who follows.'
    },
    rules: {
      de: [
        'Zeig kurz die Figur: ein Haus mit Dach und Kreuz im Viereck, in einem Zug gezeichnet.',
        'Alle fassen das Seil an einer festen Stelle. Die Hände dürfen nicht verrutschen oder loslassen.',
        'Die Gruppe hat zuerst ein paar Minuten zum Planen.',
        'Dann legt sie das Haus mit dem Seil auf den Boden.'
      ],
      en: [
        'Briefly show the figure: a house with a roof and a cross inside the square, drawn in one stroke.',
        'Everyone holds the rope at a fixed point. Hands may not slide or let go.',
        'The group first gets a few minutes to plan.',
        'Then it lays the house on the floor with the rope.'
      ]
    },
    variants: {
      de: ['Wer in der Figur angekommen ist, darf nicht mehr sprechen.', 'Die Hälfte der Gruppe hat die Augen geschlossen.'],
      en: ['Once you are in place in the figure, you may no longer speak.', 'Half of the group keeps their eyes closed.']
    },
    reflection: {
      de: ['Wer hat geführt, und wie kam es dazu?', 'Hatten alle das gleiche Bild im Kopf?'],
      en: ['Who led, and how did that happen?', 'Did everyone have the same picture in mind?']
    },
    animatorTips: {
      de: ['Gib die Regeln einmal klar vor und beantworte danach keine Fragen mehr zum Lösungsweg.'],
      en: ['State the rules clearly once, then answer no more questions about how to solve it.']
    }
  },
  {
    id: 'stuehle-balancieren',
    status: 'draft',
    title: { de: 'Stühle balancieren', en: 'Balancing Chairs' },
    purpose: 'zusammenarbeit',
    category: 'cooperative',
    energyLevel: 'medium',
    groupSize: { min: 6, max: 25 },
    prepLevel: 'low_prep',
    materials: { de: ['Ein Stuhl pro Person'], en: ['One chair per person'] },
    durationMinutes: '10–15 Min',
    durationMin: 10,
    durationMax: 15,
    space: { de: 'Platz für einen großen Kreis', en: 'Room for a large circle' },
    summary: {
      de: 'Alle kippen ihren Stuhl auf zwei Beine und laufen einmal im Kreis, ohne dass ein Stuhl umfällt.',
      en: 'Everyone tips their chair onto two legs and the group walks around the circle without any chair falling.'
    },
    idea: {
      de: 'Ein kurzer Bewegungsauftrag, den nur die ganze Gruppe zusammen schafft.',
      en: 'A short movement challenge that only the whole group can manage together.'
    },
    rules: {
      de: [
        'Alle stehen im Kreis, jede Person hinter einem Stuhl.',
        'Fasse die Lehne mit einer Hand und kippe den Stuhl so, dass er auf zwei Beinen balanciert.',
        'Auf ein Zeichen lassen alle los und gehen einen Platz weiter, um den nächsten Stuhl zu fangen.',
        'Ziel ist eine ganze Runde. Fällt ein Stuhl oder kommt eine zweite Hand dazu, beginnt ihr neu.'
      ],
      en: [
        'Everyone stands in a circle, each behind a chair.',
        'Hold the backrest with one hand and tip the chair so it balances on two legs.',
        'On a signal, everyone lets go and moves one place on to catch the next chair.',
        'The goal is one full round. If a chair falls or a second hand is used, start again.'
      ]
    },
    safety: {
      de: ['Nur stabile Stühle ohne Rollen nehmen und Taschen aus dem Weg räumen.'],
      en: ['Only use sturdy chairs without wheels and clear bags out of the way.']
    },
    animatorTips: {
      de: ['Klappt es zu schnell, vergrößert die Abstände zwischen den Stühlen.', 'Lass alle dieselbe Hand benutzen. So siehst du leichter, ob jemand schummelt.'],
      en: ['If it works too fast, increase the gaps between the chairs.', 'Have everyone use the same hand. It makes cheating easier to spot.']
    }
  },
  {
    id: 'stift-an-schnueren',
    status: 'draft',
    title: { de: 'Ein Stift, vier Schnüre', en: 'One Pen, Four Strings' },
    purpose: 'zusammenarbeit',
    category: 'cooperative',
    energyLevel: 'calm',
    groupSize: { min: 4, max: 24 },
    prepLevel: 'materials_needed',
    materials: {
      de: ['Pro Vierergruppe: ein dicker Stift mit vier angeknoteten Schnüren (je etwa 1 m)', 'Großes Papier mit einer aufgezeichneten Strecke oder Form'],
      en: ['Per group of four: a thick marker with four strings tied to it (about 1 m each)', 'Large paper with a path or shape drawn on it']
    },
    durationMinutes: '20–30 Min',
    durationMin: 20,
    durationMax: 30,
    space: { de: 'Ein Tisch oder Boden pro Gruppe', en: 'A table or floor space per group' },
    summary: {
      de: 'Vier Personen führen gemeinsam einen Stift, nur über Schnüre, und zeichnen damit eine Strecke nach.',
      en: 'Four people steer one pen together, only by its strings, and trace a path with it.'
    },
    idea: {
      de: 'Jede Person zieht in ihre Richtung. Nur wer aufeinander achtet, bekommt eine saubere Linie hin.',
      en: 'Each person pulls in their own direction. Only by paying attention to each other do you get a clean line.'
    },
    rules: {
      de: [
        'Bildet Vierergruppen. Jede Person hält das Ende einer Schnur.',
        'Den Stift selbst darf niemand anfassen.',
        'Zeichnet die Strecke auf dem Papier nach. Du stoppst die Zeit.',
        'Danach plant jede Gruppe kurz und versucht es ein zweites Mal.'
      ],
      en: [
        'Form groups of four. Each person holds the end of one string.',
        'Nobody may touch the pen itself.',
        'Trace the path on the paper. You time it.',
        'Then each group plans briefly and tries a second time.'
      ]
    },
    variants: {
      de: ['Statt einer Strecke malt ihr ein Motiv, zum Beispiel ein Haus oder euren Gruppennamen.', 'Beim zweiten Mal wird nicht gesprochen.'],
      en: ['Instead of a path, draw a picture, for example a house or your group’s name.', 'In the second round nobody speaks.']
    },
    reflection: {
      de: ['Was hat sich zwischen dem ersten und dem zweiten Versuch verändert?'],
      en: ['What changed between the first and second attempt?']
    },
    animatorTips: {
      de: ['Die Bilder eignen sich gut als Erinnerung an der Wand.'],
      en: ['The drawings make a nice reminder on the wall.']
    }
  },
  {
    id: 'namens-akrostichon',
    status: 'draft',
    title: { de: 'Namensgedicht', en: 'Name Poem' },
    purpose: 'kennenlernen',
    category: 'cooperative',
    energyLevel: 'calm',
    groupSize: { min: 3, max: 25 },
    prepLevel: 'low_prep',
    materials: { de: ['Papier', 'Stifte'], en: ['Paper', 'Pens'] },
    durationMinutes: '15–20 Min',
    durationMin: 15,
    durationMax: 20,
    space: { de: 'Sitzplätze mit Schreibunterlage', en: 'Seats with something to write on' },
    summary: {
      de: 'Alle schreiben ihren Vornamen senkrecht auf und finden zu jedem Buchstaben etwas, das zu ihnen passt.',
      en: 'Everyone writes their first name vertically and finds something that fits them for each letter.'
    },
    idea: {
      de: 'Eine ruhige Vorstellungsrunde, bei der auch Stillere etwas von sich zeigen können.',
      en: 'A calm introduction round where quieter members can share something about themselves too.'
    },
    rules: {
      de: [
        'Alle schreiben ihren Vornamen in großen Buchstaben untereinander.',
        'Zu jedem Buchstaben kommt ein Wort oder kurzer Satz über dich: was du gern machst, was dich ausmacht, was dir wichtig ist.',
        'Danach stellen sich alle mit ihrem Blatt vor.',
        'Hängt die Blätter auf, damit sie bei den nächsten Treffen sichtbar bleiben.'
      ],
      en: [
        'Everyone writes their first name in large letters, one below the other.',
        'For each letter, add a word or short sentence about yourself: what you like doing, what makes you you, what matters to you.',
        'Then everyone introduces themselves with their sheet.',
        'Hang the sheets up so they stay visible at your next meetings.'
      ]
    },
    variants: {
      de: ['Wenn ihr euch schon kennt, zieht jede Person einen anderen Namen und schreibt Gutes über diese Person.'],
      en: ['If you already know each other, each person draws someone else’s name and writes good things about that person.']
    },
    animatorTips: {
      de: ['Mach selbst mit und zeig dein Blatt als Erstes. Das nimmt die Scheu.'],
      en: ['Join in yourself and show your sheet first. It takes away the shyness.']
    }
  },
  {
    id: 'geraeusche-raten',
    status: 'draft',
    title: { de: 'Geräusche raten', en: 'Guess the Sound' },
    purpose: 'raten',
    category: 'energizer',
    energyLevel: 'calm',
    groupSize: { min: 3, max: 25 },
    prepLevel: 'low_prep',
    materials: { de: ['Ein Sichtschutz, zum Beispiel ein Tuch über Stühlen', 'Alltagsgegenstände, die Geräusche machen'], en: ['A screen, for example a cloth over chairs', 'Everyday objects that make sounds'] },
    durationMinutes: '5–15 Min',
    durationMin: 5,
    durationMax: 15,
    space: { de: 'Beliebig', en: 'Anywhere' },
    summary: {
      de: 'Hinter einem Sichtschutz macht jemand ein Geräusch. Die anderen raten, was es war.',
      en: 'Behind a screen, someone makes a sound. The others guess what it was.'
    },
    idea: {
      de: 'Holt die Gruppe zur Ruhe, weil alle ganz still sein müssen, um gut zu hören.',
      en: 'Calms the group down, because everyone has to be very quiet to listen well.'
    },
    rules: {
      de: [
        'Eine Person geht hinter den Sichtschutz und macht ein Geräusch, zum Beispiel Papier reißen, Wasser eingießen, Stift klicken.',
        'Alle anderen sind still und hören zu.',
        'Wer eine Idee hat, meldet sich. Wer richtig rät, macht das nächste Geräusch.'
      ],
      en: [
        'One person goes behind the screen and makes a sound, for example tearing paper, pouring water, clicking a pen.',
        'Everyone else is quiet and listens.',
        'Whoever has an idea raises a hand. Whoever guesses right makes the next sound.'
      ]
    },
    variants: {
      de: ['Draußen: Alle schließen eine Minute die Augen und zählen danach auf, was sie gehört haben.'],
      en: ['Outdoors: everyone closes their eyes for a minute, then lists everything they heard.']
    },
    animatorTips: {
      de: ['Leg ein paar Gegenstände bereit, damit niemand lange überlegen muss.'],
      en: ['Have a few objects ready so nobody has to think for long.']
    }
  },
  {
    id: 'atem-zaehlen',
    status: 'draft',
    title: { de: 'Atem beobachten', en: 'Watching the Breath' },
    purpose: 'ruhe',
    category: 'cooperative',
    energyLevel: 'calm',
    groupSize: { min: 1, max: 30 },
    prepLevel: 'instant',
    materials: { de: ['Keine'], en: ['None'] },
    durationMinutes: '3–5 Min',
    durationMin: 3,
    durationMax: 5,
    space: { de: 'Sitzplätze', en: 'Seats' },
    summary: {
      de: 'Ein paar Minuten nur dem eigenen Atem folgen. Gedanken dürfen kommen und wieder gehen.',
      en: 'A few minutes of simply following your own breath. Thoughts may come and go.'
    },
    idea: {
      de: 'Hilft nach einem wilden Spiel, wieder ruhig zu werden, zum Beispiel vor einer Andacht oder dem Lernen eines Zitats.',
      en: 'Helps the group settle after a wild game, for example before a devotional or learning a quote.'
    },
    rules: {
      de: [
        'Alle sitzen bequem, die Füße auf dem Boden. Wer mag, schließt die Augen.',
        'Beim Einatmen denkst du still „ein“, beim Ausatmen „aus“.',
        'Merkst du, dass du an etwas anderes denkst, kehrst du ohne Ärger zum Atem zurück.',
        'Nach drei bis fünf Minuten beendest du die Übung mit einem leisen Zeichen.'
      ],
      en: [
        'Everyone sits comfortably, feet on the floor. Close your eyes if you like.',
        'As you breathe in, silently think "in", as you breathe out, "out".',
        'When you notice you are thinking of something else, return to the breath without getting annoyed.',
        'After three to five minutes, end the exercise with a quiet signal.'
      ]
    },
    animatorTips: {
      de: ['Fang mit einer Minute an. Juniorjugendliche brauchen etwas Übung, bis längere Stille angenehm wird.'],
      en: ['Start with one minute. Junior youth need some practice before longer silence feels comfortable.']
    }
  },
  {
    id: 'vorhang-faellt',
    status: 'draft',
    title: { de: 'Vorhang fällt', en: 'Drop the Curtain' },
    purpose: 'kennenlernen',
    category: 'competitive',
    energyLevel: 'medium',
    groupSize: { min: 8, max: 30 },
    prepLevel: 'low_prep',
    materials: { de: ['Eine große Decke oder ein Tuch als Sichtschutz'], en: ['A large blanket or sheet as a screen'] },
    durationMinutes: '10–15 Min',
    durationMin: 10,
    durationMax: 15,
    space: { de: 'Platz für zwei Gruppen und den Sichtschutz in der Mitte', en: 'Room for two groups with the screen in the middle' },
    summary: {
      de: 'Zwei Gruppen sitzen getrennt hinter einem Sichtschutz. Aus jeder Gruppe geht eine Person nach vorn. Auf drei fällt der Sichtschutz, und wer zuerst den Namen des Gegenübers ruft, gewinnt.',
      en: 'Two groups sit apart behind a screen. One person from each group steps forward. On three, the screen drops, and whoever calls out the other person’s name first wins.'
    },
    idea: {
      de: 'Übt Namen auf spielerische Weise. Nach ein paar Runden kennen alle die Namen der anderen Gruppe.',
      en: 'Practises names in a playful way. After a few rounds everyone knows the names of the other group.'
    },
    rules: {
      de: [
        'Teile die Gruppe in zwei Hälften. Zwei Personen halten die Decke als Sichtschutz zwischen ihnen hoch.',
        'Jede Gruppe schickt leise eine Person direkt vor den Sichtschutz.',
        'Die Spielleitung zählt bis drei und lässt den Sichtschutz fallen.',
        'Wer zuerst den Namen der Person gegenüber ruft, gewinnt die Runde. Die andere Person wechselt in die Gruppe der Gewinnerin oder des Gewinners.',
        'Das Spiel endet, wenn eine Gruppe leer ist oder die Zeit um ist.'
      ],
      en: [
        'Split the group in half. Two people hold up the blanket as a screen between them.',
        'Each group quietly sends one person to stand right in front of the screen.',
        'The game leader counts to three and drops the screen.',
        'Whoever calls out the name of the person opposite first wins the round. The other person joins the winner’s group.',
        'The game ends when one group is empty or time is up.'
      ]
    },
    variants: {
      de: ['Rücken an Rücken: Die beiden vorn stehen mit dem Rücken zum Sichtschutz. Ihre Gruppe beschreibt die Person gegenüber, ohne den Namen zu sagen.'],
      en: ['Back to back: the two at the front stand with their backs to the screen. Their group describes the person opposite without saying the name.']
    },
    animatorTips: {
      de: ['Spiel es erst, wenn alle die Namen einmal gehört haben, zum Beispiel nach einer Vorstellungsrunde.'],
      en: ['Play it once everyone has heard all names, for example after a round of introductions.']
    }
  },
  {
    id: 'spiegel',
    status: 'draft',
    title: { de: 'Spiegel', en: 'Mirror' },
    purpose: 'ruhe',
    category: 'cooperative',
    energyLevel: 'calm',
    groupSize: { min: 2, max: 30 },
    prepLevel: 'instant',
    materials: { de: ['Keine'], en: ['None'] },
    durationMinutes: '5–10 Min',
    durationMin: 5,
    durationMax: 10,
    space: { de: 'Platz, damit Paare sich gegenüberstehen können', en: 'Room for pairs to stand facing each other' },
    summary: {
      de: 'Zwei stehen sich gegenüber. Eine Person bewegt sich langsam, die andere macht jede Bewegung wie ein Spiegelbild mit. Am Ende soll niemand mehr erkennen, wer führt.',
      en: 'Two people stand facing each other. One moves slowly, the other copies every movement like a mirror image. In the end, nobody should be able to tell who is leading.'
    },
    idea: {
      de: 'Übt genaues Hinschauen und Rücksicht. Wer führt, merkt schnell: Der Spiegel kommt nur mit, wenn ich langsam und deutlich bin. Gut führen heißt, auf den anderen zu achten.',
      en: 'Practises close attention and consideration. The leader soon notices that the mirror can only follow if the movements are slow and clear. Leading well means paying attention to the other person.'
    },
    rules: {
      de: [
        'Teile die Gruppe in Paare. Die beiden stehen sich mit etwa einer Armlänge Abstand gegenüber, ohne sich zu berühren.',
        'In jedem Paar führt zuerst eine Person. Sie bewegt Hände, Arme, Gesicht oder den ganzen Körper ganz langsam.',
        'Die andere Person ist der Spiegel und macht jede Bewegung gleichzeitig mit. Hebt die führende Person die rechte Hand, hebt der Spiegel die linke.',
        'Nach etwa einer Minute sagst du „Wechsel“. Jetzt führt die andere Person.',
        'In der letzten Runde führt niemand fest. Beide versuchen, sich gemeinsam zu bewegen, ohne abzusprechen, wer anfängt.'
      ],
      en: [
        'Split the group into pairs. The two stand facing each other about an arm’s length apart, without touching.',
        'In each pair, one person leads first. They move their hands, arms, face or whole body very slowly.',
        'The other person is the mirror and copies every movement at the same time. If the leader raises their right hand, the mirror raises their left.',
        'After about a minute, say “Switch”. Now the other person leads.',
        'In the last round, nobody leads on purpose. Both try to move together without agreeing who starts.'
      ]
    },
    variants: {
      de: [
        'Gruppenspiegel: Eine Person steht vor der ganzen Gruppe, alle spiegeln sie.',
        'Wer führt?: Zwei Paare spielen, die anderen schauen zu und raten, wer in jedem Paar führt.'
      ],
      en: [
        'Group mirror: one person stands in front of the whole group, and everyone mirrors them.',
        'Who leads?: two pairs play while the others watch and guess who is leading in each pair.'
      ]
    },
    animatorTips: {
      de: [
        'Zeig es zuerst selbst mit einer Person vor, ganz langsam.',
        'Wird es hektisch, erinnere die Gruppe: Ziel ist nicht, den Spiegel abzuhängen, sondern zusammenzubleiben.'
      ],
      en: [
        'Demonstrate it first yourself with one person, very slowly.',
        'If it gets hectic, remind the group: the goal is not to lose the mirror but to stay together.'
      ]
    },
    reflection: {
      de: [
        'Wann war es leicht mitzugehen, und wann schwer?',
        'Was hat die führende Person getan, damit der Spiegel mitkommt?',
        'Wo im Alltag hilft es, so aufeinander zu achten?'
      ],
      en: [
        'When was it easy to follow, and when was it hard?',
        'What did the leader do to help the mirror keep up?',
        'Where in everyday life does it help to pay attention to each other like this?'
      ]
    }
  },
  {
    id: 'lebendige-skulptur',
    status: 'draft',
    title: { de: 'Lebendige Skulptur', en: 'Living Sculpture' },
    purpose: 'zusammenarbeit',
    category: 'cooperative',
    energyLevel: 'medium',
    groupSize: { min: 4, max: 30 },
    prepLevel: 'instant',
    materials: { de: ['Keine'], en: ['None'] },
    durationMinutes: '10–20 Min',
    durationMin: 10,
    durationMax: 20,
    space: { de: 'Freie Fläche in der Mitte des Raums', en: 'Open space in the middle of the room' },
    summary: {
      de: 'Kleine Gruppen bauen ohne Worte ein Standbild zu einem Begriff wie Einheit, Freundschaft oder Dienst. Die anderen schauen es an und sagen, was sie sehen.',
      en: 'Small groups build a frozen statue of a word such as unity, friendship or service, without talking. The others look at it and say what they see.'
    },
    idea: {
      de: 'Macht große Begriffe greifbar. Die Gruppe muss sich ohne Worte einigen, und jede Person wird gebraucht. Gut als Brücke zu einem Zitat oder zum Thema des Treffens.',
      en: 'Makes big ideas tangible. The group has to agree without words, and every person is needed. A good bridge to a quote or the theme of the meeting.'
    },
    rules: {
      de: [
        'Teile die Gruppe in Kleingruppen mit vier bis sechs Personen.',
        'Nenne einen Begriff, zum Beispiel Einheit, Freundschaft, Hilfe, Gerechtigkeit oder Dienst.',
        'Jede Kleingruppe hat zwei Minuten. Ohne zu sprechen baut sie ein Standbild: Eine Person beginnt mit einer Haltung, die nächste ergänzt sie, bis alle Teil des Bildes sind.',
        'Auf dein Zeichen erstarren alle und halten das Bild zehn Sekunden still.',
        'Die anderen gehen einmal um das Standbild herum und sagen, was sie sehen. Danach erzählt die Kleingruppe, was sie zeigen wollte.'
      ],
      en: [
        'Split the group into small groups of four to six people.',
        'Name a word, for example unity, friendship, help, justice or service.',
        'Each small group has two minutes. Without talking, they build a statue: one person starts with a pose, the next adds to it, until everyone is part of the picture.',
        'On your signal, everyone freezes and holds the picture still for ten seconds.',
        'The others walk once around the statue and say what they see. Then the small group explains what they wanted to show.'
      ]
    },
    variants: {
      de: [
        'Jetzt und später: Die Kleingruppe baut zuerst ein Bild davon, wie etwas heute ist, dann eines, wie es sein könnte, und geht langsam vom einen ins andere über.',
        'Zitat-Bild: Nimm einen Satz aus dem Zitat, das die Gruppe gerade lernt, als Begriff.'
      ],
      en: [
        'Now and later: the small group first builds a picture of how something is today, then one of how it could be, and moves slowly from one to the other.',
        'Quote picture: use a sentence from the quote the group is learning as the word.'
      ]
    },
    safety: {
      de: ['Niemand muss andere berühren. Jede Person entscheidet selbst, wie nah sie anderen kommt.'],
      en: ['Nobody has to touch anyone. Each person decides for themselves how close they come to others.']
    },
    animatorTips: {
      de: [
        'Fang mit einem einfachen Begriff wie „Freundschaft“ an, bevor schwierigere kommen.',
        'Achte darauf, dass beim Anschauen nur beschrieben und nicht bewertet wird.'
      ],
      en: [
        'Start with a simple word like “friendship” before harder ones.',
        'Make sure people only describe what they see and do not judge it.'
      ]
    },
    reflection: {
      de: [
        'Was war schwer daran, sich ohne Worte zu einigen?',
        'Welches Bild hat dich überrascht?',
        'Wie könnte Einheit in unserer Nachbarschaft aussehen?'
      ],
      en: [
        'What was hard about agreeing without words?',
        'Which picture surprised you?',
        'What could unity look like in our neighbourhood?'
      ]
    }
  },
];
