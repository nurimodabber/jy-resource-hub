import { ServiceProject } from '../types';

export const SERVICE_PROJECTS_DATA: ServiceProject[] = [
  {
    id: 'trash-audit-cleanup',
    title: {
      de: 'Stadtteil-Putz & Müll-Audit',
      en: 'Neighborhood Clean-up & Trash Audit'
    },
    category: 'environmental',
    scope: 'quick',
    duration: {
      de: '1 Nachmittag (90–120 Min)',
      en: '1 Afternoon (90–120 min)'
    },
    materials: {
      de: ['Arbeitshandschuhe', 'Müllsäcke (verschiedene Farben für Recycling)', 'Müllgreifer (falls vorhanden)', 'Klemmbrett für Strichliste'],
      en: ['Work gloves', 'Trash bags (color-coded for recycling)', 'Litter pickers (if available)', 'Clipboard and tally sheet']
    },
    objective: {
      de: 'Den eigenen Sozialraum konkret von Müll befreien und durch ein systematisches Audit verstehen, welche Konsummuster den Stadtteil belasten.',
      en: 'Physically beautify the immediate neighborhood while systematically auditing discarded waste to understand local consumption patterns.'
    },
    steps: {
      de: [
        'Besprechung und Zuteilung: Zweierteams bilden, jeweils einer sammelt mit Handschuhen, einer führt die Strichliste (Zigarettenfilter, Plastikflaschen, Einwegverpackungen).',
        'Sammelphase (45–60 Min): Eine festgelegte Route (z.B. Park, Spielplatz oder Fußweg zur Schule) gründlich ablaufen.',
        'Sortierung & Wiegen: Am Treffpunkt den Müll nach Wertstoffen trennen und das Gesamtgewicht bzw. die Säcke zählen.',
        'Gemeinsame Reflexion: Welche Funde haben uns überrascht? Welcher Müll hätte vermieden werden können?'
      ],
      en: [
        'Briefing & Pair Formation: Form buddy pairs where one collects wearing gloves and the other tallies categories (bottle caps, snack wrappers, cigarette butts).',
        'Collection Phase (45–60 min): Traverse a designated route (e.g., local park, playground, or school walkway).',
        'Sorting & Weighing: Return to base, separate recyclables from landfill waste, and tally totals.',
        'Group Reflection: Which discarded items surprised the group most? What simple shifts could eliminate this waste at the source?'
      ]
    },
    reflectionQuestions: {
      de: [
        'Wie hat sich die Atmosphäre des Ortes verändert, nachdem wir fertig waren?',
        'Welche Verantwortung haben wir als Bewohner unseres Viertels gegenüber der Natur und den Mitmenschen?',
        'Wie können wir Müllvermeidung auch in unseren eigenen Familien und Freundeskreisen ansprechen?'
      ],
      en: [
        'How did the atmosphere of the space transform after our efforts?',
        'What moral responsibility do we bear toward nature and our fellow neighbors in this neighborhood?',
        'How can we promote mindful waste reduction within our own families and peer circles?'
      ]
    },
    animatorTips: {
      de: [
        'Sicherheit geht vor: Glasflaschen und scharfe Gegenstände nur von Leitern aufheben lassen; niemals in unübersichtliche Büsche greifen.',
        'Vorab bei der örtlichen Stadtreinigung anfragen – oft stellen Kommunen kostenlos Zangen, Handschuhe und Müllsäcke bereit.'
      ],
      en: [
        'Safety first: Facilitators should handle broken glass or sharp items; instruct youth never to reach blindly into bushes.',
        'Check with local municipal sanitation services beforehand—many city councils provide free pickers, gloves, and bags.'
      ]
    }
  },
  {
    id: 'gratitude-letters-workers',
    title: {
      de: 'Dankbarkeits-Briefe für Alltagshelden',
      en: 'Gratitude Letters for Everyday Unsung Heroes'
    },
    category: 'neighborhood',
    scope: 'quick',
    duration: {
      de: '1 Gruppenstunde (60–75 Min)',
      en: '1 Gathering (60–75 min)'
    },
    materials: {
      de: ['Hochwertiges Bastelpapier & Umschläge', 'Kalligrafie- und Buntstifte', 'Klebestifte & Deko-Material', 'Ggf. kleine Blumengrüße oder Teebeutel'],
      en: ['Quality cardstock and envelopes', 'Calligraphy & colored pens', 'Stickers / decorative paper', 'Optional fresh flowers or artisanal tea bags']
    },
    objective: {
      de: 'Menschen wertschätzen, deren tägliche Arbeit oft unsichtbar bleibt (Busfahrer, Reinigungskräfte, Postboten, Pflegepersonal).',
      en: 'Affirm and uplift individuals whose daily service often goes unnoticed (bus drivers, custodians, postal carriers, care aides).'
    },
    steps: {
      de: [
        'Brainstorming (15 Min): Welche Berufe halten unser Viertel im Stillen am Laufen? Wer bekommt selten ein echtes „Danke“ zu hören?',
        'Gestaltung (30 Min): Die Jugendlichen schreiben persönliche, warmherzige Botschaften mit handgestalteten Karten.',
        'Verpackung: Jede Karte wird mit einer kleinen Aufmerksamkeit (z.B. einer Sonnenblume oder Schokolade) versehen.',
        'Übergabe (20 Min): Gemeinsam losziehen und die Karten respektvoll und herzlich an die Empfänger überreichen.'
      ],
      en: [
        'Brainstorming (15 min): Which vocations silently sustain our neighborhood daily? Who rarely receives heartfelt recognition?',
        'Card Crafting (30 min): Youth compose personalized, sincere expressions of gratitude paired with hand-drawn art.',
        'Assembly: Pair each letter with a small token of cheer (a sunflower, warm tea sachet, or chocolate).',
        'Personal Delivery (20 min): Walk out into the community to deliver the cards directly and warmly.'
      ]
    },
    reflectionQuestions: {
      de: [
        'Wie haben die Empfänger reagiert, als sie die Karten erhalten haben?',
        'Warum neigen Menschen dazu, alltägliche Dienste als selbstverständlich hinzunehmen?',
        'Was bewirkt aufrichtige Dankbarkeit in der Seele desjenigen, der sie ausdrückt?'
      ],
      en: [
        'How did the recipients react upon receiving unexpected gratitude?',
        'Why do people tend to take essential everyday labor for granted?',
        'What spiritual effect does expressing genuine gratitude produce within the person who gives it?'
      ]
    },
    animatorTips: {
      de: [
        'Vorab keine vorgefertigten Mustertexte vorgeben; die Jugendlichen finden oft erstaunlich treffende und tief berührende Worte.',
        'Wenn Jugendliche schüchtern sind, die Übergabe kurz zu zweit anleiten.'
      ],
      en: [
        'Avoid providing rigid script templates; youth naturally express startlingly genuine and poetic sentiments.',
        'For timid youth, pair them up so they can step forward and hand over the card together.'
      ]
    }
  },
  {
    id: 'elderly-wisdom-interviews',
    title: {
      de: 'Lebensweisheit-Interviews & Seniorenbesuch',
      en: 'Intergenerational Wisdom Interviews'
    },
    category: 'intergenerational',
    scope: 'medium',
    duration: {
      de: '2 Treffen (1x Vorbereitung, 1x Besuch & Auswertung)',
      en: '2 Sessions (1x prep, 1x visit & synthesis)'
    },
    materials: {
      de: ['Interview-Fragebogen auf Klemmbrett', 'Diktiergerät / Smartphone für Tonaufnahmen (mit Erlaubnis)', 'Selbstgebackene Kekse oder Kuchen', 'Fotokamera'],
      en: ['Clipboard with interview prompts', 'Voice recorder / phone (with explicit permission)', 'Homemade baked goods', 'Camera for commemorative portrait']
    },
    objective: {
      de: 'Brücken zwischen den Generationen bauen, Einsamkeit lindern und die Schätze gelebter Lebenserfahrung erfassen.',
      en: 'Bridge the generational divide, alleviate social isolation among elders, and document the treasures of lived experience.'
    },
    steps: {
      de: [
        'Vorbereitung (Treffen 1): Fragen erarbeiten: „Was war die wichtigste Lektion Ihres Lebens?“, „Wie meisterten Sie schwere Zeiten?“, „Was wünschen Sie der Jugend heute?“',
        'Besuch im Seniorenheim oder bei Nachbarn (Treffen 2): Gemeinsam bei Tee und Gebäck zuhören und Notizen machen.',
        'Dokumentation: Ein kleines illustriertes Heftchen oder Plakat mit den schönsten Zitaten der Senioren gestalten.',
        'Rückgabe: Ein Exemplar der gestalteten Zitate als Andenken an die Senioren überreichen.'
      ],
      en: [
        'Preparation (Session 1): Formulate inquiry questions: "What was life\'s greatest lesson?", "How did you overcome adversity?", "What hope do you hold for youth today?"',
        'Visit (Session 2): Spend an unhurried afternoon listening over tea and homemade biscuits, taking careful notes.',
        'Synthesis: Compile a beautifully lettered booklet or photo-poster spotlighting the seniors\' quotes and insights.',
        'Gift Return: Present a finished bound keepsake copy back to the participants.'
      ]
    },
    reflectionQuestions: {
      de: [
        'Was hat euch an den Erzählungen am meisten berührt oder zum Nachdenken gebracht?',
        'Inwiefern unterscheidet sich der Blickwinkel eines älteren Menschen von dem eines Jugendlichen?',
        'Wie können wir diese Verbindung auch über dieses Projekt hinaus lebendig halten?'
      ],
      en: [
        'What story touched you the most deeply or shifted your perspective?',
        'How does an elder\'s long-term horizon differ from the immediate concerns of adolescent life?',
        'How can we sustain an ongoing relationship with these friends beyond this single visit?'
      ]
    },
    animatorTips: {
      de: [
        'Unbedingt vorher die Leitung der Senioreneinrichtung kontaktieren und Zeitrahmen sowie Gruppengröße präzise abstimmen.',
        'Jugendliche auf ruhiges, deutliches Sprechen und aktives, geduldiges Zuhören vorbereiten.'
      ],
      en: [
        'Always coordinate with senior center staff well in advance to establish group sizes and comfort preferences.',
        'Coach youth in speaking gently, unhurriedly, and practicing patient, active listening.'
      ]
    }
  },
  {
    id: 'seed-bombs-wildflowers',
    title: {
      de: 'Samenbomben für städtische Bienenweiden',
      en: 'Wildflower Seed Bombs for Urban Biodiversity'
    },
    category: 'environmental',
    scope: 'quick',
    duration: {
      de: '1 Gruppenstunde (60–90 Min)',
      en: '1 Gathering (60–90 min)'
    },
    materials: {
      de: ['Heimisches Wildblumensaatgut (ungebeizt)', 'Tonmehl oder Lehmpulver', 'Torffreie Pflanzerde', 'Wasser & Rührschüsseln', 'Eierkartons zum Trocknen'],
      en: ['Native wildflower seeds (non-GMO)', 'Clay powder or bentonite', 'Peat-free potting soil', 'Water & mixing basins', 'Egg cartons for drying']
    },
    objective: {
      de: 'Karge urbane Randstreifen in blühende Oasen für Bestäuber verwandeln und das Bewusstsein für Biodiversität schärfen.',
      en: 'Transform barren roadside strips into vibrant pollinator havens while deepening awareness of ecological balance.'
    },
    steps: {
      de: [
        'Mischverhältnis erklären: 5 Teile Ton, 3 Teile Erde, 1 Teil Saatgut, schrittweise Wasser hinzugeben.',
        'Matschküche & Formen: Teig kneten und walnussgroße Kugeln rollen. In Eierkartons 2 Tage trocknen lassen.',
        'Verteilungs-Aktion: Die Kugeln an grauen, brachliegenden Stellen im Stadtteil auswerfen (oder an Passanten mit Pflegehinweisen verschenken).',
        'Dokumentation: Orte markieren und bei späteren Gruppenstunden das Keimen und Blühen beobachten.'
      ],
      en: [
        'Recipe ratio: Mix 5 parts clay powder, 3 parts rich soil, 1 part native seeds, adding water slowly until pliable dough forms.',
        'Rolling: Roll into walnut-sized balls. Place in egg cartons to dry in shade for 48 hours.',
        'Deployment: Scatter seed balls across barren roadside dirt patches, or distribute to neighbors with care instructions.',
        'Longitudinal observation: Map drop locations and revisit them during future sessions to celebrate initial sprouts.'
      ]
    },
    reflectionQuestions: {
      de: [
        'Welche Parallelen gibt es zwischen einem kleinen Samenkorn und den Potenzialen in einem jungen Menschen?',
        'Wie wirkt sich ein grüneres, blühendes Umfeld auf das seelische Wohlbefinden von Menschen aus?'
      ],
      en: [
        'What spiritual parallels exist between a humble seed and the latent capacities within a young human being?',
        'How does a blooming, verdant environment enhance the inner peace and well-being of a community?'
      ]
    },
    animatorTips: {
      de: [
        'Ausschließlich heimische Wildblumenarten verwenden, um invasive Neophyten zu vermeiden.',
        'Die Jugendlichen lieben das taktile Kneten; Plastikunterlagen für Tische bereithalten.'
      ],
      en: [
        'Strictly source regionally native wildflower mixes to protect local pollinators and avoid invasive weeds.',
        'Youth thoroughly enjoy the tactile clay mixing; lay down protective table coverings beforehand.'
      ]
    }
  },
  {
    id: 'children-storytelling-festival',
    title: {
      de: 'Kinder-Geschichtenstunde & Spielefest',
      en: 'Children\'s Storytelling & Games Festival'
    },
    category: 'children',
    scope: 'medium',
    duration: {
      de: '2 Treffen (Planung + Durchführung eines 90-Min Events)',
      en: '2 Sessions (Planning + hosting a 90-min event)'
    },
    materials: {
      de: ['Kinderbücher mit Tugend-Geschichten', 'Requisiten für Schattentheater oder Puppenspiel', 'Bastelmaterialien (Farben, Scheren, Papier)', 'Kleine gesunde Snacks'],
      en: ['Illustrated storybooks featuring virtues', 'Puppet or shadow-play props', 'Crafting supplies (colored paper, safety scissors, glue)', 'Healthy snack platters']
    },
    objective: {
      de: 'Juniorjugendliche übernehmen Vorbildfunktion für jüngere Kinder und vermitteln Werte durch interaktives Erzählen und Spiele.',
      en: 'Junior youth step up as inspiring older mentors for younger children, fostering virtue development through narrative and play.'
    },
    steps: {
      de: [
        'Rollenverteilung (Treffen 1): Wer liest vor? Wer inszeniert ein kurzes Schauspiel? Wer leitet das anschließende Basteln und Bewegungsspiel?',
        'Probelauf: Das Vorlesen mit verteilten Stimmen und Geräuscheffekten üben.',
        'Durchführung (Treffen 2): Einladung an Nachbarskinder: 30 Min interaktive Geschichte, 30 Min Basteln zur Geschichte, 30 Min kooperative Spiele.',
        'Auswertung: Wie fühlte es sich an, Verantwortung für die Kleinen zu tragen?'
      ],
      en: [
        'Role delegation (Session 1): Who reads the central tale? Who acts out characters? Who facilitates the follow-up craft and game?',
        'Rehearsal: Practice expressive vocal pacing, interactive questions, and sound effects.',
        'Hosting (Session 2): Welcome younger neighborhood kids for 30 min story theater, 30 min responsive craft, and 30 min cooperative yard games.',
        'Debrief: How did stepping into leadership for younger children transform our own group\'s maturity?'
      ]
    },
    reflectionQuestions: {
      de: [
        'Welche Eigenschaften braucht man, um jüngeren Kindern Geborgenheit und Begeisterung zu schenken?',
        'Wie können wir im Alltag ein positives Vorbild für die Kinder in unserer Nachbarschaft sein?'
      ],
      en: [
        'What inner virtues are required to create a safe, uplifting haven for young children?',
        'How can our daily habits set an inspiring moral standard for younger kids observing us in the neighborhood?'
      ]
    },
    animatorTips: {
      de: [
        'Lobe die Juniorjugendlichen gezielt für Geduld, sanften Tonfall und Aufmerksamkeit gegenüber schüchternen Kindern.'
      ],
      en: [
        'Praise the junior youth specifically for patience, gentle tone, and mindful inclusion of quieter children.'
      ]
    }
  },
  {
    id: 'sidewalk-chalk-kindness',
    title: {
      de: 'Gehweg-Kreide: Lichtbotschaften im öffentlichen Raum',
      en: 'Sidewalk Chalk: Uplifting Words in Public Space'
    },
    category: 'creative',
    scope: 'quick',
    duration: {
      de: '1 Gruppenstunde (45–60 Min)',
      en: '1 Gathering (45–60 min)'
    },
    materials: {
      de: ['Große Straßenmalkreiden in leuchtenden Farben', 'Schablonen (optional)', 'Zitatenkarten als Vorlagen', 'Schwamm und Wasser für Korrekturen'],
      en: ['Jumbo sidewalk chalk in vibrant colors', 'Lettering stencils (optional)', 'Quote reference cards', 'Damp sponges for touch-ups']
    },
    objective: {
      de: 'Den öffentlichen Raum mit inspirierenden Zitaten, aufmunternden Gedanken und farbenfrohen Kunstwerken für Fußgänger erhellen.',
      en: 'Brighten pedestrian footpaths with uplifting scripture passages, inspiring reflections, and joyful street art.'
    },
    steps: {
      de: [
        'Zitate & Sprüche auswählen: Aus den gelernten Zitaten 3–4 prägnante Verse auswählen (z.B. über Einheit, Hoffnung, Freundlichkeit).',
        'Platzwahl: Einen viel frequentierten, sicheren Gehweg (z.B. vor dem Gemeindezentrum, Parkeingang oder Schulweg) wählen.',
        'Gestaltung: Mit kalligrafischen Schriftzügen, floralen Ornamenten und Farbverläufen die Worte auf den Asphalt zaubern.',
        'Reaktionen beobachten: Passanten beim Lesen beobachten und das gemeinsame Werk fotografieren.'
      ],
      en: [
        'Text curation: Select 3–4 punchy verses from memorized texts (focusing on unity, hope, kindness, and courage).',
        'Site scouting: Choose a safe, high-traffic pedestrian walkway (community center path, public park entrance, or library plaza).',
        'Artistic creation: Render the quotes with stylized typography, floral motifs, and gradient borders.',
        'Public resonance: Quietly observe pedestrians pause, smile, and photograph the artwork.'
      ]
    },
    reflectionQuestions: {
      de: [
        'Wie reagieren Menschen, wenn ihnen unerwartet ein ermutigendes Wort auf dem Gehweg begegnet?',
        'Wie können wir Kunst als Werkzeug nutzen, um die Gedanken unserer Mitmenschen zu erheben?'
      ],
      en: [
        'How do weary commuters react when greeted unexpectedly by words of light beneath their feet?',
        'In what ways can creative arts serve as a tool to elevate collective community consciousness?'
      ]
    },
    animatorTips: {
      de: [
        'Nur wasserlösliche Kreide auf öffentlichem Pflaster verwenden; denkmalgeschützte Gebäude oder private Eingänge meiden.'
      ],
      en: [
        'Use strictly non-toxic, washable sidewalk chalk; avoid historic brick facades or private residential gates.'
      ]
    }
  },
  {
    id: 'community-book-box',
    title: {
      de: 'Offener Bücherschrank & Leseecke-Patenschaft',
      en: 'Community Book Box Curation & Stewardship'
    },
    category: 'neighborhood',
    scope: 'medium',
    duration: {
      de: '2 Nachmittage',
      en: '2 Afternoons'
    },
    materials: {
      de: ['Ausgemusterte wetterfeste Box oder bestehender Bücherschrank', 'Buchspenden (vorsortiert)', 'Reinigungsmittel & Pinsel', 'Lesezeichen mit ermutigenden Zitaten'],
      en: ['Weatherproof cabinet or existing public book box', 'Curated donated books', 'Cleaning rags and brushes', 'Handmade bookmarks with quotes']
    },
    objective: {
      de: 'Einen bestehenden offenen Bücherschrank pflegen, säubern, mit inspirierender Literatur bestücken und handgemachte Lesezeichen beilegen.',
      en: 'Adopt, restore, and replenish an existing public mini-library, leaving inspirational bookmarks inside quality literature.'
    },
    steps: {
      de: [
        'Bestandsaufnahme & Reinigung: Den Bücherschrank von kaputten oder unpassenden Büchern befreien, Scheiben putzen und Scharniere ölen.',
        'Bücher-Sammelaktion: Im Freundeskreis und bei Nachbarn nach spannenden Jugend- und Kinderbüchern fragen.',
        'Lesezeichen-Werkstatt: 50 kunstvolle Lesezeichen mit Zitaten über Wissen und Charakter anfertigen und in die Bücher einlegen.',
        'Regelmäßige Patenschaft: Einmal im Monat nach dem Rechten sehen.'
      ],
      en: [
        'Audit & Polish: Clear weathered debris from the book nook, wipe glass clean, and reorganize disorganized shelves.',
        'Book Drive: Collect gentle-condition youth and children\'s literature from neighborhood families.',
        'Bookmark Atelier: Craft 50 artistic bookmarks inscribed with quotes on knowledge and wisdom, tucked into the books.',
        'Ongoing stewardship: Assign a monthly rotation to check and maintain the library box.'
      ]
    },
    reflectionQuestions: {
      de: [
        'Warum ist der freie Zugang zu guten Büchern so entscheidend für die geistige Gesundheit einer Gemeinschaft?',
        'Wie unterscheidet sich das Pflegen von Gemeingut von rein persönlichem Besitz?'
      ],
      en: [
        'Why is barrier-free access to wholesome books crucial for the moral and intellectual health of a town?',
        'How does caring for public commons cultivate a sense of civic ownership?'
      ]
    },
    animatorTips: {
      de: [
        'Vorab klären, ob es einen offiziellen Betreuer des Schranks gibt, und sich mit ihm freundlich abstimmen.'
      ],
      en: [
        'Check if there is an existing municipal guardian or volunteer sponsor for the book box to partner harmoniously.'
      ]
    }
  },
  {
    id: 'food-bank-hygiene-drive',
    title: {
      de: 'Wärme-Pakete für die örtliche Tafel / Notschlafstelle',
      en: 'Care & Hygiene Kits for Local Shelters'
    },
    category: 'institutional',
    scope: 'medium',
    duration: {
      de: '2 Treffen (Sammeln & Packen)',
      en: '2 Sessions (Collection & Packing)'
    },
    materials: {
      de: ['Stofftaschen oder Kartons', 'Hygieneartikel (Zahnbürsten, Seife, Feuchttücher, Socken)', 'Handgeschriebene Grußkarten', 'Sammelboxen für Supermärkte'],
      en: ['Cloth tote bags or boxes', 'Essential toiletries (toothbrushes, soap, warm socks, lip balm)', 'Handwritten notes of care', 'Donation collection bins']
    },
    objective: {
      de: 'Menschen in Notlagen mit dringend benötigten Hygieneartikeln versorgen und ihnen durch persönliche Worte Wärme und Würde schenken.',
      en: 'Equip vulnerable individuals experiencing homelessness or hardship with dignity essentials and heartfelt personal messages.'
    },
    steps: {
      de: [
        'Bedarfsermittlung: Anruf bei der lokalen Tafel oder Obdachlosenhilfe: Welche Artikel fehlen aktuell am meisten?',
        'Sammel-Aktion: Im Umfeld, bei Verwandten oder durch einen Stand vor dem Supermarkt Spenden sammeln.',
        'Packtag: In der Gruppe Packstraßen bilden: Socken, Seife, Zahnbürste und jeweils eine handgeschriebene Grußkarte liebevoll verpacken.',
        'Übergabe: Die Pakete gemeinsam an die Einrichtung übergeben und sich über die Arbeit der Organisation informieren.'
      ],
      en: [
        'Needs Assessment: Call the local shelter or soup kitchen: Which non-food essentials are in shortest supply?',
        'Community Drive: Mobilize neighbors, families, and school peers to donate unopened essentials.',
        'Packing Atelier: Assemble care bundles in an organized relay line, including a personalized blessing card in each kit.',
        'Delivery & Learning: Present the kits directly to the social workers and listen to a brief orientation about their shelter work.'
      ]
    },
    reflectionQuestions: {
      de: [
        'Was bedeutet es, anderen mit wahrer Würde und ohne Herablassung zu dienen?',
        'Welche strukturellen Ursachen führen dazu, dass Menschen in Not geraten, und wie können wir zu dauerhafter Gerechtigkeit beitragen?'
      ],
      en: [
        'What does it mean to serve those in vulnerability with utmost humility and zero condescension?',
        'What underlying factors generate societal vulnerability, and how does true justice address them?'
      ]
    },
    animatorTips: {
      de: [
        'Socken und Zahnhygiene werden fast immer am dringendsten gebraucht.',
        'Lasse die Jugendlichen die Übergabe selbst durchführen, statt dass Leiter im Vordergrund stehen.'
      ],
      en: [
        'Warm socks and dental hygiene products are almost universally the highest-demand items.',
        'Ensure the youth step forward to hand over the donations themselves rather than mentors.'
      ]
    }
  },
  {
    id: 'bike-repair-neighborhood',
    title: {
      de: 'Fahrrad-Check & Aufpump-Station für Nachbarn',
      en: 'Neighborhood Bicycle Safety & Pump Clinic'
    },
    category: 'neighborhood',
    scope: 'medium',
    duration: {
      de: '1 Nachmittag (2–3 Stunden)',
      en: '1 Afternoon (2–3 hours)'
    },
    materials: {
      de: ['Stand-Luftpumpe mit Manometer', 'Kettenöl & Lappen', 'Inbusschlüssel-Set & Schraubenschlüssel', 'Reifenflickzeug & Eimer mit Wasser', 'Hinweisschild'],
      en: ['Floor bike pump with pressure gauge', 'Chain lubricant & rags', 'Hex key set & basic wrenches', 'Tire patch kit & water basin', 'Welcoming sidewalk sign']
    },
    objective: {
      de: 'Nachbarn helfen, ihre Fahrräder verkehrssicher zu machen: Reifen aufpumpen, Ketten ölen, Bremsen prüfen und kleine Pannen flicken.',
      en: 'Assist neighborhood residents in tuning up their bicycles: pumping tires, cleaning and lubricating chains, and inspecting brakes.'
    },
    steps: {
      de: [
        'Vorbereitung: Die Jugendlichen lernen vorab an ihren eigenen Rädern die Basics: Reifendruck, Kette ölen, Schrauben nachziehen.',
        'Station aufbauen: An einem gut sichtbaren Platz (Hof, Gehweg) ein Schild aufstellen: „Kostenloser Fahrrad-Check durch die Jugendgruppe“.',
        'Service leisten: Nachbarn begrüßen, Luftdruck prüfen, Kette schmieren, Reflektoren säubern.',
        'Gemeinschaft pflegen: Mit den Nachbarn ins Gespräch kommen und ein Glas Wasser anbieten.'
      ],
      en: [
        'Skill session: Youth first practice on their own bikes: checking tire PSI, degreasing chains, and tightening loose bolts.',
        'Clinic setup: Position a sidewalk sign at a welcoming plaza: "Free Bicycle Safety Check by Junior Youth".',
        'Service in action: Greet neighbors, calibrate tire pressure, lubricate drivetrains, and polish reflectors.',
        'Hospitality: Offer cool water and engage in friendly consultation while completing tune-ups.'
      ]
    },
    reflectionQuestions: {
      de: [
        'Wie schafft eine praktische, handwerkliche Hilfsaktion Vertrauen in der Nachbarschaft?',
        'Was lernen wir über Zusammenarbeit, wenn wir gemeinsam an einer mechanischen Aufgabe tüfteln?'
      ],
      en: [
        'How does tangible, hands-on mechanical service dissolve social distance among neighbors?',
        'What does troubleshooting mechanical puzzles teach us about group problem solving?'
      ]
    },
    animatorTips: {
      de: [
        'Einen sachkundigen Erwachsenen oder älteren Jugendlichen als Supervisor für Bremsen-Checks dazuholen.',
        'Immer Schutzhandschuhe gegen Kettenfett bereitstellen.'
      ],
      en: [
        'Invite a bicycle-savvy adult or older youth to supervise brake calibrations.',
        'Keep grease-resistant gloves and shop wipes readily accessible.'
      ]
    }
  },
  {
    id: 'digital-helpdesk-seniors',
    title: {
      de: 'Smartphone & Digital-Sprechstunde für Ältere',
      en: 'Smartphone & Digital Clinic for Seniors'
    },
    category: 'intergenerational',
    scope: 'medium',
    duration: {
      de: '1–2 Nachmittage (jeweils 90 Min)',
      en: '1–2 Afternoons (90 min each)'
    },
    materials: {
      de: ['Tische und bequeme Stühle', 'WLAN-Zugang', 'Notizblöcke & Stifte für Schritt-für-Schritt-Anleitungen', 'Kaffee, Tee & Gebäck'],
      en: ['Tables and comfortable chairs', 'Stable Wi-Fi access', 'Note pads & pens for custom instructions', 'Coffee, tea & pastries']
    },
    objective: {
      de: 'Digitale Barrieren abbauen: Älteren Menschen in 1-zu-1-Tandems geduldig erklären, wie sie Fotos versenden, Schriftgrößen anpassen oder Videoanrufe mit Enkeln führen.',
      en: 'Dismantle digital isolation: Patiently tutor seniors in 1-on-1 pairs on sending family photos, adjusting font sizes, or video calling grandchildren.'
    },
    steps: {
      de: [
        'Haltungs-Schulung: Den Jugendlichen vermitteln: Nicht selbst tippen, sondern den Senior die Handgriffe selbst ausführen lassen; absolute Geduld.',
        'Einladung & Empfang: Senioren im Gemeindehaus oder Seniorenclub mit Tee und Wärme willkommen heißen.',
        '1-zu-1-Betreuung: Jeder Jugendliche setzt sich zu einem Senior und widmet sich dessen konkreten Fragen.',
        'Schriftliche Merkhilfe: Die Jugendlichen schreiben verständliche, bebilderte Spickzettel für zu Hause auf.'
      ],
      en: [
        'Posture briefing: Train youth in golden rule of tech support: never grab the phone; guide the elder to tap the screen themselves with infinite patience.',
        'Welcome & Hospitality: Receive elders in a quiet hall with tea, cookies, and relaxing background music.',
        '1-on-1 Mentoring: Pair each youth with an elder to address their individual questions without rush.',
        'Cheatsheet Crafting: Youth handwrite step-by-step illustrated notes for the elder to keep at home.'
      ]
    },
    reflectionQuestions: {
      de: [
        'Warum fällt es Jugendlichen oft so leicht, Technik zu bedienen, während Ältere Hemmungen haben?',
        'Wie fühlte es sich an, echtes Wissen und Fähigkeiten an eine ältere Generation weiterzugeben?'
      ],
      en: [
        'Why does intuitive digital literacy come naturally to youth, while causing intense hesitation for seniors?',
        'How did it feel to step into the role of a patient, gentle instructor for someone decades older?'
      ]
    },
    animatorTips: {
      de: [
        'Ermahne die Jugendlichen freundlich, niemals das Smartphone aus der Hand des Seniors zu reißen, um es „schnell selbst zu machen“.'
      ],
      en: [
        'Constantly remind youth: the goal is empowerment, not speed. Keep hands behind back unless invited.'
      ]
    }
  },
  {
    id: 'birdhouse-wildlife-nesting',
    title: {
      de: 'Nistkasten- & Insektenhotel-Bau',
      en: 'Nesting Boxes & Insect Hotel Crafting'
    },
    category: 'environmental',
    scope: 'deep',
    duration: {
      de: 'Halbtages-Projekt (3–4 Stunden)',
      en: 'Half-Day Project (3–4 hours)'
    },
    materials: {
      de: ['Unbehandeltes Holz (Fichte/Tanne)', 'Holzbohrer, Schrauben & Akkuschrauber', 'Schilfrohr, Bambusstäbe, Tannenzapfen', 'Aufhänge-Draht'],
      en: ['Untreated timber planks', 'Drill bits, wood screws & cordless drill', 'Hollow bamboo canes, pinecones, bark', 'Mounting wire']
    },
    objective: {
      de: 'Lokalen Singvögeln und nützlichen Wildbienen geschützte Brut- und Überwinterungsplätze im Stadtteil schenken.',
      en: 'Provide vital nesting sanctuaries and wintering shelters for native songbirds and solitary wild bees.'
    },
    steps: {
      de: [
        'Zuschnitt & Montage: Die Holzteile nach erprobten Bauplänen (NABU/BUND) verschrauben. Auf korrekten Einflugloch-Durchmesser achten.',
        'Insektenhotel befüllen: Schilfhalme sauber entgraten und bündeln; Hartholzblöcke mit verschiedenen Bohrerdurchmessern (3–8 mm) versehen.',
        'Installation: Die Nistkästen an geeigneten Bäumen (in 2–3 m Höhe, geschützt vor Katzen und direkter Mittagssonne) anbringen.',
        'Patenschaft: Die Kästen im Herbst säubern und protokollieren, wer eingezogen ist.'
      ],
      en: [
        'Construction: Assemble precut wooden panels according to conservation guidelines. Drill correct aperture diameter for native tits/robins.',
        'Insect Haven Assembly: Smooth bamboo stems and bundle tightly; drill smooth 3–8mm blind holes into hardwood blocks.',
        'Mounting: Fasten securely onto trees at 2–3m height, shielded from feline predators and intense midday heat.',
        'Seasonal Audit: Clean and document occupied nests each autumn.'
      ]
    },
    reflectionQuestions: {
      de: [
        'Welche Rolle spielen Tiere und Pflanzen in der Schöpfung und wie können wir zu ihren Hütern werden?',
        'Wie stärkt handwerkliches Schaffen das Selbstvertrauen der Gruppe?'
      ],
      en: [
        'What sacred role do non-human creatures occupy within creation, and how can we act as their loving stewards?',
        'How does collaborative carpentry and physical making build lasting team cohesion?'
      ]
    },
    animatorTips: {
      de: [
        'Auf saubere Bohrungen ohne Splitter achten, damit sich die zarten Flügel der Wildbienen nicht verletzen.'
      ],
      en: [
        'Sand all drilled entrance holes completely smooth; splinters tear fragile bee wings.'
      ]
    }
  },
  {
    id: 'flowerbed-revitalization',
    title: {
      de: 'Gemeindebeet- & Parkbank-Verschönerung',
      en: 'Community Garden Revitalization & Park Bench Polish'
    },
    category: 'environmental',
    scope: 'medium',
    duration: {
      de: '1 Nachmittag (2–3 Stunden)',
      en: '1 Afternoon (2–3 hours)'
    },
    materials: {
      de: ['Gartenschaufeln & Harken', 'Mulch & Bio-Blumenerde', 'Mehrjährige Stauden & Sträucher', 'Schleifpapier & Holzöl für Parkbänke', 'Gießkannen'],
      en: ['Trowels, rakes & garden shears', 'Organic mulch & topsoil', 'Perennial shrubs & pollinator flowers', 'Sandpaper & non-toxic wood oil', 'Watering cans']
    },
    objective: {
      de: 'Ein vernachlässigtes öffentliches Beet oder den Außenbereich eines Gemeindezentrums in einen einladenden Ort der Begegnung verwandeln.',
      en: 'Transform an overgrown public flowerbed or community center courtyard into an inviting oasis of beauty and gathering.'
    },
    steps: {
      de: [
        'Beet vorbereiten: Unkraut jäten, Boden lockern, alte Steine und Müll entfernen.',
        'Pflanzung: Stauden harmonisch anordnen, einpflanzen, kräftig wässern und mit Rindenmulch abdecken.',
        'Parkbank-Aufbereitung: Verwitterte Holzbänke vorsichtig abschleifen und mit umweltfreundlichem Pflegeöl einlassen.',
        'Feierlicher Abschluss: Das neue Beet mit einer gemeinsamen Andacht oder einem Lied einweihen.'
      ],
      en: [
        'Ground prep: Clear invasive weeds, loosen compacted soil, and extract buried trash.',
        'Planting: Arrange perennials harmoniously, dig planting beds, water deeply, and apply protective mulch.',
        'Bench restoration: Sand weathered wooden park benches and coat with natural linseed oil.',
        'Dedication: Conclude with a celebratory devotional prayer and song at the newly revitalized site.'
      ]
    },
    reflectionQuestions: {
      de: [
        'Wie wirkt die Schönheit der Natur auf die Gedanken von Vorbeigehenden?',
        'Warum ist Pflege und Beständigkeit bei einem Dienstprojekt genauso wichtig wie der erste Tag?'
      ],
      en: [
        'How does visible natural beauty influence the mood and inner posture of passersby?',
        'Why is consistent follow-up care just as spiritually significant as the launch event?'
      ]
    },
    animatorTips: {
      de: [
        'Einen festen Gießplan für die ersten vier Wochen nach der Pflanzung aufstellen.'
      ],
      en: [
        'Establish an alternating youth watering roster for the critical first four weeks.'
      ]
    }
  },
  {
    id: 'hospital-care-cards',
    title: {
      de: 'Mutmach-Karten für Kinderkrankenhaus / Reha',
      en: 'Encouragement Art for Pediatric Wards'
    },
    category: 'creative',
    scope: 'quick',
    duration: {
      de: '1 Gruppenstunde (60 Min)',
      en: '1 Gathering (60 min)'
    },
    materials: {
      de: ['Aquarellfarben & dickes Papier', 'Wachsmalstifte & Fineliner', 'Hoffnungsvolle Gedichte & Zitate', 'Schleifenbänder'],
      en: ['Watercolor palettes & heavy paper', 'Wax pastels & fine ink pens', 'Uplifting poetic verses', 'Ribbon ties']
    },
    objective: {
      de: 'Kindern und Jugendlichen, die längere Zeit im Krankenhaus verbringen müssen, handgemalte Farbtupfer und mutmachende Verse ans Krankenbett senden.',
      en: 'Channel empathy and warmth to children enduring long hospital stays through vibrant hand-painted artwork and resilient verses.'
    },
    steps: {
      de: [
        'Einfühlungs-Runde: Wie fühlt es sich an, krank im Bett zu liegen und seine Freunde nicht sehen zu können?',
        'Kreativphase: Leuchtende, farbenfrohe Kunstwerke malen (Sonnenaufgänge, Tiere, Blumen) mit mutmachenden Sprüchen („Du bist stark“, „Jeder neue Tag bringt Licht“).',
        'Veredelung: Die Kunstwerke als Miniposter oder Aufstell-Karten fertigstellen.',
        'Zustellung: Über die Krankenhausseelsorge oder Patientenbetreuung gebündelt übergeben.'
      ],
      en: [
        'Empathy circle: What does it feel like to be confined to a hospital room away from school, friends, and fresh air?',
        'Artistic creation: Paint luminous watercolor landscapes, vibrant animals, and stars inscribed with affirming words.',
        'Mounting: Fold into self-standing desk cards or mini-posters.',
        'Coordinated handover: Deliver in bulk to pediatric hospital liaisons or volunteer chaplains.'
      ]
    },
    reflectionQuestions: {
      de: [
        'Wie kann Kunst eine heilende und tröstende Wirkung auf den menschlichen Geist haben?',
        'Was lernen wir über Verbundenheit mit Menschen, die wir vielleicht nie persönlich treffen?'
      ],
      en: [
        'In what ways can visual art and poetic language exert a healing, soothing influence on the soul?',
        'What does this teach us about spiritual solidarity with souls we may never meet face to face?'
      ]
    },
    animatorTips: {
      de: [
        'Hygieneregeln beachten: Keine losen Glitzerpartikel oder organische Naturmaterialien, die auf Krankenstationen unzulässig sind.'
      ],
      en: [
        'Observe medical hygiene protocols: strictly avoid loose glitter or organic plant materials prohibited in clinical wards.'
      ]
    }
  },
  {
    id: 'anti-bullying-peace-poster',
    title: {
      de: 'Respekt-Kampagne & Schulfoyer-Ausstellung',
      en: 'Kindness & Inclusion School Poster Campaign'
    },
    category: 'institutional',
    scope: 'medium',
    duration: {
      de: '2 Treffen (Konzeption & Plakatgestaltung)',
      en: '2 Sessions (Conceptualization & Poster Atelier)'
    },
    materials: {
      de: ['Große Plakatkartons (DIN A2)', 'Acryl- und Filzstifte', 'Fotodrucke / Collagen-Material', 'Klebestreifen'],
      en: ['Large heavy poster boards (A2)', 'Acrylic paint pens & wide markers', 'Photo prints / collage media', 'Mounting tape']
    },
    objective: {
      de: 'Ein starkes Zeichen gegen Ausgrenzung, Lästern und Mobbing setzen, indem die Gruppe die Schönheit von Vielfalt und Einheit sichtbar macht.',
      en: 'Take a courageous stand against social exclusion, gossip, and cyberbullying by visualizing the power of diversity and unity.'
    },
    steps: {
      de: [
        'Diskussion: Wo erleben Jugendliche in der Schule oder online Ausgrenzung? Welche Worte verletzen, welche heilen?',
        'Botschaften formulieren: Starke Slogans erarbeiten (z.B. „Worte bauen Brücken oder Mauern – was wählst du?“, „Ihr seid die Früchte eines Baumes“).',
        'Plakate gestalten: Hochwertige, typografisch ansprechende Plakate mit eindrucksvollen Kontrasten entwerfen.',
        'Ausstellung: Genehmigung bei der Schulleitung oder im Jugendzentrum einholen und die Plakate öffentlich aufhängen.'
      ],
      en: [
        'Root inquiry: Where do youth encounter cliques and cruelty at school or online? Which words build up and which tear down?',
        'Slogan craftsmanship: Formulate compelling anchors ("Words build bridges or walls—what will you build?", "Ye are the fruits of one tree").',
        'Graphic design: Produce striking, visually balanced poster art using bold typography and inclusive iconography.',
        'Exhibition: Obtain approval from school leadership or community centers to exhibit the series in public corridors.'
      ]
    },
    reflectionQuestions: {
      de: [
        'Warum erfordert es oft moralischen Mut, sich gegen das Mitläufertum bei Hänseleien zu stellen?',
        'Wie können wir in unserer Gruppe eine Kultur schaffen, in der sich jeder absolut sicher und wertgeschätzt fühlt?'
      ],
      en: [
        'Why does defending the excluded require profound moral courage in adolescent peer culture?',
        'How can our junior youth group model an atmosphere where every single person feels unconditionally safe and cherished?'
      ]
    },
    animatorTips: {
      de: [
        'Fokussiere auf positive, kraftvolle Werte statt auf schockierende Verbotsschilder; Schönheit überzeugt mehr als Vorwürfe.'
      ],
      en: [
        'Anchor in radiant affirmative values rather than scolding prohibitions; beauty inspires transformation faster than guilt.'
      ]
    }
  },
  {
    id: 'first-aid-care-pack',
    title: {
      de: 'Erste-Hilfe-Auffrischung & Notfall-Kits',
      en: 'First Aid Readiness & Household Safety Kits'
    },
    category: 'neighborhood',
    scope: 'quick',
    duration: {
      de: '1 Gruppenstunde (75–90 Min)',
      en: '1 Gathering (75–90 min)'
    },
    materials: {
      de: ['Verbandskästen zum Üben (abgelaufen für Training)', 'Mullbinden, Pflaster, Dreiecktücher', 'Ziploc-Beutel für Mini-Kits', 'Notrufnummern-Kärtchen'],
      en: ['Practice first aid kits', 'Bandages, plasters, triangular slings', 'Ziploc pouches for pocket kits', 'Emergency contact wallet cards']
    },
    objective: {
      de: 'Grundlegende Erste-Hilfe-Fähigkeiten (stabile Seitenlage, Verbände) erlernen und kleine Taschen-Notfallsets für Familien und Nachbarn zusammenstellen.',
      en: 'Equip junior youth with foundational emergency skills (recovery position, pressure wraps) while compiling portable mini-first-aid pouches for homes.'
    },
    steps: {
      de: [
        'Praxistraining (45 Min): Druckverband anlegen, stabile Seitenlage üben, Notruf 112 simulieren (5 W-Fragen).',
        'Kit-Zusammenstellung (30 Min): Kompakte Notfallbeutel mit Pflastern, Wundreinigungstüchern und handbeschriebenen Notruf-Kärtchen packen.',
        'Verteilung: Jedes Gruppenmitglied nimmt ein Kit für die eigene Familie oder einen Nachbarn mit.'
      ],
      en: [
        'Practical Training (45 min): Master pressure bandages, recovery positioning, and roleplay an emergency dispatch call.',
        'Kit Assembly (30 min): Pack weather-resistant mini pouches containing clean plasters, sterile gauze, and an emergency hotline index.',
        'Distribution: Each youth gifts a pocket kit to their family or an elderly neighbor.'
      ]
    },
    reflectionQuestions: {
      de: [
        'Wie verändert das Beherrschen von lebensrettenden Fähigkeiten unser Gefühl von Selbstwirksamkeit und Verantwortung?',
        'Warum ist Vorbereitung auf Notfälle ein Akt der Nächstenliebe?'
      ],
      en: [
        'How does mastering lifesaving skills deepen our conviction of personal agency and moral duty?',
        'Why is thoughtful emergency preparedness an authentic expression of love for neighbor?'
      ]
    },
    animatorTips: {
      de: [
        'Lade ggf. einen Rettungssanitäter oder Arzt aus der Gemeinde für 30 Minuten ein, um realistische Tipps zu geben.'
      ],
      en: [
        'Consider inviting an EMT or volunteer paramedic from the community to provide 20 minutes of authentic coaching.'
      ]
    }
  },
  {
    id: 'community-blessing-podcast',
    title: {
      de: 'Vorbilder vor Ort: Audio-Interviews & Mini-Podcast',
      en: 'Local Pillars: Audio Portraits & Mini-Podcast'
    },
    category: 'creative',
    scope: 'deep',
    duration: {
      de: '2–3 Treffen',
      en: '2–3 Sessions'
    },
    materials: {
      de: ['Smartphone mit Diktier-App & externem Mikrofon', 'Frageleitfaden', 'Laptop für einfachen Schnitt (z.B. Audacity)', 'Kopfhörer'],
      en: ['Smartphone audio recorder with lavalier mic', 'Interview script', 'Laptop for basic audio editing (e.g. Audacity)', 'Headphones']
    },
    objective: {
      de: 'Engagierte Menschen im Viertel interviewen (z.B. Bibliothekar, Sanitäter, Nachbarschafts-Initiator) und inspirierende 3-Minuten-Hörstücke für Eltern und Freunde produzieren.',
      en: 'Interview dedicated local figures (librarians, community organizers, teachers) to produce 3-minute audio portraits celebrating service.'
    },
    steps: {
      de: [
        'Persönlichkeiten auswählen: Wen im Viertel bewundern wir für seine Hilfsbereitschaft und Ausdauer?',
        'Interview führen (15 Min Aufnahme): Vor Ort besuchen, 3 gezielte Fragen stellen, O-Töne aufnehmen.',
        'Schnitt & Musik: Die besten Zitate herausschneiden, mit einem kurzen Einleitungs- und Schlusssatz der Jugendlichen versehen und leise Musik unterlegen.',
        'Gemeinsames Vorspielen: Den Podcast bei einer gemeinsamen Andacht oder einem Elternabend präsentieren.'
      ],
      en: [
        'Protagonist selection: Who in our town embodies quiet humility, public service, and perseverance?',
        'Conducting Field Interviews: Visit in pairs, capture 15 minutes of crisp audio exploring their core motivation.',
        'Audio editing: Curate the most powerful quotes, frame with youth voiceover reflections, and layer gentle acoustic music.',
        'Community Listening Party: Premier the finished audio story at a family gathering or devotional evening.'
      ]
    },
    reflectionQuestions: {
      de: [
        'Was motiviert Menschen, sich jahrzehntelang ehrenamtlich oder im Dienst für andere einzusetzen?',
        'Welche Eigenschaften möchten wir von den interviewten Vorbildern für unser eigenes Leben übernehmen?'
      ],
      en: [
        'What sustains people through decades of unheralded community dedication?',
        'What spiritual virtues modeled by these figures do we wish to cultivate within our own character?'
      ]
    },
    animatorTips: {
      de: [
        'Halte die Technik extrem einfach: Meist reicht die Standard-Sprachmemos-App moderner Smartphones vollkommen aus.'
      ],
      en: [
        'Keep technical complexity minimal: a clean smartphone voice memo app yields remarkable clarity in a quiet room.'
      ]
    }
  }
];
