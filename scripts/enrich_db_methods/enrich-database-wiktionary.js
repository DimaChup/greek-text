#!/usr/bin/env node

/**
 * Wiktionary-Based Database Enrichment
 * 
 * This script uses Wiktionary scraping and rule-based analysis
 * to enrich a skeleton database file with linguistic information.
 * 
 * Usage: node enrich-database-wiktionary.js --input path/to/input_db.js --output path/to/output_db.js
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const franc = require('franc');
const { program } = require('commander');
const ProgressBar = require('progress');
const pLimit = require('p-limit');

// Configure command line options
program
  .option('-i, --input <path>', 'Path to the input database file')
  .option('-o, --output <path>', 'Path to the output enriched database file')
  .option('-l, --language <code>', 'Force specific language code (ISO 639-1)')
  .option('-c, --concurrency <number>', 'Maximum number of concurrent requests', parseInt, 3)
  .option('-t, --timeout <ms>', 'Timeout for requests in milliseconds', parseInt, 10000)
  .option('--max-retries <number>', 'Maximum number of retries for failed requests', parseInt, 2)
  .parse(process.argv);

const options = program.opts();

if (!options.input) {
  console.error('Error: Input file path is required');
  program.help();
  process.exit(1);
}

// Language mappings
const francToWiktionary = {
  'spa': 'es',
  'eng': 'en',
  'fra': 'fr',
  'deu': 'de',
  'ita': 'it',
  'por': 'pt',
  'rus': 'ru',
  'grc': 'grc',
  'lat': 'la',
  // Add more mappings as needed
};

const languageNames = {
  'es': 'Spanish',
  'en': 'English',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'grc': 'Ancient Greek',
  'la': 'Latin',
  // Add more language names as needed
};

// Standardized part of speech mapping
const posMapping = {
  'noun': 'NOUN',
  'verb': 'VERB',
  'adjective': 'ADJECTIVE',
  'adverb': 'ADVERB',
  'pronoun': 'PRONOUN',
  'preposition': 'PREPOSITION',
  'conjunction': 'CONJUNCTION',
  'interjection': 'INTERJECTION',
  'determiner': 'DETERMINER',
  'article': 'ARTICLE',
  'numeral': 'NUMERAL',
  // Add language-specific mappings
  'sustantivo': 'NOUN',
  'verbo': 'VERB',
  'adjetivo': 'ADJECTIVE',
  'adverbio': 'ADVERB',
  'pronombre': 'PRONOUN',
  'preposición': 'PREPOSITION',
  'conjunción': 'CONJUNCTION',
  'interjección': 'INTERJECTION',
  'artículo': 'ARTICLE',
  // Add more mappings for other languages
};

async function main() {
  try {
    // Read the input database file
    const inputFilePath = path.resolve(options.input);
    const databaseCode = fs.readFileSync(inputFilePath, 'utf8');
    
    // Extract the database object
    const databaseName = path.basename(inputFilePath, '.js').replace(/_db$/, '');
    const variableName = databaseName.replace(/[^a-zA-Z0-9]/g, '') + 'Database';
    
    console.log(`Processing database: ${databaseName}`);
    
    // Extract the database object using Function constructor
    let database;
    try {
      const extractFunc = new Function(`
        ${databaseCode}
        return ${variableName};
      `);
      database = extractFunc();
    } catch (error) {
      console.error(`Error extracting database from file: ${error.message}`);
      // Try a generic object pattern extraction as fallback
      const matchResult = databaseCode.match(/const\s+\w+\s*=\s*(\{[\s\S]+\})/);
      if (matchResult && matchResult[1]) {
        try {
          database = new Function(`return ${matchResult[1]}`)();
        } catch (evalError) {
          throw new Error(`Failed to parse database: ${evalError.message}`);
        }
      } else {
        throw new Error('Could not extract database object from file');
      }
    }
    
    // Detect language if not specified
    let langCode = options.language;
    if (!langCode) {
      const detectedLang = await detectLanguage(database);
      langCode = francToWiktionary[detectedLang] || detectedLang;
      console.log(`Detected language: ${languageNames[langCode] || langCode} (${langCode})`);
    } else {
      console.log(`Using specified language: ${languageNames[langCode] || langCode} (${langCode})`);
    }
    
    // Create a concurrency limiter
    const limit = pLimit(options.concurrency);
    
    // Process the database
    const enrichedDatabase = await enrichDatabase(database, langCode, limit);
    
    // Format and save the enriched database
    const outputFilePath = options.output || inputFilePath.replace('.js', '_enriched.js');
    const outputCode = formatDatabaseCode(enrichedDatabase, databaseName, langCode);
    fs.writeFileSync(outputFilePath, outputCode, 'utf8');
    
    console.log(`Enriched database saved to: ${outputFilePath}`);
    console.log(`Total words processed: ${Object.keys(enrichedDatabase).length}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

async function detectLanguage(database) {
  // Extract a sample of words from the database for language detection
  const words = Object.keys(database);
  const sampleWords = words.slice(0, Math.min(words.length, 20)).join(' ');
  
  // Use franc for language detection
  const detectedLanguages = franc.all(sampleWords);
  const primaryLanguage = detectedLanguages[0][0];
  
  console.log('Language detection results:');
  detectedLanguages.slice(0, 3).forEach(([code, score]) => {
    console.log(`- ${languageNames[francToWiktionary[code]] || code}: ${Math.round(score * 100)}% confidence`);
  });
  
  return primaryLanguage;
}

async function enrichDatabase(database, langCode, limit) {
  const enrichedDatabase = {};
  const words = Object.keys(database);
  const totalWords = words.length;
  
  console.log(`Enriching ${totalWords} words with Wiktionary data...`);
  const progressBar = new ProgressBar('[:bar] :current/:total words processed (:percent) - ETA: :etas', {
    total: totalWords,
    width: 30
  });
  
  // Prepare the promises for each word
  const promises = words.map(word => limit(() => enrichWord(word, database[word], langCode)
    .then(enrichedData => {
      enrichedDatabase[word] = {
        ...database[word],
        ...enrichedData
      };
      progressBar.tick();
      return true;
    })
    .catch(error => {
      console.warn(`Warning: Could not enrich word "${word}": ${error.message}`);
      enrichedDatabase[word] = {
        ...database[word],
        partOfSpeech: database[word].partOfSpeech || 'UNKNOWN',
        morphology: database[word].morphology || 'invariable',
        meanings: database[word].meanings || [word],
        bestTranslation: database[word].bestTranslation || word,
        lemma: database[word].lemma || word,
        LemmaMeanings: database[word].LemmaMeanings || [word]
      };
      progressBar.tick();
      return false;
    })
  ));
  
  // Wait for all promises to resolve
  await Promise.all(promises);
  
  return enrichedDatabase;
}

async function enrichWord(word, wordData, langCode) {
  // Skip words that already have complete data
  if (wordData.partOfSpeech && wordData.morphology && 
      wordData.meanings && wordData.meanings.length > 0 &&
      wordData.lemma && wordData.LemmaMeanings && wordData.LemmaMeanings.length > 0) {
    return wordData;
  }
  
  // Try to fetch data from Wiktionary
  const wiktionaryData = await fetchWiktionaryData(word, langCode);
  
  // If we got data from Wiktionary, use it
  if (wiktionaryData) {
    return {
      partOfSpeech: wiktionaryData.partOfSpeech || wordData.partOfSpeech || 'UNKNOWN',
      morphology: wiktionaryData.morphology || wordData.morphology || 'invariable',
      meanings: wiktionaryData.meanings || wordData.meanings || [word],
      bestTranslation: wiktionaryData.bestTranslation || wordData.bestTranslation || word,
      lemma: wiktionaryData.lemma || wordData.lemma || word,
      LemmaMeanings: wiktionaryData.LemmaMeanings || wordData.LemmaMeanings || [word]
    };
  }
  
  // If we couldn't get data from Wiktionary, use rule-based analysis
  return analyzeWordRules(word, langCode);
}

async function fetchWiktionaryData(word, langCode) {
  try {
    // Define the Wiktionary URL
    const url = `https://${langCode}.wiktionary.org/wiki/${encodeURIComponent(word)}`;
    
    // Make a request to Wiktionary
    const response = await axios.get(url, {
      timeout: options.timeout,
      headers: {
        'User-Agent': 'Language Database Enrichment Script/1.0'
      }
    });
    
    // Parse the HTML
    const $ = cheerio.load(response.data);
    
    // Extract language section - find the section for our target language
    const languageSections = {};
    $('h2 .mw-headline').each(function() {
      const langName = $(this).text().trim();
      const langSection = $(this).parent().nextUntil('h2');
      languageSections[langName] = langSection;
    });
    
    // Get the section for our language (or English if we can't find it)
    const targetLangName = languageNames[langCode] || langCode;
    let targetSection = languageSections[targetLangName] || languageSections['English'] || $('body');
    
    // Extract part of speech
    let partOfSpeech = null;
    targetSection.find('h3 .mw-headline, h4 .mw-headline').each(function() {
      const headingText = $(this).text().trim().toLowerCase();
      for (const [pos, standardPos] of Object.entries(posMapping)) {
        if (headingText.includes(pos)) {
          partOfSpeech = standardPos;
          break;
        }
      }
    });
    
    // Extract morphology
    const morphologyPatterns = {
      'NOUN': /(?:masculine|feminine|neuter|plural|singular|count|mass)/i,
      'VERB': /(?:infinitive|participle|gerund|tense|person|conjugation)/i,
      'ADJECTIVE': /(?:comparative|superlative|positive|form)/i
    };
    
    let morphology = 'invariable';
    if (partOfSpeech && morphologyPatterns[partOfSpeech]) {
      const pattern = morphologyPatterns[partOfSpeech];
      targetSection.find('p, li').each(function() {
        const text = $(this).text();
        const match = text.match(pattern);
        if (match) {
          morphology = match[0].toLowerCase();
          return false; // Break the loop
        }
      });
    }
    
    // Extract definitions/meanings
    const meanings = [];
    targetSection.find('ol > li').each(function() {
      const definition = $(this).text().trim()
        .replace(/\([^)]*\)/g, '') // Remove parenthetical text
        .replace(/\s+/g, ' ')      // Normalize whitespace
        .trim();
      
      if (definition && !definition.match(/^(synonyms|antonyms|examples):$/i)) {
        meanings.push(definition);
      }
    });
    
    // Extract lemma information
    let lemma = word;
    let lemmaMeanings = [...meanings];
    
    // Many wiktionary pages have "form of X" in definitions
    const formOfPattern = /(?:form|tense|participle|conjugation) of\s+['"]?([^'".,;:]+)['"]?/i;
    for (const meaning of meanings) {
      const match = meaning.match(formOfPattern);
      if (match && match[1]) {
        lemma = match[1].trim();
        break;
      }
    }
    
    // If the lemma is different from the word, try to get lemma meanings
    if (lemma !== word) {
      try {
        const lemmaData = await fetchWiktionaryData(lemma, langCode);
        if (lemmaData && lemmaData.meanings && lemmaData.meanings.length > 0) {
          lemmaMeanings = lemmaData.meanings;
        }
      } catch (error) {
        // If we can't get lemma data, just use the original meanings
      }
    }
    
    // Compile the results
    return {
      partOfSpeech: partOfSpeech || 'UNKNOWN',
      morphology: morphology,
      meanings: meanings.length > 0 ? meanings.slice(0, 5) : [word],
      bestTranslation: meanings.length > 0 ? meanings[0] : word,
      lemma: lemma,
      LemmaMeanings: lemmaMeanings.length > 0 ? lemmaMeanings.slice(0, 5) : [lemma]
    };
    
  } catch (error) {
    // If it's a 404, the word wasn't found in Wiktionary
    if (error.response && error.response.status === 404) {
      throw new Error(`Word not found in Wiktionary: ${word}`);
    }
    throw error;
  }
}

function analyzeWordRules(word, langCode) {
  // Analyze the word using language-specific rules
  // This is a fallback when Wiktionary lookup fails
  
  let partOfSpeech = 'UNKNOWN';
  let morphology = 'invariable';
  let meanings = [word];
  let lemma = word;
  
  // Language-specific rules
  switch (langCode) {
    case 'es': // Spanish
      if (word.match(/^(el|la|los|las|un|una|unos|unas)$/i)) {
        partOfSpeech = 'ARTICLE';
      } else if (word.match(/^(y|e|o|u|ni|pero|sino|aunque)$/i)) {
        partOfSpeech = 'CONJUNCTION';
      } else if (word.match(/^(a|ante|bajo|con|contra|de|desde|en|entre|hacia|hasta|para|por|según|sin|sobre|tras)$/i)) {
        partOfSpeech = 'PREPOSITION';
      } else if (word.match(/mente$/i)) {
        partOfSpeech = 'ADVERB';
      } else if (word.match(/[aeiou]r$/i)) {
        partOfSpeech = 'VERB';
        morphology = 'infinitive';
        // Remove the -ar/-er/-ir ending to get the stem
        lemma = word;
      } else if (word.match(/[oae]s$/i)) {
        partOfSpeech = 'NOUN';
        morphology = 'plural';
        // Remove the -s ending to get singular form
        lemma = word.replace(/s$/, '');
      } else if (word.match(/[oa]$/i)) {
        partOfSpeech = 'NOUN';
        morphology = word.match(/o$/) ? 'masculine singular' : 'feminine singular';
      }
      break;
      
    case 'en': // English
      if (word.match(/^(a|an|the)$/i)) {
        partOfSpeech = 'ARTICLE';
      } else if (word.match(/^(and|or|but|yet|so|for|nor)$/i)) {
        partOfSpeech = 'CONJUNCTION';
      } else if (word.match(/^(in|on|at|to|for|with|by|about|under|over)$/i)) {
        partOfSpeech = 'PREPOSITION';
      } else if (word.match(/ly$/i)) {
        partOfSpeech = 'ADVERB';
      } else if (word.match(/ing$/i)) {
        partOfSpeech = 'VERB';
        morphology = 'present participle';
        // Try to get the base form by removing -ing
        // (This is oversimplified and doesn't handle spelling changes)
        lemma = word.replace(/ing$/, '');
      } else if (word.match(/ed$/i)) {
        partOfSpeech = 'VERB';
        morphology = 'past tense/participle';
        // Try to get the base form by removing -ed
        lemma = word.replace(/ed$/, '');
      } else if (word.match(/s$/i) && !word.match(/ss$/i)) {
        // Might be a plural noun or third-person verb
        partOfSpeech = 'NOUN';
        morphology = 'plural';
        lemma = word.replace(/s$/, '');
      }
      break;
      
    // Add more languages as needed
  }
  
  return {
    partOfSpeech,
    morphology,
    meanings,
    bestTranslation: word,
    lemma,
    LemmaMeanings: [lemma]
  };
}

function formatDatabaseCode(database, databaseName, langCode) {
  const variableName = databaseName.replace(/[^a-zA-Z0-9]/g, '') + 'Database';
  
  // Format the database as nicely indented JavaScript
  const databaseJson = JSON.stringify(database, null, 2)
    .replace(/"([^"]+)":/g, '$1:') // Remove quotes from property names
    .replace(/"/g, "'");          // Replace double quotes with single quotes
  
  return `// Enriched word frequency database for ${databaseName}
// Language: ${languageNames[langCode] || langCode}
// Generated on: ${new Date().toISOString()}
const ${variableName} = ${databaseJson};

module.exports = ${variableName};
`;
}

// Run the script
main(); 