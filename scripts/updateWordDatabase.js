// scripts/updateWordDatabase.js
const fs = require('fs');
const path = require('path');

/**
 * Script to compare a new word database against all existing databases in src/databases:
 * 1. Scans the src/databases directory for all database files
 * 2. Creates a combined view of all existing words
 * 3. Creates a filtered version of the new database containing only words not found in any existing database
 * 4. In the filtered database, word numbering continues from the highest word number in existing databases
 * 
 * Usage: node scripts/updateWordDatabase.js [new-db-path]
 * Example: node scripts/updateWordDatabase.js data/output/mundo4_db.js
 */

// Get file paths from command line arguments
const args = process.argv.slice(2);

if (args.length < 1) {
  console.error('Error: Missing required argument');
  console.error('Usage: node updateWordDatabase.js [new-db-path]');
  console.error('Example: node updateWordDatabase.js data/output/mundo4_db.js');
  process.exit(1);
}

const DATABASES_DIR = path.resolve('src/databases');
const NEW_DB_PATH = path.resolve(args[0]);
const NEW_DB_FILTERED_PATH = path.resolve(
  path.dirname(NEW_DB_PATH),
  path.basename(NEW_DB_PATH, '.js') + '_filtered.js'
);

// Add this after the existing NEW_DB_FILTERED_PATH declaration
const DATABASES_COPY_PATH = path.resolve(
  DATABASES_DIR,
  path.basename(NEW_DB_PATH, '.js') + '_filtered.js'
);

// Verify the databases directory exists
if (!fs.existsSync(DATABASES_DIR)) {
  console.error(`Error: Databases directory not found: ${DATABASES_DIR}`);
  console.error('Please create this directory first.');
  process.exit(1);
}

// Verify input file exists
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
    console.error(`Error reading database file ${filePath}: ${error.message}`);
    return null;
  }
}

// Main function to update the database
function updateDatabase() {
  console.log(`Reading new database from: ${NEW_DB_PATH}`);
  
  // Read the new database file
  const newDb = extractDatabaseFromFile(NEW_DB_PATH);
  if (!newDb) {
    console.error('Failed to process the new database.');
    process.exit(1);
  }
  
  // Get all database files from the databases directory
  console.log(`Scanning directory for existing databases: ${DATABASES_DIR}`);
  const dbFiles = fs.readdirSync(DATABASES_DIR)
    .filter(file => file.endsWith('.js'))
    .map(file => path.join(DATABASES_DIR, file));
  
  console.log(`Found ${dbFiles.length} database files: ${dbFiles.map(f => path.basename(f)).join(', ')}`);
  
  // Create a combined view of all existing words
  const combinedExistingWords = {};
  let highestWordNumber = 0;
  
  dbFiles.forEach(dbFile => {
    const db = extractDatabaseFromFile(dbFile);
    if (db && db.data) {
      console.log(`Processing ${path.basename(dbFile)}: ${Object.keys(db.data).length} words`);
      
      // Add words to the combined view
      Object.entries(db.data).forEach(([word, info]) => {
        combinedExistingWords[word] = info;
        
        // Track highest word number
        if (info.wordNumber && info.wordNumber > highestWordNumber) {
          highestWordNumber = info.wordNumber;
        }
      });
    }
  });
  
  console.log(`Combined existing words: ${Object.keys(combinedExistingWords).length}`);
  console.log(`Highest existing word number: ${highestWordNumber}`);
  
  // Track statistics
  const stats = {
    existingWords: 0,
    newWords: 0,
    nextWordNumber: highestWordNumber + 1
  };
  
  // Create filtered new database to contain only new words
  const filteredNewDb = {};
  
  // Process words from the new database
  Object.entries(newDb.data).forEach(([word, newInfo]) => {
    if (combinedExistingWords[word]) {
      // Word already exists in one of the databases
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
  
  // Generate filtered new database content (new words only with sequential numbering)
  console.log('Generating filtered new database with only new words...');
  const filteredNewContent = `// Filtered database from ${newDb.name} containing only words not found in existing databases
// Word numbering continues sequentially starting at ${highestWordNumber + 1}
const ${newDb.name}_filtered = ${JSON.stringify(filteredNewDb, null, 2)};

export default ${newDb.name}_filtered;
`;
  
  // Write the filtered database file
  fs.writeFileSync(NEW_DB_FILTERED_PATH, filteredNewContent);
  
  // Then add this single line after the existing fs.writeFileSync() call that creates the filtered database
  fs.writeFileSync(DATABASES_COPY_PATH, filteredNewContent);
  
  console.log(`\nDatabase comparison and update complete!`);
  console.log(`- Words in all existing databases: ${Object.keys(combinedExistingWords).length}`);
  console.log(`- Words in new database: ${Object.keys(newDb.data).length}`);
  console.log(`- Words already present in existing databases: ${stats.existingWords}`);
  console.log(`- New words found (not in any existing database): ${stats.newWords}`);
  console.log(`- Filtered new words saved to: ${NEW_DB_FILTERED_PATH}`);
  console.log(`- Copy also saved to: ${DATABASES_COPY_PATH}`);
  
  // Show examples if there were new words
  if (stats.newWords > 0) {
    const newWordExample = Object.entries(filteredNewDb)[0];
    
    if (newWordExample) {
      console.log(`\nExample new word: "${newWordExample[0]}"`);
      console.log(`- Word Number: ${newWordExample[1].wordNumber} (continuing after ${highestWordNumber})`);
      console.log(`- Frequency: ${newWordExample[1].frequency}`);
    }
  }
}

// Run the update
updateDatabase();