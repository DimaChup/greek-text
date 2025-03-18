const fs = require('fs');
const path = require('path');

// Path to the original database file
const INPUT_FILE = path.join(__dirname, '../src/wordDatabase.js');
// Path for the new lemma-based database file
const OUTPUT_FILE = path.join(__dirname, '../src/wordDatabaseByLemma.js');

// Function to restructure the database
function restructureDatabase() {
  console.log('Reading word database...');
  
  // Read the database file
  let fileContent = fs.readFileSync(INPUT_FILE, 'utf8');
  
  // Extract the database object from the file
  const dbStart = fileContent.indexOf('const wordDatabase = {');
  const dbEnd = fileContent.lastIndexOf('};');
  const dbString = fileContent.substring(dbStart + 'const wordDatabase = '.length, dbEnd + 1);
  
  // Parse the database object
  let wordDatabase;
  try {
    wordDatabase = eval('(' + dbString + ')');
  } catch (error) {
    console.error('Error parsing database:', error);
    return;
  }
  
  console.log('Restructuring database by lemmas...');
  
  // Create the new lemma-based structure
  const lemmaDatabase = {};
  
  // Process each word in the original database
  Object.entries(wordDatabase).forEach(([word, info]) => {
    const lemma = info.lemma;
    
    // Initialize the lemma entry if it doesn't exist
    if (!lemmaDatabase[lemma]) {
      lemmaDatabase[lemma] = {
        partOfSpeech: info.partOfSpeech,
        bestTranslation: info.bestLemmaTranslation, // Just keep this one translation
        forms: {}
      };
    }
    
    // Add this word form to the lemma
    lemmaDatabase[lemma].forms[word] = {
      morphology: info.morphology,
      bestTranslation: info.bestTranslation,
      meanings: info.meanings || [] // Each form keeps its own meanings
    };
  });
  
  console.log('Writing new database file...');
  
  // Generate the new file content
  const newFileContent = `// Generated lemma-based word database
const lemmaDatabase = ${JSON.stringify(lemmaDatabase, null, 2)};

export default lemmaDatabase;
`;
  
  // Write the new database to file
  fs.writeFileSync(OUTPUT_FILE, newFileContent);
  
  console.log(`Lemma database created at: ${OUTPUT_FILE}`);
  console.log(`Found ${Object.keys(lemmaDatabase).length} unique lemmas.`);
}

// Run the restructuring
restructureDatabase();