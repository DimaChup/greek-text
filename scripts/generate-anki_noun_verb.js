const fs = require('fs');
const path = require('path');

// Path to the lemma database file
const INPUT_FILE = path.join(__dirname, '../src/wordDatabaseByLemma.js');
// Paths for the output text files
const VERBS_OUTPUT_FILE = path.join(__dirname, '../data/verb-lemmas.txt');
const NOUNS_OUTPUT_FILE = path.join(__dirname, '../data/noun-lemmas.txt');

// Function to process the database and generate the formatted output
function generateLemmaList() {
  console.log('Reading lemma database...');
  
  // Read the database file
  let fileContent = fs.readFileSync(INPUT_FILE, 'utf8');
  
  // Extract the database object from the file
  const dbStart = fileContent.indexOf('const lemmaDatabase = {');
  const dbEnd = fileContent.lastIndexOf('};');
  const dbString = fileContent.substring(dbStart + 'const lemmaDatabase = '.length, dbEnd + 1);
  
  // Parse the database object
  let lemmaDatabase;
  try {
    lemmaDatabase = eval('(' + dbString + ')');
  } catch (error) {
    console.error('Error parsing database:', error);
    return;
  }
  
  console.log('Generating formatted lemma lists...');
  
  // Initialize separate output strings for verbs and nouns
  let verbsOutput = '';
  let nounsOutput = '';
  let verbCount = 0;
  let nounCount = 0;
  
  // Process each lemma in the database
  Object.entries(lemmaDatabase).forEach(([lemma, info]) => {
    // Skip if there's no lemma
    if (!lemma) return;
    
    // Get the part of speech and handle strictly
    const partOfSpeech = info.partOfSpeech?.toUpperCase() || '';
    
    // Format the lemma line with just its best translation
    const lemmaLine = `${lemma} * ${info.bestTranslation}\n\n`;
    
    // Format each form except the lemma itself
    const forms = Object.entries(info.forms || {})
      .filter(([form, _]) => form.toLowerCase() !== lemma.toLowerCase());
    
    let formLines = '';
    if (forms.length > 0) {
      forms.forEach(([form, formInfo]) => {
        formLines += `${form}: ${formInfo.bestTranslation}\n`;
      });
    }
    
    // Add a semicolon at the end of forms
    const fullEntry = lemmaLine + formLines + ';\n\n';
    
    // Check if it's exactly a verb
    if (partOfSpeech === 'VERB') {
      verbsOutput += fullEntry;
      verbCount++;
    }
    
    // Check if it's exactly a noun
    if (partOfSpeech === 'NOUN') {
      nounsOutput += fullEntry;
      nounCount++;
    }
  });
  
  // Write the outputs to files
  fs.writeFileSync(VERBS_OUTPUT_FILE, verbsOutput);
  fs.writeFileSync(NOUNS_OUTPUT_FILE, nounsOutput);
  
  console.log(`Verb lemma list created at: ${VERBS_OUTPUT_FILE}`);
  console.log(`Noun lemma list created at: ${NOUNS_OUTPUT_FILE}`);
  console.log(`Processed ${verbCount} verbs and ${nounCount} nouns.`);
}

// Run the function
generateLemmaList();