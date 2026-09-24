import { Game } from '../types';

export const GAMES_DATA: Game[] = [
  // 1. Wer bin ich
  {
    id: 'wer-bin-ich',
    title: {
      de: 'Wer bin ich?',
      en: 'Who Am I?'
    },
    category: 'social_deduction',
    energyLevel: 'calm',
    groupSize: { min: 4, max: 25 },
    prepLevel: 'low_prep',
    materials: {
      de: ['Haftnotizen (Post-its)', 'Stifte'],
      en: ['Sticky notes', 'Pens']
    },
    durationMinutes: '15–25 Min',
    space: {
      de: 'Sitzkreis',
      en: 'Seated circle'
    },
    summary: {
      de: 'Jeder trägt den Namen einer bekannten Persönlichkeit oder eines Begriffs auf der Stirn und muss durch geschickte Ja/Nein-Fragen die eigene Identität erraten.',
      en: 'Each person wears the name of a character or object on their forehead, deducing their identity using strictly yes/no questions.'
    },
    idea: {
      de: 'Klassisches Deduktionsspiel, das logisches Ausschließen und präzises Fragen schult.',
      en: 'Classic deduction game training logical elimination and precise questioning.'
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
    category: 'social_deduction',
    energyLevel: 'medium',
    groupSize: { min: 8, max: 25 },
    prepLevel: 'low_prep',
    materials: {
      de: ['Werwolf-Karten oder beschriftete Zettel'],
      en: ['Role cards or written slips']
    },
    durationMinutes: '25–45 Min',
    space: {
      de: 'Ruhiger Raum mit Sitzkreis',
      en: 'Quiet room with seated circle'
    },
    summary: {
      de: 'Dorfbewohner versuchen heimliche Werwölfe in ihren Reihen zu entlarven, bevor das Dorf überrannt wird.',
      en: 'Villagers work to deduce and eliminate secret werewolves lurking among them before it is too late.'
    },
    idea: {
      de: 'Fördert überzeugende Gesprächsführung, aufmerksames Beobachten und argumentative Standhaftigkeit.',
      en: 'Develops persuasive argumentation, keen observation, and debate discipline.'
    },
    rules: {
      de: [
        'Jeder erhält geheim eine Rollenkarte (z. B. Dorfbewohner, Werwolf, Seherin, Hexe).',
        'Nachtphase: Alle schließen die Augen. Der Spielleiter ruft nacheinander die Sonderrollen auf. Die Werwölfe einigen sich stumm auf ein Opfer.',
        'Tagphase: Das Dorf erwacht. Der Spielleiter berichtet vom nächtlichen Vorfall.',
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

  // 4. Psychiater
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

  // 5. Empire
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

  // 6. Schere Stein Papier Showdown
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

  // 7. Schnick Schnack Schnuck Evolution
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

  // 8. Salad Bowl
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
  },

  // 9. Schlafmütze (Mörder in der Runde)
  {
    id: 'schlafmuetze-moerder',
    title: {
      de: 'Mörder in der Runde (Zwinkerspiel)',
      en: 'Wink Murder'
    },
    category: 'social_deduction',
    energyLevel: 'calm',
    groupSize: { min: 8, max: 25 },
    prepLevel: 'low_prep',
    materials: {
      de: ['Spielkarten oder Zettel zur Rollenvergabe'],
      en: ['Playing cards or secret slips for role distribution']
    },
    durationMinutes: '15–20 Min',
    space: {
      de: 'Sitzkreis mit gutem Blickkontakt',
      en: 'Seated circle with clear sightlines'
    },
    summary: {
      de: 'Ein geheimer Täter schaltet Mitspieler durch unauffälliges Zuzwinkern aus. Ein Detektiv (oder die Gruppe) muss ihn überführen.',
      en: 'A secret culprit eliminates players by discreetly winking at them while a detective tries to catch them.'
    },
    idea: {
      de: 'Schult intensive Blickkontakte, Körpersprache und ruhige Beobachtung im Raum.',
      en: 'Develops visual acuity, subtle body language observation, and quiet tension in the room.'
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

  // 10. Menschlicher Knoten
  {
    id: 'menschlicher-knoten',
    title: {
      de: 'Der menschliche Knoten',
      en: 'Human Knot'
    },
    category: 'cooperative',
    energyLevel: 'medium',
    groupSize: { min: 6, max: 16 },
    prepLevel: 'instant',
    materials: {
      de: ['Keine'],
      en: ['None']
    },
    durationMinutes: '10–20 Min',
    space: {
      de: 'Freie Stehfläche',
      en: 'Open standing area'
    },
    summary: {
      de: 'Alle greifen sich kreuz und quer an den Händen und müssen das Gewirr durch Drehen und Steigen entknoten, ohne loszulassen.',
      en: 'Participants reach across a circle to grab random hands and must untangle themselves into an open circle without letting go.'
    },
    idea: {
      de: 'Ein Klassiker des handlungsorientierten Teambuildings: Fördert geduldige Kommunikation und physische Flexibilität.',
      en: 'A foundational teamwork exercise testing patience, spatial communication, and gentle physical coordination.'
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

  // 11. Hi Ha Ho
  {
    id: 'hi-ha-ho',
    title: {
      de: 'Hi – Ha – Ho (Rhythmus-Duell)',
      en: 'Hi – Ha – Ho'
    },
    category: 'competitive',
    energyLevel: 'high',
    groupSize: { min: 6, max: 20 },
    prepLevel: 'instant',
    materials: {
      de: ['Keine'],
      en: ['None']
    },
    durationMinutes: '10–15 Min',
    space: {
      de: 'Fester Stehkreis',
      en: 'Standing circle'
    },
    summary: {
      de: 'Hochenergetisches Reaktionsspiel im Kreis mit festen Lauten und Schnitten. Trainiert blitzschnelle Wachheit.',
      en: 'Fast-paced rhythmic reaction game in a circle using rapid sword-like poses and acoustic calls.'
    },
    idea: {
      de: 'Stresst das Kurzzeitgedächtnis positiv und bringt schlagartig maximale Wachheit in den Raum.',
      en: 'Engages short-term memory and sharp reflexes, instantly lifting group alertness.'
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

  // 13. Gemeinsam Zählen (The Mind)
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

  // 14. Minenfeld (Blindes Führen)
  {
    id: 'minenfeld',
    title: {
      de: 'Das Minenfeld (Blindes Führen)',
      en: 'The Minefield'
    },
    category: 'cooperative',
    energyLevel: 'medium',
    groupSize: { min: 6, max: 24 },
    prepLevel: 'low_prep',
    materials: {
      de: ['Augenbinden oder Tücher', 'Hindernisse (Flaschen, Kissen, Hütchen, Bälle)'],
      en: ['Blindfolds', 'Obstacles (bottles, cones, cushions, balls)']
    },
    durationMinutes: '15–25 Min',
    space: {
      de: 'Größerer Raum oder Rasenfläche',
      en: 'Large room or lawn'
    },
    summary: {
      de: 'Eine Person muss mit verbundenen Augen ein Hindernisfeld durchqueren – geleitet rein durch die präzisen Zurufe eines Partners.',
      en: 'A blindfolded participant must navigate across an obstacle field guided purely by the vocal directions of a partner.'
    },
    idea: {
      de: 'Baut tiefes gegenseitiges Vertrauen auf und schult klare, unmissverständliche Kommunikation unter Reizüberflutung.',
      en: 'Builds interpersonal trust and teaches concise communication amidst background noise.'
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

  // 15. Gemeinsame Geschichte (Ein-Wort-Geschichte)
  {
    id: 'ein-wort-geschichte',
    title: {
      de: 'Die Ein-Wort-Geschichte',
      en: 'One-Word Story'
    },
    category: 'cooperative',
    energyLevel: 'calm',
    groupSize: { min: 4, max: 20 },
    prepLevel: 'instant',
    materials: {
      de: ['Keine'],
      en: ['None']
    },
    durationMinutes: '10–15 Min',
    space: {
      de: 'Sitzkreis',
      en: 'Seated circle'
    },
    summary: {
      de: 'Die Gruppe erfindet gemeinsam eine logische Geschichte, bei der jeder immer nur genau ein einziges Wort beisteuern darf.',
      en: 'The group collaboratively weaves a coherent narrative where each person speaks exactly one word per turn.'
    },
    idea: {
      de: 'Trainiert das Loslassen eigener vorgefertigter Pläne und das feinfühlige Anknüpfen an den Gedanken des Vorgängers.',
      en: 'Teaches relinquishing personal ego and building constructively on what others contribute.'
    },
    rules: {
      de: [
        'Alle sitzen im Kreis.',
        'Reihum steuert jede Person genau ein Wort bei, das grammatikalisch und inhaltlich an das vorherige anschließt.',
        'Das Tempo sollte zügig sein: Nicht 10 Sekunden überlegen, sondern spontan reagieren.',
        'Ziel ist es, eine sinnvolle Handlung aufzubauen (Einleitung, Wendepunkt, Auflösung), ohne den Faden zu verlieren.'
      ],
      en: [
        'Sit in a circle.',
        'Going in sequence, each person contributes exactly one word that connects grammatically and semantically to the last.',
        'Keep momentum brisk: avoid overthinking.',
        'The objective is to sustain a coherent narrative arc (introduction, conflict, resolution).'
      ]
    },
    animatorTips: {
      de: [
        'Gebt zu Beginn ein inspirierendes Thema oder ein erstes Wort vor (z. B. „Gestern...“ oder „Plötzlich...“).',
        'Großartig für Zwischendurch oder im Bus während einer Campfahrt.'
      ],
      en: [
        'Provide a creative starter word or scenario to establish momentum (e.g. "Suddenly..." or "Yesterday...").',
        'Perfect as a portable travel or bus game during camp outings.'
      ]
    }
  },

  // 16. Helium Stick
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

  // 17. Stand Up
  {
    id: 'stand-up-ruecken',
    title: {
      de: 'Stand Up (Rücken an Rücken aufstehen)',
      en: 'Back-to-Back Stand Up'
    },
    category: 'cooperative',
    energyLevel: 'high',
    groupSize: { min: 2, max: 40 },
    prepLevel: 'instant',
    materials: {
      de: ['Keine'],
      en: ['None']
    },
    durationMinutes: '10–15 Min',
    space: {
      de: 'Ebener Boden mit Bewegungsfreiheit',
      en: 'Flat ground with open space'
    },
    summary: {
      de: 'Zwei Personen sitzen Rücken an Rücken und müssen ohne Hände aufstehen. Danach zu viert, zu acht – bis die gesamte Gruppe synchron aufsteht.',
      en: 'Two players sit back-to-back and stand up without using their hands. Expand to quartets, then eight, until the whole group rises as one.'
    },
    idea: {
      de: 'Verlangt synchrone Kraftübertragung und gegenseitiges Stützen: Einer allein fällt um, gemeinsam steht man sicher.',
      en: 'Requires balanced counter-pressure and physical synchronicity: individual effort collapses, shared commitment succeeds.'
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

  // 18. Stumme Reihe
  {
    id: 'stumme-reihe',
    title: {
      de: 'Die stumme Reihe',
      en: 'The Silent Lineup'
    },
    category: 'cooperative',
    energyLevel: 'calm',
    groupSize: { min: 6, max: 35 },
    prepLevel: 'instant',
    materials: {
      de: ['Keine'],
      en: ['None']
    },
    durationMinutes: '10–15 Min',
    space: {
      de: 'Ausreichend Raumlänge',
      en: 'Room length for a single file line'
    },
    summary: {
      de: 'Die Gruppe muss sich nach einem geheimen Kriterium (z. B. Geburtstag oder Schuhgröße) der Reihe nach aufstellen – ohne ein einziges Wort zu sprechen.',
      en: 'The group must order themselves by a specific metric (e.g. birthday or shoe size) without speaking a single word.'
    },
    idea: {
      de: 'Fördert nonverbale Kommunikation, Gestik und kollektives Mitdenken ohne Sprache.',
      en: 'Sharpens nonverbal gesturing, empathy, and collective coordination in silence.'
    },
    rules: {
      de: [
        'Die Spielleitung nennt das Sortierkriterium (z. B. Geburtstag vom 1. Januar bis 31. Dezember, Hausnummer oder Körpergröße).',
        'Mit dem Startsignal gilt absolutes Sprechverbot. Auch Lippenlesen oder Flüstern ist untersagt.',
        'Die Gruppe darf nur über Zeichensprache, Gesten und Fingerzeichen kommunizieren.',
        'Sobald alle in einer geraden Reihe stehen, wird von vorne nach hinten laut aufgelöst und kontrolliert.'
      ],
      en: [
        'The facilitator announces the sorting criteria (e.g. birthday from Jan 1 to Dec 31, house number, or height).',
        'Upon the signal, absolute silence begins. No whispering or overt lip-reading.',
        'Participants communicate strictly via hand gestures, finger counting, and body language.',
        'Once the line settles, players announce their numbers sequentially from front to back to verify accuracy.'
      ]
    },
    animatorTips: {
      de: [
        'Stoppt die Zeit: „Schaffen wir es unter 60 Sekunden fehlerfrei?“',
        'Steigerung für Fortgeschrittene: Alle stehen auf einer Bank oder einer Linie und dürfen beim Sortieren den Boden daneben nicht berühren.'
      ],
      en: [
        'Time the attempt: "Can we achieve a flawless line in under 60 seconds?"',
        'Advanced variation: Have the group stand on a narrow bench or tape line without stepping off.'
      ]
    }
  },

  // 19. Eisschollen-Rettung
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

  // 20. Lebender Balltransport (Pipelines)
  {
    id: 'lebender-balltransport',
    title: {
      de: 'Pipelines (Der lebende Balltransport)',
      en: 'Pipelines'
    },
    category: 'cooperative',
    energyLevel: 'high',
    groupSize: { min: 8, max: 25 },
    prepLevel: 'materials_needed',
    materials: {
      de: ['Halbierte Rohrstücke oder gefaltete A4-Pappen', 'Ein Tischtennis- oder Golfball', 'Zielbehälter'],
      en: ['Half-pipe tubes or folded cardstock', 'A ping pong or golf ball', 'Target cup']
    },
    durationMinutes: '15–25 Min',
    space: {
      de: 'Flur, Saal oder Wiese',
      en: 'Long hallway, hall, or lawn'
    },
    summary: {
      de: 'Ein rollender Ball muss über eine lange Strecke transportiert werden, indem die Spieler ihre kurzen Rohrstücke blitzschnell neu aneinanderreihen.',
      en: 'A rolling ball must travel across a long distance by players sprinting to recombine short gutter pipes.'
    },
    idea: {
      de: 'Erfordert hohe Laufbereitschaft, nahtlose Übergaben und das Zurückstellen eigener Bequemlichkeit für das Teamziel.',
      en: 'Requires rapid sprinting, smooth handoffs, and selflessness to keep the ball in motion.'
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
    category: 'cooperative',
    energyLevel: 'calm',
    groupSize: { min: 6, max: 18 },
    prepLevel: 'materials_needed',
    materials: {
      de: ['Ein langes Seil (10–15 Meter, verknotet)', 'Augenbinden für alle'],
      en: ['A long knotted rope (10–15 meters)', 'Blindfolds for all']
    },
    durationMinutes: '15–25 Min',
    space: {
      de: 'Freie Raumfläche',
      en: 'Open floor space'
    },
    summary: {
      de: 'Die Gruppe hält ein langes Seil und muss mit verbundenen Augen ein geometrisch exaktes Quadrat mit rechten Winkeln auf dem Boden formen.',
      en: 'Blindfolded participants holding a loop of rope must coordinate to shape it into a geometrically precise square on the floor.'
    },
    idea: {
      de: 'Schult räumliches Vorstellungsvermögen, Führungsübernahme ohne Dominanz und gemeinsames Abstimmen im Dunkeln.',
      en: 'Challenges spatial visualization, egalitarian leadership, and vocal coordination in darkness.'
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
      de: 'Decke wenden (Der fliegende Teppich)',
      en: 'Turn the Tarp'
    },
    category: 'cooperative',
    energyLevel: 'medium',
    groupSize: { min: 6, max: 16 },
    prepLevel: 'materials_needed',
    materials: {
      de: ['Eine Decke, Plane oder großes Tuch'],
      en: ['A blanket, tarp, or large sheet']
    },
    durationMinutes: '12–20 Min',
    space: {
      de: 'Fester Boden',
      en: 'Solid flat floor'
    },
    summary: {
      de: 'Die gesamte Gruppe steht auf einer ausgebreiteten Decke und muss diese auf die Unterseite wenden, ohne dass jemand den Boden daneben berührt.',
      en: 'The entire group stands on a blanket and must flip it completely over to its reverse side without anyone stepping off.'
    },
    idea: {
      de: 'Verlangt enges Zusammenrücken, gegenseitiges Festhalten und geschickte Gewichtsverlagerung auf engstem Raum.',
      en: 'Requires close physical support, mutual balance, and strategic weight shifting in confined space.'
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
      de: '100-Schläge-Ball (Ball in der Luft)',
      en: 'Keep It Up (100 Hits)'
    },
    category: 'cooperative',
    energyLevel: 'high',
    groupSize: { min: 6, max: 30 },
    prepLevel: 'materials_needed',
    materials: {
      de: ['Ein leichter Softball, Volleyball oder Luftballon'],
      en: ['A light foam ball, volleyball, or balloon']
    },
    durationMinutes: '10–15 Min',
    space: {
      de: 'Freie Raumhöhe',
      en: 'Room with open ceiling or lawn'
    },
    summary: {
      de: 'Die Gruppe hält einen Ball durch Schlagen gemeinsam in der Luft, bis eine Zielmarke (z. B. 50 oder 100 Kontakte) erreicht ist.',
      en: 'The group keeps a ball airborne through consecutive taps until reaching a shared goal (e.g. 50 or 100 touches).'
    },
    idea: {
      de: 'Ein dynamischer Energie- und Koordinationsbooster, der alle Blicke nach oben lenkt und gemeinsame Begeisterung weckt.',
      en: 'A high-energy team coordination booster that unites group focus upward in shared celebration.'
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
    category: 'cooperative',
    energyLevel: 'medium',
    groupSize: { min: 8, max: 25 },
    prepLevel: 'low_prep',
    materials: {
      de: ['Zettel mit Zahlen (z. B. 1–100, unregelmäßig vergeben)', 'Klebeband'],
      en: ['Slips with numbers (e.g. 1–100, non-consecutive)', 'Tape']
    },
    durationMinutes: '12–18 Min',
    space: {
      de: 'Freie Raumfläche',
      en: 'Open floor space'
    },
    summary: {
      de: 'Jeder hat eine geheime Zahl auf Stirn oder Rücken, kennt aber nur die Zahlen der anderen. Ohne Worte muss eine aufsteigende Reihe gebildet werden.',
      en: 'Each person wears a number they cannot see, visible only to others. In silence, they must organize themselves in ascending order.'
    },
    idea: {
      de: 'Man sieht nur das Potenzial und den Platz des anderen: Erfolg gelingt nur, indem man anderen hilft, ihren richtigen Platz zu finden.',
      en: 'You only see others’ numbers: success comes from altruistically helping others find their correct position.'
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
    category: 'cooperative',
    energyLevel: 'medium',
    groupSize: { min: 8, max: 18 },
    prepLevel: 'materials_needed',
    materials: {
      de: ['Ein Seil oder Flatterband, gespannt auf 1,00 bis 1,20 m Höhe'],
      en: ['A rope or ribbon tensioned at 1.0 to 1.2 meters height']
    },
    durationMinutes: '20–30 Min',
    space: {
      de: 'Draußen / Turnhalle',
      en: 'Outdoor lawn or gymnasium'
    },
    summary: {
      de: 'Die gesamte Gruppe muss ein Seil auf Brusthöhe überwinden. Untendurch ist verboten. Berührt jemand das Seil, müssen alle zurück!',
      en: 'The entire team must cross over a chest-high rope without touching it or going underneath.'
    },
    idea: {
      de: 'Klassiker der Erlebnispädagogik: Erfordert Heben, Absichern, Vertrauen und echte Muskelkraft.',
      en: 'Experiential team classic: requires lifting, spotting, mutual trust, and physical responsibility.'
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

  // 26. Das synchronisierte Klatschen (Impuls-Kreis)
  {
    id: 'impuls-kreis',
    title: {
      de: 'Der Impuls-Kreis (Synchron-Klatschen)',
      en: 'Synchronized Clapping Circle'
    },
    category: 'energizer',
    energyLevel: 'high',
    groupSize: { min: 6, max: 30 },
    prepLevel: 'instant',
    materials: {
      de: ['Keine'],
      en: ['None']
    },
    durationMinutes: '5–10 Min',
    space: {
      de: 'Kreis',
      en: 'Circle'
    },
    summary: {
      de: 'Ein Klatsch-Impuls wandert blitzschnell im Kreis, indem zwei benachbarte Personen immer absolut synchron in die Hände klatschen.',
      en: 'A clapping impulse travels around the circle: two neighbors make direct eye contact and clap simultaneously.'
    },
    idea: {
      de: 'Schult rhythmische Präzision, Blickkontakt und nonverbalen Reaktionsfluss im Bruchteil einer Sekunde.',
      en: 'Cultivates split-second timing, eye contact, and continuous acoustic flow.'
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

  // 27. Säuresee
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

  // 28. Stille Matrix
  {
    id: 'stille-matrix',
    title: {
      de: 'Die stille Matrix (Das unsichtbare Labyrinth)',
      en: 'The Silent Matrix (Invisible Maze)'
    },
    category: 'cooperative',
    energyLevel: 'calm',
    groupSize: { min: 6, max: 20 },
    prepLevel: 'low_prep',
    materials: {
      de: ['Kreide oder Seile für ein 4x4-Raster auf dem Boden', 'Geheimer Plan für die Spielleitung'],
      en: ['Chalk or ropes for a 4x4 floor grid', 'Secret path map for the facilitator']
    },
    durationMinutes: '20–30 Min',
    space: {
      de: 'Freie Bodenfläche',
      en: 'Open floor space'
    },
    summary: {
      de: 'Die Gruppe muss ein unsichtbares Labyrinth auf einem Bodenraster durchqueren. Falsche Schritte lösen ein Signal aus – der Pfad erschließt sich rein aus dem kollektiven Gedächtnis.',
      en: 'The team crosses an invisible maze on a floor grid. Wrong steps trigger a buzzer sound; the correct path is uncovered purely via collective memory.'
    },
    idea: {
      de: 'Fördert konzentriertes Beobachten und gegenseitige Fürsorge: Die Fehler einzelner werden zur wertvollen Information für alle.',
      en: 'Fosters active observation and collective memory: one person’s misstep provides guidance for everyone else.'
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
    category: 'cooperative',
    energyLevel: 'medium',
    groupSize: { min: 6, max: 20 },
    prepLevel: 'low_prep',
    materials: {
      de: ['Eine Plane, Seile oder Kreide zur Flächenbegrenzung'],
      en: ['Tarp, ropes, or chalk boundary']
    },
    durationMinutes: '10–15 Min',
    space: {
      de: 'Bodenfläche',
      en: 'Floor area'
    },
    summary: {
      de: 'Die gesamte Gruppe muss auf einer Bodenfläche stehen, die nach jeder erfolgreichen Runde halbiert wird. Erfordert Stützen, Tragen und Zusammenhalt.',
      en: 'The entire group stands on a defined ground space that shrinks by half after each round, requiring mutual support and balance.'
    },
    idea: {
      de: 'Physisches Teambuilding, das Berührungsängste abbaut und gegenseitige Hilfsbereitschaft auf spielerische Weise fordert.',
      en: 'Playful physical teambuilding that dissolves hesitation and fosters mutual trust on minimal space.'
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
  }
];
