// mergeWordDatabases.js
const fs = require('fs');
const path = require('path');

/**
 * Script to add all words from a filtered database to wordDatabase.js
 * The main database is hardcoded, but you can specify which filtered database to merge.
 * Output is saved in the same directory as the input filtered database.
 * 
 * Usage: node scripts/mergeWordDatabases.js [filtered-db-path]
 * Example: node scripts/mergeWordDatabases.js data/output_mundoB/mundoB_db_filtered.js
 */

// Hardcoded path for main database
const MAIN_DB_PATH = path.resolve('src/wordDatabase.js');

// Get filtered database path from command line argument
const args = process.argv.slice(2);

if (args.length < 1) {
  console.error('Error: Missing filtered database path');
  console.error('Usage: node mergeWordDatabases.js [filtered-db-path]');
  console.error('Example: node mergeWordDatabases.js data/output_mundoB/mundoB_db_filtered.js');
  process.exit(1);
}

// Define file paths
const FILTERED_DB_PATH = path.resolve(args[0]);

// Create output path in the same directory as the filtered database
const OUTPUT_PATH = path.resolve(
  path.dirname(FILTERED_DB_PATH),
  'wordDatabase_merged.js'
);

// Verify input files exist
if (!fs.existsSync(MAIN_DB_PATH)) {
  console.error(`Error: Main database file not found: ${MAIN_DB_PATH}`);
  process.exit(1);
}

if (!fs.existsSync(FILTERED_DB_PATH)) {
  console.error(`Error: Filtered database file not found: ${FILTERED_DB_PATH}`);
  process.exit(1);
}

// Function to extract database object from file content
function extractDatabaseFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const dbMatch = content.match(/const\s+\w+\s*=\s*({[\s\S]*?});/);
    
    if (!dbMatch || !dbMatch[1]) {
      throw new Error(`Could not extract database object from ${filePath}`);
    }
    
    return {
      content: content,
      name: content.match(/const\s+(\w+)\s*=/)[1],
      data: eval(`(${dbMatch[1]})`)
    };
  } catch (error) {
    console.error(`Error reading database file: ${error.message}`);
    process.exit(1);
  }
}

// Main function to merge the databases
function mergeDatabases() {
  console.log(`Reading main database from: ${MAIN_DB_PATH}`);
  console.log(`Reading filtered database from: ${FILTERED_DB_PATH}`);
  
  // Read both database files
  const mainDb = extractDatabaseFromFile(MAIN_DB_PATH);
  const filteredDb = extractDatabaseFromFile(FILTERED_DB_PATH);
  
  // Create merged database by starting with the main database
  const mergedDb = { ...mainDb.data };
  
  // Count of words added
  let addedWordsCount = 0;
  
  // Add all words from filtered database to the merged database
  Object.entries(filteredDb.data).forEach(([word, wordInfo]) => {
    if (!mergedDb[word]) {
      mergedDb[word] = wordInfo;
      addedWordsCount++;
    } else {
      console.warn(`Warning: Word "${word}" already exists in the main database - skipping.`);
    }
  });
  
  // Generate merged database content
  console.log('Generating merged database file...');
  
  const mergedContent = `// Merged word database combining ${mainDb.name} and ${filteredDb.name}
const ${mainDb.name} = ${JSON.stringify(mergedDb, null, 2)};

export default ${mainDb.name};
`;
  
  // Write the merged database to file
  fs.writeFileSync(OUTPUT_PATH, mergedContent);
  
  console.log(`\nDatabase merge complete!`);
  console.log(`- Words in main database: ${Object.keys(mainDb.data).length}`);
  console.log(`- Words in filtered database: ${Object.keys(filteredDb.data).length}`);
  console.log(`- Words added to merged database: ${addedWordsCount}`);
  console.log(`- Total words in merged database: ${Object.keys(mergedDb).length}`);
  console.log(`- Merged database saved to: ${OUTPUT_PATH}`);
  
  // Show example of added words
  if (addedWordsCount > 0) {
    const addedWordExample = Object.entries(filteredDb.data)[0];
    
    if (addedWordExample) {
      console.log(`\nExample added word: "${addedWordExample[0]}"`);
      console.log(`- Word Number: ${addedWordExample[1].wordNumber}`);
      console.log(`- Part of Speech: ${addedWordExample[1].partOfSpeech}`);
      console.log(`- Best Translation: ${addedWordExample[1].bestTranslation}`);
    }
  }
}

// Run the merge
mergeDatabases();