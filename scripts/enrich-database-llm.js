#!/usr/bin/env node

/**
 * LLM-Based Database Enrichment
 * 
 * This script uses OpenAI's API to enrich a skeleton database file
 * with linguistic information by analyzing words in context.
 * 
 * Usage: node enrich-database-llm.js --input path/to/input_db.js --output path/to/output_db.js --api-key your_openai_key
 */

const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const { program } = require('commander');
const ProgressBar = require('progress');

// Configure command line options
program
  .option('-i, --input <path>', 'Path to the input database file')
  .option('-o, --output <path>', 'Path to the output enriched database file')
  .option('-k, --api-key <key>', 'OpenAI API key')
  .option('-b, --batch-size <number>', 'Number of words to process in each API request', parseInt, 5)
  .option('-m, --model <name>', 'OpenAI model to use', 'gpt-3.5-turbo')
  .option('--temperature <value>', 'Temperature for LLM generation', parseFloat, 0.2)
  .option('--system-prompt <text>', 'Custom system prompt for the LLM')
  .parse(process.argv);

const options = program.opts();

if (!options.input) {
  console.error('Error: Input file path is required');
  program.help();
  process.exit(1);
}

if (!options.apiKey && !process.env.OPENAI_API_KEY) {
  console.error('Error: OpenAI API key is required (use --api-key or set OPENAI_API_KEY environment variable)');
  program.help();
  process.exit(1);
}

