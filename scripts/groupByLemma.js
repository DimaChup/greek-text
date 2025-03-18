// scripts/groupByLemma.js
// This script restructures a Spanish word database by grouping words with the same lemma

const fs = require('fs');
const path = require('path');

/**
 * Reads a JavaScript database file and extracts the database object
 * @param {string} filePath - Path to the database file
 * @returns {Object} The extracted database object
 */
function readDatabaseFile(filePath) {
  try {
    // Read the file content
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Extract the database object using regex
    const databaseMatch = fileContent.match(/const\s+\w+\s*=\s*({[\s\S]*?});/);
    if (!databaseMatch || !databaseMatch[1]) {
      throw new Error('Could not extract database object from file');
    }
    
    // Convert string to object (using eval in a controlled environment)
    const databaseObj = eval(`(${databaseMatch[1]})`);
    return databaseObj;
  } catch (error) {
    console.error(`Error reading database file: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Restructures the database by grouping words by their lemma
 * @param {Object} database - The original word database
 * @returns {Object} A new database organized by lemma
 */
function groupByLemma(database) {
  const lemmaDatabase = {};
  
  // First pass: group words by lemma
  Object.entries(database).forEach(([word, info]) => {
    const lemma = info.lemma;
    
    // Initialize lemma entry if it doesn't exist
    if (!lemmaDatabase[lemma]) {
      lemmaDatabase[lemma] = {
        totalFrequency: 0,
        LemmaMeanings: [],
        partOfSpeech: info.partOfSpeech.split('/')[0], // Take the primary part of speech
        forms: {}
      };
    }
    
    // Add frequency to the lemma's total
    lemmaDatabase[lemma].totalFrequency += info.frequency;
    
    // Combine lemma meanings and remove duplicates
    if (info.LemmaMeanings) {
      lemmaDatabase[lemma].LemmaMeanings = [
        ...new Set([...lemmaDatabase[lemma].LemmaMeanings, ...info.LemmaMeanings])
      ];
    }
    
    // Add word to forms only if it's not the lemma itself
    if (word !== lemma) {
      lemmaDatabase[lemma].forms[word] = {
        wordNumber: info.wordNumber,
        frequency: info.frequency,
        morphology: info.morphology,
        meanings: info.meanings,
        bestTranslation: info.bestTranslation
      };
    }
  });
  
  return lemmaDatabase;
}

/**
 * Writes the restructured database to a file
 * @param {Object} data - The restructured database
 * @param {string} outputPath - Path where to write the output file
 * @param {string} originalDbName - Name of the original database variable
 */
function writeNewDatabase(data, outputPath, originalDbName) {
  try {
    const lemmaDbName = originalDbName.replace('Database', 'LemmaDatabase');
    
    const content = `// Restructured database grouped by lemma (generated from ${path.basename(outputPath)})
const ${lemmaDbName} = ${JSON.stringify(data, null, 2)};

export default ${lemmaDbName};
`;
    
    fs.writeFileSync(outputPath, content);
    console.log(`Successfully wrote reorganized database to ${outputPath}`);
  } catch (error) {
    console.error(`Error writing new database file: ${error.message}`);
  }
}

/**
 * Extracts the database variable name from a file
 * @param {string} filePath - Path to the database file
 * @returns {string} The name of the database variable
 */
function extractDatabaseName(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const match = fileContent.match(/const\s+(\w+)\s*=/);
    if (match && match[1]) {
      return match[1];
    }
    return 'lemmaDatabase'; // Default name if extraction fails
  } catch (error) {
    console.error(`Error extracting database name: ${error.message}`);
    return 'lemmaDatabase';
  }
}

/**
 * Main function to run the script
 */
function main() {
  // Get the input file path from command line arguments
  const inputPath = process.argv[2];
  
  if (!inputPath) {
    console.error('Please provide a path to the database file:');
    console.error('Usage: node groupByLemma.js path/to/databaseFile.js');
    process.exit(1);
  }
  
  // Resolve to absolute path
  const absoluteInputPath = path.resolve(inputPath);
  
  // Ensure the input file exists
  if (!fs.existsSync(absoluteInputPath)) {
    console.error(`File not found: ${absoluteInputPath}`);
    process.exit(1);
  }
  
  // Create output path in the same directory
  const inputDir = path.dirname(absoluteInputPath);
  const inputBasename = path.basename(inputPath, '.js');
  const outputPath = path.join(inputDir, `${inputBasename}_lemma.js`);
  
  console.log(`Reading database from: ${absoluteInputPath}`);
  const database = readDatabaseFile(absoluteInputPath);
  const databaseName = extractDatabaseName(absoluteInputPath);
  
  console.log('Reorganizing database by lemma...');
  const lemmaDatabase = groupByLemma(database);
  
  console.log(`Writing new database to: ${outputPath}`);
  writeNewDatabase(lemmaDatabase, outputPath, databaseName);
  
  // Print some statistics
  const originalWordCount = Object.keys(database).length;
  const lemmaCount = Object.keys(lemmaDatabase).length;
  console.log(`\nStatistics:`);
  console.log(`- Original word count: ${originalWordCount}`);
  console.log(`- Lemma count: ${lemmaCount}`);
  console.log(`- Words per lemma (average): ${(originalWordCount / lemmaCount).toFixed(2)}`);
  
  // Find a lemma with multiple forms for example
  let exampleLemma = '';
  let maxFormCount = 0;
  
  for (const lemma in lemmaDatabase) {
    const formCount = Object.keys(lemmaDatabase[lemma].forms).length;
    if (formCount > maxFormCount) {
      maxFormCount = formCount;
      exampleLemma = lemma;
    }
    
    // Break after finding a good example
    if (maxFormCount >= 2) break;
  }
  
  if (exampleLemma) {
    console.log(`\nExample of restructured data for lemma "${exampleLemma}":`);
    console.log(`- Part of speech: ${lemmaDatabase[exampleLemma].partOfSpeech}`);
    console.log(`- Total frequency: ${lemmaDatabase[exampleLemma].totalFrequency}`);
    console.log(`- Forms: ${Object.keys(lemmaDatabase[exampleLemma].forms).join(', ')}`);
  }
}

// Run the script
main();