import { EmpirePromptCategory, DiscussionCard, CampBestPractice } from '../types';

export const EMPIRE_PROMPTS: EmpirePromptCategory[] = [
  {
    id: 'ausreden-schlimmer',
    title: {
      de: 'Ausreden, die schlimmer sind als die Tat selbst',
      en: 'Excuses Worse Than the Crime',
    },
    description: {
      de: 'Jeder schreibt eine absurde, peinliche oder haarsträubende Ausrede auf.',
      en: 'Each person submits an absurd, embarrassing, or completely unbelievable excuse.',
    },
    exampleAnswers: {
      de: [
        '„Mein Hund hat die Hausaufgaben nicht gefressen, sondern korrigiert.“',
        '„Ich bin zu spät, weil ich erst nachdenken musste, ob Zeit real ist.“',
        '„Der Keks ist gestolpert und mir in den Mund gefallen.“',
      ],
      en: [
        '"My dog didn\'t eat my homework, he proofread and rejected it."',
        '"I am late because I had to reflect on whether time is a construct."',
        '"The cookie tripped and fell straight into my mouth."',
      ],
    },
  },
  {
    id: 'bodenlose-ausreden',
    title: {
      de: 'Bizarre Trennungsgründe',
      en: 'Bizarre Breakup Excuses',
    },
    description: {
      de: 'Kuriose oder unfreiwillig komische Begründungen für ein Beziehungsende.',
      en: 'Strange, petty, or unintentionally hilarious breakup justifications.',
    },
    exampleAnswers: {
      de: [
        '„Mein Horoskop meinte, deine Aura blockiert mein WLAN.“',
        '„Du atmest einfach zu dramatisch beim Essen.“',
        '„Meine Katze hat dich skeptisch gemustert.“',
      ],
      en: [
        '"My horoscope warned me that your aura is blocking my Wi-Fi."',
        '"You breathe too theatrically while chewing."',
        '"My cat looked at you with deep moral judgment."',
      ],
    },
  },
  {
    id: 'crazyste-lehrer',
    title: {
      de: 'Unvergessliche Lehrer-Sprüche',
      en: 'Unforgettable Teacher Quotes',
    },
    description: {
      de: 'Die typischen, manchmal absurden Sätze aus dem Schulalltag.',
      en: 'Classic, absurd, or legendary quotes heard around classroom hallways.',
    },
    exampleAnswers: {
      de: [
        '„Der Gong ist für mich, nicht für euch!“',
        '„Ich beende die Stunde, nicht die Physik!“',
        '„Wenn ihr so weitermacht, gebe ich mir selbst eine Sechs.“',
      ],
      en: [
        '"The bell dismisses you, not the laws of physics!"',
        '"I don\'t hear any studying happening over there."',
        '"If this noise continues, I will give myself detention."',
      ],
    },
  },
  {
    id: 'verboten-sein',
    title: {
      de: 'Dinge, die gesetzlich verboten gehören',
      en: 'Harmless Things That Should Be Illegal',
    },
    description: {
      de: 'Alltägliche Kleinigkeiten, die einen innerlich verzweifeln lassen.',
      en: 'Minor everyday irritations that drive people irrationally crazy.',
    },
    exampleAnswers: {
      de: [
        '„Socken, die im Schuh langsam nach vorne rutschen.“',
        '„Sprachnachrichten über 4 Minuten ohne Punkt und Komma.“',
        '„Leute, die genau vor der Rolltreppe abrupt stehen bleiben.“',
      ],
      en: [
        '"Socks that slowly slide down inside your shoe while walking."',
        '"Voice notes that exceed 4 minutes without a clear point."',
        '"People who stop abruptly right at the end of an escalator."',
      ],
    },
  },
  {
    id: 'minimal-stehlen',
    title: {
      de: 'Was würdest du stehlen, um jemanden nur minimal zu nerven?',
      en: 'What Would You Steal to Cause Minor Inconvenience?',
    },
    description: {
      de: 'Völlig harmlos, aber maximal lästig im Alltag.',
      en: 'Harmless items that cause peak psychological friction.',
    },
    exampleAnswers: {
      de: [
        '„Aus jedem Schuhpaar immer genau den linken Schnürsenkel.“',
        '„Alle Ladekabel im Haus um 10 Zentimeter kürzen.“',
        '„Den Haltegriff am Reißverschluss abknipsen.“',
      ],
      en: [
        '"The left shoelace from every pair of shoes in the house."',
        '"Cut 10 cm off every charging cable so it just barely misses the desk."',
        '"Snip the zipper pull-tab off their favorite jacket."',
      ],
    },
  },
  {
    id: 'date-ruinieren',
    title: {
      de: 'Sätze, die sofort jedes Treffen ruinieren',
      en: 'Phrases Guaranteed to Ruin a Meeting',
    },
    description: {
      de: 'Sätze, die man bei einer ersten Verabredung niemals hören möchte.',
      en: 'Uncomfortable things no one wants to hear upon first meeting someone.',
    },
    exampleAnswers: {
      de: [
        '„Meine Mutter hat mir verboten, mit Leuten ohne Zehnerkarte zu sprechen.“',
        '„Ich beurteile Charakterzüge primär nach Fußform.“',
        '„Ich hoffe du zahlst, meine Kontokarte ist seit drei Monaten gesperrt.“',
      ],
      en: [
        '"My mom insisted I ask for your credit score before ordering."',
        '"I categorize personalities primarily by earlobe shape."',
        '"I hope you are treating, my bank froze my card last month."',
      ],
    },
  },
];

