// scripts/updateWordDatabase.js
const fs = require('fs');
const path = require('path');

/**
 * Script to compare two word databases:
 * 1. Updates frequencies in wordDatabase.js for matching words
 * 2. Creates a filtered version of mundo4_db.js containing only new words
 * 3. In the filtered database, word numbering continues from the last word in wordDatabase.js
 * 
 * Usage: node scripts/updateWordDatabase.js [main-db-path] [new-db-path]
 * Example: node scripts/updateWordDatabase.js src/wordDatabase.js data/output/mundo4_db.js
 */

// Get file paths from command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Error: Missing required arguments');
  console.error('Usage: node updateWordDatabase.js [main-db-path] [new-db-path]');
  console.error('Example: node updateWordDatabase.js src/wordDatabase.js data/output/mundo4_db.js');
  process.exit(1);
}

const MAIN_DB_PATH = path.resolve(args[0]);
const NEW_DB_PATH = path.resolve(args[1]);
const MAIN_DB_UPDATED_PATH = path.resolve(
  path.dirname(MAIN_DB_PATH),
  path.basename(MAIN_DB_PATH, '.js') + '_updated.js'
);
const NEW_DB_FILTERED_PATH = path.resolve(
  path.dirname(NEW_DB_PATH),
  path.basename(NEW_DB_PATH, '.js') + '_filtered.js'
);

// Verify input files exist
if (!fs.existsSync(MAIN_DB_PATH)) {
  console.error(`Error: Main database file not found: ${MAIN_DB_PATH}`);
  process.exit(1);
}

if (!fs.existsSync(NEW_DB_PATH)) {
  console.error(`Error: New database file not found: ${NEW_DB_PATH}`);
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

// Main function to update the database
function updateDatabase() {
  console.log(`Reading main database from: ${MAIN_DB_PATH}`);
  console.log(`Reading new database from: ${NEW_DB_PATH}`);
  
  // Read both database files
  const mainDb = extractDatabaseFromFile(MAIN_DB_PATH);
  const newDb = extractDatabaseFromFile(NEW_DB_PATH);
  
  // Find the highest existing word number in the main database
  let highestWordNumber = 0;
  Object.values(mainDb.data).forEach(wordInfo => {
    if (wordInfo.wordNumber > highestWordNumber) {
      highestWordNumber = wordInfo.wordNumber;
    }
  });
  
  console.log(`Highest existing word number: ${highestWordNumber}`);
  
  // Track statistics
  const stats = {
    existingWords: 0,
    updatedFrequencies: 0,
    newWords: 0,
    nextWordNumber: highestWordNumber + 1
  };
  
  // Create updated main database with frequency updates only (no new words)
  const updatedMainDb = { ...mainDb.data };
  
  // Create filtered new database to contain only new words
  const filteredNewDb = {};
  
  // Process words from the new database
  Object.entries(newDb.data).forEach(([word, newInfo]) => {
    if (updatedMainDb[word]) {
      // Word exists in main database - update frequency only
      updatedMainDb[word].frequency = updatedMainDb[word].frequency + newInfo.frequency;
      stats.updatedFrequencies++;
      stats.existingWords++;
    } else {
      // New word - add to filtered database with sequential numbering
      filteredNewDb[word] = {
        ...newInfo,
        wordNumber: stats.nextWordNumber++
      };
      stats.newWords++;
    }
  });
  
  // Generate updated main database content (with updated frequencies only)
  console.log('Generating updated main database file with updated frequencies...');
  const updatedMainContent = `// Updated word database from ${mainDb.name} with frequencies from ${newDb.name}
const ${mainDb.name} = ${JSON.stringify(updatedMainDb, null, 2)};

export default ${mainDb.name};
`;
  
  // Generate filtered new database content (new words only with sequential numbering)
  console.log('Generating filtered new database with only new words...');
  const filteredNewContent = `// Filtered database from ${newDb.name} containing only words not found in ${mainDb.name}
// Word numbering continues sequentially starting at ${highestWordNumber + 1}
const ${newDb.name}_filtered = ${JSON.stringify(filteredNewDb, null, 2)};

export default ${newDb.name}_filtered;
`;
  
  // Write the updated files
  fs.writeFileSync(MAIN_DB_UPDATED_PATH, updatedMainContent);
  fs.writeFileSync(NEW_DB_FILTERED_PATH, filteredNewContent);
  
  console.log(`\nDatabase comparison and update complete!`);
  console.log(`- Words in main database: ${Object.keys(mainDb.data).length}`);
  console.log(`- Words in new database: ${Object.keys(newDb.data).length}`);
  console.log(`- Matching words with updated frequency: ${stats.updatedFrequencies}`);
  console.log(`- New words found (not in main database): ${stats.newWords}`);
  console.log(`- Updated main database saved to: ${MAIN_DB_UPDATED_PATH}`);
  console.log(`- Filtered new words saved to: ${NEW_DB_FILTERED_PATH}`);
  
  // Show examples if there were updates
  if (stats.updatedFrequencies > 0 || stats.newWords > 0) {
    console.log('\nExamples of changes:');
    
    // Show a frequency update example
    if (stats.updatedFrequencies > 0) {
      const updatedFreqExample = Object.entries(updatedMainDb)
        .find(([word, info]) => 
          mainDb.data[word] && 
          mainDb.data[word].frequency !== info.frequency);
      
      if (updatedFreqExample) {
        console.log(`\nWord with updated frequency: "${updatedFreqExample[0]}"`);
        console.log(`- Word Number: ${updatedFreqExample[1].wordNumber} (unchanged)`);
        console.log(`- Previous frequency: ${mainDb.data[updatedFreqExample[0]].frequency}`);
        console.log(`- New frequency: ${updatedFreqExample[1].frequency}`);
      }
    }
    
    // Show a new word example
    if (stats.newWords > 0) {
      const newWordExample = Object.entries(filteredNewDb)[0];
      
      if (newWordExample) {
        console.log(`\nExample new word: "${newWordExample[0]}"`);
        console.log(`- Word Number: ${newWordExample[1].wordNumber} (continuing after ${highestWordNumber})`);
        console.log(`- Frequency: ${newWordExample[1].frequency}`);
      }
    }
  }
}

// Run the update
updateDatabase();