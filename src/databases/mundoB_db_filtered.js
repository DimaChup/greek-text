// Filtered database from mundoBDatabase containing only words not found in existing databases
// Word numbering continues sequentially starting at 202
const mundoBDatabase_filtered = {
  "tío": {
    "wordNumber": 202,
    "frequency": 5,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["uncle", "guy (informal)", "man (colloquial)"],
    "bestTranslation": "uncle",
    "lemma": "tío",
    "LemmaMeanings": ["uncle (family relation)", "guy", "dude (colloquial)", "fellow", "man (informal)"]
  },
  "pepe": {
    "wordNumber": 203,
    "frequency": 4,
    "partOfSpeech": "NOUN",
    "morphology": "proper name",
    "meanings": ["Pepe (specific nickname for José)", "Joe (English equivalent)"],
    "bestTranslation": "Pepe",
    "lemma": "pepe",
    "LemmaMeanings": ["Pepe (common Spanish nickname for José)", "diminutive form of José"]
  },
  "era": {
    "wordNumber": 204,
    "frequency": 3,
    "partOfSpeech": "VERB",
    "morphology": "imperfect indicative, first/third person singular",
    "meanings": ["was", "used to be", "was being", "existed at that time"],
    "bestTranslation": "was",
    "lemma": "ser",
    "LemmaMeanings": ["to be (essential/permanent quality)", "to exist", "to take place", "to occur", "to belong to"]
  },
  "vida": {
    "wordNumber": 205,
    "frequency": 2,
    "partOfSpeech": "NOUN",
    "morphology": "feminine singular",
    "meanings": ["life", "lifetime", "living", "existence (of a person/being)"],
    "bestTranslation": "life",
    "lemma": "vida",
    "LemmaMeanings": ["life (state of being alive)", "existence", "biography", "vitality", "lifespan"]
  },
  "tenía": {
    "wordNumber": 206,
    "frequency": 2,
    "partOfSpeech": "VERB",
    "morphology": "imperfect indicative, first/third person singular",
    "meanings": ["had", "was having", "used to have", "possessed at that time"],
    "bestTranslation": "had",
    "lemma": "tener",
    "LemmaMeanings": ["to have", "to own", "to possess", "to hold", "to keep", "to maintain"]
  },
  "necesidad": {
    "wordNumber": 207,
    "frequency": 2,
    "partOfSpeech": "NOUN",
    "morphology": "feminine singular",
    "meanings": ["necessity", "need", "requirement", "specific necessity"],
    "bestTranslation": "necessity",
    "lemma": "necesidad",
    "LemmaMeanings": ["necessity (state of requiring something)", "requirement", "need", "exigency", "want"]
  },
  "recibí": {
    "wordNumber": 208,
    "frequency": 2,
    "partOfSpeech": "VERB",
    "morphology": "preterite indicative, first person singular",
    "meanings": ["I received", "I got", "I was given", "I accepted (at a specific past time)"],
    "bestTranslation": "I received",
    "lemma": "recibir",
    "LemmaMeanings": ["to receive", "to get", "to accept", "to welcome", "to obtain", "to be given"]
  },
  "primeros": {
    "wordNumber": 209,
    "frequency": 2,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "masculine plural",
    "meanings": ["first (plural)", "earliest ones", "initial ones", "leading ones"],
    "bestTranslation": "first ones",
    "lemma": "primero",
    "LemmaMeanings": ["first (in sequence/time)", "earliest", "primary", "principal", "chief", "leading"]
  },
  "sur": {
    "wordNumber": 210,
    "frequency": 2,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["south", "southern region", "southern area", "south side"],
    "bestTranslation": "south",
    "lemma": "sur",
    "LemmaMeanings": ["south (cardinal direction)", "southern part", "southern hemisphere", "southern territory"]
  },
  "mediados": {
    "wordNumber": 211,
    "frequency": 2,
    "partOfSpeech": "NOUN",
    "morphology": "masculine plural",
    "meanings": ["middle", "mid-point", "halfway through", "middle part of"],
    "bestTranslation": "middle",
    "lemma": "mediado",
    "LemmaMeanings": ["middle (of a period)", "mid-point", "halfway", "intermediate point", "center point"]
  },
  "puerto": {
    "wordNumber": 212,
    "frequency": 2,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["port", "harbor", "haven", "maritime terminal"],
    "bestTranslation": "port",
    "lemma": "puerto",
    "LemmaMeanings": ["port (shipping facility)", "harbor", "seaport", "dock", "haven", "maritime facility"]
  },
  "montt": {
    "wordNumber": 213,
    "frequency": 2,
    "partOfSpeech": "NOUN",
    "morphology": "proper name",
    "meanings": ["Montt (surname)", "Montt (in place names like Puerto Montt)"],
    "bestTranslation": "Montt",
    "lemma": "montt",
    "LemmaMeanings": ["Montt (Chilean surname)", "name of Chilean political family"]
  },
  "vías": {
    "wordNumber": 214,
    "frequency": 2,
    "partOfSpeech": "NOUN",
    "morphology": "feminine plural",
    "meanings": ["roads", "routes", "tracks", "paths (plural)", "railways"],
    "bestTranslation": "roads",
    "lemma": "vía",
    "LemmaMeanings": ["road", "way", "route", "track", "path", "means", "channel", "railway"]
  },
  "muy": {
    "wordNumber": 215,
    "frequency": 1,
    "partOfSpeech": "ADVERB",
    "morphology": "invariable",
    "meanings": ["very", "highly", "extremely", "greatly", "quite"],
    "bestTranslation": "very",
    "lemma": "muy",
    "LemmaMeanings": ["very (intensifier)", "extremely", "highly", "greatly", "exceedingly"]
  },
  "joven": {
    "wordNumber": 216,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE/NOUN",
    "morphology": "invariable",
    "meanings": ["young", "youthful", "young person", "youth"],
    "bestTranslation": "young",
    "lemma": "joven",
    "LemmaMeanings": ["young (of little age)", "youthful", "adolescent", "junior", "youth", "young person"]
  },
  "entonces": {
    "wordNumber": 217,
    "frequency": 1,
    "partOfSpeech": "ADVERB",
    "morphology": "invariable",
    "meanings": ["then", "at that time", "at that moment", "in that case"],
    "bestTranslation": "then",
    "lemma": "entonces",
    "LemmaMeanings": ["then (at that time)", "therefore", "in that case", "consequently", "so"]
  },
  "casi": {
    "wordNumber": 218,
    "frequency": 1,
    "partOfSpeech": "ADVERB",
    "morphology": "invariable",
    "meanings": ["almost", "nearly", "just about", "not quite"],
    "bestTranslation": "almost",
    "lemma": "casi",
    "LemmaMeanings": ["almost (not quite)", "nearly", "approximately", "virtually", "just about"]
  },
  "niño": {
    "wordNumber": 219,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["boy", "child", "kid", "young male child"],
    "bestTranslation": "boy",
    "lemma": "niño",
    "LemmaMeanings": ["child", "boy", "youngster", "minor", "infant", "young person"]
  },
  "soñaba": {
    "wordNumber": 220,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "imperfect indicative, first/third person singular",
    "meanings": ["was dreaming", "used to dream", "would dream", "dreamed habitually"],
    "bestTranslation": "was dreaming",
    "lemma": "soñar",
    "LemmaMeanings": ["to dream", "to fantasize", "to imagine", "to aspire", "to envision"]
  },
  "aventuras": {
    "wordNumber": 221,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine plural",
    "meanings": ["adventures", "exciting experiences", "quests", "exploits (plural)"],
    "bestTranslation": "adventures",
    "lemma": "aventura",
    "LemmaMeanings": ["adventure", "exciting experience", "quest", "risk", "daring enterprise"]
  },
  "entregarían": {
    "wordNumber": 222,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "conditional, third person plural",
    "meanings": ["they would deliver", "they would hand over", "they would give", "they would provide"],
    "bestTranslation": "they would deliver",
    "lemma": "entregar",
    "LemmaMeanings": ["to deliver", "to hand over", "to turn in", "to surrender", "to submit", "to give"]
  },
  "fundamentos": {
    "wordNumber": 223,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine plural",
    "meanings": ["foundations", "fundamentals", "basics", "grounds (plural)"],
    "bestTranslation": "foundations",
    "lemma": "fundamento",
    "LemmaMeanings": ["foundation", "basis", "ground", "base", "rationale", "underlying principle"]
  },
  "alejada": {
    "wordNumber": 224,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "feminine singular",
    "meanings": ["distant", "remote", "far away", "removed (feminine)"],
    "bestTranslation": "distant",
    "lemma": "alejado",
    "LemmaMeanings": ["distant", "remote", "far away", "isolated", "removed", "separated"]
  },
  "tedio": {
    "wordNumber": 225,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["tedium", "boredom", "monotony", "dullness", "weariness"],
    "bestTranslation": "boredom",
    "lemma": "tedio",
    "LemmaMeanings": ["tedium (state of being bored)", "boredom", "monotony", "ennui", "dullness"]
  },
  "aburrimiento": {
    "wordNumber": 226,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["boredom", "tedium", "dullness", "listlessness", "state of being bored"],
    "bestTranslation": "boredom",
    "lemma": "aburrimiento",
    "LemmaMeanings": ["boredom (emotional state)", "tedium", "ennui", "weariness", "monotony"]
  },
  "solo": {
    "wordNumber": 227,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE/ADVERB",
    "morphology": "masculine singular",
    "meanings": ["alone", "lonely", "by oneself", "unaccompanied", "solo"],
    "bestTranslation": "alone",
    "lemma": "solo",
    "LemmaMeanings": ["alone (without company)", "only", "just", "merely", "solely", "exclusively"]
  },
  "sueños": {
    "wordNumber": 228,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine plural",
    "meanings": ["dreams", "fantasies", "aspirations", "visions (during sleep or imagined)"],
    "bestTranslation": "dreams",
    "lemma": "sueño",
    "LemmaMeanings": ["dream", "sleep", "aspiration", "desire", "fantasy", "vision"]
  },
  "así": {
    "wordNumber": 229,
    "frequency": 1,
    "partOfSpeech": "ADVERB",
    "morphology": "invariable",
    "meanings": ["like this", "this way", "so", "thus", "in this manner"],
    "bestTranslation": "thus",
    "lemma": "así",
    "LemmaMeanings": ["thus", "so", "in this way", "in this manner", "like this", "accordingly"]
  },
  "mayúsculas": {
    "wordNumber": 230,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine plural",
    "meanings": ["capital letters", "uppercase letters", "capitals", "uppercase characters"],
    "bestTranslation": "capital letters",
    "lemma": "mayúscula",
    "LemmaMeanings": ["capital letter", "uppercase letter", "majuscule", "large letter in alphabet"]
  },
  "heredero": {
    "wordNumber": 231,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["heir", "inheritor", "successor", "the one who inherits (masculine)"],
    "bestTranslation": "heir",
    "lemma": "heredero",
    "LemmaMeanings": ["heir", "inheritor", "successor", "one who receives inheritance", "beneficiary"]
  },
  "carácter": {
    "wordNumber": 232,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["character", "personality", "temperament", "nature", "disposition"],
    "bestTranslation": "character",
    "lemma": "carácter",
    "LemmaMeanings": ["character (personality traits)", "temperament", "nature", "disposition", "letter/symbol"]
  },
  "indómito": {
    "wordNumber": 233,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "masculine singular",
    "meanings": ["indomitable", "untamed", "wild", "unruly", "uncontrollable (masculine)"],
    "bestTranslation": "indomitable",
    "lemma": "indómito",
    "LemmaMeanings": ["indomitable (cannot be tamed)", "untamable", "wild", "unruly", "unconquerable"]
  },
  "abuela": {
    "wordNumber": 234,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine singular",
    "meanings": ["grandmother", "grandma", "granny", "female grandparent"],
    "bestTranslation": "grandmother",
    "lemma": "abuela",
    "LemmaMeanings": ["grandmother", "female grandparent", "elder woman in family", "ancestress"]
  },
  "vasca": {
    "wordNumber": 235,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "feminine singular",
    "meanings": ["Basque", "from the Basque country (feminine)", "of Basque origin (feminine)"],
    "bestTranslation": "Basque",
    "lemma": "vasco",
    "LemmaMeanings": ["Basque (relating to Basque region/people)", "from the Basque Country", "of Basque ethnicity"]
  },
  "pesimismo": {
    "wordNumber": 236,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["pessimism", "negative outlook", "gloominess", "tendency to see the worst"],
    "bestTranslation": "pessimism",
    "lemma": "pesimismo",
    "LemmaMeanings": ["pessimism (negative worldview)", "gloominess", "negativity", "cynicism", "defeatism"]
  },
  "abuelo": {
    "wordNumber": 237,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["grandfather", "grandpa", "grandad", "male grandparent"],
    "bestTranslation": "grandfather",
    "lemma": "abuelo",
    "LemmaMeanings": ["grandfather", "male grandparent", "elder man in family", "forefather", "ancestor"]
  },
  "andaluz": {
    "wordNumber": 238,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE/NOUN",
    "morphology": "masculine singular",
    "meanings": ["Andalusian", "from Andalusia", "person from Andalusia (masculine)"],
    "bestTranslation": "Andalusian",
    "lemma": "andaluz",
    "LemmaMeanings": ["Andalusian (relating to Andalusia)", "of Andalusian origin", "characteristic of Andalusia"]
  },
  "voluntario": {
    "wordNumber": 239,
    "frequency": 1,
    "partOfSpeech": "NOUN/ADJECTIVE",
    "morphology": "masculine singular",
    "meanings": ["volunteer", "voluntary", "willing person (masculine)", "done willingly"],
    "bestTranslation": "volunteer",
    "lemma": "voluntario",
    "LemmaMeanings": ["volunteer", "voluntary", "willing", "unpaid worker", "of one's own free will"]
  },
  "brigadas": {
    "wordNumber": 240,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine plural",
    "meanings": ["brigades", "teams", "work groups", "organized units (plural)"],
    "bestTranslation": "brigades",
    "lemma": "brigada",
    "LemmaMeanings": ["brigade", "team", "crew", "work group", "unit of organization", "organized body"]
  },
  "internacionales": {
    "wordNumber": 241,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "plural",
    "meanings": ["international", "global", "worldwide", "involving multiple countries (plural)"],
    "bestTranslation": "international",
    "lemma": "internacional",
    "LemmaMeanings": ["international (between nations)", "global", "worldwide", "cross-border", "multinational"]
  },
  "guerra": {
    "wordNumber": 242,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine singular",
    "meanings": ["war", "warfare", "armed conflict", "state of hostilities"],
    "bestTranslation": "war",
    "lemma": "guerra",
    "LemmaMeanings": ["war (armed conflict)", "warfare", "hostility", "combat", "military action"]
  },
  "civil": {
    "wordNumber": 243,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "invariable",
    "meanings": ["civil", "civilian", "domestic", "non-military", "relating to citizens"],
    "bestTranslation": "civil",
    "lemma": "civil",
    "LemmaMeanings": ["civil (relating to citizens)", "civilian", "non-military", "civic", "polite", "courteous"]
  },
  "española": {
    "wordNumber": 244,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE/NOUN",
    "morphology": "feminine singular",
    "meanings": ["Spanish", "Spanish woman", "from Spain (feminine)", "of Spanish origin (feminine)"],
    "bestTranslation": "Spanish",
    "lemma": "español",
    "LemmaMeanings": ["Spanish (relating to Spain)", "from Spain", "Spanish language", "person from Spain"]
  },
  "fotografía": {
    "wordNumber": 245,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine singular",
    "meanings": ["photograph", "photo", "image captured by camera", "picture"],
    "bestTranslation": "photograph",
    "lemma": "fotografía",
    "LemmaMeanings": ["photograph", "photography (art/process)", "photo", "picture", "captured image"]
  },
  "junto": {
    "wordNumber": 246,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE/PREPOSITION",
    "morphology": "masculine singular/invariable",
    "meanings": ["together", "close", "next to", "beside", "united"],
    "bestTranslation": "together",
    "lemma": "junto",
    "LemmaMeanings": ["together (in proximity)", "joined", "close to", "next to", "alongside", "adjacent"]
  },
  "ernest": {
    "wordNumber": 247,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "proper name",
    "meanings": ["Ernest (specific person's name)", "Ernest (male given name)"],
    "bestTranslation": "Ernest",
    "lemma": "ernest",
    "LemmaMeanings": ["Ernest (masculine proper name)", "English/American given name"]
  },
  "hemingway": {
    "wordNumber": 248,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "proper name",
    "meanings": ["Hemingway (surname)", "Hemingway (American writer's surname)"],
    "bestTranslation": "Hemingway",
    "lemma": "hemingway",
    "LemmaMeanings": ["Hemingway (surname)", "surname of American author Ernest Hemingway"]
  },
  "único": {
    "wordNumber": 249,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "masculine singular",
    "meanings": ["only", "sole", "unique", "single", "one and only (masculine)"],
    "bestTranslation": "only",
    "lemma": "único",
    "LemmaMeanings": ["only (sole)", "unique", "exclusive", "singular", "one-of-a-kind", "unparalleled"]
  },
  "patrimonio": {
    "wordNumber": 250,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["heritage", "patrimony", "legacy", "inheritance", "assets"],
    "bestTranslation": "heritage",
    "lemma": "patrimonio",
    "LemmaMeanings": ["heritage (inherited property)", "patrimony", "estate", "inheritance", "legacy", "wealth"]
  },
  "orgulloso": {
    "wordNumber": 251,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "masculine singular",
    "meanings": ["proud (in this moment/context)", "feeling pride (currently)", "showing pride (masculine form)"],
    "bestTranslation": "proud",
    "lemma": "orgulloso",
    "LemmaMeanings": ["proud (personality trait)", "haughty", "arrogant", "dignified", "having pride"]
  },
  "cesaba": {
    "wordNumber": 252,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "imperfect indicative, first/third person singular",
    "meanings": ["was ceasing", "was stopping", "was coming to an end", "kept stopping"],
    "bestTranslation": "was ceasing",
    "lemma": "cesar",
    "LemmaMeanings": ["to cease", "to stop", "to end", "to discontinue", "to terminate"]
  },
  "repetirme": {
    "wordNumber": 253,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "infinitive with reflexive pronoun 'me'",
    "meanings": ["to repeat to myself", "to say again to myself", "to keep telling myself"],
    "bestTranslation": "to repeat to myself",
    "lemma": "repetir",
    "LemmaMeanings": ["to repeat", "to reiterate", "to say again", "to do over", "to recur"]
  },
  "descubrir": {
    "wordNumber": 254,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "infinitive",
    "meanings": ["to discover", "to uncover", "to find out", "to reveal"],
    "bestTranslation": "to discover",
    "lemma": "descubrir",
    "LemmaMeanings": ["to discover", "to uncover", "to find", "to detect", "to expose"]
  },
  "camino": {
    "wordNumber": 255,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["road", "path", "specific way", "particular route"],
    "bestTranslation": "road",
    "lemma": "camino",
    "LemmaMeanings": ["road", "path", "way", "route", "journey", "course"]
  },
  "echarse": {
    "wordNumber": 256,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "reflexive infinitive",
    "meanings": ["to lie down (oneself)", "to throw oneself", "to fling oneself", "to recline"],
    "bestTranslation": "to lie down",
    "lemma": "echar",
    "LemmaMeanings": ["to throw", "to cast", "to put", "to pour", "to launch"]
  },
  "andar": {
    "wordNumber": 257,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "infinitive",
    "meanings": ["to walk", "to go on foot", "to move around", "to travel by walking"],
    "bestTranslation": "to walk",
    "lemma": "andar",
    "LemmaMeanings": ["to walk", "to move", "to function", "to go about", "to work (mechanism)"]
  },
  "indicar": {
    "wordNumber": 258,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "infinitive",
    "meanings": ["to indicate", "to point out", "to show", "to signal something"],
    "bestTranslation": "to indicate",
    "lemma": "indicar",
    "LemmaMeanings": ["to indicate", "to show", "to point out", "to suggest", "to mark"]
  },
  "oveja": {
    "wordNumber": 259,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine singular",
    "meanings": ["sheep (single female)", "ewe", "one sheep"],
    "bestTranslation": "sheep",
    "lemma": "oveja",
    "LemmaMeanings": ["sheep (animal)", "ewe", "ovine", "follower", "meek person"]
  },
  "negrísima": {
    "wordNumber": 260,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "feminine singular, superlative",
    "meanings": ["very black (feminine)", "extremely dark (feminine)", "pitch black (feminine)"],
    "bestTranslation": "very black",
    "lemma": "negro",
    "LemmaMeanings": ["black", "dark", "black-colored", "gloomy", "dark-colored"]
  },
  "familia": {
    "wordNumber": 261,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine singular",
    "meanings": ["family unit", "household group", "immediate family", "family members"],
    "bestTranslation": "family",
    "lemma": "familia",
    "LemmaMeanings": ["family (social unit)", "household", "relatives", "lineage", "clan"]
  },
  "cuanto": {
    "wordNumber": 262,
    "frequency": 1,
    "partOfSpeech": "PRONOUN/ADVERB",
    "morphology": "masculine singular",
    "meanings": ["how much", "as much as", "whatever amount", "the amount that"],
    "bestTranslation": "how much",
    "lemma": "cuanto",
    "LemmaMeanings": ["how much", "as much as", "whatever", "all that", "the amount"]
  },
  "crecía": {
    "wordNumber": 263,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "imperfect indicative, first/third person singular",
    "meanings": ["was growing", "kept growing", "continued to grow", "was increasing in size"],
    "bestTranslation": "was growing",
    "lemma": "crecer",
    "LemmaMeanings": ["to grow", "to increase", "to develop", "to mature", "to expand"]
  },
  "nuestros": {
    "wordNumber": 264,
    "frequency": 1,
    "partOfSpeech": "DETERMINER/PRONOUN",
    "morphology": "masculine plural, possessive",
    "meanings": ["our (masculine plural items)", "ours (masculine plural)", "belonging to us (masculine plural)"],
    "bestTranslation": "our",
    "lemma": "nuestro",
    "LemmaMeanings": ["our", "ours", "belonging to us", "of our group", "of us"]
  },
  "encuentros": {
    "wordNumber": 265,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine plural",
    "meanings": ["meetings (multiple)", "encounters (plural)", "get-togethers", "gatherings"],
    "bestTranslation": "meetings",
    "lemma": "encuentro",
    "LemmaMeanings": ["meeting", "encounter", "gathering", "appointment", "rendezvous"]
  },
  "volvían": {
    "wordNumber": 266,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "imperfect indicative, third person plural",
    "meanings": ["they were returning", "they used to return", "they kept coming back", "they were turning"],
    "bestTranslation": "they were returning",
    "lemma": "volver",
    "LemmaMeanings": ["to return", "to come back", "to turn", "to go back", "to do again"]
  },
  "clandestinos": {
    "wordNumber": 267,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "masculine plural",
    "meanings": ["secret (plural)", "hidden (plural)", "underground (plural)", "illicit (plural)"],
    "bestTranslation": "clandestine",
    "lemma": "clandestino",
    "LemmaMeanings": ["secret", "hidden", "underground", "illicit", "unauthorized"]
  },
  "acercaron": {
    "wordNumber": 268,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "preterite indicative, third person plural",
    "meanings": ["they approached", "they came near", "they moved closer", "they drew near"],
    "bestTranslation": "they approached",
    "lemma": "acercar",
    "LemmaMeanings": ["to approach", "to bring near", "to move closer", "to approximate", "to draw near"]
  },
  "escritores": {
    "wordNumber": 269,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine plural",
    "meanings": ["writers (multiple)", "authors (group)", "multiple scribes"],
    "bestTranslation": "writers",
    "lemma": "escritor",
    "LemmaMeanings": ["writer", "author", "novelist", "scribe", "person who writes"]
  },
  "quienes": {
    "wordNumber": 270,
    "frequency": 1,
    "partOfSpeech": "PRONOUN",
    "morphology": "plural, relative",
    "meanings": ["who (plural)", "those who", "the ones who", "the people who"],
    "bestTranslation": "who",
    "lemma": "quien",
    "LemmaMeanings": ["who", "whom", "the one who", "which person", "that person who"]
  },
  "jamás": {
    "wordNumber": 271,
    "frequency": 1,
    "partOfSpeech": "ADVERB",
    "morphology": "invariable",
    "meanings": ["never", "not ever", "at no time", "absolutely never"],
    "bestTranslation": "never",
    "lemma": "jamás",
    "LemmaMeanings": ["never", "not ever", "at no time", "never ever", "not once"]
  },
  "olvidar": {
    "wordNumber": 272,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "infinitive",
    "meanings": ["to forget", "to leave behind", "to fail to remember", "to overlook"],
    "bestTranslation": "to forget",
    "lemma": "olvidar",
    "LemmaMeanings": ["to forget", "to overlook", "to neglect", "to omit", "to disregard"]
  },
  "julio": {
    "wordNumber": 273,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["July (month)", "seventh month", "midsummer month"],
    "bestTranslation": "July",
    "lemma": "julio",
    "LemmaMeanings": ["July", "seventh month of year", "midsummer month"]
  },
  "verne": {
    "wordNumber": 274,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "proper name",
    "meanings": ["Verne (specific surname)", "Verne (author's name)"],
    "bestTranslation": "Verne",
    "lemma": "verne",
    "LemmaMeanings": ["Verne (French surname)", "surname of Jules Verne"]
  },
  "emilio": {
    "wordNumber": 275,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "proper name",
    "meanings": ["Emilio (specific person's name)", "Emilio (Spanish given name)"],
    "bestTranslation": "Emilio",
    "lemma": "emilio",
    "LemmaMeanings": ["Emilio (masculine given name)", "Spanish form of Emil"]
  },
  "salgari": {
    "wordNumber": 276,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "proper name",
    "meanings": ["Salgari (specific surname)", "Salgari (author's name)"],
    "bestTranslation": "Salgari",
    "lemma": "salgari",
    "LemmaMeanings": ["Salgari (Italian surname)", "surname of author Emilio Salgari"]
  },
  "jack": {
    "wordNumber": 277,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "proper name",
    "meanings": ["Jack (specific person's name)", "Jack (English given name)"],
    "bestTranslation": "Jack",
    "lemma": "jack",
    "LemmaMeanings": ["Jack (masculine given name)", "diminutive of John"]
  },
  "london": {
    "wordNumber": 278,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "proper name",
    "meanings": ["London (specific surname)", "London (author's name)"],
    "bestTranslation": "London",
    "lemma": "london",
    "LemmaMeanings": ["London (surname)", "surname of author Jack London"]
  },
  "también": {
    "wordNumber": 279,
    "frequency": 1,
    "partOfSpeech": "ADVERB",
    "morphology": "invariable",
    "meanings": ["also", "too", "as well", "in addition", "likewise"],
    "bestTranslation": "also",
    "lemma": "también",
    "LemmaMeanings": ["also", "too", "as well", "in addition", "moreover"]
  },
  "historia": {
    "wordNumber": 280,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine singular",
    "meanings": ["history", "story", "account", "narrative", "particular tale"],
    "bestTranslation": "history",
    "lemma": "historia",
    "LemmaMeanings": ["history", "story", "account", "past events", "chronicle"]
  },
  "marcó": {
    "wordNumber": 281,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "preterite indicative, third person singular",
    "meanings": ["marked", "made a mark", "indicated", "signaled (at a specific time)"],
    "bestTranslation": "marked",
    "lemma": "marcar",
    "LemmaMeanings": ["to mark", "to indicate", "to signal", "to score", "to show"]
  },
  "moby": {
    "wordNumber": 282,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "proper name",
    "meanings": ["Moby (specific name)", "Moby (part of whale's name)"],
    "bestTranslation": "Moby",
    "lemma": "moby",
    "LemmaMeanings": ["Moby (name)", "part of fictional whale's name"]
  },
  "dick": {
    "wordNumber": 283,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "proper name",
    "meanings": ["Dick (specific name)", "Dick (part of whale's name)"],
    "bestTranslation": "Dick",
    "lemma": "dick",
    "LemmaMeanings": ["Dick (name)", "nickname for Richard", "part of whale's name"]
  },
  "herman": {
    "wordNumber": 284,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "proper name",
    "meanings": ["Herman (specific person's name)", "Herman (given name)"],
    "bestTranslation": "Herman",
    "lemma": "herman",
    "LemmaMeanings": ["Herman (masculine given name)", "Germanic personal name"]
  },
  "melville": {
    "wordNumber": 285,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "proper name",
    "meanings": ["Melville (specific surname)", "Melville (author's name)"],
    "bestTranslation": "Melville",
    "lemma": "melville",
    "LemmaMeanings": ["Melville (surname)", "surname of author Herman Melville"]
  },
  "catorce": {
    "wordNumber": 286,
    "frequency": 1,
    "partOfSpeech": "NUMERAL",
    "morphology": "invariable",
    "meanings": ["fourteen", "the number 14", "fourteenth"],
    "bestTranslation": "fourteen",
    "lemma": "catorce",
    "LemmaMeanings": ["fourteen (number)", "14", "fourteenth"]
  },
  "leí": {
    "wordNumber": 287,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "preterite indicative, first person singular",
    "meanings": ["I read", "I did read", "I finished reading", "I perused"],
    "bestTranslation": "I read",
    "lemma": "leer",
    "LemmaMeanings": ["to read", "to peruse", "to interpret", "to understand"]
  },
  "aquel": {
    "wordNumber": 288,
    "frequency": 1,
    "partOfSpeech": "DETERMINER/PRONOUN",
    "morphology": "masculine singular, demonstrative",
    "meanings": ["that one", "that (distant)", "the former", "that specific one"],
    "bestTranslation": "that",
    "lemma": "aquel",
    "LemmaMeanings": ["that", "that one", "the former", "the one over there"]
  },
  "dieciséis": {
    "wordNumber": 289,
    "frequency": 1,
    "partOfSpeech": "NUMERAL",
    "morphology": "invariable",
    "meanings": ["sixteen", "the number 16", "sixteenth"],
    "bestTranslation": "sixteen",
    "lemma": "dieciséis",
    "LemmaMeanings": ["sixteen (number)", "16", "sixteenth"]
  },
  "pude": {
    "wordNumber": 290,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "preterite indicative, first person singular",
    "meanings": ["I could", "I was able to", "I managed to", "I succeeded in"],
    "bestTranslation": "I could",
    "lemma": "poder",
    "LemmaMeanings": ["to be able", "can", "to have power", "to manage", "to succeed"]
  },
  "resistirme": {
    "wordNumber": 291,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "infinitive with reflexive pronoun 'me'",
    "meanings": ["to resist myself", "to hold myself back", "to refrain myself"],
    "bestTranslation": "to resist myself",
    "lemma": "resistir",
    "LemmaMeanings": ["to resist", "to withstand", "to endure", "to oppose", "to hold out"]
  },
  "llamada": {
    "wordNumber": 292,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine singular",
    "meanings": ["call", "phone call", "calling", "summons (single instance)"],
    "bestTranslation": "call",
    "lemma": "llamada",
    "LemmaMeanings": ["call", "phone call", "summons", "calling", "beckoning"]
  },
  "vacaciones": {
    "wordNumber": 293,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine plural",
    "meanings": ["vacation time", "holiday period", "time off", "break from work/school"],
    "bestTranslation": "vacation",
    "lemma": "vacaciones",
    "LemmaMeanings": ["vacation", "holiday", "time off", "break", "recess"]
  },
  "verano": {
    "wordNumber": 294,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["summer", "summer season", "summertime"],
    "bestTranslation": "summer",
    "lemma": "verano",
    "LemmaMeanings": ["summer", "summer season", "hot season", "warmest season"]
  },
  "duran": {
    "wordNumber": 295,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "present indicative, third person plural",
    "meanings": ["they last", "they endure", "they continue", "they remain"],
    "bestTranslation": "they last",
    "lemma": "durar",
    "LemmaMeanings": ["to last", "to endure", "to continue", "to persist", "to remain"]
  },
  "diciembre": {
    "wordNumber": 296,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["December", "twelfth month", "last month of year"],
    "bestTranslation": "December",
    "lemma": "diciembre",
    "LemmaMeanings": ["December", "twelfth month", "last month of the year"]
  },
  "marzo": {
    "wordNumber": 297,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["March", "third month", "spring month"],
    "bestTranslation": "March",
    "lemma": "marzo",
    "LemmaMeanings": ["March", "third month", "spring month of the year"]
  },
  "otras": {
    "wordNumber": 298,
    "frequency": 1,
    "partOfSpeech": "DETERMINER/PRONOUN",
    "morphology": "feminine plural",
    "meanings": ["other ones (feminine)", "others (feminine)", "different ones (feminine)"],
    "bestTranslation": "other",
    "lemma": "otro",
    "LemmaMeanings": ["other", "another", "different", "additional", "further"]
  },
  "supe": {
    "wordNumber": 299,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "preterite indicative, first person singular",
    "meanings": ["I knew", "I found out", "I learned", "I realized"],
    "bestTranslation": "I knew",
    "lemma": "saber",
    "LemmaMeanings": ["to know", "to learn", "to find out", "to be aware", "to understand"]
  },
  "confines": {
    "wordNumber": 300,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine plural",
    "meanings": ["boundaries", "limits", "borders", "outer edges"],
    "bestTranslation": "confines",
    "lemma": "confín",
    "LemmaMeanings": ["boundary", "limit", "border", "edge", "frontier"]
  },
  "continentales": {
    "wordNumber": 301,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "plural",
    "meanings": ["continental (plural)", "of the mainland (plural)", "relating to continents (plural)"],
    "bestTranslation": "continental",
    "lemma": "continental",
    "LemmaMeanings": ["continental", "of the mainland", "relating to a continent", "of continental origin"]
  },
  "preantárticos": {
    "wordNumber": 302,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "masculine plural",
    "meanings": ["pre-Antarctic (plural)", "before the Antarctic (plural)", "near the Antarctic region"],
    "bestTranslation": "pre-Antarctic",
    "lemma": "preantártico",
    "LemmaMeanings": ["pre-Antarctic", "relating to areas near Antarctica", "preceding the Antarctic region"]
  },
  "fondeaban": {
    "wordNumber": 303,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "imperfect indicative, third person plural",
    "meanings": ["they were anchoring", "they used to anchor", "they would drop anchor", "they were mooring"],
    "bestTranslation": "they were anchoring",
    "lemma": "fondear",
    "LemmaMeanings": ["to anchor", "to moor", "to drop anchor", "to cast anchor", "to secure a vessel"]
  },
  "pequeñas": {
    "wordNumber": 304,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "feminine plural",
    "meanings": ["small ones (feminine)", "little ones (feminine)", "tiny ones (feminine)"],
    "bestTranslation": "small",
    "lemma": "pequeño",
    "LemmaMeanings": ["small", "little", "tiny", "minor", "young"]
  },
  "flotas": {
    "wordNumber": 305,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine plural",
    "meanings": ["fleets", "naval forces", "groups of ships", "flotillas"],
    "bestTranslation": "fleets",
    "lemma": "flota",
    "LemmaMeanings": ["fleet", "naval force", "group of ships", "flotilla", "squadron"]
  },
  "barcos": {
    "wordNumber": 306,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine plural",
    "meanings": ["ships", "boats", "vessels", "watercraft (plural)"],
    "bestTranslation": "ships",
    "lemma": "barco",
    "LemmaMeanings": ["ship", "boat", "vessel", "watercraft", "maritime vessel"]
  },
  "balleneros": {
    "wordNumber": 307,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine plural",
    "meanings": ["whaling ships", "whalers", "whale hunters", "whaling vessels"],
    "bestTranslation": "whaling ships",
    "lemma": "ballenero",
    "LemmaMeanings": ["whaler", "whaling vessel", "whale hunter", "person/vessel involved in whaling"]
  },
  "ansiaba": {
    "wordNumber": 308,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "imperfect indicative, first/third person singular",
    "meanings": ["was yearning for", "was longing for", "was craving", "was eagerly desiring"],
    "bestTranslation": "was yearning for",
    "lemma": "ansiar",
    "LemmaMeanings": ["to yearn for", "to long for", "to crave", "to eagerly desire"]
  },
  "conocer": {
    "wordNumber": 309,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "infinitive",
    "meanings": ["to know", "to meet", "to get to know", "to become acquainted with"],
    "bestTranslation": "to know",
    "lemma": "conocer",
    "LemmaMeanings": ["to know", "to meet", "to be familiar with", "to recognize", "to experience"]
  },
  "aquellos": {
    "wordNumber": 310,
    "frequency": 1,
    "partOfSpeech": "DETERMINER/PRONOUN",
    "morphology": "masculine plural, demonstrative",
    "meanings": ["those (distant)", "those ones", "those (mentioned before)", "those (far away)"],
    "bestTranslation": "those",
    "lemma": "aquel",
    "LemmaMeanings": ["that", "that one", "the former", "the one over there", "that distant one"]
  },
  "hombres": {
    "wordNumber": 311,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine plural",
    "meanings": ["men", "adult males", "male humans", "mankind"],
    "bestTranslation": "men",
    "lemma": "hombre",
    "LemmaMeanings": ["man", "male adult", "human being", "mankind", "person"]
  },
  "imaginaba": {
    "wordNumber": 312,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "imperfect indicative, first/third person singular",
    "meanings": ["was imagining", "used to imagine", "would imagine", "was picturing"],
    "bestTranslation": "was imagining",
    "lemma": "imaginar",
    "LemmaMeanings": ["to imagine", "to picture", "to visualize", "to conceive", "to think up"]
  },
  "herederos": {
    "wordNumber": 313,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine plural",
    "meanings": ["heirs (male)", "inheritors", "successors", "those who inherit"],
    "bestTranslation": "heirs",
    "lemma": "heredero",
    "LemmaMeanings": ["heir", "inheritor", "successor", "beneficiary", "descendant"]
  },
  "capitán": {
    "wordNumber": 314,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["captain", "ship's commander", "team leader", "military captain"],
    "bestTranslation": "captain",
    "lemma": "capitán",
    "LemmaMeanings": ["captain", "commander", "leader", "master of a vessel", "team captain"]
  },
  "ahab": {
    "wordNumber": 315,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "proper name",
    "meanings": ["Ahab (character name)", "Captain Ahab (from Moby Dick)"],
    "bestTranslation": "Ahab",
    "lemma": "ahab",
    "LemmaMeanings": ["Ahab (literary character)", "name of whaling captain in Moby Dick"]
  },
  "convencer": {
    "wordNumber": 316,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "infinitive",
    "meanings": ["to convince", "to persuade", "to make someone believe", "to win over"],
    "bestTranslation": "to convince",
    "lemma": "convencer",
    "LemmaMeanings": ["to convince", "to persuade", "to make believe", "to win over", "to satisfy"]
  },
  "padres": {
    "wordNumber": 317,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine plural",
    "meanings": ["parents", "fathers", "mother and father", "parental figures"],
    "bestTranslation": "parents",
    "lemma": "padre",
    "LemmaMeanings": ["parent", "father", "priest", "patriarch", "elder"]
  },
  "ese": {
    "wordNumber": 318,
    "frequency": 1,
    "partOfSpeech": "DETERMINER/PRONOUN",
    "morphology": "masculine singular, demonstrative",
    "meanings": ["that", "that one", "this one", "the one mentioned"],
    "bestTranslation": "that",
    "lemma": "ese",
    "LemmaMeanings": ["that", "that one", "this", "the one mentioned", "the one near"]
  },
  "viaje": {
    "wordNumber": 319,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["journey", "trip", "voyage", "travel experience"],
    "bestTranslation": "journey",
    "lemma": "viaje",
    "LemmaMeanings": ["journey", "trip", "voyage", "travel", "expedition"]
  },
  "sólo": {
    "wordNumber": 320,
    "frequency": 1,
    "partOfSpeech": "ADVERB",
    "morphology": "invariable",
    "meanings": ["only", "just", "merely", "solely", "exclusively"],
    "bestTranslation": "only",
    "lemma": "sólo",
    "LemmaMeanings": ["only", "just", "merely", "solely", "exclusively"]
  },
  "fue": {
    "wordNumber": 321,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "preterite indicative, third person singular",
    "meanings": ["was", "went", "happened", "became", "occurred"],
    "bestTranslation": "was",
    "lemma": "ser/ir",
    "LemmaMeanings": ["to be", "to go", "to happen", "to become", "to occur"]
  },
  "posible": {
    "wordNumber": 322,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "invariable",
    "meanings": ["possible", "feasible", "achievable", "potential"],
    "bestTranslation": "possible",
    "lemma": "posible",
    "LemmaMeanings": ["possible", "feasible", "achievable", "potential", "likely"]
  },
  "gracias": {
    "wordNumber": 323,
    "frequency": 1,
    "partOfSpeech": "NOUN/INTERJECTION",
    "morphology": "feminine plural",
    "meanings": ["thank you", "thanks", "expression of gratitude", "appreciation"],
    "bestTranslation": "thank you",
    "lemma": "gracia",
    "LemmaMeanings": ["grace", "favor", "thanks", "charm", "wit"]
  },
  "ayuda": {
    "wordNumber": 324,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine singular",
    "meanings": ["help", "assistance", "aid", "support"],
    "bestTranslation": "help",
    "lemma": "ayuda",
    "LemmaMeanings": ["help", "assistance", "aid", "support", "relief"]
  },
  "quien": {
    "wordNumber": 325,
    "frequency": 1,
    "partOfSpeech": "PRONOUN",
    "morphology": "singular, relative/interrogative",
    "meanings": ["who", "whom", "the one who", "whoever"],
    "bestTranslation": "who",
    "lemma": "quien",
    "LemmaMeanings": ["who", "whom", "the one who", "whoever", "he/she who"]
  },
  "además": {
    "wordNumber": 326,
    "frequency": 1,
    "partOfSpeech": "ADVERB",
    "morphology": "invariable",
    "meanings": ["furthermore", "moreover", "besides", "in addition"],
    "bestTranslation": "furthermore",
    "lemma": "además",
    "LemmaMeanings": ["furthermore", "moreover", "besides", "in addition", "additionally"]
  },
  "financió": {
    "wordNumber": 327,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "preterite indicative, third person singular",
    "meanings": ["financed", "funded", "provided money for", "backed financially"],
    "bestTranslation": "financed",
    "lemma": "financiar",
    "LemmaMeanings": ["to finance", "to fund", "to back financially", "to support monetarily"]
  },
  "mil": {
    "wordNumber": 328,
    "frequency": 1,
    "partOfSpeech": "NUMERAL",
    "morphology": "invariable",
    "meanings": ["thousand", "one thousand", "1,000"],
    "bestTranslation": "thousand",
    "lemma": "mil",
    "LemmaMeanings": ["thousand", "one thousand", "1,000", "thousandth"]
  },
  "tantos": {
    "wordNumber": 329,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE/PRONOUN",
    "morphology": "masculine plural",
    "meanings": ["so many", "numerous", "that many", "such a number of"],
    "bestTranslation": "so many",
    "lemma": "tanto",
    "LemmaMeanings": ["so much", "so many", "numerous", "that much", "that many"]
  },
  "kilómetros": {
    "wordNumber": 330,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine plural",
    "meanings": ["kilometers", "units of distance", "km", "metric distance units"],
    "bestTranslation": "kilometers",
    "lemma": "kilómetro",
    "LemmaMeanings": ["kilometer", "unit of distance", "km", "metric measurement"]
  },
  "encuentro": {
    "wordNumber": 331,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["meeting", "encounter", "gathering", "coming together"],
    "bestTranslation": "meeting",
    "lemma": "encuentro",
    "LemmaMeanings": ["meeting", "encounter", "gathering", "rendezvous", "appointment"]
  },
  "hice": {
    "wordNumber": 332,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "preterite indicative, first person singular",
    "meanings": ["I made", "I did", "I performed", "I created"],
    "bestTranslation": "I made",
    "lemma": "hacer",
    "LemmaMeanings": ["to make", "to do", "to create", "to perform", "to construct"]
  },
  "tren": {
    "wordNumber": 333,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["train", "railway vehicle", "locomotive and cars"],
    "bestTranslation": "train",
    "lemma": "tren",
    "LemmaMeanings": ["train", "railway transport", "locomotive", "rail vehicle"]
  },
  "allí": {
    "wordNumber": 334,
    "frequency": 1,
    "partOfSpeech": "ADVERB",
    "morphology": "invariable",
    "meanings": ["there", "in that place", "at that location", "over there"],
    "bestTranslation": "there",
    "lemma": "allí",
    "LemmaMeanings": ["there", "in that place", "at that spot", "yonder", "in that location"]
  },
  "frente": {
    "wordNumber": 335,
    "frequency": 1,
    "partOfSpeech": "NOUN/PREPOSITION",
    "morphology": "invariable",
    "meanings": ["front", "facing", "opposite to", "in front of"],
    "bestTranslation": "front",
    "lemma": "frente",
    "LemmaMeanings": ["front", "forehead", "facade", "frontage", "facing part"]
  },
  "terminan": {
    "wordNumber": 336,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "present indicative, third person plural",
    "meanings": ["they finish", "they end", "they complete", "they terminate"],
    "bestTranslation": "they finish",
    "lemma": "terminar",
    "LemmaMeanings": ["to finish", "to end", "to complete", "to terminate", "to conclude"]
  },
  "bruscamente": {
    "wordNumber": 337,
    "frequency": 1,
    "partOfSpeech": "ADVERB",
    "morphology": "invariable",
    "meanings": ["abruptly", "suddenly", "sharply", "roughly"],
    "bestTranslation": "abruptly",
    "lemma": "bruscamente",
    "LemmaMeanings": ["abruptly", "suddenly", "sharply", "roughly", "brusquely"]
  },
  "ferrocarril": {
    "wordNumber": 338,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["railroad", "railway", "rail system", "train track"],
    "bestTranslation": "railroad",
    "lemma": "ferrocarril",
    "LemmaMeanings": ["railroad", "railway", "rail transport", "train system"]
  },
  "después": {
    "wordNumber": 339,
    "frequency": 1,
    "partOfSpeech": "ADVERB",
    "morphology": "invariable",
    "meanings": ["after", "afterwards", "later", "subsequently"],
    "bestTranslation": "after",
    "lemma": "después",
    "LemmaMeanings": ["after", "afterwards", "later", "subsequently", "then"]
  },
  "país": {
    "wordNumber": 340,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["country", "nation", "land", "state"],
    "bestTranslation": "country",
    "lemma": "país",
    "LemmaMeanings": ["country", "nation", "land", "state", "territory"]
  },
  "divide": {
    "wordNumber": 341,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "present indicative, third person singular",
    "meanings": ["divides", "splits", "separates", "partitions"],
    "bestTranslation": "divides",
    "lemma": "dividir",
    "LemmaMeanings": ["to divide", "to split", "to separate", "to partition", "to share"]
  },
  "miles": {
    "wordNumber": 342,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine/feminine plural",
    "meanings": ["thousands", "many thousands", "multitude"],
    "bestTranslation": "thousands",
    "lemma": "mil",
    "LemmaMeanings": ["thousand", "thousands", "great number", "multitude"]
  },
  "islas": {
    "wordNumber": 343,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine plural",
    "meanings": ["islands", "isles", "land masses surrounded by water"],
    "bestTranslation": "islands",
    "lemma": "isla",
    "LemmaMeanings": ["island", "isle", "isolated land mass", "insular territory"]
  },
  "islotes": {
    "wordNumber": 344,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine plural",
    "meanings": ["small islands", "islets", "tiny islands", "rocky outcrops"],
    "bestTranslation": "islets",
    "lemma": "islote",
    "LemmaMeanings": ["islet", "small island", "rocky outcrop", "tiny isle"]
  },
  "canales": {
    "wordNumber": 345,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine plural",
    "meanings": ["channels", "canals", "waterways", "passages"],
    "bestTranslation": "channels",
    "lemma": "canal",
    "LemmaMeanings": ["channel", "canal", "waterway", "passage", "conduit"]
  },
  "pasos": {
    "wordNumber": 346,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine plural",
    "meanings": ["steps", "passes", "passages", "movements"],
    "bestTranslation": "steps",
    "lemma": "paso",
    "LemmaMeanings": ["step", "pass", "passage", "pace", "movement"]
  },
  "cercanías": {
    "wordNumber": 347,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine plural",
    "meanings": ["surroundings", "vicinity", "nearby areas", "outskirts"],
    "bestTranslation": "surroundings",
    "lemma": "cercanía",
    "LemmaMeanings": ["proximity", "vicinity", "surrounding area", "nearness"]
  },
  "polo": {
    "wordNumber": 348,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["pole", "end point", "extremity", "polar region"],
    "bestTranslation": "pole",
    "lemma": "polo",
    "LemmaMeanings": ["pole", "end", "extremity", "polar region", "terminus"]
  },
  "parte": {
    "wordNumber": 349,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine singular",
    "meanings": ["part", "portion", "section", "piece"],
    "bestTranslation": "part",
    "lemma": "parte",
    "LemmaMeanings": ["part", "portion", "section", "piece", "share"]
  },
  "continental": {
    "wordNumber": 350,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "invariable",
    "meanings": ["continental", "of the mainland", "pertaining to a continent"],
    "bestTranslation": "continental",
    "lemma": "continental",
    "LemmaMeanings": ["continental", "of the mainland", "pertaining to a continent", "mainland-related"]
  },
  "cordilleras": {
    "wordNumber": 351,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine plural",
    "meanings": ["mountain ranges", "mountain chains", "series of connected mountains", "cordilleras"],
    "bestTranslation": "mountain ranges",
    "lemma": "cordillera",
    "LemmaMeanings": ["mountain range", "mountain chain", "series of mountains", "mountain system"]
  },
  "ventisqueros": {
    "wordNumber": 352,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine plural",
    "meanings": ["snowdrifts", "snow fields", "glaciers", "accumulated snow masses"],
    "bestTranslation": "snowdrifts",
    "lemma": "ventisquero",
    "LemmaMeanings": ["snowdrift", "glacier", "permanent snow field", "snow accumulation"]
  },
  "bosques": {
    "wordNumber": 353,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine plural",
    "meanings": ["forests", "woods", "woodlands", "wooded areas"],
    "bestTranslation": "forests",
    "lemma": "bosque",
    "LemmaMeanings": ["forest", "wood", "woodland", "grove", "wooded area"]
  },
  "impenetrables": {
    "wordNumber": 354,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "plural",
    "meanings": ["impenetrable (plural)", "impassable", "dense", "impossible to pass through"],
    "bestTranslation": "impenetrable",
    "lemma": "impenetrable",
    "LemmaMeanings": ["impenetrable", "impassable", "dense", "impossible to traverse", "inaccessible"]
  },
  "hielos": {
    "wordNumber": 355,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine plural",
    "meanings": ["ice masses", "ice fields", "frozen waters", "ice formations"],
    "bestTranslation": "ice masses",
    "lemma": "hielo",
    "LemmaMeanings": ["ice", "frozen water", "frost", "coldness", "glacial formation"]
  },
  "eternos": {
    "wordNumber": 356,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "masculine plural",
    "meanings": ["eternal ones", "everlasting ones", "perpetual ones", "endless ones"],
    "bestTranslation": "eternal",
    "lemma": "eterno",
    "LemmaMeanings": ["eternal", "everlasting", "perpetual", "endless", "timeless"]
  },
  "lagunas": {
    "wordNumber": 357,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine plural",
    "meanings": ["lagoons", "lakes", "ponds", "small bodies of water"],
    "bestTranslation": "lagoons",
    "lemma": "laguna",
    "LemmaMeanings": ["lagoon", "lake", "pond", "body of water", "water basin"]
  },
  "fiordos": {
    "wordNumber": 358,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine plural",
    "meanings": ["fjords", "deep glacial inlets", "narrow sea inlets", "coastal gorges"],
    "bestTranslation": "fjords",
    "lemma": "fiordo",
    "LemmaMeanings": ["fjord", "glacial inlet", "narrow sea inlet", "coastal gorge"]
  },
  "ríos": {
    "wordNumber": 359,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine plural",
    "meanings": ["rivers", "streams", "waterways", "flowing water bodies"],
    "bestTranslation": "rivers",
    "lemma": "río",
    "LemmaMeanings": ["river", "stream", "watercourse", "flowing water body"]
  },
  "caprichosos": {
    "wordNumber": 360,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "masculine plural",
    "meanings": ["capricious ones", "whimsical ones", "unpredictable ones", "fickle ones"],
    "bestTranslation": "capricious",
    "lemma": "caprichoso",
    "LemmaMeanings": ["capricious", "whimsical", "unpredictable", "fickle", "arbitrary"]
  },
  "impiden": {
    "wordNumber": 361,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "present indicative, third person plural",
    "meanings": ["they prevent", "they impede", "they block", "they obstruct"],
    "bestTranslation": "they prevent",
    "lemma": "impedir",
    "LemmaMeanings": ["to prevent", "to impede", "to block", "to obstruct", "to hinder"]
  },
  "trazo": {
    "wordNumber": 362,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["line", "stroke", "drawn mark", "outline"],
    "bestTranslation": "line",
    "lemma": "trazo",
    "LemmaMeanings": ["line", "stroke", "mark", "outline", "drawn element"]
  },
  "caminos": {
    "wordNumber": 363,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine plural",
    "meanings": ["roads", "paths", "routes", "ways"],
    "bestTranslation": "roads",
    "lemma": "camino",
    "LemmaMeanings": ["road", "path", "way", "route", "journey", "course"]
  },
  "ferroviarias": {
    "wordNumber": 364,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "feminine plural",
    "meanings": ["railway-related (feminine plural)", "railroad (feminine plural)", "pertaining to railways"],
    "bestTranslation": "railway",
    "lemma": "ferroviario",
    "LemmaMeanings": ["railway-related", "of railroads", "pertaining to trains", "railroad system"]
  }
};

export default mundoBDatabase_filtered;
