const fs = require('fs');
const path = require('path');

/**
 * Script to update a master vocabulary database with words from a new chapter database
 * 
 * Usage: node scripts/updateMasterDb.js [chapter-db-path] [master-db-path]
 * Example: node scripts/updateMasterDb.js src/databases/book1_ch2.js src/databases/book1_master.js
 */

// Get file paths from command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Error: Missing required arguments');
  console.error('Usage: node updateMasterDb.js [chapter-db-path] [master-db-path]');
  process.exit(1);
}

const CHAPTER_DB_PATH = path.resolve(args[0]);
const MASTER_DB_PATH = path.resolve(args[1]);

// Verify input files exist
if (!fs.existsSync(CHAPTER_DB_PATH)) {
  console.error(`Error: Chapter database file not found: ${CHAPTER_DB_PATH}`);
  process.exit(1);
}

if (!fs.existsSync(MASTER_DB_PATH)) {
  console.error(`Error: Master database file not found: ${MASTER_DB_PATH}`);
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

// Main function to update the master database
function updateMasterDatabase() {
  console.log(`Reading chapter database from: ${CHAPTER_DB_PATH}`);
  console.log(`Reading master database from: ${MASTER_DB_PATH}`);
  
  // Read both database files
  const chapterDb = extractDatabaseFromFile(CHAPTER_DB_PATH);
  const masterDb = extractDatabaseFromFile(MASTER_DB_PATH);
  
  if (!chapterDb || !masterDb) {
    console.error('Failed to process database files.');
    process.exit(1);
  }
  
  // Track statistics
  const stats = {
    existingWords: 0,
    newWords: 0,
    updatedWords: 0
  };
  
  // Merge chapter words into master
  Object.entries(chapterDb.data).forEach(([word, info]) => {
    if (masterDb.data[word]) {
      // Word exists - update if needed
      stats.existingWords++;
      
      // If the chapter has more complete info, update master
      if (
        (!masterDb.data[word].partOfSpeech && info.partOfSpeech) ||
        (!masterDb.data[word].meanings?.length && info.meanings?.length) ||
        (!masterDb.data[word].lemma && info.lemma)
      ) {
        masterDb.data[word] = {
          ...masterDb.data[word],
          partOfSpeech: info.partOfSpeech || masterDb.data[word].partOfSpeech,
          meanings: info.meanings || masterDb.data[word].meanings,
          bestTranslation: info.bestTranslation || masterDb.data[word].bestTranslation,
          lemma: info.lemma || masterDb.data[word].lemma,
          LemmaMeanings: info.LemmaMeanings || masterDb.data[word].LemmaMeanings
        };
        stats.updatedWords++;
      }
    } else {
      // New word - add to master
      masterDb.data[word] = info;
      stats.newWords++;
    }
  });
  
  // Generate updated master database content
  console.log('Generating updated master database...');
  const updatedMasterContent = `// Master vocabulary database (auto-updated)
// Last updated: ${new Date().toISOString()}
const ${masterDb.name} = ${JSON.stringify(masterDb.data, null, 2)};

export default ${masterDb.name};
`;
  
  // Write the updated master database file
  fs.writeFileSync(MASTER_DB_PATH, updatedMasterContent);
  
  console.log(`\nMaster database update complete!`);
  console.log(`- Words in chapter database: ${Object.keys(chapterDb.data).length}`);
  console.log(`- Words in updated master database: ${Object.keys(masterDb.data).length}`);
  console.log(`- Existing words: ${stats.existingWords}`);
  console.log(`- New words added: ${stats.newWords}`);
  console.log(`- Words with updated information: ${stats.updatedWords}`);
}

// Run the update
updateMasterDatabase(); 