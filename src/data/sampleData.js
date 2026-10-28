// Initial sample GRE words grouped into days
export const INITIAL_DAYS = [
  {
    id: "day-1",
    dayNumber: 1,
    title: "Essential Core & High-Frequency",
    createdAt: "2026-10-26",
    cards: [
      {
        id: "c-101",
        word: "Aberration",
        partOfSpeech: "noun",
        definition: "A departure from what is normal, usual, or expected, typically one that is unwelcome.",
        example: "The sudden drop in temperature was an aberration for this typically balmy island.",
        mnemonic: "Ab-normal behavior that causes irritation.",
        synonyms: ["anomaly", "deviation", "irregularity", "divergence"],
        status: "mastered", // "new" | "learning" | "mastered"
      },
      {
        id: "c-102",
        word: "Capricious",
        partOfSpeech: "adjective",
        definition: "Given to sudden and unaccountable changes of mood or behavior; fickle.",
        example: "The capricious weather ruined our plans for an outdoor afternoon picnic.",
        mnemonic: "Caprice sounds like car price — unpredictable and changing without warning.",
        synonyms: ["fickle", "mercurial", "volatile", "whimsical"],
        status: "learning",
      },
      {
        id: "c-103",
        word: "Laconic",
        partOfSpeech: "adjective",
        definition: "Using very few words; concise to the point of seeming rude or mysterious.",
        example: "His laconic reply of 'Maybe' suggested he was disinterested in joining the project.",
        mnemonic: "Lack of words on a sonic level.",
        synonyms: ["terse", "succinct", "brief", "concise"],
        status: "mastered",
      },
      {
        id: "c-104",
        word: "Equivocal",
        partOfSpeech: "adjective",
        definition: "Open to more than one interpretation; ambiguous; uncertain.",
        example: "The politician gave an equivocal answer to avoid taking a controversial stance.",
        mnemonic: "Equal vocal: two vocal voices speaking opposite ideas at once.",
        synonyms: ["ambiguous", "cryptic", "vague", "evasive"],
        status: "new",
      },
      {
        id: "c-105",
        word: "Enervate",
        partOfSpeech: "verb",
        definition: "To cause someone to feel drained of energy or vitality; weaken.",
        example: "The intense summer heat enervated the hikers within just a couple of hours.",
        mnemonic: "Enter + no + energy (it sounds like energy-drain).",
        synonyms: ["debilitate", "exhaust", "drain", "sap"],
        status: "learning",
      }
    ]
  },
  {
    id: "day-2",
    dayNumber: 2,
    title: "Persuasion, Tone & Character",
    createdAt: "2026-10-27",
    cards: [
      {
        id: "c-201",
        word: "Loquacious",
        partOfSpeech: "adjective",
        definition: "Tending to talk a great deal; talkative.",
        example: "The loquacious tour guide kept the group entertained with endless local anecdotes.",
        mnemonic: "Loq = speak / dialogue. Always talking.",
        synonyms: ["garrulous", "voluble", "talkative", "verbose"],
        status: "mastered",
      },
      {
        id: "c-202",
        word: "Pragmatic",
        partOfSpeech: "adjective",
        definition: "Dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.",
        example: "She took a pragmatic approach to solving the budget deficit rather than relying on idealism.",
        mnemonic: "Practical + automatic solution.",
        synonyms: ["practical", "matter-of-fact", "sensible", "down-to-earth"],
        status: "learning",
      },
      {
        id: "c-203",
        word: "Venerate",
        partOfSpeech: "verb",
        definition: "Regard with great respect; revere.",
        example: "In many cultures, younger generations are taught to venerate their elders.",
        mnemonic: "Honor someone like a veteran.",
        synonyms: ["revere", "worship", "hallow", "esteem"],
        status: "new",
      },
      {
        id: "c-204",
        word: "Pugnacious",
        partOfSpeech: "adjective",
        definition: "Eager or quick to argue, quarrel, or fight.",
        example: "The lawyer was notorious for his pugnacious demeanour during cross-examinations.",
        mnemonic: "Pug dog ready to pick a fight anytime.",
        synonyms: ["combative", "belligerent", "truculent", "bellicose"],
        status: "learning",
      }
    ]
  },
  {
    id: "day-3",
    dayNumber: 3,
    title: "Subtle Nuance & Sophistication",
    createdAt: "2026-10-28",
    cards: [
      {
        id: "c-301",
        word: "Fastidious",
        partOfSpeech: "adjective",
        definition: "Very attentive to and concerned about accuracy and detail; very demanding.",
        example: "He was fastidious about grammar, correcting even the slightest misplaced comma.",
        mnemonic: "Fussy + tedious to satisfy.",
        synonyms: ["meticulous", "punctilious", "scrupulous", "painstaking"],
        status: "new",
      },
      {
        id: "c-302",
        word: "Insipid",
        partOfSpeech: "adjective",
        definition: "Lacking flavor, vigor, or interest; dull.",
        example: "The soup was rather insipid until we added fresh herbs and roasted garlic.",
        mnemonic: "In (not) + sip-worthy = tasteless.",
        synonyms: ["bland", "uninspired", "vapid", "trite"],
        status: "new",
      },
      {
        id: "c-303",
        word: "Anachronism",
        partOfSpeech: "noun",
        definition: "A thing belonging or appropriate to a period other than that in which it exists.",
        example: "Seeing a character check a digital smartphone in a medieval film was an obvious anachronism.",
        mnemonic: "Ana (against) + Chron (time). Out of time.",
        synonyms: ["misplacement", "archaism", "prochronism"],
        status: "new",
      }
    ]
  }
];

export const STORAGE_KEY = "gre_minimal_flashcards_days_v1";
