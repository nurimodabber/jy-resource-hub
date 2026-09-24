import { Game } from '../types';

export const GAMES_DATA: Game[] = [
  {
    id: 'ssp-evolution',
    title: {
      de: 'Schnick-Schnack-Schnuck Evolution',
      en: 'Rock Paper Scissors Evolution'
    },
    category: 'energizer',
    energyLevel: 'high',
    groupSize: { min: 8, max: 60 },
    prepLevel: 'instant',
    materials: {
      de: ['Keine'],
      en: ['None']
    },
    durationMinutes: '5–10 Min',
    space: {
      de: 'Freie Fläche (drinnen oder draußen)',
      en: 'Open space (indoor or outdoor)'
    },
    summary: {
      de: 'Alle beginnen auf Stufe 1 am Boden und steigen durch gewonnene Duelle über Huhn und Affe bis zum aufrechten Menschen auf.',
      en: 'Everyone begins crouching on level 1, advancing through duels from egg to chicken, ape, and upright human.'
    },
    idea: {
      de: 'Ein schneller Bewegungseisbrecher, der alle sofort in Interaktion bringt und jegliche Hemmungen abbaut.',
      en: 'A rapid movement icebreaker that immediately gets everyone moving and breaks social hesitation.'
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
  {
    id: 'ssp-showdown',
    title: {
      de: 'Schere-Stein-Papier Fankurve',
      en: 'Rock Paper Scissors Cheering Train'
    },
    category: 'competitive',
    energyLevel: 'high',
    groupSize: { min: 10, max: 80 },
    prepLevel: 'instant',
    materials: {
      de: ['Keine'],
      en: ['None']
    },
    durationMinutes: '7–12 Min',
    space: {
      de: 'Überall möglich',
      en: 'Any open space'
    },
    summary: {
      de: 'Jeder Verlierer eines Duells schließt sich sofort als Fan hinter dem Gewinner an, bis zwei riesige Fangruppen im Finale aufeinandertreffen.',
      en: 'Every player who loses a duel joins as a fan behind the winner, building massive cheering trains that collide in a dramatic finale.'
    },
    idea: {
      de: 'Verwandelt ein simples Duellspiel in ein mitreißendes Gemeinschaftserlebnis, bei dem niemand ausscheidet.',
      en: 'Turns a basic duel into an electrifying group experience where nobody feels left out.'
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
  {
    id: 'empire',
    title: {
      de: 'Empire (Das geheime Königreich)',
      en: 'Empire (The Secret Kingdom)'
    },
    category: 'social_deduction',
    energyLevel: 'medium',
    groupSize: { min: 8, max: 30 },
    prepLevel: 'low_prep',
    materials: {
      de: ['Kleine Zettel', 'Stifte', 'Optional: Empire-Board im Toolkit'],
      en: ['Paper slips', 'Pens', 'Optional: In-app Empire Board']
    },
    durationMinutes: '20–40 Min',
    space: {
      de: 'Sitzkreis in einem Raum',
      en: 'Indoor seated circle'
    },
    summary: {
      de: 'Jeder schreibt geheim einen Begriff oder Namen zu einem Thema auf. Wer die Identitäten errät, gliedert die Spieler in das eigene Reich ein.',
      en: 'Each person writes down a secret identity or phrase. Players guess who submitted what, absorbing members into expanding empires.'
    },
    idea: {
      de: 'Verbindet Beobachtungsgabe, Gedächtnis und Humor. Lässt sich durch jugendrelevante Themenkarten exzellent anpassen.',
      en: 'Combines deduction, memory, and group wit. Enhanced by modern teen-relevant category prompts.'
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
        'Nutzt das interaktive Empire-Board im Reiter „Praxis-Toolkits“ – so muss die Liste nicht ständig wiederholt werden.',
        'Die Mitglieder eines Reiches dürfen ihren König leise beraten, aber nur der König spricht die Vermutung laut aus.'
      ],
      en: [
        'Use the interactive Empire Board in the "Field Toolkits" tab to display names on screen without constant interruptions.',
        'Empire subjects may quietly consult their king, but only the king states the official guess.'
      ]
    },
    isFavoriteDefault: true
  },
  {
    id: 'helium-stick',
    title: {
      de: 'Helium Stick (Die schwebende Stange)',
      en: 'Helium Stick'
    },
    category: 'cooperative',
    energyLevel: 'calm',
    groupSize: { min: 8, max: 16 },
    prepLevel: 'materials_needed',
    materials: {
      de: ['Eine sehr leichte lange Stange (z. B. Bambusrohr oder leichte Zeltstange)'],
      en: ['A very light thin pole or bamboo stick']
    },
    durationMinutes: '15–25 Min',
    space: {
      de: 'Ausreichend Stehfläche',
      en: 'Enough room for two parallel standing lines'
    },
    summary: {
      de: 'Eine leichte Stange liegt auf den Zeigefingern aller Teilnehmer. Das Ziel: sie gemeinsam abzulegen. Doch der unwillkürliche Druck lässt sie nach oben steigen.',
      en: 'A lightweight stick rests across everyone’s index fingers. The goal is to lower it together, yet collective tension makes it rise.'
    },
    idea: {
      de: 'Ein eindrucksvolles gruppendynamisches Phänomen: Erfolg ist nur möglich, wenn alle gemeinsam Druck abbauen und Ruhe bewahren.',
      en: 'A powerful demonstration of group dynamics: success is only possible when all participants consciously reduce pressure.'
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
  {
    id: 'gemeinsam-zaehlen',
    title: {
      de: 'Gemeinsam Zählen (The Mind)',
      en: 'Silent Counting (The Mind)'
    },
    category: 'cooperative',
    energyLevel: 'calm',
    groupSize: { min: 6, max: 25 },
    prepLevel: 'instant',
    materials: {
      de: ['Keine'],
      en: ['None']
    },
    durationMinutes: '10–15 Min',
    space: {
      de: 'Ruhiger Sitzkreis',
      en: 'Quiet seated circle'
    },
    summary: {
      de: 'Die Gruppe zählt mit geschlossenen Augen von 1 bis 20 – ohne Absprachen oder feste Reihenfolge. Sprechen zwei gleichzeitig: Neustart.',
      en: 'The group counts from 1 to 20 with eyes closed—no designated sequence, no signals. If two speak together: reset.'
    },
    idea: {
      de: 'Schult tiefes gegenseitiges Zuhören, Geduld und die Fähigkeit, gemeinsame Stille auszuhalten.',
      en: 'Builds deep active listening, communal patience, and mutual awareness without spoken words.'
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
  {
    id: 'spion',
    title: {
      de: 'Spion (Spyfall)',
      en: 'Spyfall'
    },
    category: 'social_deduction',
    energyLevel: 'medium',
    groupSize: { min: 5, max: 12 },
    prepLevel: 'low_prep',
    materials: {
      de: ['Zettel mit Ort für jeden Mitspieler, einer davon als „Spion“ markiert'],
      en: ['Location slips for everyone, one marked "Spy"']
    },
    durationMinutes: '15–20 Min',
    space: {
      de: 'Sitzkreis',
      en: 'Seated circle'
    },
    summary: {
      de: 'Alle kennen den geheimen Ort (z. B. Bibliothek, U-Boot, Flughafen) – außer dem Spion! Durch clevere Fragen muss er enttarnt werden.',
      en: 'Everyone knows the secret location (e.g. library, submarine, airport)—except the spy, who must bluff and deduce the location.'
    },
    idea: {
      de: 'Trainiert sprachliche Genauigkeit, schnelles Mitdenken und subtiles Nachfragen ohne direkte Verratshinweise.',
      en: 'Cultivates linguistic precision, deductive reasoning, and subtle questioning.'
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
  {
    id: 'ninja',
    title: {
      de: 'Ninja',
      en: 'Ninja'
    },
    category: 'competitive',
    energyLevel: 'high',
    groupSize: { min: 4, max: 18 },
    prepLevel: 'instant',
    materials: {
      de: ['Keine'],
      en: ['None']
    },
    durationMinutes: '10–15 Min',
    space: {
      de: 'Ausreichend Bewegungsradius',
      en: 'Open space with ample movement room'
    },
    summary: {
      de: 'Rundenbasiertes Reaktionsspiel im Kreis mit festen Posen. Versuche in einer fließenden Bewegung die Hand deines Nachbarn abzuschlagen.',
      en: 'Turn-based reaction game in a circle with frozen stances. In one fluid motion, strike toward an opponent’s hand.'
    },
    idea: {
      de: 'Ein Klassiker bei Freizeiten: Null Materialaufwand und hoher Aufforderungscharakter durch theatralische Posen.',
      en: 'A camp classic: zero prep, highly engaging, and memorable physical coordination.'
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
    id: 'saeuresee',
    title: {
      de: 'Der Säuresee (Schwebender Transport)',
      en: 'The Acid River (Suspended Transport)'
    },
    category: 'cooperative',
    energyLevel: 'calm',
    groupSize: { min: 6, max: 16 },
    prepLevel: 'materials_needed',
    materials: {
      de: ['Lange Schnüre oder Seile', 'Ein voller Wasserbecher oder Holzklotz', 'Bodenmarkierung für den Kreis'],
      en: ['Long ropes or strings', 'A cup of water or wooden block', 'Rope/chalk boundary']
    },
    durationMinutes: '20–30 Min',
    space: {
      de: 'Freie Bodenfläche (min. 5x5 Meter)',
      en: 'Floor area (at least 5x5 meters)'
    },
    summary: {
      de: 'Ein Gegenstand steht in der Mitte einer 4 Meter breiten Sperrzone und muss rein über Seilzüge geborgen werden, ohne den Boden zu betreten.',
      en: 'An object rests inside an off-limits zone and must be recovered purely using tensioned ropes without stepping inside.'
    },
    idea: {
      de: 'Praktische Problemlösung mit direkten physikalischen Konsequenzen: Verlangt ruhige Absprache statt Hektik.',
      en: 'Practical problem solving with real physical stakes: requires structured planning rather than impulsive rushing.'
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
  {
    id: 'eisschollen-rettung',
    title: {
      de: 'Eisschollen-Rettung (Flussüberquerung)',
      en: 'Ice Flow Crossing'
    },
    category: 'cooperative',
    energyLevel: 'high',
    groupSize: { min: 6, max: 20 },
    prepLevel: 'low_prep',
    materials: {
      de: ['A4-Blätter, Teppichfliesen oder Kissen (weniger Schollen als Personen!)'],
      en: ['Sheets of paper, carpet tiles, or mats (fewer tiles than people)']
    },
    durationMinutes: '15–20 Min',
    space: {
      de: 'Raum mit 8–10 Metern Länge',
      en: 'Room or lawn 8–10 meters wide'
    },
    summary: {
      de: 'Die Gruppe muss einen Fluss überqueren, hat aber weniger Trittflächen als Personen. Bleibt eine Scholle unberührt, schmilzt sie weg!',
      en: 'The group must cross an open expanse with fewer stepping platforms than people. Leave a tile empty, and it vanishes!'
    },
    idea: {
      de: 'Gemeinsames Vorankommen unter Ressourcenknappheit: Erfordert enges Zusammenrücken und vorausschauendes Weiterreichen.',
      en: 'Collaborative movement under strict resource constraints: requires close support and foresight.'
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
  {
    id: 'psychiater',
    title: {
      de: 'Der Psychiater',
      en: 'The Psychiatrist'
    },
    category: 'social_deduction',
    energyLevel: 'calm',
    groupSize: { min: 6, max: 20 },
    prepLevel: 'instant',
    materials: {
      de: ['Keine'],
      en: ['None']
    },
    durationMinutes: '15–25 Min',
    space: {
      de: 'Sitzkreis',
      en: 'Seated circle'
    },
    summary: {
      de: 'Ein Ermittler verlässt den Raum. Die Gruppe vereinbart ein gemeinsames Antwortmuster, das durch geschickte Fragen durchschaut werden muss.',
      en: 'An investigator leaves the room. The group agrees on a shared behavioral code that must be diagnosed through questioning.'
    },
    idea: {
      de: 'Ein humorvolles Denkspiel, das logische Mustererkennung und Beobachtungsgabe fördert.',
      en: 'A witty deduction activity enhancing pattern recognition and social observation.'
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
  {
    id: 'salad-bowl',
    title: {
      de: 'Salad Bowl (Wörter-Staffel)',
      en: 'Salad Bowl (Three-Round Catchphrase)'
    },
    category: 'competitive',
    energyLevel: 'high',
    groupSize: { min: 6, max: 24 },
    prepLevel: 'low_prep',
    materials: {
      de: ['Eine Schüssel', 'Zettel & Stifte', 'Timer'],
      en: ['Bowl', 'Paper slips & pens', 'Timer']
    },
    durationMinutes: '25–40 Min',
    space: {
      de: 'Sitzgelegenheiten für zwei Teams',
      en: 'Seating for two teams'
    },
    summary: {
      de: 'Dieselbe Sammlung von Begriffen wird über drei Runden erraten: Erst normale Erklärung, dann nur 1 einziges Wort, dann reine Pantomime.',
      en: 'The exact same pool of concepts is guessed across three escalating rounds: full verbal clues, a single word, and pure pantomime.'
    },
    idea: {
      de: 'Weil die Begriffe in den späteren Runden bereits bekannt sind, steigt das Spieltempo und der Wiedererkennungswert rasant an.',
      en: 'Because the vocabulary is familiar from round 1, rounds 2 and 3 produce lightning-fast associations and shared laughter.'
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
  }
];