export const DISCUSSION_CARDS: DiscussionCard[] = [
  {
    id: 'jugendzeit-erlesen',
    title: {
      de: 'Die erlesenste Zeit',
      en: 'The Choicest Season',
    },
    quoteSnippet: {
      de: '„Die Jugendzeit ist die erlesenste Zeit, denn sie ist die Epoche der Tatkraft und des Strebens.“',
      en: '"Youth is the choicest period of life, for it is the time of energy, enthusiasm and high aspiration."',
    },
    source: {
      de: '‘Abdu’l-Bahá',
      en: '‘Abdu’l-Bahá',
    },
    book: {
      de: 'Juniorjugendprogramm',
      en: 'Junior Youth Programme',
    },
    coreQuestion: {
      de: 'Wo und wie spürst du diese einzigartige Tatkraft ganz konkret in deinem eigenen Alltag?',
      en: 'Where and how do you directly experience this unique energy in your own daily life?',
    },
    deepeningQuestions: {
      de: [
        'Worin unterscheidet sich deine Sicht auf dein Umfeld heute von der vor zwei Jahren?',
        'Welche Talente oder Fähigkeiten möchtest du für deine Gemeinschaft einsetzen?',
        'Was hindert Jugendliche manchmal daran, ihre eigene Gestaltungsfähigkeit ernst zu nehmen?',
      ],
      en: [
        'How has your perspective on your surroundings evolved compared to two years ago?',
        'What talents or skills do you hope to place in service to your community?',
        'What sometimes holds young people back from recognizing their own capacity?',
      ],
    },
    theme: {
      de: 'Tatkraft & Jugend',
      en: 'Youth & Agency',
    },
  },
  {
    id: 'lampe-und-licht',
    title: {
      de: 'Lampe und Licht',
      en: 'The Lamp and the Light',
    },
    quoteSnippet: {
      de: '„Der materielle Fortschritt ist wie der Lampenkörper, der geistige Fortschritt aber wie das Licht in der Lampe.“',
      en: '"Material progress is like unto the lamp, while spiritual progress is the light in the lamp."',
    },
    source: {
      de: '‘Abdu’l-Bahá (Ansprachen in Paris)',
      en: '‘Abdu’l-Bahá (Paris Talks)',
    },
    book: {
      de: 'Geist des Glaubens',
      en: 'Spirit of Faith',
    },
    coreQuestion: {
      de: 'Warum reicht materieller Wohlstand allein nicht aus, um ein erfülltes Leben zu führen?',
      en: 'Why is material prosperity alone insufficient to build a truly fulfilling life?',
    },
    deepeningQuestions: {
      de: [
        'Was nützt die schönste Lampe, wenn kein Licht in ihr scheint?',
        'Welche Tugenden (wie Aufrichtigkeit, Freundschaft, Mitgefühl) machen eine Gruppe erst lebendig?',
        'Wo begegnet uns in den sozialen Medien die Verwechslung von Äußerlichkeiten und echtem Wert?',
      ],
      en: [
        'What use is the finest lamp if it contains no light to illuminate the darkness?',
        'What virtues (such as sincerity, kindness, justice) bring life to a group?',
        'Where do we see social media confuse external appearance with genuine worth?',
      ],
    },
    theme: {
      de: 'Werte & Charakter',
      en: 'Values & Character',
    },
  },
  {
    id: 'true-friendship-cliques',
    title: {
      de: 'Wahre Freundschaft vs. Grüppchenbildung',
      en: 'Noble Friendship vs. Exclusive Cliques',
    },
    quoteSnippet: {
      de: '„Ein wahrer Freund ist wie ein leuchtender Spiegel, der das Gute in deiner Seele widerspiegelt.“',
      en: '"A faithful friend is a strong defense: and he that hath found such a one hath found a treasure."',
    },
    source: {
      de: '‘Abdu’l-Bahá',
      en: '‘Abdu’l-Bahá',
    },
    book: {
      de: 'Den geraden Pfad beschreiten',
      en: 'Walking the Straight Path',
    },
    coreQuestion: {
      de: 'Woran erkennt man einen wahren Freund, der dich geistig aufrichtet, im Gegensatz zu bloßen Zweckbündnissen?',
      en: 'What distinguishes a noble companion who elevates your character from superficial alliances built on convenience?',
    },
    deepeningQuestions: {
      de: [
        'Warum neigen Cliquen in der Schule dazu, andere abzuwerten, um sich selbst stark zu fühlen?',
        'Wie können wir in unserer Gruppe eine Kultur leben, in der JEDER neue Gast sofort bedingungslos willkommen ist?',
        'Was tust du, wenn ein Freund dich zu etwas drängt, das gegen dein Gewissen spricht?',
      ],
      en: [
        'Why do school cliques often belittle outsiders to artificially manufacture belonging?',
        'How can our circle nurture an open-hearted culture where any newcomer feels warmly and instantly embraced?',
        'How do you respond when a companion pressures you into choices that violate your conscience?',
      ],
    },
    theme: {
      de: 'Freundschaft & Einheit',
      en: 'Noble Friendship',
    },
  },
  {
    id: 'constructive-speech',
    title: {
      de: 'Die Kraft der Zunge: Aufbauen statt Lästern',
      en: 'The Power of the Tongue: Building vs. Tearing Down',
    },
    quoteSnippet: {
      de: '„Die Zunge ist ein loderndes Feuer, und Mangel an Beherrschung ist wie tödliches Gift.“',
      en: '"The tongue is a smoldering fire, and an excess of speech a deadly poison."',
    },
    source: {
      de: "Bahá'u'lláh (Botschaften aus Akka)",
      en: "Bahá'u'lláh (Tablets of Bahá'u'lláh)",
    },
    book: {
      de: 'Die Kraft des Wortes nutzen',
      en: 'Drawing on the Power of the Word',
    },
    coreQuestion: {
      de: 'Warum ist Lästern (Hinterrücksreden) so ansteckend und wie vergiftet es das Vertrauen in einer Gruppe?',
      en: 'Why is gossip so casually contagious, and how does it silently corrode mutual trust within a community?',
    },
    deepeningQuestions: {
      de: [
        'Was bewirkt es in dir, wenn jemand in deiner Gegenwart schlecht über einen Abwesenden spricht?',
        'Welche sanften, aber klaren Sätze können wir sagen, um ein Gespräch sofort in eine positive Richtung zu lenken?',
        'Wie fühlt es sich an, zu wissen, dass die eigenen Freunde in Abwesenheit immer gut über einen sprechen?',
      ],
      en: [
        "What shifts in your gut when someone begins dismantling an absent peer's character in your presence?",
        'What gracious yet firm pivot phrases can we deploy to steer conversations back into clean air?',
        'How does it feel to know with absolute certainty that your group will defend your honor whenever you are absent?',
      ],
    },
    theme: {
      de: 'Wahrhaftigkeit & Sprache',
      en: 'Pure Speech',
    },
  },
  {
    id: 'overcoming-prejudice',
    title: {
      de: 'Schönheit der Vielfalt & Abbau von Vorurteilen',
      en: 'Harmony of Diversity & Overcoming Prejudice',
    },
    quoteSnippet: {
      de: '„Ihr seid die Früchte eines Baumes und die Blätter eines Zweiges. Verhaltet euch zueinander in größter Liebe und Eintracht.“',
      en: '"Ye are the fruits of one tree, and the leaves of one branch. Deal ye one with another with the utmost love and harmony."',
    },
    source: {
      de: "Bahá'u'lláh (Ährenlese)",
      en: "Bahá'u'lláh (Gleanings)",
    },
    book: {
      de: 'Brise der Bestätigung',
      en: 'Breezes of Confirmation',
    },
    coreQuestion: {
      de: 'Wie bereichert die Vielfalt an Herkunft, Persönlichkeiten und Gaben unsere Gruppe, statt Trennung zu erzeugen?',
      en: 'How does rich diversity of culture, temperaments, and backgrounds beautify a community rather than creating friction?',
    },
    deepeningQuestions: {
      de: [
        'Wo begegnen uns im Schulalltag subtile Vorurteile oder Stereotypen?',
        'Warum ist ein Garten mit verschiedenfarbigen Blumen schöner als ein Beet mit nur einer einzigen Blume?',
        'Wie können wir aktiv voneinander lernen und Brücken zwischen verschiedenen Welten bauen?',
      ],
      en: [
        'Where do subtle stereotypes or assumptions crop up in hallway chatter and social expectations?',
        'Why is a garden filled with vibrant, contrasting blossoms far more breathtaking than a monochrome lawn?',
        "How can we proactively inquire into one another's stories to dissolve invisible walls?",
      ],
    },
    theme: {
      de: 'Einheit der Menschheit',
      en: 'Unity in Diversity',
    },
  },
  {
    id: 'liebe-zur-menschheit-breezes',
    status: 'draft',
    title: {
      de: 'Liebe zur gesamten Menschheit',
      en: 'Love for All Mankind',
    },
    quoteSnippet: {
      de: '„Ihr wurdet erschaffen, einander Liebe zu erzeigen und nicht Widerspenstigkeit und Groll. Seid nicht stolz auf die Liebe zu euch selbst, sondern auf die Liebe zur gesamten Menschheit.“',
      en: '"Ye were created to show love one to another and not perversity and rancour. Take pride not in love for yourselves but in love for all mankind."',
    },
    source: {
      de: "Bahá'u'lláh (Botschaften aus Akka, Lawh-i-Maqsúd)",
      en: "Bahá'u'lláh (Tablets of Bahá'u'lláh, Lawh-i-Maqsúd)",
    },
    book: {
      de: 'Brise der Bestätigung',
      en: 'Breezes of Confirmation',
    },
    coreQuestion: {
      de: 'Wie können wir unsere Liebe über den eigenen Freundeskreis hinaus auf Menschen ausdehnen, die ganz anders denken oder leben?',
      en: 'How can we expand our circle of care beyond familiar friends to embrace those from entirely different walks of life?',
    },
    deepeningQuestions: {
      de: [
        'Wo fällt es uns leicht, liebevoll zu sein – und wo spüren wir inneren Widerstand?',
        'Was bewirkt der Satz „Seid nicht stolz auf die Liebe zu euch selbst“ in einer Welt voller Selbstdarstellung?',
        'Wie kann unsere Juniorjugendgruppe zu einem Ort bedingungsloser Herzlichkeit werden?',
      ],
      en: [
        'Where does showing loving kindness feel natural, and where do we hit inner resistance?',
        'What challenge does "Take pride not in love for yourselves" pose in a culture fixated on self-promotion?',
        'How can our youth circle embody universal warmth toward any newcomer?',
      ],
    },
    theme: {
      de: 'Liebe & Menschheit',
      en: 'Love & Humanity',
    },
  },
  {
    id: 'hingabe-und-weltbuerger',
    status: 'draft',
    title: {
      de: 'Der wahre Mensch im Dienst',
      en: 'True Nobility in Service',
    },
    quoteSnippet: {
      de: '„Er ist ein wahrer Mensch, der sich heute dem Dienst an der gesamten Menschenrasse weiht.“',
      en: '"That one indeed is a man who, today, dedicateth himself to the service of the entire human race."',
    },
    source: {
      de: "Bahá'u'lláh (Botschaften aus Akka, Worte des Paradieses)",
      en: "Bahá'u'lláh (Tablets of Bahá'u'lláh, Words of Paradise)",
    },
    book: {
      de: 'Brise der Bestätigung',
      en: 'Breezes of Confirmation',
    },
    coreQuestion: {
      de: 'Was unterscheidet ein Leben im Dienst am Gemeinwohl von einem Leben, das nur um persönlichen Erfolg kreist?',
      en: 'What distinguishes a life dedicated to community uplift from one driven solely by personal advancement?',
    },
    deepeningQuestions: {
      de: [
        'Wer in deinem Umfeld oder in der Geschichte verkörpert diese Hingabe auf berührende Weise?',
        'Warum fühlt sich das Dienen manchmal anstrengend an, schenkt aber am Ende die größte Erfüllung?',
        'Welche kleinen Schritte können wir als Gruppe heute unternehmen, um diesen Geist zu leben?',
      ],
      en: [
        'Who in your neighborhood or world history exemplifies this selfless dedication?',
        'Why does genuine service sometimes demand sacrifice yet yield lasting peace?',
        'What concrete step could our group undertake today to live out this ideal?',
      ],
    },
    theme: {
      de: 'Dienst & Sinn',
      en: 'Purpose & Service',
    },
  },
  {
    id: 'wahrhaftigkeit-grundlage',
    status: 'draft',
    title: {
      de: 'Das Fundament aller Tugenden',
      en: 'The Bedrock of All Virtues',
    },
    quoteSnippet: {
      de: '„Wahrhaftigkeit ist die Grundlage aller menschlichen Tugenden.“',
      en: '"Truthfulness is the foundation of all human virtues."',
    },
    source: {
      de: '‘Abdu’l-Bahá',
      en: '‘Abdu’l-Bahá',
    },
    book: {
      de: 'Den geraden Pfad beschreiten',
      en: 'Walking the Straight Path',
    },
    coreQuestion: {
      de: 'Warum stürzt jedes geistige Gebäude ein, wenn die Wahrhaftigkeit als Fundament bröckelt?',
      en: 'Why does any social or moral structure crumble if truthfulness is compromised at the foundation?',
    },
    deepeningQuestions: {
      de: [
        'Welche kleinen, scheinbar harmlosen Unwahrheiten begegnen uns täglich, und wie untergraben sie das Vertrauen?',
        'Was erfordert mehr Mut: Die Wahrheit zu sagen, auch wenn sie unbequem ist, oder eine Ausrede zu erfinden?',
        'Wie verändert sich eine Gruppe, wenn alle wissen, dass jedes Wort ehrlich gemeint ist?',
      ],
      en: [
        'What subtle "white lies" do we encounter daily, and how do they gradually erode trust?',
        'Which requires deeper bravery: speaking truth with humility when inconvenient, or inventing an excuse?',
        'How does a community flourish when its members know with certainty that words are genuinely meant?',
      ],
    },
    theme: {
      de: 'Wahrhaftigkeit & Fundament',
      en: 'Truthfulness & Foundation',
    },
  },
  {
    id: 'schoepferische-kraft-wort-gottes',
    status: 'draft',
    title: {
      de: 'Das Wort als Lebenselixier',
      en: 'The Word as the Elixir of Life',
    },
    quoteSnippet: {
      de: '„Jedes Wort, das aus dem Munde Gottes hervorgeht, ist mit solcher Schöpferkraft begabt, dass es jedem menschlichen Leibe neues Leben einflößen kann.“',
      en: '"Every single word that proceedeth from the mouth of God is endowed with such potency as can instil new life into every human frame."',
    },
    source: {
      de: "Bahá'u'lláh (Ährenlese)",
      en: "Bahá'u'lláh (Gleanings)",
    },
    book: {
      de: 'Die Kraft des Wortes nutzen',
      en: 'Drawing on the Power of the Word',
    },
    coreQuestion: {
      de: 'Wie spürst du den Unterschied zwischen alltäglichem Gerede und Worten, die die Seele tief berühren und aufrichten?',
      en: 'How do you discern the difference between fleeting chatter and words that deeply touch and renew the soul?',
    },
    deepeningQuestions: {
      de: [
        'Welche Verse oder Gedanken begleiten dich durch schwere Tage wie ein innerer Anker?',
        'Warum ist das Auswendiglernen von geistigen Zitaten eine praktische Stütze für das Leben?',
        'Wie können wir in unserer Gruppe eine Atmosphäre schaffen, in der geistige Worte lebendig werden?',
      ],
      en: [
        'Which sacred passages serve as an inner anchor during turbulent times?',
        'Why does committing inspiring words to memory serve as a living compass for daily choices?',
        'How can our meetings cultivate an atmosphere where spiritual words truly come alive?',
      ],
    },
    theme: {
      de: 'Geistige Worte & Kraft',
      en: 'The Creative Word',
    },
  },
  {
    id: 'bergwerk-edelsteine-bildung',
    status: 'draft',
    title: {
      de: 'Der Mensch als edles Bergwerk',
      en: 'A Mine Rich in Gems',
    },
    quoteSnippet: {
      de: '„Betrachtet den Menschen als ein Bergwerk, reich an Edelsteinen von unschätzbarem Wert. Nur die Erziehung kann bewirken, dass es seine Schätze enthüllt und die Menschheit daraus Nutzen zu ziehen vermag.“',
      en: '"Regard man as a mine rich in gems of inestimable value. Education can, alone, cause it to reveal its treasures, and enable mankind to benefit therefrom."',
    },
    source: {
      de: "Bahá'u'lláh (Botschaften aus Akka, Lawh-i-Maqsúd)",
      en: "Bahá'u'lláh (Tablets of Bahá'u'lláh, Lawh-i-Maqsúd)",
    },
    book: {
      de: 'Nach Vortrefflichkeit streben',
      en: 'Learning About Excellence',
    },
    coreQuestion: {
      de: 'Welche verborgenen Edelsteine (Tugenden, Begabungen, Einsichten) nimmst du in deinen Freunden wahr?',
      en: 'What hidden gems of character, talent, and insight do you recognize in the companions sitting beside you?',
    },
    deepeningQuestions: {
      de: [
        'Warum sehen wir bei manchen Menschen zuerst den „Schmutz des Gesteins“ statt die Edelsteine im Inneren?',
        'Welche Art von Erziehung und Begleitung hilft uns, unsere eigenen verborgenen Schätze freizulegen?',
        'Wie können wir einander ermutigen, diese Gaben nicht für Hochmut, sondern zum Nutzen aller einzusetzen?',
      ],
      en: [
        'Why are people often quick to notice rough exterior faults rather than the priceless gems beneath?',
        'What kind of patient education helps each person uncover their latent capacity?',
        'How can we celebrate our distinct gifts without slipping into rivalry or arrogance?',
      ],
    },
    theme: {
      de: 'Potenziale & Edelsteine',
      en: 'Human Nobility',
    },
  },
  {
    id: 'jeder-tag-besser-als-vorige',
    status: 'draft',
    title: {
      de: 'Jeden Tag besser als den vorigen',
      en: 'Each Day Better Than the Last',
    },
    quoteSnippet: {
      de: '„Lasst jeden Tag besser sein als den vorherigen und jeden Morgen reicher als den gestrigen Abend.“',
      en: '"Let each day be better than the one that came before, and each morning richer than the previous eve."',
    },
    source: {
      de: "Bahá'u'lláh",
      en: "Bahá'u'lláh",
    },
    book: {
      de: 'Nach Vortrefflichkeit streben',
      en: 'Learning About Excellence',
    },
    coreQuestion: {
      de: 'Was bedeutet stetiges geistiges Wachstum im Alltag, ohne in ungesunden Leistungsdruck oder Perfektionismus zu verfallen?',
      en: 'What does steady moral progress look like in daily life without succumbing to unhealthy perfectionism?',
    },
    deepeningQuestions: {
      de: [
        'Wie unterscheidet sich der Wunsch, heute besser zu sein als gestern, von dem Druck, besser sein zu müssen als andere?',
        'Welche kleinen täglichen Gewohnheiten helfen dir, innerlich ruhig und zielgerichtet zu bleiben?',
        'Wie gehen wir liebevoll mit eigenen Fehlern um, sodass sie zu Lernchancen werden?',
      ],
      en: [
        'How does striving to be better than yesterday differ from competing to outshine others?',
        'What small daily reflection habits keep your heart centered and purposeful?',
        'How do we treat our own mistakes with gentle honesty so they become stepping stones?',
      ],
    },
    theme: {
      de: 'Wachstum & Vortrefflichkeit',
      en: 'Excellence & Growth',
    },
  },
  {
    id: 'gedanke-des-friedens',
    title: {
      de: 'Gedanken des Friedens',
      en: 'Thoughts of Peace',
    },
    quoteSnippet: {
      de: '„Wenn der Gedanke des Krieges kommt, setzt ihm den Gedanken des Friedens entgegen, der stärker ist. Der Gedanke des Hasses muss durch den Gedanken der Liebe überwunden werden.“',
      en: '"When a thought of war comes, oppose it by a stronger thought of peace. A thought of hatred must be destroyed by a more powerful thought of love."',
    },
    source: {
      de: '‘Abdu’l-Bahá (Ansprachen in Paris)',
      en: '‘Abdu’l-Bahá (Paris Talks)',
    },
    book: {
      de: 'Hoffnungsvolle Funken',
      en: 'Drawing on the Power of the Word',
    },
    coreQuestion: {
      de: 'Wie schaffen wir es, aufkeimenden Streit oder Ärger im Kopf zu stoppen, bevor er zu verletzenden Worten wird?',
      en: 'How can we catch brewing resentment in our minds before it hardens into hurtful words or actions?',
    },
    deepeningQuestions: {
      de: [
        'Was passiert in einem Konflikt, wenn eine Seite bewusst mit Freundlichkeit statt Gegenangriff reagiert?',
        'Wie können wir lernen, unsere eigenen Gedanken achtsam wahrzunehmen und zu steuern?',
        'Welche Friedensgedanken können wir in unserem Viertel ganz praktisch säen?',
      ],
      en: [
        'What happens in a tense dispute when one person consciously responds with calm kindness instead of retaliation?',
        'How can we train ourselves to notice our inner dialogue and steer our thoughts with intention?',
        'What practical seeds of peace can we plant within our own families and neighborhood?',
      ],
    },
    theme: {
      de: 'Frieden & Gedankenkraft',
      en: 'Peace & Mindful Thought',
    },
    status: 'draft',
  },
  {
    id: 'fehler-verzeihen',
    title: {
      de: 'Das Auge des Verzeihens',
      en: 'The Eye of Forgiveness',
    },
    quoteSnippet: {
      de: '„Verschließt eure Augen vor den Fehlern anderer und blickt mit dem Auge der Nachsicht und des Verständnisses.“',
      en: '"Breathe not the sins of others so long as thou art thyself a sinner. Look with the eye of forgiveness upon the shortcomings of your fellows."',
    },
    source: {
      de: "Bahá'u'lláh (Verborgene Worte, Persisch 26)",
      en: "Bahá'u'lláh (The Hidden Words, Persian 26)",
    },
    book: {
      de: 'Den geraden Pfad gehen',
      en: 'Walking the Straight Path',
    },
    coreQuestion: {
      de: 'Warum fällt es uns oft so leicht, Fehler bei anderen zu entdecken, und wie können wir unseren Blick auf das Gute richten?',
      en: 'Why is it often tempting to fixate on the faults of others, and how can we train our eyes to search for the good?',
    },
    deepeningQuestions: {
      de: [
        'Wie fühlst du dich, wenn dir jemand nach einem Fehler eine zweite Chance gibt, ohne nachtragend zu sein?',
        'Was passiert mit der Atmosphäre einer Gruppe, wenn hinter dem Rücken über Fehler geredet wird?',
        'Wie können wir einander helfen, Schwächen zu überwinden, ohne einander zu verurteilen?',
      ],
      en: [
        'How does it feel when someone extends a sincere second chance without holding lingering grudges?',
        "How does the trust in a group erode when small shortcomings are amplified behind each other's backs?",
        'How can we support one another in outgrowing faults with genuine warmth rather than condemnation?',
      ],
    },
    theme: {
      de: 'Nachsicht & Vergebung',
      en: 'Forgiveness & Seeing Good',
    },
    status: 'draft',
  },
  {
    id: 'freude-fluegel',
    title: {
      de: 'Freude verleiht Flügel',
      en: 'Joy Gives Wings',
    },
    quoteSnippet: {
      de: '„Freude verleiht uns Flügel! Wenn wir fröhlich sind, ist unsere Kraft lebendiger, unser Verstand wacher und unsere Einsicht klarer.“',
      en: '"Joy gives us wings! In times of joy our strength is more vital, our intellect keener, and our understanding less clouded."',
    },
    source: {
      de: '‘Abdu’l-Bahá (Ansprachen in Paris)',
      en: '‘Abdu’l-Bahá (Paris Talks)',
    },
    book: {
      de: 'Der Quell der Freude',
      en: 'Wellspring of Joy',
    },
    coreQuestion: {
      de: 'Wie unterscheidet sich tiefe, geistige Freude von bloßer oberflächlicher Unterhaltung oder Ablenkung?',
      en: 'How does genuine inner joy differ from fleeting entertainment or passive distraction?',
    },
    deepeningQuestions: {
      de: [
        'In welchen Momenten hast du schon einmal gespürt, dass Freude dir neue Energie für schwere Aufgaben geschenkt hat?',
        'Wie können wir in unserer Gruppe eine Fröhlichkeit leben, die niemanden ausschließt oder auf Kosten anderer lacht?',
        'Was hilft dir persönlich an Tagen, an denen die Stimmung trüb ist, wieder Licht zu sehen?',
      ],
      en: [
        'When have you experienced joyful enthusiasm giving you renewed energy to tackle a demanding task?',
        "How can we cultivate a warm sense of fun that includes everyone and never laughs at another's expense?",
        'What helps you reconnect with hope and inner light on days when things feel heavy?',
      ],
    },
    theme: {
      de: 'Freude & Hoffnung',
      en: 'Joy & Inner Light',
    },
    status: 'draft',
  },
  {
    id: 'geschenk-des-verstandes',
    title: {
      de: 'Die Gabe des Verstandes',
      en: 'The Gift of Intellect',
    },
    quoteSnippet: {
      de: '„Der Verstand ist die höchste Gabe und der größte Segen, den die göttliche Schöpferkraft dem Menschen verliehen hat.“',
      en: '"The intellect is the most precious gift bestowed by the Divine Creator upon humankind."',
    },
    source: {
      de: '‘Abdu’l-Bahá (Das Geheimnis der göttlichen Kultur)',
      en: '‘Abdu’l-Bahá (The Secret of Divine Civilization)',
    },
    book: {
      de: 'Denkende Geister',
      en: 'Thinking Minds',
    },
    coreQuestion: {
      de: 'Wofür tragen wir Verantwortung, wenn wir die Fähigkeit besitzen, selbstständig und kritisch nachzudenken?',
      en: 'What responsibility comes with the capacity to think independently and seek truth with our own minds?',
    },
    deepeningQuestions: {
      de: [
        'Warum ist es gefährlich, unüberlegt Meinungen anderer zu übernehmen, ohne sie selbst zu prüfen?',
        'Wie können wir unseren Verstand schärfen wie ein Werkzeug, das der Gemeinschaft dient?',
        'Wo ergänzen sich wissenschaftliche Erkenntnis und geistige Werte im täglichen Leben?',
      ],
      en: [
        'Why is it risky to absorb popular opinions without examining whether they align with truth and justice?',
        'How can we refine our minds like well-tuned instruments dedicated to the service of others?',
        'Where do reasoned insight and spiritual values reinforce each other in everyday decision-making?',
      ],
    },
    theme: {
      de: 'Erkenntnis & Vernunft',
      en: 'Intellect & Perception',
    },
    status: 'draft',
  },
  {
    id: 'reines-strahlendes-herz',
    title: {
      de: 'Das strahlende Herz',
      en: 'The Radiant Heart',
    },
    quoteSnippet: {
      de: '„Besitze ein reines, gütiges und strahlendes Herz, auf dass dir eine Herrschaft zuteilwerde, die ewig ist und unvergänglich.“',
      en: '"Possess a pure, kindly and radiant heart, that thine may be a sovereignty ancient, imperishable and everlasting."',
    },
    source: {
      de: "Bahá'u'lláh (Verborgene Worte, Arabisch 1)",
      en: "Bahá'u'lláh (The Hidden Words, Arabic 1)",
    },
    book: {
      de: 'Ein edles Erbe',
      en: 'A Noble Heritage',
    },
    coreQuestion: {
      de: 'Was bedeutet es für dich ganz praktisch im Umgang mit Freunden, ein „reines und gütiges Herz“ zu bewahren?',
      en: 'What does it look like in real relationships to maintain a pure, compassionate, and transparent heart?',
    },
    deepeningQuestions: {
      de: [
        'Was trübt unser Herz im Alltag – und wie können wir es wieder rein und frei machen?',
        'Warum ist Güte niemals ein Zeichen von Schwäche, sondern die größte innere Stärke?',
        'Wie strahlt ein Mensch aus, der ohne Hintergedanken und Eitelkeit anderen begegnet?',
      ],
      en: [
        'What habits cloud our inner clarity, and how can we keep our intentions sincere and untainted?',
        'Why is genuine kindness never a weakness, but a sign of quiet inner fortitude?',
        'What atmosphere surrounds someone who approaches others without pretense or selfish motives?',
      ],
    },
    theme: {
      de: 'Aufrichtigkeit & Herz',
      en: 'Purity & Sincerity',
    },
    status: 'draft',
  },
  {
    id: 'worte-schoepferkraft',
    title: {
      de: 'Die schöpferische Kraft der Rede',
      en: 'The Potency of Speech',
    },
    quoteSnippet: {
      de: '„Ein jedes Wort, das aus dem Munde hervorgeht, hat seinen Atem und wirkt seine Wirkung.“',
      en: '"Every word that proceedeth from the mouth of God is endowed with such potency as can instill new life into every human frame."',
    },
    source: {
      de: "Bahá'u'lláh (Botschaften aus Akka, Lawh-i-Maqsúd)",
      en: "Bahá'u'lláh (Tablets of Bahá'u'lláh, Tablet of Maqsúd)",
    },
    book: {
      de: 'Hoffnungsvolle Funken',
      en: 'Drawing on the Power of the Word',
    },
    coreQuestion: {
      de: 'Wie können wir unsere Sprache als heilendes, aufbauendes Werkzeug statt als Waffe nutzen?',
      en: 'How can we harness our words as instruments of healing and encouragement rather than harm?',
    },
    deepeningQuestions: {
      de: [
        'Welche Worte von anderen haben dich in deinem Leben am tiefsten ermutigt oder geprägt?',
        'Wie schnell ist ein unbedachtes Wort im Chat geschrieben, und welche Spuren hinterlässt es?',
        'Wie können wir uns angewöhnen, vor dem Sprechen kurz innezuhalten und den Wert unserer Worte zu prüfen?',
      ],
      en: [
        'Which words spoken by someone else have given you the deepest confidence or guidance in life?',
        'How quickly is a careless remark sent in a group chat, and what hidden ripples does it leave?',
        'How can we build the habit of pausing before speaking to reflect on the uplifting power of our words?',
      ],
    },
    theme: {
      de: 'Worte & Verantwortung',
      en: 'The Power of Speech',
    },
    status: 'draft',
  },
  {
    id: 'hinter-dem-ruecken',
    title: {
      de: 'Vertrauen schützen',
      en: 'Shielding Trust',
    },
    quoteSnippet: {
      de: '„Üble Nachrede löscht das Leuchten des Herzens aus und erstickt das Leben der Seele.“',
      en: '"Backbiting quencheth the light of the heart, and extinguisheth the life of the soul."',
    },
    source: {
      de: "Bahá'u'lláh (Tafeln von Bahá'u'lláh)",
      en: "Bahá'u'lláh (Tablets of Bahá'u'lláh)",
    },
    book: {
      de: 'Den geraden Pfad gehen',
      en: 'Walking the Straight Path',
    },
    coreQuestion: {
      de: 'Warum zersetzt Lästern das Vertrauen in einer Gruppe – selbst bei denen, die nur stumm zuhören?',
      en: 'Why does gossip erode mutual trust within a group, even among those who only listen quietly?',
    },
    deepeningQuestions: {
      de: [
        'Was kannst du konkret sagen oder tun, wenn jemand in deiner Anwesenheit anfängt, über Abwesende herzuziehen?',
        'Warum reden Menschen manchmal schlecht über andere – und was suchen sie eigentlich dabei?',
        'Wie fühlt sich ein Raum an, in dem du absolut sicher weißt, dass niemand hinter deinem Rücken lästert?',
      ],
      en: [
        "What can you gently say or do when conversation shifts toward criticizing someone who isn't present?",
        'Why do people sometimes default to gossip, and what insecurity are they often trying to soothe?',
        'How liberating does it feel to belong to a space where you know your dignity is safeguarded when you leave?',
      ],
    },
    theme: {
      de: 'Würde & Vertrauen',
      en: 'Trust & Backbiting',
    },
    status: 'draft',
  },
  {
    id: 'vortrefflichkeit-charakter',
    title: {
      de: 'Der höchste Grad an Reife',
      en: 'The Highest Degree of Maturity',
    },
    quoteSnippet: {
      de: '„Bemüht euch mit ganzem Herzen, damit ihr euch durch eure Lebensführung und euren Charakter von anderen abhebt.“',
      en: '"Exert yourselves that ye may become the signs of unity and the banners of harmony amongst humanity."',
    },
    source: {
      de: '‘Abdu’l-Bahá (Briefe und Botschaften)',
      en: "‘Abdu’l-Bahá (Selections from the Writings of 'Abdu'l-Bahá)",
    },
    book: {
      de: 'Überlegungen und Handeln',
      en: 'Learning About Excellence',
    },
    coreQuestion: {
      de: 'Was bedeutet wahre Vortrefflichkeit im Gegensatz zu bloßem Leistungsdruck oder egoistischem Ehrgeiz?',
      en: 'What is the difference between genuine moral excellence and stressful, competitive ambition?',
    },
    deepeningQuestions: {
      de: [
        'In welchen Situationen verlangt es echten Mut, seinen Prinzipien treu zu bleiben, auch wenn alle anderen mit dem Strom schwimmen?',
        'Wie können wir uns gegenseitig anfeuern, ohne in ungesunde Konkurrenz zu verfallen?',
        'Welche Gewohnheit hat dir geholfen, beständiger und gewissenhafter zu werden?',
      ],
      en: [
        'When does it require true bravery to stand by your ethical convictions when peers go with the crowd?',
        'How can we cheer each other on toward growth without falling into petty comparison or jealousy?',
        'Which personal routine has helped you develop consistency, discipline, and quiet maturity?',
      ],
    },
    theme: {
      de: 'Wachstum & Reife',
      en: 'Excellence of Character',
    },
    status: 'draft',
  },
  {
    id: 'kintsugi-goldene-narben',
    title: {
      de: 'Kintsugi: Aus Scherben wächst Stärke',
      en: 'Kintsugi: Golden Strength from Broken Pieces',
    },
    quoteSnippet: {
      de: '„Wenn eine Schale zerbricht, wird sie mit Goldlack gefügt. Die Risse werden nicht versteckt, sondern erzählen von Reife und Beständigkeit.“',
      en: '"When a bowl is broken, Japanese master craftspeople mend it with gold. The scars are not hidden, but celebrated as marks of resilience and depth."',
    },
    source: {
      de: 'Japanische Kintsugi-Philosophie',
      en: 'Japanese Kintsugi Tradition',
    },
    coreQuestion: {
      de: 'Wie können Fehler, Rückschläge und schwere Zeiten uns weiser, einfühlsamer und stärker machen?',
      en: 'How can our missteps, setbacks, and difficult moments deepen our empathy, wisdom, and inner grit?',
    },
    deepeningQuestions: {
      de: [
        'Aus welchem eigenen Missgeschick hast du rückblickend am meisten für dein Leben gelernt?',
        'Warum versuchen Menschen in den sozialen Medien oft, ein künstlich makelloses Leben vorzutäuschen?',
        'Wie können wir einer Freundin oder einem Freund beistehen, wenn gerade etwas gründlich schiefgegangen ist?',
      ],
      en: [
        'Looking back, which apparent failure taught you the most indispensable lesson of your youth?',
        'Why do social platforms pressure people to project flawless lives, and why does that feel so exhausting?',
        'How can we support a friend through a crushing mistake without pity, but with genuine belief in their renewal?',
      ],
    },
    theme: {
      de: 'Resilienz & Fehlerkultur',
      en: 'Resilience & Renewal',
    },
    status: 'draft',
  },
  {
    id: 'fuer-das-leben-lernen',
    title: {
      de: 'Nicht für die Noten, für das Leben',
      en: 'Learning for Life, Not Just for Marks',
    },
    quoteSnippet: {
      de: '„Non scholae, sed vitae discimus – Nicht für die Schule, sondern für das Leben lernen wir.“',
      en: '"Non scholae, sed vitae discimus—We do not learn for school, but for life."',
    },
    source: {
      de: 'Seneca (Römischer Philosoph)',
      en: 'Seneca (Roman Philosopher)',
    },
    coreQuestion: {
      de: 'Wie finden wir die Freude am Lernen wieder, wenn Schule oft nur auf Noten und Prüfungsdruck reduziert wird?',
      en: 'How do we reclaim genuine curiosity when education is reduced to test anxiety and letter grades?',
    },
    deepeningQuestions: {
      de: [
        'Was war die wertvollste Sache, die du im letzten Jahr gelernt hast, die in keinem Zeugnis steht?',
        'Wie können wir uns in unserer Gruppe gegenseitig helfen, Dinge wirklich tief zu begreifen statt nur auswendig zu lernen?',
        'Welche Fähigkeiten werden für deine Zukunft als gestaltender Mensch am wichtigsten sein?',
      ],
      en: [
        'What is the most meaningful insight or skill you gained this past year that never appears on a report card?',
        'How can our circle help each other deeply understand ideas rather than merely memorizing facts for an exam?',
        'Which qualities of character will matter most for your future as an active, conscious contributor to society?',
      ],
    },
    theme: {
      de: 'Bildung & Echtes Verstehen',
      en: 'Lifelong Learning & Discernment',
    },
    status: 'draft',
  },
  {
    id: 'steter-tropfen',
    title: {
      de: 'Steter Tropfen höhlt den Stein',
      en: 'Continuous Drops Hollow the Stone',
    },
    quoteSnippet: {
      de: '„Gutta cavat lapidem, non vi sed saepe cadendo – Der Tropfen höhlt den Stein, nicht durch Kraft, sondern durch stetes Fallen.“',
      en: '"A drop of water hollows out stone, not through sheer force, but through steadfast falling."',
    },
    source: {
      de: 'Ovid (Römische Spruchweisheit)',
      en: 'Ovid (Ancient Wisdom)',
    },
    coreQuestion: {
      de: 'Warum sind kleine tägliche Gewohnheiten auf lange Sicht viel wirkungsvoller als seltene, hektische Kraftakte?',
      en: 'Why do modest, daily habits produce vastly deeper transformations than rare, chaotic bursts of willpower?',
    },
    deepeningQuestions: {
      de: [
        'Welche gute Gewohnheit (z. B. Lesen, Ordnung, Nachdenken) möchtest du wie stete Tropfen in deinen Alltag einbauen?',
        'Was tun wir, wenn die Motivation nach ein paar Tagen nachlässt – wie bleiben wir trotzdem dran?',
        'Welches scheinbar unlösbare Problem in unserer Gemeinschaft braucht vor allem Geduld und Ausdauer?',
      ],
      en: [
        'Which constructive routine would you love to anchor into your mornings or evenings with steadfast consistency?',
        'What mental shift helps us keep going when early excitement wanes and progress feels imperceptible?',
        'Which tough community challenge requires patient, unyielding persistence rather than quick fixes?',
      ],
    },
    theme: {
      de: 'Geduld & Beharrlichkeit',
      en: 'Patience & Perseverance',
    },
    status: 'draft',
  },
  {
    id: 'reise-tausend-meilen',
    title: {
      de: 'Der erste Schritt',
      en: 'The First Step of a Thousand Miles',
    },
    quoteSnippet: {
      de: '„Eine Reise von tausend Meilen beginnt mit einem einzigen Schritt.“',
      en: '"A journey of a thousand miles begins with a single step."',
    },
    source: {
      de: 'Laozi (Daodejing)',
      en: 'Laozi (Daodejing)',
    },
    coreQuestion: {
      de: 'Warum zögern wir oft vor großen Aufgaben, und was hilft uns, heute den mutigen ersten Schritt zu tun?',
      en: 'Why do we freeze before grand ambitions, and what grants us the bravery to take that first humble stride?',
    },
    deepeningQuestions: {
      de: [
        'Welches Vorhaben schiebst du schon länger vor dir her, weil dir der ganze Weg zu unüberwindbar erscheint?',
        'Wie können wir eine riesige Aufgabe in so kleine Häppchen zerlegen, dass der Anfang kinderleicht wird?',
        'Wie kann die Gruppe dir helfen, bei deinem nächsten ersten Schritt nicht allein zu sein?',
      ],
      en: [
        'What project or conversation have you been postponing because the entire journey feels overwhelming?',
        'How can we break an intimidating goal into bite-sized milestones where starting feels natural?',
        'How can our circle encourage you so you never feel alone when stepping out of your comfort zone?',
      ],
    },
    theme: {
      de: 'Anfangen & Mut',
      en: 'Beginning with Courage',
    },
    status: 'draft',
  },
  {
    id: 'wurzeln-und-fluegel',
    title: {
      de: 'Wurzeln und Flügel',
      en: 'Roots and Wings',
    },
    quoteSnippet: {
      de: '„Es gibt zwei bleibende Geschenke, die wir unseren Kindern mitgeben können: Das eine sind feste Wurzeln, das andere sind starke Flügel.“',
      en: '"There are two lasting bequests we can give our youth: one is deep roots, the other is strong wings."',
    },
    source: {
      de: 'Traditionelles Sprichwort',
      en: 'Traditional Proverb',
    },
    coreQuestion: {
      de: 'Was gibt dir in deinem Leben festen Halt (Wurzeln) und was schenkt dir den Mut, Neues zu wagen (Flügel)?',
      en: 'What provides solid grounding in your values (roots), and what empowers you to explore and pioneer (wings)?',
    },
    deepeningQuestions: {
      de: [
        'Was passiert mit einem Baum, der nur Flügel hat, aber keine Wurzeln – oder der nur Wurzeln hat, aber nie austreibt?',
        'Welche Werte deiner Familie oder Gemeinschaft möchtest du dein Leben lang als Wurzeln bewahren?',
        'Wohin möchtest du deine Flügel in den nächsten Jahren ausstrecken?',
      ],
      en: [
        'What happens when someone seeks total freedom without moral grounding, or clings to habit without daring to grow?',
        'Which core principles from your upbringing do you want to keep rooted in your character for a lifetime?',
        'Toward which frontiers of learning and service do you hope to spread your wings in the years ahead?',
      ],
    },
    theme: {
      de: 'Identität & Freiheit',
      en: 'Roots and Wings',
    },
    status: 'draft',
  },
];

