// Filtered database from mundoCDatabase containing only words not found in existing databases
// Word numbering continues sequentially starting at 365
const mundoCDatabase_filtered = {
  "evangelista": {
    "wordNumber": 365,
    "frequency": 3,
    "partOfSpeech": "NOUN",
    "morphology": "masculine/feminine singular",
    "meanings": ["evangelist", "gospel writer", "preacher of the gospel", "religious messenger"],
    "bestTranslation": "evangelist",
    "lemma": "evangelista",
    "LemmaMeanings": ["evangelist", "gospel writer", "preacher", "one who spreads religious teachings"]
  },
  "nuevo": {
    "wordNumber": 366,
    "frequency": 2,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "masculine singular",
    "meanings": ["new", "fresh", "recent", "novel", "unused"],
    "bestTranslation": "new",
    "lemma": "nuevo",
    "LemmaMeanings": ["new", "fresh", "recent", "modern", "novel", "unfamiliar"]
  },
  "unos": {
    "wordNumber": 367,
    "frequency": 2,
    "partOfSpeech": "DETERMINER/PRONOUN",
    "morphology": "masculine plural, indefinite",
    "meanings": ["some", "a few", "several", "about (with numbers)"],
    "bestTranslation": "some",
    "lemma": "uno",
    "LemmaMeanings": ["one", "a/an", "some", "approximately", "about"]
  },
  "porvenir": {
    "wordNumber": 368,
    "frequency": 2,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["future", "time ahead", "what is to come", "prospects"],
    "bestTranslation": "future",
    "lemma": "porvenir",
    "LemmaMeanings": ["future", "time to come", "prospects", "destiny", "what lies ahead"]
  },
  "carretera": {
    "wordNumber": 369,
    "frequency": 2,
    "partOfSpeech": "NOUN",
    "morphology": "feminine singular",
    "meanings": ["highway", "road", "main road", "motorway"],
    "bestTranslation": "highway",
    "lemma": "carretera",
    "LemmaMeanings": ["highway", "road", "motorway", "main thoroughfare", "paved road"]
  },
  "detuvo": {
    "wordNumber": 370,
    "frequency": 2,
    "partOfSpeech": "VERB",
    "morphology": "preterite indicative, third person singular",
    "meanings": ["stopped", "halted", "detained", "came to a stop"],
    "bestTranslation": "stopped",
    "lemma": "detener",
    "LemmaMeanings": ["to stop", "to halt", "to detain", "to arrest", "to pause"]
  },
  "lugar": {
    "wordNumber": 371,
    "frequency": 2,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["place", "location", "spot", "site", "position"],
    "bestTranslation": "place",
    "lemma": "lugar",
    "LemmaMeanings": ["place", "location", "site", "spot", "position", "locality"]
  },
  "casas": {
    "wordNumber": 372,
    "frequency": 2,
    "partOfSpeech": "NOUN",
    "morphology": "feminine plural",
    "meanings": ["houses", "homes", "buildings", "residences"],
    "bestTranslation": "houses",
    "lemma": "casa",
    "LemmaMeanings": ["house", "home", "residence", "building", "dwelling"]
  },
  "terminaba": {
    "wordNumber": 373,
    "frequency": 2,
    "partOfSpeech": "VERB",
    "morphology": "imperfect indicative, first/third person singular",
    "meanings": ["was ending", "was finishing", "used to end", "would finish"],
    "bestTranslation": "was ending",
    "lemma": "terminar",
    "LemmaMeanings": ["to end", "to finish", "to complete", "to conclude", "to terminate"]
  },
  "barco": {
    "wordNumber": 374,
    "frequency": 2,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["ship", "boat", "vessel", "watercraft"],
    "bestTranslation": "ship",
    "lemma": "barco",
    "LemmaMeanings": ["ship", "boat", "vessel", "watercraft", "maritime vessel"]
  },
  "patrón": {
    "wordNumber": 375,
    "frequency": 2,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["captain", "boss", "master", "employer", "skipper"],
    "bestTranslation": "captain",
    "lemma": "patrón",
    "LemmaMeanings": ["boss", "master", "employer", "pattern", "patron", "captain"]
  },
  "antonio": {
    "wordNumber": 376,
    "frequency": 2,
    "partOfSpeech": "NOUN",
    "morphology": "proper name",
    "meanings": ["Antonio (given name)", "Anthony (English equivalent)"],
    "bestTranslation": "Antonio",
    "lemma": "antonio",
    "LemmaMeanings": ["Antonio (masculine given name)", "derived from Latin Antonius"]
  },
  "garaicochea": {
    "wordNumber": 377,
    "frequency": 2,
    "partOfSpeech": "NOUN",
    "morphology": "proper name",
    "meanings": ["Garaicochea (Basque surname)", "family name"],
    "bestTranslation": "Garaicochea",
    "lemma": "garaicochea",
    "LemmaMeanings": ["Garaicochea (Basque surname)", "family name of Basque origin"]
  },
  "vasco": {
    "wordNumber": 378,
    "frequency": 2,
    "partOfSpeech": "ADJECTIVE/NOUN",
    "morphology": "masculine singular",
    "meanings": ["Basque", "from the Basque Country", "of Basque origin"],
    "bestTranslation": "Basque",
    "lemma": "vasco",
    "LemmaMeanings": ["Basque", "from Basque Country", "of Basque ethnicity", "Euskaldun"]
  },
  "muelle": {
    "wordNumber": 379,
    "frequency": 2,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["dock", "pier", "wharf", "quay"],
    "bestTranslation": "dock",
    "lemma": "muelle",
    "LemmaMeanings": ["dock", "pier", "wharf", "quay", "spring (mechanical)"]
  },
  "porque": {
    "wordNumber": 380,
    "frequency": 2,
    "partOfSpeech": "CONJUNCTION",
    "morphology": "invariable",
    "meanings": ["because", "since", "as", "for the reason that"],
    "bestTranslation": "because",
    "lemma": "porque",
    "LemmaMeanings": ["because", "since", "for", "as", "due to the fact that"]
  },
  "aroma": {
    "wordNumber": 381,
    "frequency": 2,
    "partOfSpeech": "NOUN",
    "morphology": "masculine/feminine singular",
    "meanings": ["aroma", "scent", "fragrance", "smell"],
    "bestTranslation": "aroma",
    "lemma": "aroma",
    "LemmaMeanings": ["aroma", "scent", "fragrance", "smell", "perfume"]
  },
  "mesas": {
    "wordNumber": 382,
    "frequency": 2,
    "partOfSpeech": "NOUN",
    "morphology": "feminine plural",
    "meanings": ["tables", "desks", "dining tables", "flat surfaces"],
    "bestTranslation": "tables",
    "lemma": "mesa",
    "LemmaMeanings": ["table", "desk", "plateau", "board", "flat surface"]
  },
  "mañana": {
    "wordNumber": 383,
    "frequency": 1,
    "partOfSpeech": "NOUN/ADVERB",
    "morphology": "feminine singular/invariable",
    "meanings": ["morning", "tomorrow", "next day", "future time"],
    "bestTranslation": "morning/tomorrow",
    "lemma": "mañana",
    "LemmaMeanings": ["morning", "tomorrow", "future", "next day", "early part of day"]
  },
  "siguiente": {
    "wordNumber": 384,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "invariable",
    "meanings": ["following", "next", "subsequent", "succeeding"],
    "bestTranslation": "following",
    "lemma": "siguiente",
    "LemmaMeanings": ["following", "next", "subsequent", "succeeding", "coming after"]
  },
  "crucé": {
    "wordNumber": 385,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "preterite indicative, first person singular",
    "meanings": ["I crossed", "I went across", "I traversed", "I passed over"],
    "bestTranslation": "I crossed",
    "lemma": "cruzar",
    "LemmaMeanings": ["to cross", "to traverse", "to go across", "to intersect", "to pass over"]
  },
  "estrecho": {
    "wordNumber": 386,
    "frequency": 1,
    "partOfSpeech": "NOUN/ADJECTIVE",
    "morphology": "masculine singular",
    "meanings": ["strait", "narrow", "tight", "confined"],
    "bestTranslation": "strait",
    "lemma": "estrecho",
    "LemmaMeanings": ["narrow", "tight", "strait", "confined", "restricted"]
  },
  "bordo": {
    "wordNumber": 387,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["board", "aboard", "on board", "ship's side"],
    "bestTranslation": "board",
    "lemma": "bordo",
    "LemmaMeanings": ["board", "edge", "ship's side", "vessel", "border"]
  },
  "lanchón": {
    "wordNumber": 388,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["large launch", "big boat", "barge", "large watercraft"],
    "bestTranslation": "large launch",
    "lemma": "lanchón",
    "LemmaMeanings": ["large launch", "barge", "big boat", "large watercraft"]
  },
  "atiborrado": {
    "wordNumber": 389,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE/PARTICIPLE",
    "morphology": "masculine singular",
    "meanings": ["crammed", "stuffed", "packed", "filled to capacity"],
    "bestTranslation": "crammed",
    "lemma": "atiborrar",
    "LemmaMeanings": ["to cram", "to stuff", "to pack", "to fill completely"]
  },
  "bombonas": {
    "wordNumber": 390,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine plural",
    "meanings": ["gas cylinders", "tanks", "large containers", "gas bottles"],
    "bestTranslation": "gas cylinders",
    "lemma": "bombona",
    "LemmaMeanings": ["gas cylinder", "tank", "large container", "gas bottle"]
  },
  "gas": {
    "wordNumber": 391,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["gas", "fuel", "gaseous substance", "vapor"],
    "bestTranslation": "gas",
    "lemma": "gas",
    "LemmaMeanings": ["gas", "fuel", "gaseous substance", "vapor", "fumes"]
  },
  "cien": {
    "wordNumber": 392,
    "frequency": 1,
    "partOfSpeech": "NUMERAL",
    "morphology": "invariable",
    "meanings": ["hundred", "one hundred", "100"],
    "bestTranslation": "hundred",
    "lemma": "cien",
    "LemmaMeanings": ["hundred", "one hundred", "100", "hundredth"]
  },
  "sureste": {
    "wordNumber": 393,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["southeast", "southeastern region", "SE direction"],
    "bestTranslation": "southeast",
    "lemma": "sureste",
    "LemmaMeanings": ["southeast", "southeastern direction", "SE", "southeastern region"]
  },
  "planté": {
    "wordNumber": 394,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "preterite indicative, first person singular",
    "meanings": ["I planted", "I stood", "I positioned myself", "I placed firmly"],
    "bestTranslation": "I planted",
    "lemma": "plantar",
    "LemmaMeanings": ["to plant", "to stand", "to place", "to position", "to establish"]
  },
  "esperar": {
    "wordNumber": 395,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "infinitive",
    "meanings": ["to wait", "to hope", "to expect", "to await"],
    "bestTranslation": "to wait",
    "lemma": "esperar",
    "LemmaMeanings": ["to wait", "to hope", "to expect", "to await", "to anticipate"]
  },
  "vehículo": {
    "wordNumber": 396,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["vehicle", "conveyance", "means of transport", "car"],
    "bestTranslation": "vehicle",
    "lemma": "vehículo",
    "LemmaMeanings": ["vehicle", "conveyance", "means of transport", "automobile", "carrier"]
  },
  "une": {
    "wordNumber": 397,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "present indicative, third person singular",
    "meanings": ["unites", "joins", "connects", "links together"],
    "bestTranslation": "unites",
    "lemma": "unir",
    "LemmaMeanings": ["to unite", "to join", "to connect", "to link", "to bring together"]
  },
  "san": {
    "wordNumber": 398,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "title, invariable",
    "meanings": ["Saint", "St.", "holy person (title)"],
    "bestTranslation": "Saint",
    "lemma": "san",
    "LemmaMeanings": ["Saint", "holy", "blessed", "sacred (title)"]
  },
  "sebastián": {
    "wordNumber": 399,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "proper name",
    "meanings": ["Sebastian (given name)", "name of place/person"],
    "bestTranslation": "Sebastian",
    "lemma": "sebastián",
    "LemmaMeanings": ["Sebastian (masculine given name)", "from Greek Sebastianos"]
  },
  "poblado": {
    "wordNumber": 400,
    "frequency": 1,
    "partOfSpeech": "NOUN/ADJECTIVE",
    "morphology": "masculine singular",
    "meanings": ["settlement", "populated", "inhabited", "village"],
    "bestTranslation": "settlement",
    "lemma": "poblado",
    "LemmaMeanings": ["settlement", "village", "populated place", "inhabited area"]
  },
  "fronterizo": {
    "wordNumber": 401,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "masculine singular",
    "meanings": ["border", "frontier", "bordering", "located at the border"],
    "bestTranslation": "border",
    "lemma": "fronterizo",
    "LemmaMeanings": ["bordering", "frontier", "relating to borders", "boundary"]
  },
  "argentina": {
    "wordNumber": 402,
    "frequency": 1,
    "partOfSpeech": "NOUN/ADJECTIVE",
    "morphology": "feminine singular",
    "meanings": ["Argentine", "Argentinian", "from Argentina", "relating to Argentina"],
    "bestTranslation": "Argentine",
    "lemma": "argentino",
    "LemmaMeanings": ["Argentine", "Argentinian", "from Argentina", "relating to Argentina"]
  },
  "tierra": {
    "wordNumber": 403,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine singular",
    "meanings": ["earth", "land", "soil", "ground", "territory"],
    "bestTranslation": "land",
    "lemma": "tierra",
    "LemmaMeanings": ["earth", "land", "soil", "ground", "world", "territory"]
  },
  "fuego": {
    "wordNumber": 404,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["fire", "flame", "blaze", "burning"],
    "bestTranslation": "fire",
    "lemma": "fuego",
    "LemmaMeanings": ["fire", "flame", "blaze", "heat", "passion"]
  },
  "suerte": {
    "wordNumber": 405,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine singular",
    "meanings": ["luck", "fortune", "fate", "chance"],
    "bestTranslation": "luck",
    "lemma": "suerte",
    "LemmaMeanings": ["luck", "fortune", "fate", "destiny", "chance"]
  },
  "pues": {
    "wordNumber": 406,
    "frequency": 1,
    "partOfSpeech": "CONJUNCTION/ADVERB",
    "morphology": "invariable",
    "meanings": ["well", "then", "so", "therefore", "since"],
    "bestTranslation": "well",
    "lemma": "pues",
    "LemmaMeanings": ["well", "then", "therefore", "since", "for", "because"]
  },
  "media": {
    "wordNumber": 407,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE/NOUN",
    "morphology": "feminine singular",
    "meanings": ["half", "middle", "average", "medium"],
    "bestTranslation": "half",
    "lemma": "medio",
    "LemmaMeanings": ["half", "middle", "medium", "average", "intermediate"]
  },
  "jeep": {
    "wordNumber": 408,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["jeep", "off-road vehicle", "4x4 vehicle"],
    "bestTranslation": "jeep",
    "lemma": "jeep",
    "LemmaMeanings": ["jeep", "four-wheel drive vehicle", "off-road vehicle"]
  },
  "ministerio": {
    "wordNumber": 409,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["ministry", "government department", "cabinet department"],
    "bestTranslation": "ministry",
    "lemma": "ministerio",
    "LemmaMeanings": ["ministry", "government department", "cabinet office", "administrative body"]
  },
  "agricultura": {
    "wordNumber": 410,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine singular",
    "meanings": ["agriculture", "farming", "cultivation", "agricultural activity"],
    "bestTranslation": "agriculture",
    "lemma": "agricultura",
    "LemmaMeanings": ["agriculture", "farming", "cultivation", "agricultural science"]
  },
  "viajaban": {
    "wordNumber": 411,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "imperfect indicative, third person plural",
    "meanings": ["they were traveling", "they used to travel", "they journeyed"],
    "bestTranslation": "they were traveling",
    "lemma": "viajar",
    "LemmaMeanings": ["to travel", "to journey", "to voyage", "to go on trips"]
  },
  "veterinarios": {
    "wordNumber": 412,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine plural",
    "meanings": ["veterinarians", "vets", "animal doctors"],
    "bestTranslation": "veterinarians",
    "lemma": "veterinario",
    "LemmaMeanings": ["veterinarian", "vet", "animal doctor", "veterinary surgeon"]
  },
  "mostraron": {
    "wordNumber": 413,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "preterite indicative, third person plural",
    "meanings": ["they showed", "they displayed", "they demonstrated", "they exhibited"],
    "bestTranslation": "they showed",
    "lemma": "mostrar",
    "LemmaMeanings": ["to show", "to display", "to demonstrate", "to exhibit", "to reveal"]
  },
  "encantados": {
    "wordNumber": 414,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "masculine plural",
    "meanings": ["delighted", "enchanted", "pleased", "charmed"],
    "bestTranslation": "delighted",
    "lemma": "encantado",
    "LemmaMeanings": ["delighted", "enchanted", "pleased", "charmed", "happy"]
  },
  "chico": {
    "wordNumber": 415,
    "frequency": 1,
    "partOfSpeech": "NOUN/ADJECTIVE",
    "morphology": "masculine singular",
    "meanings": ["boy", "small", "little", "young man"],
    "bestTranslation": "boy",
    "lemma": "chico",
    "LemmaMeanings": ["boy", "small", "little", "young", "kid"]
  },
  "patiperreaba": {
    "wordNumber": 416,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "imperfect indicative, third person singular",
    "meanings": ["was wandering around", "was roaming", "was walking aimlessly"],
    "bestTranslation": "was wandering around",
    "lemma": "patiperrar",
    "LemmaMeanings": ["to wander", "to roam", "to walk aimlessly", "to stroll about"]
  },
  "lejos": {
    "wordNumber": 417,
    "frequency": 1,
    "partOfSpeech": "ADVERB",
    "morphology": "invariable",
    "meanings": ["far", "far away", "distant", "at a distance"],
    "bestTranslation": "far",
    "lemma": "lejos",
    "LemmaMeanings": ["far", "distant", "remote", "far away", "at a distance"]
  },
  "ripio": {
    "wordNumber": 418,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["gravel", "rubble", "crushed stone", "road metal"],
    "bestTranslation": "gravel",
    "lemma": "ripio",
    "LemmaMeanings": ["gravel", "rubble", "crushed stone", "construction debris"]
  },
  "corría": {
    "wordNumber": 419,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "imperfect indicative, third person singular",
    "meanings": ["was running", "ran", "was flowing", "was moving quickly"],
    "bestTranslation": "was running",
    "lemma": "correr",
    "LemmaMeanings": ["to run", "to flow", "to move quickly", "to hurry"]
  },
  "paralela": {
    "wordNumber": 420,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "feminine singular",
    "meanings": ["parallel", "alongside", "running alongside", "equidistant"],
    "bestTranslation": "parallel",
    "lemma": "paralelo",
    "LemmaMeanings": ["parallel", "alongside", "similar", "corresponding"]
  },
  "costa": {
    "wordNumber": 421,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine singular",
    "meanings": ["coast", "shoreline", "seashore", "coastal region"],
    "bestTranslation": "coast",
    "lemma": "costa",
    "LemmaMeanings": ["coast", "shore", "seashore", "coastline", "coastal area"]
  },
  "norte": {
    "wordNumber": 422,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["north", "northern region", "northern direction"],
    "bestTranslation": "north",
    "lemma": "norte",
    "LemmaMeanings": ["north", "northern", "northward", "northern region"]
  },
  "bahía": {
    "wordNumber": 423,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine singular",
    "meanings": ["bay", "inlet", "cove", "harbor"],
    "bestTranslation": "bay",
    "lemma": "bahía",
    "LemmaMeanings": ["bay", "inlet", "cove", "gulf", "harbor area"]
  },
  "inútil": {
    "wordNumber": 424,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "invariable",
    "meanings": ["useless", "futile", "worthless", "ineffective"],
    "bestTranslation": "useless",
    "lemma": "inútil",
    "LemmaMeanings": ["useless", "futile", "worthless", "ineffective", "pointless"]
  },
  "eso": {
    "wordNumber": 425,
    "frequency": 1,
    "partOfSpeech": "PRONOUN",
    "morphology": "demonstrative, neuter",
    "meanings": ["that", "that thing", "that matter", "it"],
    "bestTranslation": "that",
    "lemma": "eso",
    "LemmaMeanings": ["that", "that thing", "that matter", "it", "that situation"]
  },
  "tarde": {
    "wordNumber": 426,
    "frequency": 1,
    "partOfSpeech": "NOUN/ADVERB",
    "morphology": "feminine singular/invariable",
    "meanings": ["afternoon", "evening", "late", "late time"],
    "bestTranslation": "afternoon/late",
    "lemma": "tarde",
    "LemmaMeanings": ["afternoon", "evening", "late", "late time of day"]
  },
  "dejaron": {
    "wordNumber": 427,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "preterite indicative, third person plural",
    "meanings": ["they left", "they abandoned", "they allowed", "they let"],
    "bestTranslation": "they left",
    "lemma": "dejar",
    "LemmaMeanings": ["to leave", "to let", "to allow", "to abandon", "to quit"]
  },
  "lo": {
    "wordNumber": 428,
    "frequency": 1,
    "partOfSpeech": "PRONOUN",
    "morphology": "personal, masculine singular",
    "meanings": ["it", "him", "that", "the thing"],
    "bestTranslation": "it",
    "lemma": "lo",
    "LemmaMeanings": ["it", "him", "that", "the thing", "direct object"]
  },
  "formaban": {
    "wordNumber": 429,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "imperfect indicative, third person plural",
    "meanings": ["they formed", "they made up", "they constituted", "they shaped"],
    "bestTranslation": "they formed",
    "lemma": "formar",
    "LemmaMeanings": ["to form", "to make up", "to constitute", "to shape", "to create"]
  },
  "unas": {
    "wordNumber": 430,
    "frequency": 1,
    "partOfSpeech": "DETERMINER/PRONOUN",
    "morphology": "feminine plural, indefinite",
    "meanings": ["some", "a few", "about", "approximately"],
    "bestTranslation": "some",
    "lemma": "uno",
    "LemmaMeanings": ["one", "a/an", "some", "approximately", "about"]
  },
  "veinte": {
    "wordNumber": 431,
    "frequency": 1,
    "partOfSpeech": "NUMERAL",
    "morphology": "invariable",
    "meanings": ["twenty", "20", "twentieth"],
    "bestTranslation": "twenty",
    "lemma": "veinte",
    "LemmaMeanings": ["twenty", "20", "twentieth", "score"]
  },
  "alineadas": {
    "wordNumber": 432,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE/PARTICIPLE",
    "morphology": "feminine plural",
    "meanings": ["aligned", "lined up", "arranged in line", "ordered"],
    "bestTranslation": "aligned",
    "lemma": "alinear",
    "LemmaMeanings": ["to align", "to line up", "to arrange in order", "to put in line"]
  },
  "calle": {
    "wordNumber": 433,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine singular",
    "meanings": ["street", "road", "thoroughfare", "way"],
    "bestTranslation": "street",
    "lemma": "calle",
    "LemmaMeanings": ["street", "road", "thoroughfare", "public way"]
  },
  "buscar": {
    "wordNumber": 434,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "infinitive",
    "meanings": ["to look for", "to search", "to seek", "to find"],
    "bestTranslation": "to look for",
    "lemma": "buscar",
    "LemmaMeanings": ["to look for", "to search", "to seek", "to find", "to try to find"]
  },
  "conocido": {
    "wordNumber": 435,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE/NOUN",
    "morphology": "masculine singular",
    "meanings": ["known", "familiar", "acquaintance", "well-known"],
    "bestTranslation": "known",
    "lemma": "conocer",
    "LemmaMeanings": ["to know", "to be acquainted with", "to be familiar with"]
  },
  "atraque": {
    "wordNumber": 436,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["docking", "mooring", "berthing", "tying up"],
    "bestTranslation": "docking",
    "lemma": "atraque",
    "LemmaMeanings": ["docking", "mooring", "berthing place", "act of docking"]
  },
  "encontré": {
    "wordNumber": 437,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "preterite indicative, first person singular",
    "meanings": ["I found", "I met", "I encountered", "I discovered"],
    "bestTranslation": "I found",
    "lemma": "encontrar",
    "LemmaMeanings": ["to find", "to meet", "to encounter", "to discover"]
  },
  "embarcaciones": {
    "wordNumber": 438,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine plural",
    "meanings": ["vessels", "boats", "ships", "watercraft"],
    "bestTranslation": "vessels",
    "lemma": "embarcación",
    "LemmaMeanings": ["vessel", "boat", "ship", "watercraft", "maritime vessel"]
  },
  "calado": {
    "wordNumber": 439,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["draft", "depth", "water depth", "draught"],
    "bestTranslation": "draft",
    "lemma": "calado",
    "LemmaMeanings": ["draft", "depth", "water depth", "draught of a vessel"]
  },
  "veía": {
    "wordNumber": 440,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "imperfect indicative, first/third person singular",
    "meanings": ["saw", "was seeing", "used to see", "could see"],
    "bestTranslation": "was seeing",
    "lemma": "ver",
    "LemmaMeanings": ["to see", "to view", "to watch", "to observe", "to look at"]
  },
  "ninguna": {
    "wordNumber": 441,
    "frequency": 1,
    "partOfSpeech": "DETERMINER/PRONOUN",
    "morphology": "feminine singular",
    "meanings": ["none", "not any", "no one", "not a single one"],
    "bestTranslation": "none",
    "lemma": "ninguno",
    "LemmaMeanings": ["none", "no one", "not any", "neither", "no such"]
  },
  "teniendo": {
    "wordNumber": 442,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "gerund",
    "meanings": ["having", "holding", "keeping", "possessing"],
    "bestTranslation": "having",
    "lemma": "tener",
    "LemmaMeanings": ["to have", "to hold", "to possess", "to keep", "to maintain"]
  },
  "hubiese": {
    "wordNumber": 443,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "imperfect subjunctive, first/third person singular",
    "meanings": ["had", "would have", "might have", "were to have"],
    "bestTranslation": "had",
    "lemma": "haber",
    "LemmaMeanings": ["to have (auxiliary)", "to exist", "to be (existential)"]
  },
  "zarpado": {
    "wordNumber": 444,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "past participle",
    "meanings": ["sailed", "set sail", "departed", "left port"],
    "bestTranslation": "sailed",
    "lemma": "zarpar",
    "LemmaMeanings": ["to sail", "to set sail", "to depart", "to leave port"]
  },
  "acerqué": {
    "wordNumber": 445,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "preterite indicative, first person singular",
    "meanings": ["I approached", "I came near", "I moved closer", "I drew near"],
    "bestTranslation": "I approached",
    "lemma": "acercar",
    "LemmaMeanings": ["to approach", "to bring near", "to move closer", "to draw near"]
  },
  "grupo": {
    "wordNumber": 446,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["group", "cluster", "gathering", "set"],
    "bestTranslation": "group",
    "lemma": "grupo",
    "LemmaMeanings": ["group", "cluster", "set", "gathering", "collection"]
  },
  "calafateaban": {
    "wordNumber": 447,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "imperfect indicative, third person plural",
    "meanings": ["they were caulking", "they caulked", "they were sealing"],
    "bestTranslation": "they were caulking",
    "lemma": "calafatear",
    "LemmaMeanings": ["to caulk", "to seal", "to waterproof", "to make watertight"]
  },
  "nave": {
    "wordNumber": 448,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine singular",
    "meanings": ["ship", "vessel", "craft", "boat"],
    "bestTranslation": "ship",
    "lemma": "nave",
    "LemmaMeanings": ["ship", "vessel", "craft", "boat", "spacecraft"]
  },
  "quién": {
    "wordNumber": 449,
    "frequency": 1,
    "partOfSpeech": "PRONOUN",
    "morphology": "interrogative",
    "meanings": ["who", "whom", "which person", "what person"],
    "bestTranslation": "who",
    "lemma": "quién",
    "LemmaMeanings": ["who", "whom", "which person", "what person"]
  },
  "dice": {
    "wordNumber": 450,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "present indicative, third person singular",
    "meanings": ["says", "tells", "speaks", "states"],
    "bestTranslation": "says",
    "lemma": "decir",
    "LemmaMeanings": ["to say", "to tell", "to speak", "to state", "to express"]
  },
  "busca": {
    "wordNumber": 451,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "present indicative, third person singular",
    "meanings": ["searches", "looks for", "seeks", "tries to find"],
    "bestTranslation": "searches",
    "lemma": "buscar",
    "LemmaMeanings": ["to look for", "to search", "to seek", "to find", "to try to find"]
  },
  "chiporrito": {
    "wordNumber": 452,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["small boat", "little vessel", "small craft"],
    "bestTranslation": "small boat",
    "lemma": "chiporrito",
    "LemmaMeanings": ["small boat", "little vessel", "small watercraft"]
  },
  "don": {
    "wordNumber": 453,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular, title",
    "meanings": ["Mr.", "Sir", "Don (Spanish title of respect)"],
    "bestTranslation": "Don",
    "lemma": "don",
    "LemmaMeanings": ["title of respect", "mister", "sir", "gentleman"]
  },
  "dijeron": {
    "wordNumber": 454,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "preterite indicative, third person plural",
    "meanings": ["they said", "they told", "they spoke", "they stated"],
    "bestTranslation": "they said",
    "lemma": "decir",
    "LemmaMeanings": ["to say", "to tell", "to speak", "to state", "to express"]
  },
  "reparaciones": {
    "wordNumber": 455,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine plural",
    "meanings": ["repairs", "fixes", "maintenance work", "restoration"],
    "bestTranslation": "repairs",
    "lemma": "reparación",
    "LemmaMeanings": ["repair", "fix", "maintenance", "restoration", "mending"]
  },
  "ah": {
    "wordNumber": 456,
    "frequency": 1,
    "partOfSpeech": "INTERJECTION",
    "morphology": "invariable",
    "meanings": ["ah", "oh", "aha", "I see"],
    "bestTranslation": "ah",
    "lemma": "ah",
    "LemmaMeanings": ["ah", "oh", "expression of understanding", "expression of surprise"]
  },
  "salieron": {
    "wordNumber": 457,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "preterite indicative, third person plural",
    "meanings": ["they left", "they went out", "they departed", "they exited"],
    "bestTranslation": "they left",
    "lemma": "salir",
    "LemmaMeanings": ["to leave", "to go out", "to exit", "to depart"]
  },
  "dar": {
    "wordNumber": 458,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "infinitive",
    "meanings": ["to give", "to provide", "to offer", "to grant"],
    "bestTranslation": "to give",
    "lemma": "dar",
    "LemmaMeanings": ["to give", "to provide", "to offer", "to grant", "to present"]
  },
  "vuelta": {
    "wordNumber": 459,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine singular",
    "meanings": ["turn", "spin", "rotation", "lap"],
    "bestTranslation": "turn",
    "lemma": "vuelta",
    "LemmaMeanings": ["turn", "return", "spin", "rotation", "round"]
  },
  "prueba": {
    "wordNumber": 460,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine singular",
    "meanings": ["test", "trial", "proof", "evidence"],
    "bestTranslation": "test",
    "lemma": "prueba",
    "LemmaMeanings": ["test", "proof", "trial", "evidence", "demonstration"]
  },
  "ya": {
    "wordNumber": 461,
    "frequency": 1,
    "partOfSpeech": "ADVERB",
    "morphology": "invariable",
    "meanings": ["already", "now", "right away", "immediately"],
    "bestTranslation": "already",
    "lemma": "ya",
    "LemmaMeanings": ["already", "now", "immediately", "at once", "right away"]
  },
  "estarán": {
    "wordNumber": 462,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "future indicative, third person plural",
    "meanings": ["they will be", "they shall be", "they will exist"],
    "bestTranslation": "they will be",
    "lemma": "estar",
    "LemmaMeanings": ["to be", "to exist", "to stay", "to remain"]
  },
  "vuelven": {
    "wordNumber": 463,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "present indicative, third person plural",
    "meanings": ["they return", "they come back", "they turn", "they go back"],
    "bestTranslation": "they return",
    "lemma": "volver",
    "LemmaMeanings": ["to return", "to come back", "to turn", "to go back"]
  },
  "dijo": {
    "wordNumber": 464,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "preterite indicative, third person singular",
    "meanings": ["said", "told", "spoke", "stated"],
    "bestTranslation": "said",
    "lemma": "decir",
    "LemmaMeanings": ["to say", "to tell", "to speak", "to state", "to express"]
  },
  "uno": {
    "wordNumber": 465,
    "frequency": 1,
    "partOfSpeech": "PRONOUN/NUMERAL",
    "morphology": "masculine singular",
    "meanings": ["one", "someone", "a person", "one person"],
    "bestTranslation": "one",
    "lemma": "uno",
    "LemmaMeanings": ["one", "single", "someone", "a person"]
  },
  "todos": {
    "wordNumber": 466,
    "frequency": 1,
    "partOfSpeech": "PRONOUN/ADJECTIVE",
    "morphology": "masculine plural",
    "meanings": ["all", "everyone", "everybody", "all of them"],
    "bestTranslation": "all",
    "lemma": "todo",
    "LemmaMeanings": ["all", "every", "whole", "entire", "complete"]
  },
  "reanudaron": {
    "wordNumber": 467,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "preterite indicative, third person plural",
    "meanings": ["they resumed", "they restarted", "they continued", "they began again"],
    "bestTranslation": "they resumed",
    "lemma": "reanudar",
    "LemmaMeanings": ["to resume", "to restart", "to continue", "to begin again"]
  },
  "calafate": {
    "wordNumber": 468,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["caulker", "ship caulker", "boat maintenance worker"],
    "bestTranslation": "caulker",
    "lemma": "calafate",
    "LemmaMeanings": ["caulker", "ship maintenance worker", "boat repair specialist"]
  },
  "permanecer": {
    "wordNumber": 469,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "infinitive",
    "meanings": ["to remain", "to stay", "to continue", "to persist"],
    "bestTranslation": "to remain",
    "lemma": "permanecer",
    "LemmaMeanings": ["to remain", "to stay", "to continue", "to persist", "to endure"]
  },
  "molestaban": {
    "wordNumber": 470,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "imperfect indicative, third person plural",
    "meanings": ["they bothered", "they annoyed", "they disturbed", "they troubled"],
    "bestTranslation": "they bothered",
    "lemma": "molestar",
    "LemmaMeanings": ["to bother", "to annoy", "to disturb", "to trouble"]
  },
  "miradas": {
    "wordNumber": 471,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine plural",
    "meanings": ["looks", "glances", "gazes", "stares"],
    "bestTranslation": "looks",
    "lemma": "mirada",
    "LemmaMeanings": ["look", "glance", "gaze", "stare", "glare"]
  },
  "divertidas": {
    "wordNumber": 472,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "feminine plural",
    "meanings": ["fun", "amusing", "entertaining", "enjoyable"],
    "bestTranslation": "amusing",
    "lemma": "divertido",
    "LemmaMeanings": ["fun", "amusing", "entertaining", "enjoyable", "pleasant"]
  },
  "hambre": {
    "wordNumber": 473,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine singular",
    "meanings": ["hunger", "appetite", "starvation", "desire for food"],
    "bestTranslation": "hunger",
    "lemma": "hambre",
    "LemmaMeanings": ["hunger", "appetite", "starvation", "food craving"]
  },
  "caminé": {
    "wordNumber": 474,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "preterite indicative, first person singular",
    "meanings": ["I walked", "I strolled", "I went on foot", "I moved"],
    "bestTranslation": "I walked",
    "lemma": "caminar",
    "LemmaMeanings": ["to walk", "to stroll", "to go on foot", "to move"]
  },
  "entre": {
    "wordNumber": 475,
    "frequency": 1,
    "partOfSpeech": "PREPOSITION",
    "morphology": "invariable",
    "meanings": ["between", "among", "amid", "in between"],
    "bestTranslation": "between",
    "lemma": "entre",
    "LemmaMeanings": ["between", "among", "amid", "amongst", "in the middle of"]
  },
  "doble": {
    "wordNumber": 476,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "invariable",
    "meanings": ["double", "dual", "twofold", "twice"],
    "bestTranslation": "double",
    "lemma": "doble",
    "LemmaMeanings": ["double", "dual", "twofold", "duplicate"]
  },
  "fila": {
    "wordNumber": 477,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine singular",
    "meanings": ["row", "line", "queue", "file"],
    "bestTranslation": "row",
    "lemma": "fila",
    "LemmaMeanings": ["row", "line", "queue", "file", "rank"]
  },
  "madera": {
    "wordNumber": 478,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine singular",
    "meanings": ["wood", "timber", "lumber", "wooden material"],
    "bestTranslation": "wood",
    "lemma": "madera",
    "LemmaMeanings": ["wood", "timber", "lumber", "wooden material"]
  },
  "buscando": {
    "wordNumber": 479,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "gerund",
    "meanings": ["looking for", "searching", "seeking", "trying to find"],
    "bestTranslation": "looking for",
    "lemma": "buscar",
    "LemmaMeanings": ["to look for", "to search", "to seek", "to try to find"]
  },
  "almacén": {
    "wordNumber": 480,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["store", "warehouse", "shop", "storage facility"],
    "bestTranslation": "store",
    "lemma": "almacén",
    "LemmaMeanings": ["store", "warehouse", "shop", "storage place"]
  },
  "pronto": {
    "wordNumber": 481,
    "frequency": 1,
    "partOfSpeech": "ADVERB",
    "morphology": "invariable",
    "meanings": ["soon", "quickly", "shortly", "promptly"],
    "bestTranslation": "soon",
    "lemma": "pronto",
    "LemmaMeanings": ["soon", "early", "quick", "prompt", "fast"]
  },
  "pasar": {
    "wordNumber": 482,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "infinitive",
    "meanings": ["to pass", "to go by", "to cross", "to move through"],
    "bestTranslation": "to pass",
    "lemma": "pasar",
    "LemmaMeanings": ["to pass", "to go by", "to cross", "to spend time"]
  },
  "puerta": {
    "wordNumber": 483,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine singular",
    "meanings": ["door", "gate", "entrance", "doorway"],
    "bestTranslation": "door",
    "lemma": "puerta",
    "LemmaMeanings": ["door", "gate", "entrance", "portal"]
  },
  "abierta": {
    "wordNumber": 484,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "feminine singular",
    "meanings": ["open", "opened", "unlocked", "accessible"],
    "bestTranslation": "open",
    "lemma": "abierto",
    "LemmaMeanings": ["open", "opened", "unlocked", "accessible"]
  },
  "irresistible": {
    "wordNumber": 485,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "invariable",
    "meanings": ["irresistible", "compelling", "overwhelming", "unavoidable"],
    "bestTranslation": "irresistible",
    "lemma": "irresistible",
    "LemmaMeanings": ["irresistible", "compelling", "overwhelming", "unavoidable"]
  },
  "cebollas": {
    "wordNumber": 486,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine plural",
    "meanings": ["onions", "bulbs", "alliums"],
    "bestTranslation": "onions",
    "lemma": "cebolla",
    "LemmaMeanings": ["onion", "bulb", "allium"]
  },
  "fritas": {
    "wordNumber": 487,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "feminine plural",
    "meanings": ["fried", "deep-fried", "sautéed"],
    "bestTranslation": "fried",
    "lemma": "frito",
    "LemmaMeanings": ["fried", "deep-fried", "cooked in oil"]
  },
  "alcé": {
    "wordNumber": 488,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "preterite indicative, first person singular",
    "meanings": ["I raised", "I lifted", "I elevated", "I picked up"],
    "bestTranslation": "I raised",
    "lemma": "alzar",
    "LemmaMeanings": ["to raise", "to lift", "to elevate", "to pick up"]
  },
  "cabeza": {
    "wordNumber": 489,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine singular",
    "meanings": ["head", "skull", "mind", "leader"],
    "bestTranslation": "head",
    "lemma": "cabeza",
    "LemmaMeanings": ["head", "mind", "leader", "chief", "top"]
  },
  "vi": {
    "wordNumber": 490,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "preterite indicative, first person singular",
    "meanings": ["I saw", "I watched", "I observed", "I noticed"],
    "bestTranslation": "I saw",
    "lemma": "ver",
    "LemmaMeanings": ["to see", "to watch", "to observe", "to look at"]
  },
  "letrero": {
    "wordNumber": 491,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["sign", "signboard", "notice", "placard"],
    "bestTranslation": "sign",
    "lemma": "letrero",
    "LemmaMeanings": ["sign", "signboard", "notice", "billboard"]
  },
  "pintado": {
    "wordNumber": 492,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE/PARTICIPLE",
    "morphology": "masculine singular",
    "meanings": ["painted", "colored", "decorated", "drawn"],
    "bestTranslation": "painted",
    "lemma": "pintar",
    "LemmaMeanings": ["to paint", "to color", "to draw", "to decorate"]
  },
  "sobre": {
    "wordNumber": 493,
    "frequency": 1,
    "partOfSpeech": "PREPOSITION",
    "morphology": "invariable",
    "meanings": ["on", "over", "about", "concerning"],
    "bestTranslation": "on",
    "lemma": "sobre",
    "LemmaMeanings": ["on", "over", "about", "concerning", "regarding"]
  },
  "tabla": {
    "wordNumber": 494,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine singular",
    "meanings": ["board", "plank", "table", "chart"],
    "bestTranslation": "board",
    "lemma": "tabla",
    "LemmaMeanings": ["board", "plank", "table", "chart", "panel"]
  },
  "pensión": {
    "wordNumber": 495,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine singular",
    "meanings": ["boarding house", "pension", "guesthouse", "lodging"],
    "bestTranslation": "boarding house",
    "lemma": "pensión",
    "LemmaMeanings": ["boarding house", "pension", "guesthouse", "lodging house"]
  },
  "fueguina": {
    "wordNumber": 496,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "feminine singular",
    "meanings": ["from Tierra del Fuego", "relating to Tierra del Fuego", "Fuegian"],
    "bestTranslation": "Fuegian",
    "lemma": "fueguino",
    "LemmaMeanings": ["from Tierra del Fuego", "Fuegian", "relating to Tierra del Fuego"]
  },
  "terminó": {
    "wordNumber": 497,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "preterite indicative, third person singular",
    "meanings": ["ended", "finished", "completed", "concluded"],
    "bestTranslation": "ended",
    "lemma": "terminar",
    "LemmaMeanings": ["to end", "to finish", "to complete", "to conclude"]
  },
  "empujarme": {
    "wordNumber": 498,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "infinitive with reflexive pronoun",
    "meanings": ["to push myself", "to drive myself", "to force myself"],
    "bestTranslation": "to push myself",
    "lemma": "empujar",
    "LemmaMeanings": ["to push", "to shove", "to drive", "to force"]
  },
  "entraba": {
    "wordNumber": 499,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "imperfect indicative, third person singular",
    "meanings": ["was entering", "used to enter", "would enter", "entered"],
    "bestTranslation": "was entering",
    "lemma": "entrar",
    "LemmaMeanings": ["to enter", "to go in", "to come in", "to get in"]
  },
  "restaurante": {
    "wordNumber": 500,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["restaurant", "dining establishment", "eatery", "dining place"],
    "bestTranslation": "restaurant",
    "lemma": "restaurante",
    "LemmaMeanings": ["restaurant", "dining establishment", "place to eat", "eating venue"]
  },
  "vacío": {
    "wordNumber": 501,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "masculine singular",
    "meanings": ["empty", "vacant", "void", "deserted"],
    "bestTranslation": "empty",
    "lemma": "vacío",
    "LemmaMeanings": ["empty", "vacant", "void", "hollow", "unoccupied"]
  },
  "ningún": {
    "wordNumber": 502,
    "frequency": 1,
    "partOfSpeech": "DETERMINER",
    "morphology": "masculine singular",
    "meanings": ["no", "not any", "not a single", "none"],
    "bestTranslation": "no",
    "lemma": "ninguno",
    "LemmaMeanings": ["no", "none", "not any", "not a single one"]
  },
  "parroquiano": {
    "wordNumber": 503,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["regular customer", "patron", "frequent visitor", "regular client"],
    "bestTranslation": "regular customer",
    "lemma": "parroquiano",
    "LemmaMeanings": ["regular customer", "patron", "client", "habitual visitor"]
  },
  "ocupaba": {
    "wordNumber": 504,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "imperfect indicative, third person singular",
    "meanings": ["was occupying", "occupied", "was taking up", "was filling"],
    "bestTranslation": "was occupying",
    "lemma": "ocupar",
    "LemmaMeanings": ["to occupy", "to take up", "to fill", "to hold"]
  },
  "ordenadas": {
    "wordNumber": 505,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "feminine plural",
    "meanings": ["ordered", "arranged", "organized", "neat"],
    "bestTranslation": "ordered",
    "lemma": "ordenado",
    "LemmaMeanings": ["ordered", "arranged", "organized", "systematic", "tidy"]
  },
  "dos": {
    "wordNumber": 506,
    "frequency": 1,
    "partOfSpeech": "NUMERAL",
    "morphology": "invariable",
    "meanings": ["two", "2", "second", "pair"],
    "bestTranslation": "two",
    "lemma": "dos",
    "LemmaMeanings": ["two", "2", "second", "pair", "couple"]
  },
  "filas": {
    "wordNumber": 507,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine plural",
    "meanings": ["rows", "lines", "queues", "ranks"],
    "bestTranslation": "rows",
    "lemma": "fila",
    "LemmaMeanings": ["row", "line", "queue", "rank", "formation"]
  },
  "mesón": {
    "wordNumber": 508,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["counter", "bar", "tavern", "inn"],
    "bestTranslation": "counter",
    "lemma": "mesón",
    "LemmaMeanings": ["counter", "bar", "tavern", "inn", "large table"]
  },
  "adornado": {
    "wordNumber": 509,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE/PARTICIPLE",
    "morphology": "masculine singular",
    "meanings": ["decorated", "adorned", "embellished", "ornamented"],
    "bestTranslation": "decorated",
    "lemma": "adornar",
    "LemmaMeanings": ["to decorate", "to adorn", "to embellish", "to ornament"]
  },
  "lámparas": {
    "wordNumber": 510,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine plural",
    "meanings": ["lamps", "lights", "lighting fixtures", "lanterns"],
    "bestTranslation": "lamps",
    "lemma": "lámpara",
    "LemmaMeanings": ["lamp", "light", "lighting fixture", "luminaire"]
  },
  "aceite": {
    "wordNumber": 511,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["oil", "cooking oil", "lubricant", "grease"],
    "bestTranslation": "oil",
    "lemma": "aceite",
    "LemmaMeanings": ["oil", "cooking oil", "lubricant", "oily substance"]
  },
  "flores": {
    "wordNumber": 512,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "feminine plural",
    "meanings": ["flowers", "blossoms", "blooms", "florals"],
    "bestTranslation": "flowers",
    "lemma": "flor",
    "LemmaMeanings": ["flower", "blossom", "bloom", "flowering plant"]
  },
  "artificiales": {
    "wordNumber": 513,
    "frequency": 1,
    "partOfSpeech": "ADJECTIVE",
    "morphology": "plural",
    "meanings": ["artificial", "synthetic", "man-made", "fake"],
    "bestTranslation": "artificial",
    "lemma": "artificial",
    "LemmaMeanings": ["artificial", "synthetic", "man-made", "not natural"]
  },
  "tomé": {
    "wordNumber": 514,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "preterite indicative, first person singular",
    "meanings": ["I took", "I had", "I grabbed", "I consumed"],
    "bestTranslation": "I took",
    "lemma": "tomar",
    "LemmaMeanings": ["to take", "to have", "to grab", "to consume"]
  },
  "asiento": {
    "wordNumber": 515,
    "frequency": 1,
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["seat", "chair", "place to sit", "sitting place"],
    "bestTranslation": "seat",
    "lemma": "asiento",
    "LemmaMeanings": ["seat", "chair", "sitting place", "place to sit"]
  },
  "esperé": {
    "wordNumber": 516,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "preterite indicative, first person singular",
    "meanings": ["I waited", "I waited for", "I expected", "I hoped"],
    "bestTranslation": "I waited",
    "lemma": "esperar",
    "LemmaMeanings": ["to wait", "to expect", "to hope", "to await"]
  },
  "atendieran": {
    "wordNumber": 517,
    "frequency": 1,
    "partOfSpeech": "VERB",
    "morphology": "imperfect subjunctive, third person plural",
    "meanings": ["they would attend to", "they would serve", "they would assist", "they would help"],
    "bestTranslation": "they would attend to",
    "lemma": "atender",
    "LemmaMeanings": ["to attend to", "to serve", "to assist", "to pay attention to"]
  }
};

export default mundoCDatabase_filtered;
