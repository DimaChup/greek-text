#!/usr/bin/env node

/**
 * Dictionary-Based Database Enrichment
 * 
 * This script takes a skeleton database file and enriches it with linguistic information
 * using language detection and dictionary APIs.
 * 
 * Usage: node enrich-database-dictionary.js --input path/to/input_db.js --output path/to/output_db.js
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const franc = require('franc');
const { program } = require('commander');

// Configure command line options
program
  .option('-i, --input <path>', 'Path to the input database file')
  .option('-o, --output <path>', 'Path to the output enriched database file')
  .option('-l, --language <code>', 'Force specific language code (ISO 639-1)')
  .option('-p, --api-key <key>', 'API key for dictionary services')
  .option('--sample-size <number>', 'Number of words to sample for language detection', parseInt, 20)
  .parse(process.argv);

const options = program.opts();

if (!options.input) {
  console.error('Error: Input file path is required');
  program.help();
  process.exit(1);
}

// Language code to full name mapping
const languageNames = {
  'spa': 'Spanish',
  'eng': 'English',
  'fra': 'French',
  'deu': 'German',
  'ita': 'Italian',
  'por': 'Portuguese',
  'rus': 'Russian',
  'grc': 'Ancient Greek',
  'lat': 'Latin',
  // Add more languages as needed
};

// Language code to dictionary API mapping
const dictionaryApis = {
  'spa': {
    url: 'https://api.dictionaryapi.dev/api/v2/entries/es/',
    parser: parseFreeDictionaryApi
  },
  'eng': {
    url: 'https://api.dictionaryapi.dev/api/v2/entries/en/',
    parser: parseFreeDictionaryApi
  },
  // Add more language-specific API configurations
};

// Part of speech mapping (free dictionary API to your format)
const posMapping = {
  'noun': 'NOUN',
  'verb': 'VERB',
  'adjective': 'ADJECTIVE',
  'adverb': 'ADVERB',
  'pronoun': 'PRONOUN',
  'preposition': 'PREPOSITION',
  'conjunction': 'CONJUNCTION',
  'interjection': 'INTERJECTION',
  'article': 'ARTICLE',
  'determiner': 'DETERMINER',
  // Add more mappings as needed
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
    // This is a safer way to evaluate the JS code without using eval
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
    const languageCode = options.language || await detectLanguage(database, options.sampleSize);
    console.log(`Detected language: ${languageNames[languageCode] || languageCode}`);
    
    // Enrich the database
    const enrichedDatabase = await enrichDatabase(database, languageCode);
    
    // Format and save the enriched database
    const outputFilePath = options.output || inputFilePath.replace('.js', '_enriched.js');
    const outputCode = formatDatabaseCode(enrichedDatabase, databaseName);
    fs.writeFileSync(outputFilePath, outputCode, 'utf8');
    
    console.log(`Enriched database saved to: ${outputFilePath}`);
    console.log(`Total words processed: ${Object.keys(enrichedDatabase).length}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

async function detectLanguage(database, sampleSize) {
  // Extract a sample of words from the database for language detection
  const words = Object.keys(database);
  const sampleWords = words.slice(0, Math.min(words.length, sampleSize || 20)).join(' ');
  
  // Use franc for language detection
  const detectedLanguages = franc.all(sampleWords);
  const primaryLanguage = detectedLanguages[0][0];
  
  console.log('Language detection results:');
  detectedLanguages.slice(0, 3).forEach(([code, score]) => {
    console.log(`- ${languageNames[code] || code}: ${Math.round(score * 100)}% confidence`);
  });
  
  return primaryLanguage;
}

async function enrichDatabase(database, languageCode) {
  const enrichedDatabase = {};
  const totalWords = Object.keys(database).length;
  let processed = 0;
  
  // Get the appropriate dictionary API config
  const apiConfig = dictionaryApis[languageCode] || {
    url: `https://api.dictionaryapi.dev/api/v2/entries/${languageCode}/`,
    parser: parseFreeDictionaryApi
  };
  
  for (const [word, wordData] of Object.entries(database)) {
    processed++;
    
    // Skip words that already have complete data
    if (wordData.partOfSpeech && wordData.morphology && wordData.meanings && wordData.meanings.length > 0) {
      enrichedDatabase[word] = wordData;
      continue;
    }
    
    console.log(`Processing word ${processed}/${totalWords}: "${word}"`);
    
    try {
      // First try to get data from dictionary API
      const enrichedWordData = await fetchWordData(word, apiConfig);
      
      // Merge with existing data
      enrichedDatabase[word] = {
        ...wordData,
        partOfSpeech: enrichedWordData.partOfSpeech || wordData.partOfSpeech || 'UNKNOWN',
        morphology: enrichedWordData.morphology || wordData.morphology || 'invariable',
        meanings: enrichedWordData.meanings || wordData.meanings || [word],
        bestTranslation: enrichedWordData.bestTranslation || wordData.bestTranslation || word,
        lemma: enrichedWordData.lemma || wordData.lemma || word,
        LemmaMeanings: enrichedWordData.LemmaMeanings || wordData.LemmaMeanings || [word]
      };
      
      // Add a delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.warn(`Warning: Could not enrich word "${word}": ${error.message}`);
      
      // Use basic fallback data
      enrichedDatabase[word] = {
        ...wordData,
        partOfSpeech: wordData.partOfSpeech || 'UNKNOWN',
        morphology: wordData.morphology || 'invariable',
        meanings: wordData.meanings || [word],
        bestTranslation: wordData.bestTranslation || word,
        lemma: wordData.lemma || word,
        LemmaMeanings: wordData.LemmaMeanings || [word]
      };
    }
  }
  
  return enrichedDatabase;
}

async function fetchWordData(word, apiConfig) {
  try {
    const response = await axios.get(`${apiConfig.url}${encodeURIComponent(word)}`);
    return apiConfig.parser(response.data, word);
  } catch (error) {
    // If API fails, make a best guess based on word characteristics
    return makeIntelligentGuess(word);
  }
}

function parseFreeDictionaryApi(data, originalWord) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('No data returned from dictionary API');
  }
  
  const entry = data[0];
  const meanings = [];
  let partOfSpeech = null;
  
  if (entry.meanings && entry.meanings.length > 0) {
    // Extract part of speech from the first meaning
    const rawPos = entry.meanings[0].partOfSpeech;
    partOfSpeech = posMapping[rawPos.toLowerCase()] || rawPos.toUpperCase();
    
    // Extract definitions
    entry.meanings.forEach(meaning => {
      if (meaning.definitions && meaning.definitions.length > 0) {
        meaning.definitions.forEach(def => {
          if (def.definition) {
            meanings.push(def.definition);
          }
        });
      }
    });
  }
  
  // Determine lemma
  const lemma = entry.word || originalWord;
  
  return {
    partOfSpeech: partOfSpeech,
    morphology: guessMorphology(originalWord, partOfSpeech),
    meanings: meanings.length > 0 ? meanings.slice(0, 5) : [originalWord],
    bestTranslation: meanings.length > 0 ? meanings[0] : originalWord,
    lemma: lemma,
    LemmaMeanings: meanings.length > 0 ? meanings.slice(0, 5) : [originalWord]
  };
}

function makeIntelligentGuess(word) {
  // Makes a best guess for a word's properties based on its form
  let partOfSpeech = 'UNKNOWN';
  let morphology = 'invariable';
  
  // Simple heuristics for Spanish (adjust for other languages)
  if (word.match(/^(el|la|los|las|un|una|unos|unas)$/i)) {
    partOfSpeech = 'ARTICLE';
  } else if (word.match(/^(y|e|o|u|ni|pero|sino|aunque)$/i)) {
    partOfSpeech = 'CONJUNCTION';
  } else if (word.match(/^(a|ante|bajo|con|contra|de|desde|en|entre|hacia|hasta|para|por|según|sin|sobre|tras)$/i)) {
    partOfSpeech = 'PREPOSITION';
  } else if (word.match(/mente$/)) {
    partOfSpeech = 'ADVERB';
    morphology = 'invariable';
  } else if (word.match(/[aeiou]r$/)) {
    partOfSpeech = 'VERB';
    morphology = 'infinitive';
  } else if (word.match(/[oa]s?$/)) {
    partOfSpeech = 'NOUN';
    morphology = word.match(/[o]s?$/) ? 'masculine' : 'feminine';
  }
  
  return {
    partOfSpeech,
    morphology,
    meanings: [word],
    bestTranslation: word,
    lemma: word,
    LemmaMeanings: [word]
  };
}

function guessMorphology(word, partOfSpeech) {
  // Simple morphology guessing based on word form and part of speech
  if (!partOfSpeech) return 'invariable';
  
  switch (partOfSpeech) {
    case 'PREPOSITION':
    case 'CONJUNCTION':
    case 'ADVERB':
    case 'INTERJECTION':
      return 'invariable';
    case 'VERB':
      if (word.match(/ing$/i)) return 'present participle';
      if (word.match(/ed$/i)) return 'past participle';
      return 'infinitive';
    case 'NOUN':
      if (word.match(/s$/i)) return 'plural';
      return 'singular';
    case 'ADJECTIVE':
      if (word.match(/er$/i)) return 'comparative';
      if (word.match(/est$/i)) return 'superlative';
      return 'positive';
    default:
      return 'invariable';
  }
}

function formatDatabaseCode(database, databaseName) {
  const variableName = databaseName.replace(/[^a-zA-Z0-9]/g, '') + 'Database';
  
  // Format the database as nicely indented JSON
  const databaseJson = JSON.stringify(database, null, 2)
    .replace(/"([^"]+)":/g, '$1:') // Remove quotes from property names
    .replace(/"/g, "'");           // Replace double quotes with single quotes
  
  return `// Enriched word frequency database for ${databaseName}
const ${variableName} = ${databaseJson};

module.exports = ${variableName};
`;
}

// Run the script
main(); 