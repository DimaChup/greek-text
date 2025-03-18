// scripts/generate-anki_noun_verb.js
const fs = require('fs');
const path = require('path');

/**
 * Generates Anki-compatible noun and verb lists from a lemma database
 * including all meanings for both lemmas and their forms
 * 
 * Usage:
 * node scripts/generate-anki_noun_verb.js path/to/lemma_database.js
 */

// Check if input file was provided
const inputFile = process.argv[2];
if (!inputFile) {
  console.error('Please provide the path to the lemma database file');
  console.error('Usage: node generate-anki_noun_verb.js path/to/lemma_database.js');
  process.exit(1);
}

// Resolve input file path
const INPUT_FILE = path.resolve(inputFile);

// Generate output file paths in the same directory as the input file
const inputDir = path.dirname(INPUT_FILE);
const baseName = path.basename(INPUT_FILE, '.js').replace('_lemma', '');
const VERBS_OUTPUT_FILE = path.join(inputDir, `${baseName}-verb-lemmas.txt`);
const NOUNS_OUTPUT_FILE = path.join(inputDir, `${baseName}-noun-lemmas.txt`);

/**
 * Checks if a part of speech exactly matches a specified type
 * Handles compound types like "VERB/NOUN" correctly
 */
function isExactPartOfSpeech(fullPartOfSpeech, typeToMatch) {
  // Split by possible delimiters and check each part
  const parts = fullPartOfSpeech.split(/[\/\s,]+/);
  return parts.some(part => part === typeToMatch);
}

// Function to process the database and generate the formatted output
function generateLemmaList() {
  console.log(`Reading lemma database from: ${INPUT_FILE}`);
  
  let fileContent;
  try {
    fileContent = fs.readFileSync(INPUT_FILE, 'utf8');
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
  let lemmaDatabase;
  try {
    lemmaDatabase = eval('(' + dbString + ')');
  } catch (error) {
    console.error(`Error parsing database: ${error.message}`);
    process.exit(1);
  }
  
  console.log('Generating formatted verb and noun lists...');
  
  // Initialize separate output strings for verbs and nouns
  let verbsOutput = '';
  let nounsOutput = '';
  
  // Counters for statistics
  let verbCount = 0;
  let nounCount = 0;
  let skippedCount = 0;
  
  // Process each lemma in the database
  Object.entries(lemmaDatabase).forEach(([lemma, info]) => {
    // Skip if there's no lemma
    if (!lemma) return;
    
    // Get the part of speech and standardize to uppercase
    const partOfSpeech = (info.partOfSpeech || '').toUpperCase();
    
    // Format all lemma meanings
    const lemmaMeanings = info.LemmaMeanings && info.LemmaMeanings.length > 0 
      ? info.LemmaMeanings.join(', ') 
      : 'No meaning available';
    
    // Format the lemma line - include all meanings
    const lemmaLine = `${lemma} * ${lemmaMeanings}\n\n`;
    
    // Format each form with all its meanings
    const forms = Object.entries(info.forms || {});
    let formLines = '';
    
    if (forms.length > 0) {
      forms.forEach(([form, formInfo]) => {
        // Include all meanings for each form, not just bestTranslation
        const formMeanings = formInfo.meanings && formInfo.meanings.length > 0 
          ? formInfo.meanings.join(', ') 
          : formInfo.bestTranslation || 'No meaning available';
        
        formLines += `${form}: ${formMeanings}\n`;
      });
    }
    
    // Add a semicolon at the end of forms and blank lines
    const fullEntry = lemmaLine + formLines + ';\n\n';
    
    // STRICTLY match only VERB or NOUN
    if (isExactPartOfSpeech(partOfSpeech, 'VERB')) {
      verbsOutput += fullEntry;
      verbCount++;
    }
    else if (isExactPartOfSpeech(partOfSpeech, 'NOUN')) {
      nounsOutput += fullEntry;
      nounCount++;
    }
    else {
      skippedCount++;
      // Optionally log skipped entries for debugging
      // console.log(`Skipped: ${lemma} (${partOfSpeech})`);
    }
  });
  
  // Write the outputs to files
  try {
    fs.writeFileSync(VERBS_OUTPUT_FILE, verbsOutput);
    fs.writeFileSync(NOUNS_OUTPUT_FILE, nounsOutput);
    
    console.log(`Verb lemma list created at: ${VERBS_OUTPUT_FILE}`);
    console.log(`Noun lemma list created at: ${NOUNS_OUTPUT_FILE}`);
    console.log(`\nSummary:`);
    console.log(`Processed ${verbCount} verbs and ${nounCount} nouns.`);
    console.log(`Skipped ${skippedCount} entries (not VERB or NOUN).`);
  } catch (error) {
    console.error(`Error writing output files: ${error.message}`);
  }
}

// Run the function
generateLemmaList();