// System prompt for the LLM
const DEFAULT_SYSTEM_PROMPT = `You are a linguistic expert. Analyze words and provide grammatical information for each word.
For each word, provide:
1. Part of speech (NOUN, VERB, ADJECTIVE, ADVERB, PREPOSITION, CONJUNCTION, PRONOUN, ARTICLE, DETERMINER, NUMERAL, INTERJECTION)
2. Morphology (like "masculine singular", "feminine plural", "infinitive", "past participle", "invariable", etc.)
3. 3-5 possible meanings or translations to English
4. The best/most common translation
5. The lemma (base form of the word)
6. 3-5 meanings of the lemma

Format your response as a JSON object with these properties.`;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: options.apiKey || process.env.OPENAI_API_KEY
});

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
    
    // Detect the language through initial analysis
    const wordsList = Object.keys(database);
    const languageInfo = await detectLanguage(wordsList.slice(0, 20));
    console.log(`Detected language: ${languageInfo.language}`);
    console.log(`Language details: ${languageInfo.details}`);
    
    // Enrich the database
    const enrichedDatabase = await enrichDatabase(database, languageInfo);
    
    // Format and save the enriched database
    const outputFilePath = options.output || inputFilePath.replace('.js', '_enriched.js');
    const outputCode = formatDatabaseCode(enrichedDatabase, databaseName, languageInfo);
    fs.writeFileSync(outputFilePath, outputCode, 'utf8');
    
    console.log(`Enriched database saved to: ${outputFilePath}`);
    console.log(`Total words processed: ${Object.keys(enrichedDatabase).length}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

async function detectLanguage(sampleWords) {
  console.log('Detecting language from sample words...');
  
  const response = await openai.chat.completions.create({
    model: options.model,
    temperature: options.temperature,
    messages: [
      {
        role: 'system',
        content: 'You are a language identification expert. Analyze the provided words and determine the language. Respond with a JSON object containing the language name and brief details about its characteristics.'
      },
      {
        role: 'user',
        content: `Identify the language of these words: ${sampleWords.join(', ')}`
      }
    ],
    response_format: { type: 'json_object' }
  });
  
  const content = response.choices[0].message.content;
  try {
    return JSON.parse(content);
  } catch (error) {
    console.warn('Could not parse language detection response as JSON:', content);
    return { language: 'Unknown', details: 'Could not detect language automatically' };
  }
}

async function enrichDatabase(database, languageInfo) {
  const enrichedDatabase = {};
  const words = Object.keys(database);
  const batchSize = options.batchSize;
  const totalBatches = Math.ceil(words.length / batchSize);
  
  console.log(`Processing ${words.length} words in batches of ${batchSize}...`);
  const progressBar = new ProgressBar('[:bar] :current/:total batches (:percent) - ETA: :etas', {
    total: totalBatches,
    width: 30
  });
  
  for (let i = 0; i < totalBatches; i++) {
    const batchStart = i * batchSize;
    const batchWords = words.slice(batchStart, batchStart + batchSize);
    const batchData = batchWords.map(word => ({ 
      word, 
      ...database[word] 
    }));
    
    try {
      const enrichedBatch = await processBatch(batchData, languageInfo);
      
      // Merge enriched data with original database
      for (const [word, enrichedData] of Object.entries(enrichedBatch)) {
        enrichedDatabase[word] = {
          ...database[word],
          ...enrichedData
        };
      }
      
      // Update progress
      progressBar.tick();
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error(`Error processing batch ${i+1}/${totalBatches}:`, error.message);
      
      // Use original data for this batch
      for (const word of batchWords) {
        enrichedDatabase[word] = database[word];
      }
      
      // Continue with next batch
      progressBar.tick();
    }
  }
  
  return enrichedDatabase;
}

async function processBatch(batchData, languageInfo) {
  const words = batchData.map(item => item.word);
  
  const response = await openai.chat.completions.create({
    model: options.model,
    temperature: options.temperature,
    messages: [
      {
        role: 'system',
        content: options.systemPrompt || DEFAULT_SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: `
Language: ${languageInfo.language}

Analyze the following ${languageInfo.language} words and provide detailed linguistic information for each:
${words.join(', ')}

For each word, provide:
1. Part of speech (NOUN, VERB, ADJECTIVE, ADVERB, PREPOSITION, CONJUNCTION, PRONOUN, ARTICLE, DETERMINER, NUMERAL, INTERJECTION)
2. Morphology (e.g., "masculine singular", "feminine plural", "infinitive", "past participle", "invariable")
3. 3-5 possible meanings or translations to English
4. The best/most common translation
5. The lemma (base form)
6. 3-5 meanings of the lemma

Return your analysis as a JSON object with the word as the key and an object containing the linguistic details as the value.
Example format:
{
  "word1": {
    "partOfSpeech": "NOUN",
    "morphology": "masculine singular",
    "meanings": ["meaning1", "meaning2", "meaning3"],
    "bestTranslation": "most common meaning",
    "lemma": "base form",
    "LemmaMeanings": ["lemma meaning1", "lemma meaning2", "lemma meaning3"]
  },
  "word2": {
    // ...
  }
}
`
      }
    ],
    response_format: { type: 'json_object' }
  });
  
  const content = response.choices[0].message.content;
  try {
    const enrichedBatch = JSON.parse(content);
    
    // Verify that all words were processed
    for (const word of words) {
      if (!enrichedBatch[word]) {
        console.warn(`Warning: LLM didn't provide data for word "${word}". Using default values.`);
        enrichedBatch[word] = {
          partOfSpeech: 'UNKNOWN',
          morphology: 'invariable',
          meanings: [word],
          bestTranslation: word,
          lemma: word,
          LemmaMeanings: [word]
        };
      }
    }
    
    return enrichedBatch;
    
  } catch (error) {
    console.warn('Could not parse LLM response as JSON:', content);
    throw new Error('Failed to parse LLM response');
  }
}

function formatDatabaseCode(database, databaseName, languageInfo) {
  const variableName = databaseName.replace(/[^a-zA-Z0-9]/g, '') + 'Database';
  
  // Format the database as nicely indented JSON
  const databaseJson = JSON.stringify(database, null, 2)
    .replace(/"([^"]+)":/g, '$1:') // Remove quotes from property names
    .replace(/"/g, "'");           // Replace double quotes with single quotes
  
  return `// Enriched word frequency database for ${databaseName}
// Language: ${languageInfo.language}
// Generated on: ${new Date().toISOString()}
const ${variableName} = ${databaseJson};

module.exports = ${variableName};
`;
}

// Run the script
main(); 