export const CAMP_BEST_PRACTICES: CampBestPractice[] = [
  {
    id: 'haltung',
    title: {
      de: 'Die innere Haltung des Animators',
      en: 'The Mentor’s Posture',
    },
    area: {
      de: 'Haltung & Vorbild',
      en: 'Posture & Modeling',
    },
    quoteOrMotto: {
      de: 'Echtes Vertrauen entsteht durch Zugewandtheit und gelebte Verlässlichkeit.',
      en: 'Genuine trust grows through humble presence and consistent care.',
    },
    keyInsights: {
      de: [
        'Dienstorientierte Haltung: Es geht im Raum nie um das Prestige des Leiters, sondern um die Entfaltung der Jugendlichen.',
        'Körpersprache und Tonfall: Ruhige Ausstrahlung, offener Blickkontakt und Geduld schaffen emotionale Sicherheit.',
        'Vorleben statt Belehren: Bei Spielen und Übungen selbst mit ganzer Energie mitmachen, ohne sich über die Gruppe zu stellen.',
      ],
      en: [
        'Service-oriented mindset: Focus on the potential of the youth rather than personal authority.',
        'Paraverbal signals: A steady tone, open posture, and patience foster psychological safety.',
        'Participation over preaching: Fully engage in activities and challenges alongside the participants.',
      ],
    },
  },
  {
    id: 'einheit-team',
    title: {
      de: 'Einheit im Leiter-Team vor der Gruppe',
      en: 'Team Unity Before the Group',
    },
    area: {
      de: 'Zusammenarbeit im Team',
      en: 'Co-Facilitation',
    },
    quoteOrMotto: {
      de: 'Einheit im Team ist das Fundament, auf dem die Jugendlichen Vertrauen schöpfen.',
      en: 'Facilitator unity is the cornerstone of group security.',
    },
    keyInsights: {
      de: [
        'Entscheidungen gemeinsam tragen: Ein Beschluss der Beratung wird von allen Teamern getragen.',
        'Diskretion bei Uneinigkeit: Kritik an anderen Leitern niemals vor der Gruppe äußern, sondern immer im geschützten Teamkreis besprechen.',
        'Räume für leisere Stimmen schaffen: Dafür sorgen, dass sich alle Gruppenmitglieder gleichberechtigt einbringen können.',
      ],
      en: [
        'Collective ownership: Decisions reached through consultation are supported by all co-leaders.',
        'Address friction privately: Never critique or contradict a fellow leader in front of the participants.',
        'Nurture quieter voices: Actively create conversational space for more reserved participants.',
      ],
    },
  },
  {
    id: 'praxistauglichkeit',
    title: {
      de: 'Klarheit statt kognitiver Überfrachtung',
      en: 'Clarity Over Academic Complexity',
    },
    area: {
      de: 'Programmgestaltung',
      en: 'Program Design',
    },
    quoteOrMotto: {
      de: 'Abläufe müssen unmittelbar verständlich und ohne Reibung anwendbar sein.',
      en: 'Activities must be immediately actionable without unnecessary cognitive friction.',
    },
    keyInsights: {
      de: [
        'Einfache Sprache: Aufgeblasene Formulierungen und Fachbegriffe vermeiden; Regeln in 30 Sekunden am Beispiel demonstrieren.',
        'Kurze Übergänge: Zitate und Spiele nicht mit langen Monologen ankündigen, sondern direkt ins Tun übergehen.',
        'Sorgfältige Vorbereitung: Das beste Programm ist jenes, das für die Jugendlichen spürbar durchdacht und vorbereitet wurde.',
      ],
      en: [
        'Direct language: Avoid convoluted jargon; demonstrate rules by visual example in 30 seconds.',
        'Crisp transitions: Move smoothly into activities rather than bogging down in lengthy preamble.',
        'Thoughtful preparation: Smooth flow comes from quiet, loving preparation behind the scenes.',
      ],
    },
  },
];
