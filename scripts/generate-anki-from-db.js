const fs = require('fs');
const path = require('path');

/**
 * Generates Anki-compatible word lists from a word database
 * Supports filtering by part of speech
 * 
 * Usage:
 * node scripts/generate-anki-from-db.js --input path/to/database.js [--pos VERB,NOUN] [--output path/to/output/dir]
 */

// Parse command line arguments
const args = processArguments(process.argv.slice(2));

// Check if input file was provided
if (!args.input) {
  console.error('Please provide the path to the database file using --input');
  console.error('Usage: node scripts/generate-anki-from-db.js --input path/to/database.js [--pos VERB,NOUN]');
  process.exit(1);
}

// Resolve input file path
const INPUT_FILE = path.resolve(args.input);

// Generate output directory path
let outputDir = args.output ? path.resolve(args.output) : path.dirname(INPUT_FILE);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get base name for output files
const baseName = path.basename(INPUT_FILE, '.js').replace('_db', '').replace('_filtered', '');

// Parse parts of speech to filter
const partsOfSpeech = args.pos ? args.pos.split(',') : null;

// Process database and generate output
processDatabase(INPUT_FILE, outputDir, baseName, partsOfSpeech);

/**
 * Process command line arguments
 */
function processArguments(args) {
  const result = {};
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' || args[i] === '-i') {
      result.input = args[i + 1];
      i++;
    } else if (args[i] === '--pos' || args[i] === '-p') {
      result.pos = args[i + 1];
      i++;
    } else if (args[i] === '--output' || args[i] === '-o') {
      result.output = args[i + 1];
      i++;
    }
  }
  
  return result;
}

/**
 * Process the database file and generate Anki-compatible output
 */
function processDatabase(inputFile, outputDir, baseName, partsOfSpeech) {
  console.log(`Reading database from: ${inputFile}`);
  
  // Read the file content
  let fileContent;
  try {
    fileContent = fs.readFileSync(inputFile, 'utf8');
  } catch (error) {
    console.error(`Error reading file: ${error.message}`);
    process.exit(1);
  }
  
  // Extract the database object from the file
  const dbMatch = fileContent.match(/const\s+\w+\s*=\s*({[\s\S]*?});/);
  if (!dbMatch || !dbMatch[1]) {
    console.error('Could not extract database object from file');
    process.exit(1);
  }
  
  const dbString = dbMatch[1];
  
  // Parse the database object
  let database;
  try {
    database = eval('(' + dbString + ')');
  } catch (error) {
    console.error(`Error parsing database: ${error.message}`);
    process.exit(1);
  }
  
  console.log('Generating formatted word lists...');
  
  // Initialize output map for different parts of speech
  const outputMap = {};
  let totalWords = 0;
  let processedWords = 0;
  
  // Process each word in the database
  Object.entries(database).forEach(([word, info]) => {
    totalWords++;
    
    // Skip if there's no part of speech
    if (!info.partOfSpeech) return;
    
    // Get the part of speech and standardize to uppercase
    const partOfSpeech = info.partOfSpeech.toUpperCase().split('/')[0];
    
    // Skip if we're filtering by part of speech and this part of speech isn't included
    if (partsOfSpeech && !partsOfSpeech.includes(partOfSpeech)) return;
    
    processedWords++;
    
    // Initialize output for this part of speech if needed
    if (!outputMap[partOfSpeech]) {
      outputMap[partOfSpeech] = '';
    }
    
    // Format the entry based on whether the word is a lemma or not
    let entry;
    if (word === info.lemma) {
      // Word is already a lemma
      const meanings = info.LemmaMeanings && info.LemmaMeanings.length > 0 
        ? info.LemmaMeanings.join(', ') 
        : info.bestTranslation || 'No meaning available';
      
      entry = `${word} * ${meanings};\n\n`;
    } else {
      // Word is a form, needs lemma info
      const wordMeanings = info.meanings && info.meanings.length > 0 
        ? info.meanings.join(', ') 
        : info.bestTranslation || 'No meaning available';
      
      const lemmaMeanings = info.LemmaMeanings && info.LemmaMeanings.length > 0 
        ? info.LemmaMeanings.join(', ') 
        : 'No lemma meaning available';
      
      entry = `${word} * ${wordMeanings}\n\n${info.lemma}: ${lemmaMeanings};\n\n`;
    }
    
    // Add the entry to the appropriate output
    outputMap[partOfSpeech] += entry;
  });
  
  // Write output files for each part of speech
  const writtenFiles = [];
  for (const [pos, content] of Object.entries(outputMap)) {
    if (content.trim()) {
      const outputFile = path.join(outputDir, `${baseName}-${pos.toLowerCase()}.txt`);
      fs.writeFileSync(outputFile, content);
      writtenFiles.push(outputFile);
      console.log(`Created ${pos} list at: ${outputFile}`);
    }
  }
  
  console.log(`\nSummary:`);
  console.log(`Total words in database: ${totalWords}`);
  console.log(`Words processed: ${processedWords}`);
  console.log(`Parts of speech found: ${Object.keys(outputMap).join(', ')}`);
  console.log(`Created ${writtenFiles.length} output files.`);
} 