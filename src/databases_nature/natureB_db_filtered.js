// Filtered database from natureBDatabase containing only words not found in existing databases
// Word numbering continues sequentially starting at 121
const natureBDatabase_filtered = {
  "ἐμβήμεν": {
    "wordNumber": 121,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "aorist active infinitive (Doric/epic form)",
    "meanings": ["to step into", "to enter", "to board", "to embark on"],
    "bestTranslation": "to enter",
    "lemma": "ἐμβαίνω",
    "LemmaMeanings": ["to step into", "to enter", "to board", "to embark on", "to mount"]
  },
  "πάντ": {
    "wordNumber": 122,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "accusative singular masculine/feminine or accusative plural neuter (elided form)",
    "meanings": ["all", "every", "the whole", "entire"],
    "bestTranslation": "all",
    "lemma": "πᾶς",
    "LemmaMeanings": ["all", "every", "the whole", "entire", "complete"]
  },
  "ἔχρυσεν": {
    "wordNumber": 123,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "aorist active indicative 3rd person singular",
    "meanings": ["gilded", "coated with gold", "adorned with gold"],
    "bestTranslation": "gilded",
    "lemma": "χρυσόω",
    "LemmaMeanings": ["to gild", "to coat with gold", "to adorn with gold", "to make golden"]
  },
  "πλευρὰ": {
    "wordNumber": 124,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "accusative plural neuter or nominative singular feminine",
    "meanings": ["sides", "ribs", "flanks", "walls"],
    "bestTranslation": "sides",
    "lemma": "πλευρόν/πλευρά",
    "LemmaMeanings": ["side", "rib", "flank", "wall", "lateral surface"]
  },
  "χαλκείας": {
    "wordNumber": 125,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "accusative plural feminine or genitive singular feminine",
    "meanings": ["bronze", "brazen", "copper", "of bronze material"],
    "bestTranslation": "bronze",
    "lemma": "χάλκειος",
    "LemmaMeanings": ["of bronze", "brazen", "made of copper", "bronze-colored"]
  },
  "ἐμβολάς": {
    "wordNumber": 126,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "accusative plural feminine",
    "meanings": ["rams", "beaks", "points", "insertions", "projections"],
    "bestTranslation": "rams",
    "lemma": "ἐμβολή",
    "LemmaMeanings": ["ram", "beak", "insertion", "projection", "ship's prow", "attack"]
  },
  "ὑποφαίνουσα": {
    "wordNumber": 127,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "present active participle nominative singular feminine",
    "meanings": ["showing slightly", "revealing", "displaying", "indicating"],
    "bestTranslation": "revealing",
    "lemma": "ὑποφαίνω",
    "LemmaMeanings": ["to show slightly", "to reveal gradually", "to display", "to indicate", "to suggest"]
  },
  "πάντων": {
    "wordNumber": 128,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "genitive plural masculine/neuter",
    "meanings": ["of all", "of everything", "of everyone"],
    "bestTranslation": "of all",
    "lemma": "πᾶς",
    "LemmaMeanings": ["all", "every", "the whole", "entire", "complete"]
  },
  "ὁδοῖο": {
    "wordNumber": 129,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "genitive singular feminine (epic form)",
    "meanings": ["of the road", "of the journey", "of the way", "of the path"],
    "bestTranslation": "of the journey",
    "lemma": "ὁδός",
    "LemmaMeanings": ["road", "journey", "way", "path", "method"]
  },
  "μακρὰ": {
    "wordNumber": 130,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "accusative plural neuter or nominative singular feminine",
    "meanings": ["long", "far", "extended", "distant", "tall"],
    "bestTranslation": "long",
    "lemma": "μακρός",
    "LemmaMeanings": ["long", "far", "extended", "distant", "tall", "great"]
  },
  "δὴ": {
    "wordNumber": 131,
    "frequency": 1,
    "partOfSpeech": "PARTICLE",
    "morphology": "standard form",
    "meanings": ["indeed", "really", "certainly", "now", "precisely"],
    "bestTranslation": "indeed",
    "lemma": "δή",
    "LemmaMeanings": ["indeed", "really", "certainly", "now", "precisely", "just"]
  },
  "χρὴ": {
    "wordNumber": 132,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "present active indicative 3rd person singular impersonal",
    "meanings": ["it is necessary", "one must", "one should", "it is fitting"],
    "bestTranslation": "it is necessary",
    "lemma": "χρή",
    "LemmaMeanings": ["it is necessary", "one must", "one should", "it is fitting", "it behooves"]
  },
  "οἴσετε": {
    "wordNumber": 133,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "future active indicative 2nd person plural",
    "meanings": ["you will bring", "you will carry", "you will bear", "you will fetch"],
    "bestTranslation": "you will bring",
    "lemma": "φέρω",
    "LemmaMeanings": ["to bring", "to carry", "to bear", "to fetch", "to endure"]
  },
  "τοῦτο": {
    "wordNumber": 134,
    "frequency": 1,
    "partOfSpeech": "PRONOUN",
    "morphology": "accusative singular neuter",
    "meanings": ["this", "this thing", "that", "that thing"],
    "bestTranslation": "this",
    "lemma": "οὗτος",
    "LemmaMeanings": ["this", "this one", "that", "that one", "he/she/it"]
  },
  "ἵν": {
    "wordNumber": 135,
    "frequency": 1,
    "partOfSpeech": "CONJUNCTION",
    "morphology": "elided form",
    "meanings": ["in order that", "so that", "where", "in which place"],
    "bestTranslation": "so that",
    "lemma": "ἵνα",
    "LemmaMeanings": ["in order that", "so that", "where", "in which place", "that"]
  },
  "οὐκ": {
    "wordNumber": 136,
    "frequency": 1,
    "partOfSpeech": "PARTICLE",
    "morphology": "standard form (before vowel with smooth breathing)",
    "meanings": ["not", "no"],
    "bestTranslation": "not",
    "lemma": "οὐ",
    "LemmaMeanings": ["not", "no", "non-"]
  },
  "λόγων": {
    "wordNumber": 137,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "genitive plural masculine",
    "meanings": ["of words", "of speeches", "of accounts", "of arguments", "of reasons"],
    "bestTranslation": "of words",
    "lemma": "λόγος",
    "LemmaMeanings": ["word", "speech", "account", "reason", "discourse", "ratio"]
  },
  "ἄλλων": {
    "wordNumber": 138,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "genitive plural masculine/feminine/neuter",
    "meanings": ["of others", "of different ones", "of the rest"],
    "bestTranslation": "of others",
    "lemma": "ἄλλος",
    "LemmaMeanings": ["other", "another", "different", "else", "the rest"]
  },
  "ὑπ": {
    "wordNumber": 139,
    "frequency": 1,
    "partOfSpeech": "PREPOSITION",
    "morphology": "elided form",
    "meanings": ["under", "by", "because of", "subject to"],
    "bestTranslation": "by",
    "lemma": "ὑπό",
    "LemmaMeanings": ["under", "by", "because of", "subject to", "during"]
  },
  "ἀπάτησθε": {
    "wordNumber": 140,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "aorist passive subjunctive 2nd person plural",
    "meanings": ["you may be deceived", "you might be beguiled", "you might be misled"],
    "bestTranslation": "you may be deceived",
    "lemma": "ἀπατάω",
    "LemmaMeanings": ["to deceive", "to beguile", "to cheat", "to mislead", "to delude"]
  },
  "ἀπείρητος": {
    "wordNumber": 141,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "nominative singular masculine/feminine",
    "meanings": ["untried", "untested", "inexperienced", "without attempt"],
    "bestTranslation": "untried",
    "lemma": "ἀπείρητος",
    "LemmaMeanings": ["untried", "untested", "unattempted", "inexperienced", "unfamiliar"]
  },
  "ἐκεῖνος": {
    "wordNumber": 142,
    "frequency": 1,
    "partOfSpeech": "PRONOUN",
    "morphology": "nominative singular masculine",
    "meanings": ["that", "that one", "he", "that person", "the former"],
    "bestTranslation": "that one",
    "lemma": "ἐκεῖνος",
    "LemmaMeanings": ["that", "that one", "he/she/it", "the former", "the famous one"]
  },
  "πόντος": {
    "wordNumber": 143,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "nominative singular masculine",
    "meanings": ["sea", "deep sea", "ocean", "open sea"],
    "bestTranslation": "sea",
    "lemma": "πόντος",
    "LemmaMeanings": ["sea", "deep sea", "ocean", "open sea", "main"]
  },
  "ᾧ": {
    "wordNumber": 144,
    "frequency": 1,
    "partOfSpeech": "PRONOUN",
    "morphology": "dative singular masculine/neuter relative",
    "meanings": ["to which", "for which", "in which", "by which"],
    "bestTranslation": "in which",
    "lemma": "ὅς",
    "LemmaMeanings": ["who", "which", "that", "what"]
  },
  "πλάνηισιν": {
    "wordNumber": 145,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "dative plural feminine (epic form)",
    "meanings": ["with wanderings", "with roamings", "with errors", "with deviations"],
    "bestTranslation": "with wanderings",
    "lemma": "πλάνη",
    "LemmaMeanings": ["wandering", "roaming", "error", "deviation", "perplexity"]
  },
  "ἀφάκεα": {
    "wordNumber": 146,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "accusative plural neuter or nominative singular feminine",
    "meanings": ["sightless", "dim-eyed", "blind", "not seeing clearly"],
    "bestTranslation": "dim-eyed",
    "lemma": "ἀφακής",
    "LemmaMeanings": ["sightless", "dim-eyed", "blind", "not seeing clearly", "unseeing"]
  },
  "φῦλα": {
    "wordNumber": 147,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "accusative/nominative plural neuter",
    "meanings": ["tribes", "races", "clans", "classes", "kinds"],
    "bestTranslation": "tribes",
    "lemma": "φῦλον",
    "LemmaMeanings": ["tribe", "race", "clan", "class", "kind", "species"]
  },
  "βροτεῖα": {
    "wordNumber": 148,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "accusative plural neuter or nominative singular feminine",
    "meanings": ["mortal", "human", "of mortals", "belonging to men"],
    "bestTranslation": "mortal",
    "lemma": "βρότειος",
    "LemmaMeanings": ["mortal", "human", "of mortals", "belonging to men", "earthly"]
  },
  "ἀλλὰ": {
    "wordNumber": 149,
    "frequency": 1,
    "partOfSpeech": "CONJUNCTION",
    "morphology": "standard form",
    "meanings": ["but", "however", "yet", "still", "nevertheless"],
    "bestTranslation": "but",
    "lemma": "ἀλλά",
    "LemmaMeanings": ["but", "however", "yet", "still", "nevertheless", "rather"]
  },
  "σὺ": {
    "wordNumber": 150,
    "frequency": 1,
    "partOfSpeech": "PRONOUN",
    "morphology": "nominative singular second person",
    "meanings": ["you", "thou"],
    "bestTranslation": "you",
    "lemma": "σύ",
    "LemmaMeanings": ["you", "thou", "yourself"]
  },
  "γνώσῃ": {
    "wordNumber": 151,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "future middle indicative 2nd person singular",
    "meanings": ["you will know", "you will learn", "you will recognize", "you will understand"],
    "bestTranslation": "you will know",
    "lemma": "γιγνώσκω",
    "LemmaMeanings": ["to know", "to learn", "to recognize", "to understand", "to perceive"]
  },
  "πολύπειρον": {
    "wordNumber": 152,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "accusative singular masculine or nominative/accusative singular neuter",
    "meanings": ["much-experienced", "of great experience", "well-tried", "skilled"],
    "bestTranslation": "much-experienced",
    "lemma": "πολύπειρος",
    "LemmaMeanings": ["much-experienced", "of great experience", "well-tried", "skilled", "sagacious"]
  },
  "ἔμμορε": {
    "wordNumber": 153,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "perfect active indicative 3rd person singular (epic form)",
    "meanings": ["has obtained", "has received as share", "has partaken of"],
    "bestTranslation": "has obtained",
    "lemma": "μείρομαι",
    "LemmaMeanings": ["to receive as one's portion", "to obtain one's share", "to partake of"]
  },
  "θυμὸν": {
    "wordNumber": 154,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "accusative singular masculine",
    "meanings": ["heart", "soul", "spirit", "mind", "courage"],
    "bestTranslation": "heart",
    "lemma": "θυμός",
    "LemmaMeanings": ["heart", "soul", "spirit", "mind", "courage", "anger"]
  },
  "ἀλήθειαν": {
    "wordNumber": 155,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "accusative singular feminine",
    "meanings": ["truth", "reality", "truthfulness", "genuineness"],
    "bestTranslation": "truth",
    "lemma": "ἀλήθεια",
    "LemmaMeanings": ["truth", "reality", "truthfulness", "genuineness", "sincerity"]
  },
  "εὐπειθῆ": {
    "wordNumber": 156,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "accusative singular masculine or nominative/accusative singular/plural neuter",
    "meanings": ["obedient", "compliant", "docile", "persuasive", "readily obeying"],
    "bestTranslation": "obedient",
    "lemma": "εὐπειθής",
    "LemmaMeanings": ["obedient", "compliant", "docile", "persuasive", "readily obeying"]
  },
  "σὺν": {
    "wordNumber": 157,
    "frequency": 1,
    "partOfSpeech": "PREPOSITION",
    "morphology": "standard form",
    "meanings": ["with", "together with", "along with", "by the aid of"],
    "bestTranslation": "with",
    "lemma": "σύν",
    "LemmaMeanings": ["with", "together with", "along with", "by the aid of", "by means of"]
  },
  "θυμῷ": {
    "wordNumber": 158,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "dative singular masculine",
    "meanings": ["with heart", "with soul", "with spirit", "with mind", "with courage"],
    "bestTranslation": "with heart",
    "lemma": "θυμός",
    "LemmaMeanings": ["heart", "soul", "spirit", "mind", "courage", "anger"]
  },
  "παστάξῃς": {
    "wordNumber": 159,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "aorist active subjunctive 2nd person singular",
    "meanings": ["you might taste", "you might eat", "you might experience", "you might try"],
    "bestTranslation": "you might taste",
    "lemma": "πατέομαι",
    "LemmaMeanings": ["to taste", "to eat", "to feed on", "to experience", "to try"]
  },
  "ἀλλ": {
    "wordNumber": 160,
    "frequency": 1,
    "partOfSpeech": "CONJUNCTION",
    "morphology": "elided form",
    "meanings": ["but", "however", "yet", "still", "nevertheless"],
    "bestTranslation": "but",
    "lemma": "ἀλλά",
    "LemmaMeanings": ["but", "however", "yet", "still", "nevertheless", "rather"]
  },
  "ἅμα": {
    "wordNumber": 161,
    "frequency": 1,
    "partOfSpeech": "ADVERB/PREPOSITION",
    "morphology": "standard form",
    "meanings": ["at once", "at the same time", "together with", "along with"],
    "bestTranslation": "at the same time",
    "lemma": "ἅμα",
    "LemmaMeanings": ["at once", "at the same time", "together with", "along with", "simultaneously"]
  },
  "δόξας": {
    "wordNumber": 162,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "accusative plural feminine",
    "meanings": ["opinions", "notions", "expectations", "appearances", "beliefs"],
    "bestTranslation": "opinions",
    "lemma": "δόξα",
    "LemmaMeanings": ["opinion", "notion", "expectation", "appearance", "glory", "reputation"]
  },
  "βροτείας": {
    "wordNumber": 163,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "accusative plural feminine or genitive singular feminine",
    "meanings": ["mortal", "human", "of mortals", "belonging to men"],
    "bestTranslation": "mortal",
    "lemma": "βρότειος",
    "LemmaMeanings": ["mortal", "human", "of mortals", "belonging to men", "earthly"]
  },
  "ἀπατηλὰς": {
    "wordNumber": 164,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "accusative plural feminine",
    "meanings": ["deceptive", "deceitful", "fallacious", "misleading", "false"],
    "bestTranslation": "deceptive",
    "lemma": "ἀπατηλός",
    "LemmaMeanings": ["deceptive", "deceitful", "fallacious", "misleading", "false"]
  },
  "ἀκούσῃς": {
    "wordNumber": 165,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "aorist active subjunctive 2nd person singular",
    "meanings": ["you might hear", "you might listen to", "you might heed", "you might learn"],
    "bestTranslation": "you might hear",
    "lemma": "ἀκούω",
    "LemmaMeanings": ["to hear", "to listen to", "to heed", "to learn", "to obey"]
  },
  "κόσμον": {
    "wordNumber": 166,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "accusative singular masculine",
    "meanings": ["order", "arrangement", "ornament", "decoration", "universe"],
    "bestTranslation": "order",
    "lemma": "κόσμος",
    "LemmaMeanings": ["order", "arrangement", "ornament", "decoration", "universe", "world"]
  },
  "ἐμῶν": {
    "wordNumber": 167,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "genitive plural masculine/feminine/neuter",
    "meanings": ["of my", "of mine"],
    "bestTranslation": "of my",
    "lemma": "ἐμός",
    "LemmaMeanings": ["my", "mine", "my own", "belonging to me"]
  },
  "ἐπέων": {
    "wordNumber": 168,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "genitive plural neuter (epic form)",
    "meanings": ["of words", "of speeches", "of sayings", "of verses", "of tales"],
    "bestTranslation": "of words",
    "lemma": "ἔπος",
    "LemmaMeanings": ["word", "speech", "saying", "verse", "tale", "utterance"]
  },
  "πυθέμενος": {
    "wordNumber": 169,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "aorist middle participle nominative singular masculine",
    "meanings": ["having learned", "having inquired", "having ascertained", "having discovered"],
    "bestTranslation": "having learned",
    "lemma": "πυνθάνομαι",
    "LemmaMeanings": ["to learn", "to inquire", "to ascertain", "to hear", "to understand"]
  },
  "οἵ": {
    "wordNumber": 170,
    "frequency": 1,
    "partOfSpeech": "PRONOUN",
    "morphology": "nominative plural masculine relative",
    "meanings": ["who", "which", "that"],
    "bestTranslation": "who",
    "lemma": "ὅς",
    "LemmaMeanings": ["who", "which", "that", "what"]
  },
  "πώς": {
    "wordNumber": 171,
    "frequency": 1,
    "partOfSpeech": "ADVERB",
    "morphology": "interrogative form",
    "meanings": ["how?", "in what way?", "by what means?"],
    "bestTranslation": "how",
    "lemma": "πῶς",
    "LemmaMeanings": ["how", "in what way", "by what means", "to what end", "why"]
  },
  "κεν": {
    "wordNumber": 172,
    "frequency": 1,
    "partOfSpeech": "PARTICLE",
    "morphology": "modal particle (epic/lyric form)",
    "meanings": ["would", "might", "could", "should", "modal force"],
    "bestTranslation": "might",
    "lemma": "ἄν/κεν",
    "LemmaMeanings": ["would", "might", "could", "should", "particle marking potential/conditional"]
  },
  "ἕκαστα": {
    "wordNumber": 173,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "accusative/nominative plural neuter",
    "meanings": ["each thing", "every single thing", "details", "particulars"],
    "bestTranslation": "each thing",
    "lemma": "ἕκαστος",
    "LemmaMeanings": ["each", "every", "each one", "every single", "individually"]
  },
  "φαινόμενα": {
    "wordNumber": 174,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "present middle/passive participle accusative/nominative plural neuter",
    "meanings": ["appearing", "seeming", "being visible", "manifesting", "phenomena"],
    "bestTranslation": "appearances",
    "lemma": "φαίνω",
    "LemmaMeanings": ["to show", "to appear", "to seem", "to make visible", "to manifest"]
  },
  "διαπλήσσουσι": {
    "wordNumber": 175,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "present active indicative 3rd person plural",
    "meanings": ["they strike through", "they break apart", "they shatter", "they divide"],
    "bestTranslation": "they strike through",
    "lemma": "διαπλήσσω",
    "LemmaMeanings": ["to strike through", "to break apart", "to smash through", "to shatter", "to divide"]
  },
  "δοκήσιμον": {
    "wordNumber": 176,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "accusative singular masculine or nominative/accusative singular neuter",
    "meanings": ["seeming", "appearing", "reputable", "esteemed", "of good reputation"],
    "bestTranslation": "seeming",
    "lemma": "δοκήσιμος",
    "LemmaMeanings": ["seeming", "apparent", "reputable", "of good standing", "esteemed"]
  },
  "ὄμμα": {
    "wordNumber": 177,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "accusative/nominative singular neuter",
    "meanings": ["eye", "sight", "vision", "gaze", "glance"],
    "bestTranslation": "eye",
    "lemma": "ὄμμα",
    "LemmaMeanings": ["eye", "sight", "vision", "gaze", "glance", "look"]
  },
  "βροτῶν": {
    "wordNumber": 178,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "genitive plural masculine",
    "meanings": ["of mortals", "of humans", "of men"],
    "bestTranslation": "of mortals",
    "lemma": "βροτός",
    "LemmaMeanings": ["mortal", "human being", "man", "mortal creature", "subject to death"]
  },
  "διδάξω": {
    "wordNumber": 179,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "future active indicative 1st person singular",
    "meanings": ["I will teach", "I will instruct", "I will inform", "I will show"],
    "bestTranslation": "I will teach",
    "lemma": "διδάσκω",
    "LemmaMeanings": ["to teach", "to instruct", "to inform", "to train", "to explain"]
  },
  "σε": {
    "wordNumber": 180,
    "frequency": 1,
    "partOfSpeech": "PRONOUN",
    "morphology": "accusative singular second person",
    "meanings": ["you", "thee", "yourself"],
    "bestTranslation": "you",
    "lemma": "σύ",
    "LemmaMeanings": ["you", "thou", "yourself"]
  },
  "μύθων": {
    "wordNumber": 181,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "genitive plural masculine",
    "meanings": ["of tales", "of stories", "of accounts", "of words", "of speeches"],
    "bestTranslation": "of tales",
    "lemma": "μῦθος",
    "LemmaMeanings": ["tale", "story", "account", "word", "speech", "narrative"]
  },
  "πείρασι": {
    "wordNumber": 182,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "dative plural neuter",
    "meanings": ["at the limits", "at the boundaries", "at the ends", "at the extremities"],
    "bestTranslation": "at the limits",
    "lemma": "πεῖραρ/πέρας",
    "LemmaMeanings": ["limit", "boundary", "end", "extremity", "termination", "goal"]
  },
  "πάντα": {
    "wordNumber": 183,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "accusative plural neuter or nominative plural neuter",
    "meanings": ["all things", "everything", "the whole", "all"],
    "bestTranslation": "all things",
    "lemma": "πᾶς",
    "LemmaMeanings": ["all", "every", "the whole", "entire", "complete"]
  },
  "οὐδὲν": {
    "wordNumber": 184,
    "frequency": 1,
    "partOfSpeech": "PRONOUN",
    "morphology": "accusative/nominative singular neuter",
    "meanings": ["nothing", "not one thing", "no one", "not at all"],
    "bestTranslation": "nothing",
    "lemma": "οὐδείς",
    "LemmaMeanings": ["no one", "nobody", "nothing", "not one", "none"]
  },
  "χρεών": {
    "wordNumber": 185,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "present active participle nominative singular neuter (used impersonally)",
    "meanings": ["being necessary", "being fated", "being proper", "inevitable"],
    "bestTranslation": "necessary",
    "lemma": "χρή",
    "LemmaMeanings": ["it is necessary", "one must", "one should", "it is fated", "it behooves"]
  },
  "ἐστι": {
    "wordNumber": 186,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "present active indicative 3rd person singular",
    "meanings": ["is", "exists", "lives", "is the case"],
    "bestTranslation": "is",
    "lemma": "εἰμί",
    "LemmaMeanings": ["to be", "to exist", "to live", "to be the case", "to happen"]
  },
  "μὴ": {
    "wordNumber": 187,
    "frequency": 1,
    "partOfSpeech": "PARTICLE",
    "morphology": "negative particle",
    "meanings": ["not", "lest", "so that not", "no"],
    "bestTranslation": "not",
    "lemma": "μή",
    "LemmaMeanings": ["not", "lest", "so that not", "forbidding", "negative with wishes/commands"]
  },
  "ἐὸν": {
    "wordNumber": 188,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "present active participle accusative/nominative singular neuter (epic form)",
    "meanings": ["being", "existing", "what is", "that which exists"],
    "bestTranslation": "being",
    "lemma": "εἰμί",
    "LemmaMeanings": ["to be", "to exist", "to live", "to be the case", "to happen"]
  },
  "εἶναι": {
    "wordNumber": 189,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "present active infinitive",
    "meanings": ["to be", "to exist", "to become", "to live", "to be possible"],
    "bestTranslation": "to be",
    "lemma": "εἰμί",
    "LemmaMeanings": ["to be", "to exist", "to live", "to be the case", "to happen"]
  }
};

export default natureBDatabase_filtered;
