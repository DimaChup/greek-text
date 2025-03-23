// GreekTextAnalyzer.js

import React, { useEffect, useState, useMemo } from 'react';

const GreekTextAnalyzer = () => {
  // Dynamically load all databases from the databases directory
  const combinedDatabase = useMemo(() => {
    let mergedDatabase = {};
    
    // Use require.context to dynamically import all .js files from the databases directory
    try {
      const dbContext = require.context('./databases', false, /\.js$/);
      
      // Log available databases for debugging
      console.log('Available databases:', dbContext.keys());
      
      // Import and merge each database
      dbContext.keys().forEach(filename => {
        try {
          const databaseModule = dbContext(filename);
          const database = databaseModule.default || databaseModule;
          console.log(`Loading database: ${filename}`);
          mergedDatabase = { ...mergedDatabase, ...database };
        } catch (error) {
          console.warn(`Error loading database ${filename}:`, error);
        }
      });
      
      console.log(`Loaded ${Object.keys(mergedDatabase).length} words from databases`);
    } catch (error) {
      console.warn('Could not load databases directory:', error);
    }
    
    return mergedDatabase;
  }, []);

  // State
  const [text, setText] = useState('');
  const [matrix, setMatrix] = useState([]);
  const [activeTypes, setActiveTypes] = useState([]);
  const [wordAnalysis, setWordAnalysis] = useState([]);
  const [hoveredAnalysis, setHoveredAnalysis] = useState(null);
  const [excludedWords, setExcludedWords] = useState(new Set());
  const [textRange, setTextRange] = useState({ start: 0, end: 100 });
  const [uniqueInFullText, setUniqueInFullText] = useState(true);
  const [hoveredWord, setHoveredWord] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for existing preference
    const savedPreference = localStorage.getItem('darkMode');
    // Return true if explicitly set to 'true', false otherwise
    return savedPreference === 'true';
  });

  // Add a new state for storing unique words from the text
  const [uniqueWordsFromText, setUniqueWordsFromText] = useState([]);
  const [showUniqueWordsPanel, setShowUniqueWordsPanel] = useState(false);

  // Add state for tracking database generation process
  const [isGeneratingDatabase, setIsGeneratingDatabase] = useState(false);
  const [databaseGenerated, setDatabaseGenerated] = useState(false);
  const [generatedDatabaseName, setGeneratedDatabaseName] = useState('');

  // RED group: Articles, Pronouns, Particles, Prepositions, Conjunctions, and Demonstrative Pronouns
  const redGroup = [
    'ARTICLE',
    'PRONOUN',
    'PARTICLE',
    'PREPOSITION',
    'CONJUNCTION',
    'DEMONSTRATIVE PRONOUN'
  ];

  // Mapping for analysis card background colors per group
  const bgMapping = useMemo(() => ({
    'VERB': darkMode ? 'bg-pink-900' : 'bg-pink-200',
    'NOUN': darkMode ? 'bg-blue-900' : 'bg-blue-200',
    'ADJECTIVE': darkMode ? 'bg-green-900' : 'bg-green-200',
    'RED': darkMode ? 'bg-red-900' : 'bg-red-200',
    'ADVERB': darkMode ? 'bg-yellow-900' : 'bg-yellow-200'
  }), [darkMode]);

  // Helper to clean the word string - improved version to handle complex punctuation
  const cleanWord = (word) => {
    return word
      // First, handle ellipsis and other combined punctuation
      .replace(/…/g, '')
      // Remove all quotes (including Spanish, Greek, and standard)
      .replace(/[«»""''"`]/g, '') 
      // Remove all punctuation globally, not just at beginning or end
      .replace(/[,.;:!?()¡¿\[\]{}*#@%&^+_=|~<>\/\\-]/g, '')
      // Remove specific Greek punctuation
      .replace(/[᾽]/g, '')
      // Remove middle dot and other special characters
      .replace(/[·•‣◦‧⁃⁌⁍⦁⦾⦿]/g, '')
      .trim()
      .toLowerCase(); // Convert to lowercase for case-insensitive matching
  };

  // Update createTextMatrix to preserve exact line structure
  const createTextMatrix = (text) => {
    if (!text) return [];
    // Split by newlines and don't filter out empty lines
    return text.split('\n').map(line => {
      if (line.trim() === '') {
        // Return a special marker for empty lines
        return [''];
      }
      // Otherwise split by spaces but keep all words
      return line.split(/\s+/).filter(word => word);
    });
  };

  // Update isRedGroup to handle empty parts of speech
  const isRedGroup = (part) => {
    // If part is empty or undefined, consider it part of RED group
    if (!part) return true;
    
    const mainCategories = ['NOUN', 'VERB', 'ADJECTIVE', 'ADVERB'];
    return !mainCategories.includes(part);
  };

  // Replace the getVisibleText function with this much simpler approach
  const getVisibleText = (fullText, range) => {
    if (!fullText) return "";
    
    // Split text into lines while preserving empty lines
    const lines = fullText.split('\n');
    
    // Calculate which lines to include based on percentage
    const totalLines = lines.length;
    const startLine = Math.floor(totalLines * (range.start / 100));
    const endLine = Math.ceil(totalLines * (range.end / 100));
    
    // Get only the lines in our range
    const selectedLines = lines.slice(startLine, endLine);
    
    // Join back with newlines preserved
    return selectedLines.join('\n');
  };

  // Update word analysis to use word-based ranges
  const updateWordAnalysis = (fullText, range, types) => {
    if (!fullText) {
      setWordAnalysis([]);
      return;
    }
    
    // Get the visible text based on range
    const visibleText = getVisibleText(fullText, range);
    const visibleMatrix = createTextMatrix(visibleText);
    const uniqueWordsInRange = new Map();
    
    // If we're in Selection Mode (uniqueInFullText = false),
    // just collect unique words from the visible text
    if (!uniqueInFullText) {
      visibleMatrix.forEach(row => {
        row.forEach(word => {
          const cleaned = cleanWord(word);
          const info = combinedDatabase[cleaned];
          
          if (info && 
              isWordTypeActiveCustom(info, types) && 
              !uniqueWordsInRange.has(cleaned)) {
            
            uniqueWordsInRange.set(cleaned, {
              word: cleaned,
              ...info
            });
          }
        });
      });
      
      setWordAnalysis(Array.from(uniqueWordsInRange.values()));
      return;
    }
    
    // Otherwise, use the Progressive Mode logic
    // Split the text into words
    const allWords = fullText.match(/\S+/g) || [];
    const totalWords = allWords.length;
    
    // Calculate the word index for the start of our range
    const startIndex = Math.floor(totalWords * (range.start / 100));
    
    // Get all words before our range
    const wordsBeforeRange = allWords.slice(0, startIndex);
    const wordsSeenBefore = new Set();
    
    // Collect all unique words seen before our range
    wordsBeforeRange.forEach(word => {
      wordsSeenBefore.add(cleanWord(word));
    });
    
    // Process the visible text and exclude words seen before
    visibleMatrix.forEach(row => {
      row.forEach(word => {
        const cleaned = cleanWord(word);
        const info = combinedDatabase[cleaned];
        
        if (info && 
            isWordTypeActiveCustom(info, types) && 
            !uniqueWordsInRange.has(cleaned) && 
            !wordsSeenBefore.has(cleaned)) {
          
          uniqueWordsInRange.set(cleaned, {
            word: cleaned,
            ...info
          });
        }
      });
    });
    
    setWordAnalysis(Array.from(uniqueWordsInRange.values()));
  };

  // Update the useEffect to call our function with the right parameters
  useEffect(() => {
    updateWordAnalysis(text, textRange, activeTypes);
  }, [text, textRange, activeTypes, combinedDatabase, uniqueInFullText]);

  // Debug output to help troubleshoot
  useEffect(() => {
    // Log details about database loading
    console.log("Database loaded with keys:", Object.keys(combinedDatabase).slice(0, 10));
    console.log("First database entry sample:", 
      Object.keys(combinedDatabase).length > 0 
        ? combinedDatabase[Object.keys(combinedDatabase)[0]] 
        : "No entries"
    );
  }, [combinedDatabase]);

  // Compute visible text based on current range
  const visibleText = useMemo(() => 
    getVisibleText(text, textRange), 
    [text, textRange]
  );
  
  // Update the handleTextChange to only update the raw text
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
  };
  
  // Handlers for range slider changes - improved for better reliability
  const handleStartRangeChange = (e) => {
    const newStart = parseInt(e.target.value, 10);
    setTextRange(prev => ({
      start: Math.min(newStart, prev.end - 5), // Ensure at least 5% gap
      end: prev.end
    }));
  };
  
  const handleEndRangeChange = (e) => {
    const newEnd = parseInt(e.target.value, 10);
    setTextRange(prev => ({
      start: prev.start,
      end: Math.max(newEnd, prev.start + 5) // Ensure at least 5% gap
    }));
  };
  
  // Update matrix and word analysis whenever visible text changes
  useEffect(() => {
    setMatrix(createTextMatrix(visibleText));
    updateWordAnalysis(text, textRange, activeTypes);
  }, [visibleText, activeTypes, combinedDatabase]);

  // Event Handlers
  const handleTypeClick = (type) => {
    let newActiveTypes;
    if (activeTypes.includes(type)) {
      newActiveTypes = activeTypes.filter(t => t !== type);
    } else {
      newActiveTypes = [...activeTypes, type];
    }
    setActiveTypes(newActiveTypes);
  };

  // Update isWordTypeActiveCustom to handle RED group properly
  const isWordTypeActiveCustom = (info, types) => {
    // If RED is active and the word has no part of speech, it should be highlighted
    if (types.includes('RED') && (!info.partOfSpeech || info.partOfSpeech === '')) {
      return true;
    }
    
    // If info doesn't have partOfSpeech, skip other checks
    if (!info || !info.partOfSpeech) return false;
    
    const part = info.partOfSpeech.toUpperCase();
    if (types.includes(part)) return true;
    if (types.includes('RED') && isRedGroup(part)) return true;
    
    return false;
  };

  // Returns the appropriate highlight class for a given word
  const getHighlightClass = (word) => {
    const cleaned = cleanWord(word);
    const info = combinedDatabase[cleaned];
    
    // Base classes
    let classes = 'inline-block px-1 py-1 m-1 rounded font-serif transition-all duration-200 ';
    
    // Check if this word is the currently hovered word
    const isHovered = hoveredWord === cleaned;
    
    // Handle words with no part of speech in the RED group
    if (info && activeTypes.includes('RED') && (!info.partOfSpeech || info.partOfSpeech === '')) {
      classes += darkMode ? 'bg-red-900 ' : 'bg-red-200 ';
      
      if (isHovered) {
        classes += 'ring-2 ring-offset-1 ring-opacity-80 scale-110 z-10 shadow-lg ring-red-500 ';
      }
      
      return classes;
    }
    
    // Otherwise proceed with regular highlighting
    if (info && info.partOfSpeech && isWordTypeActiveCustom(info, activeTypes)) {
      const part = info.partOfSpeech.toUpperCase();
      
      // Add the basic highlight color
      if (part === 'VERB' && activeTypes.includes('VERB')) 
        classes += darkMode ? 'bg-pink-900 ' : 'bg-pink-200 ';
      else if (part === 'ADJECTIVE' && activeTypes.includes('ADJECTIVE')) 
        classes += darkMode ? 'bg-green-900 ' : 'bg-green-200 ';
      else if (part === 'NOUN' && activeTypes.includes('NOUN')) 
        classes += darkMode ? 'bg-blue-900 ' : 'bg-blue-200 ';
      else if (part === 'ADVERB' && activeTypes.includes('ADVERB')) 
        classes += darkMode ? 'bg-yellow-900 ' : 'bg-yellow-200 ';
      else if (activeTypes.includes('RED') && isRedGroup(part)) 
        classes += darkMode ? 'bg-red-900 ' : 'bg-red-200 ';
      
      // If this word is being hovered, add the glow effect
      if (isHovered) {
        classes += 'ring-2 ring-offset-1 ring-opacity-80 scale-110 z-10 shadow-lg ';
        
        // Add color-specific ring
        if (part === 'VERB') classes += 'ring-pink-500 ';
        else if (part === 'ADJECTIVE') classes += 'ring-green-500 ';
        else if (part === 'NOUN') classes += 'ring-blue-500 ';
        else if (part === 'ADVERB') classes += 'ring-yellow-500 ';
        else classes += 'ring-red-500 ';
      }
    } else {
      classes += darkMode ? 'bg-gray-700 border-gray-600 ' : '';
    }
    
    return classes;
  };

  // Helper to determine tooltip background class based on analysis data
  const getAnalysisBgClass = (analysisData) => {
    const part = analysisData.partOfSpeech.toUpperCase();
    if (redGroup.includes(part)) {
      return bgMapping['RED'];
    }
    return bgMapping[part] || 'bg-white';
  };

  // Group analysis by active type
  const groupedAnalysis = activeTypes.reduce((acc, type) => {
    let filtered;
    if (type === 'RED') {
      filtered = wordAnalysis.filter(word =>
        isRedGroup(word.partOfSpeech.toUpperCase())
      );
    } else {
      filtered = wordAnalysis.filter(word =>
        word.partOfSpeech.toUpperCase() === type
      );
    }
    if (filtered.length > 0) {
      acc[type] = filtered;
    }
    return acc;
  }, {});

  // Add function to toggle word exclusion
  const toggleWordExclusion = (word) => {
    setExcludedWords(prevExcluded => {
      const newExcluded = new Set(prevExcluded);
      if (newExcluded.has(word)) {
        newExcluded.delete(word);
      } else {
        newExcluded.add(word);
      }
      return newExcluded;
    });
  };

  // Update the handleAnkiExport function to use the toggle
  const handleAnkiExport = (partOfSpeech) => {
    if (!text) {
      alert("Please enter some text to analyze.");
      return;
    }
    
    // Get the visible text
    const visibleText = getVisibleText(text, textRange);
    const visibleMatrix = createTextMatrix(visibleText);
    const uniqueWordsInRange = new Set();
    
    // Selection Mode: just get unique words from visible text
    if (!uniqueInFullText) {
      visibleMatrix.forEach(row => {
        row.forEach(word => {
          const cleaned = cleanWord(word);
          uniqueWordsInRange.add(cleaned);
        });
      });
    } 
    // Progressive Mode: exclude words seen earlier in the text
    else {
      // Split the text into words
      const allWords = text.match(/\S+/g) || [];
      const totalWords = allWords.length;
      
      // Calculate the word index for the start of our range
      const startIndex = Math.floor(totalWords * (textRange.start / 100));
      
      // Get all words before our range
      const wordsBeforeRange = allWords.slice(0, startIndex);
      const wordsSeenBefore = new Set();
      
      // Collect all unique words seen before our range
      wordsBeforeRange.forEach(word => {
        wordsSeenBefore.add(cleanWord(word));
      });
      
      // Only add words not seen before
      visibleMatrix.forEach(row => {
        row.forEach(word => {
          const cleaned = cleanWord(word);
          if (!wordsSeenBefore.has(cleaned)) {
            uniqueWordsInRange.add(cleaned);
          }
        });
      });
    }
    
    // Filter for words matching part of speech and not excluded
    const filteredWords = Array.from(uniqueWordsInRange)
      .map(word => {
        const info = combinedDatabase[word];
        if (!info) return null;
        
        const pos = info.partOfSpeech?.toUpperCase().split('/')[0];
        if (pos === partOfSpeech && !excludedWords.has(word)) {
          return [word, info];
        }
        return null;
      })
      .filter(item => item !== null);
    
    if (filteredWords.length === 0) {
      alert(`No ${partOfSpeech.toLowerCase()} words found in the visible text.`);
      return;
    }
    
    // Format the entries for Anki - same as before
    let content = '';
    filteredWords.forEach(([word, info]) => {
      if (word === info.lemma) {
        // Word is already a lemma
        const meanings = info.LemmaMeanings && info.LemmaMeanings.length > 0 
          ? info.LemmaMeanings.join(', ') 
          : info.bestTranslation || 'No meaning available';
        
        content += `${word} * ${meanings};\n\n`;
      } else {
        // Word is a form, needs lemma info
        const wordMeanings = info.meanings && info.meanings.length > 0 
          ? info.meanings.join(', ') 
          : info.bestTranslation || 'No meaning available';
        
        const lemmaMeanings = info.LemmaMeanings && info.LemmaMeanings.length > 0 
          ? info.LemmaMeanings.join(', ') 
          : 'No lemma meaning available';
        
        content += `${word} * ${wordMeanings}\n\n${info.lemma}: ${lemmaMeanings};\n\n`;
      }
    });
    
    // Create a downloadable file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `anki-export-${partOfSpeech.toLowerCase()}.txt`;
    link.click();
    
    // Clean up
    URL.revokeObjectURL(url);
  };

  // Add this effect to apply dark mode to the document
  useEffect(() => {
    // Save preference to localStorage
    localStorage.setItem('darkMode', darkMode);
    
    // Apply or remove the dark class on the document body
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Update the generateDatabase function to match the structure from text2db.py
  const generateDatabase = async () => {
    if (!text) {
      alert("Please enter some text to analyze.");
      return;
    }
    
    setIsGeneratingDatabase(true);
    
    try {
      // Create a text matrix from the full text
      const textMatrix = createTextMatrix(text);
      
      // Use a Set to collect unique words
      const uniqueWordsSet = new Set();
      
      // Process each word in the text and count frequencies
      const wordFrequencies = {};
      
      textMatrix.forEach(row => {
        row.forEach(word => {
          if (word) {
            const cleaned = cleanWord(word);
            if (cleaned && cleaned.length > 1) { // Ignore single characters
              uniqueWordsSet.add(cleaned);
              
              // Count frequency
              wordFrequencies[cleaned] = (wordFrequencies[cleaned] || 0) + 1;
            }
          }
        });
      });
      
      // Convert the Set to Array and sort alphabetically
      const uniqueWords = Array.from(uniqueWordsSet).sort();
      
      // Check which words exist in the database
      const wordsWithStatus = uniqueWords.map(word => ({
        word,
        inDatabase: !!combinedDatabase[word],
        databaseInfo: combinedDatabase[word] || null
      }));
      
      // Update state
      setUniqueWordsFromText(wordsWithStatus);
      setShowUniqueWordsPanel(true);
      
      // Generate a unique name for the database based on timestamp
      const timestamp = new Date().getTime();
      
      // Clean the text to create a valid JavaScript identifier (first few words)
      const cleanedDbNameBase = text.trim().split(/\s+/).slice(0, 3).join('_')
        .replace(/[^a-zA-Z0-9_]/g, '')
        .replace(/^[0-9]/, 'text');
      
      // Make sure we have something valid left
      const dbNameBase = cleanedDbNameBase || 'text';
      
      // Database name format matches Python script
      const dbName = `${dbNameBase}Database`;
      
      // Create the database object - FORMAT MATCHING PYTHON SCRIPT
      const database = {};
      
      // Add each word with its properties (with structure matching Python script)
      uniqueWords.forEach((word, index) => {
        database[word] = {
          wordNumber: index + 1,
          frequency: wordFrequencies[word] || 1,
          partOfSpeech: combinedDatabase[word]?.partOfSpeech || '',
          morphology: combinedDatabase[word]?.morphology || '',
          meanings: combinedDatabase[word]?.meanings || [],
          bestTranslation: combinedDatabase[word]?.bestTranslation || '',
          lemma: combinedDatabase[word]?.lemma || '',
          LemmaMeanings: combinedDatabase[word]?.LemmaMeanings || []
        };
      });
      
      // Create the JavaScript code for the database (matching Python script format)
      const jsCode = `// Generated word frequency database with word numbers for ${dbNameBase} on ${new Date().toLocaleString()}
const ${dbName} = ${JSON.stringify(database, null, 2)};

export default ${dbName};`;
      
      // Define the API endpoint URL
      const apiUrl = 'http://localhost:3001/api/save-database';
      
      // Send the database to the server
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: `${dbName}.js`,
          content: jsCode
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Server error: ${errorData.error || response.statusText}`);
      }
      
      const result = await response.json();
      
      // Update state with database name
      setGeneratedDatabaseName(dbName);
      setDatabaseGenerated(true);
      
      console.log("Generated database structure:", database);
      
      // Show success message
      alert(
        "Database has been saved successfully to the databases directory!\n\n" +
        "To use the new database with the current text, you'll need to reload the page manually after you're done with this session."
      );
      
    } catch (error) {
      console.error("Error generating database:", error);
      
      // Provide a fallback option if server saving fails
      const fallback = window.confirm(
        `Error saving to server: ${error.message}\n\nWould you like to download the database file instead?`
      );
      
      if (fallback) {
        downloadDatabaseFile();
      }
    } finally {
      setIsGeneratingDatabase(false);
    }
  };

  // Update the fallback download function to match the same structure
  const downloadDatabaseFile = () => {
    try {
      // Similar structure as above
      const timestamp = new Date().getTime();
      const cleanedDbNameBase = text.trim().split(/\s+/).slice(0, 3).join('_')
        .replace(/[^a-zA-Z0-9_]/g, '')
        .replace(/^[0-9]/, 'text');
      
      const dbNameBase = cleanedDbNameBase || 'text';
      const dbName = `${dbNameBase}Database`;
      
      // Create database object with the same structure as Python script
      const database = {};
      
      // Add each word with structure matching Python script
      uniqueWordsFromText.forEach((item, index) => {
        database[item.word] = {
          wordNumber: index + 1,
          frequency: 1, // Default frequency
          partOfSpeech: item.databaseInfo?.partOfSpeech || '',
          morphology: item.databaseInfo?.morphology || '',
          meanings: item.databaseInfo?.meanings || [],
          bestTranslation: item.databaseInfo?.bestTranslation || '',
          lemma: item.databaseInfo?.lemma || '',
          LemmaMeanings: item.databaseInfo?.LemmaMeanings || []
        };
      });
      
      const jsCode = `// Generated word frequency database with word numbers for ${dbNameBase} on ${new Date().toLocaleString()}
const ${dbName} = ${JSON.stringify(database, null, 2)};

export default ${dbName};`;
      
      // Create blob and download
      const blob = new Blob([jsCode], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${dbName}.js`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert("Database file has been downloaded. Please move it to the src/databases directory manually.");
      
      setGeneratedDatabaseName(dbName);
      setDatabaseGenerated(true);
    } catch (downloadError) {
      console.error("Error in fallback download:", downloadError);
      alert("Failed to generate database file: " + downloadError.message);
    }
  };

  // Add a debug function to verify your generated database structure
  const debugGeneratedDatabase = () => {
    // Check if we have processed words
    console.log("Unique words count:", uniqueWordsFromText.length);
    
    // Check if we have words with part of speech info
    const wordsWithPos = uniqueWordsFromText.filter(w => 
      w.inDatabase && w.databaseInfo && w.databaseInfo.partOfSpeech
    );
    console.log("Words with part of speech:", wordsWithPos.length);
    
    // Check if the combinedDatabase has words with part of speech
    const dbWordsWithPos = Object.values(combinedDatabase).filter(info => 
      info && info.partOfSpeech
    );
    console.log("Database words with part of speech:", dbWordsWithPos.length);
    
    // Log some samples
    if (dbWordsWithPos.length > 0) {
      console.log("Sample word data:", dbWordsWithPos[0]);
    }
  };

  return (
    <div className={`p-2 sm:p-4 relative ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      <div className={`w-full max-w-4xl mx-auto rounded-lg shadow-lg p-2 sm:p-4 ${
        darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
      }`}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg font-bold">Greek Text Analyzer</h1>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`px-3 py-1 rounded flex items-center text-sm transition-colors ${
              darkMode 
                ? 'bg-gray-700 text-yellow-200' 
                : 'bg-blue-100 text-gray-800'
            }`}
          >
            {darkMode ? (
              <>
                <span className="mr-2">☀️</span>
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <span className="mr-2">🌙</span>
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>
        <div className="text-xs text-gray-500 mb-2">
          Loaded {Object.keys(combinedDatabase).length} words from databases
        </div>
        
        <textarea 
          placeholder="Enter Greek text here (try pasting some Ancient Greek text)"
          value={text}
          onChange={handleTextChange}
          className="w-full h-72 p-2 border rounded mb-3 font-serif text-sm"
        />

        {/* Replace the two buttons with a single button */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button 
            onClick={generateDatabase}
            className={`px-3 py-1 sm:px-4 sm:py-2 text-sm rounded transition-colors ${
              isGeneratingDatabase ? 
                'bg-gray-400 cursor-not-allowed' : 
                'bg-green-600 text-white hover:bg-green-700'
            }`}
            disabled={isGeneratingDatabase}
          >
            {isGeneratingDatabase ? 
              'Processing...' : 
              'Generate Database'
            }
          </button>
        </div>

        {/* Database generation success message */}
        {databaseGenerated && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded text-sm">
            <p className="font-semibold">Database file generated successfully!</p>
            <p className="text-xs mt-1">
              File name: <code>{generatedDatabaseName}.js</code>
            </p>
            <p className="text-xs mt-1">
              The database file has been saved to the <code>src/databases</code> directory on the server.
              You can continue working with your current text. When you're ready to use the new database, you can reload the application.
            </p>
            <div className="flex gap-2 mt-2">
              <button 
                onClick={() => window.location.reload()}
                className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Reload Now (will lose current text)
              </button>
              <button 
                onClick={() => setDatabaseGenerated(false)}
                className="text-xs px-2 py-1 bg-green-200 rounded hover:bg-green-300"
              >
                Continue Working
              </button>
            </div>
          </div>
        )}

        {/* Improved Range slider section */}
        <div className="mb-4 p-2 sm:p-3 border rounded bg-gray-50">
          <div className="flex flex-col mb-1">
            <div className="flex justify-between mb-1">
              <span className="text-xs sm:text-sm font-medium">Text Range to Analyze</span>
              <span className="text-xs sm:text-sm font-medium">{textRange.start}% - {textRange.end}%</span>
            </div>
            
            {/* Simpler, more reliable dual slider implementation */}
            <div className="mb-4">
              <div className="text-xs text-gray-600 flex justify-between mb-1">
                <span>Start: {textRange.start}%</span>
                <span>End: {textRange.end}%</span>
              </div>
              
              {/* Start slider */}
              <div className="mb-3">
                <label className="block text-xs text-gray-600 mb-1">Start Position:</label>
                <input
                  type="range"
                  min="0"
                  max="95"
                  value={textRange.start}
                  onChange={handleStartRangeChange}
                  className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
              
              {/* End slider */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">End Position:</label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={textRange.end}
                  onChange={handleEndRangeChange}
                  className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
            
            {/* Visual representation of selected range */}
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500" 
                style={{ 
                  marginLeft: `${textRange.start}%`, 
                  width: `${textRange.end - textRange.start}%` 
                }}
              ></div>
            </div>
            
            <div className="text-xs text-gray-500 mt-3">
              Analyzing text from {textRange.start}% to {textRange.end}% ({visibleText.length} characters)
            </div>

            {/* Add toggle for word analysis mode */}
            <div className="mt-4 border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Word Analysis Mode:</span>
                <label className="inline-flex items-center cursor-pointer">
                  <span className="mr-2 text-xs text-gray-700">
                    {uniqueInFullText ? 'Progressive Mode' : 'Selection Mode'}
                  </span>
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={uniqueInFullText}
                      onChange={() => setUniqueInFullText(!uniqueInFullText)}
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </div>
                </label>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                <strong>Progressive Mode:</strong> Words are shown only when they first appear in the text
                <br />
                <strong>Selection Mode:</strong> All unique words in the current selection are shown
              </div>
            </div>
          </div>
        </div>

        {/* Reorder and update the button section */}
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
          <button 
            onClick={() => handleTypeClick('VERB')}
            className={`px-2 py-1 sm:px-3 text-xs sm:text-sm rounded ${activeTypes.includes('VERB') ? 'bg-pink-500 text-white' : 'bg-gray-200'}`}
          >
            {activeTypes.includes('VERB') ? 'Unhighlight Verbs' : 'Highlight Verbs'}
          </button>
          <button 
            onClick={() => handleTypeClick('NOUN')}
            className={`px-2 py-1 sm:px-3 text-xs sm:text-sm rounded ${activeTypes.includes('NOUN') ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {activeTypes.includes('NOUN') ? 'Unhighlight Nouns' : 'Highlight Nouns'}
          </button>
          <button 
            onClick={() => handleTypeClick('ADJECTIVE')}
            className={`px-2 py-1 sm:px-3 text-xs sm:text-sm rounded ${activeTypes.includes('ADJECTIVE') ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
          >
            {activeTypes.includes('ADJECTIVE') ? 'Unhighlight Adjectives' : 'Highlight Adjectives'}
          </button>
          <button 
            onClick={() => handleTypeClick('ADVERB')}
            className={`px-2 py-1 sm:px-3 text-xs sm:text-sm rounded ${activeTypes.includes('ADVERB') ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
          >
            {activeTypes.includes('ADVERB') ? 'Unhighlight Adverbs' : 'Highlight Adverbs'}
          </button>
          <button 
            onClick={() => handleTypeClick('RED')}
            className={`px-2 py-1 sm:px-3 text-xs sm:text-sm rounded ${activeTypes.includes('RED') ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
          >
            {activeTypes.includes('RED') ? 'Unhighlight Other Parts' : 'Highlight Other Parts'}
          </button>
          {activeTypes.length > 0 && (
            <button 
              onClick={() => setActiveTypes([])}
              className="px-2 py-1 sm:px-3 text-xs sm:text-sm rounded bg-gray-500 text-white"
            >
              Clear All Highlights
            </button>
          )}
        </div>

        {/* Add Anki Export section */}
        <div className="mb-4 mt-3 border-t pt-3">
          <h3 className="text-base font-semibold mb-2">Export to Anki:</h3>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            <button 
              onClick={() => handleAnkiExport('VERB')}
              className="px-2 py-1 sm:px-3 text-xs sm:text-sm rounded bg-pink-500 text-white"
            >
              Export Verbs
            </button>
            <button 
              onClick={() => handleAnkiExport('NOUN')}
              className="px-2 py-1 sm:px-3 text-xs sm:text-sm rounded bg-blue-500 text-white"
            >
              Export Nouns
            </button>
            <button 
              onClick={() => handleAnkiExport('ADJECTIVE')}
              className="px-2 py-1 sm:px-3 text-xs sm:text-sm rounded bg-green-500 text-white"
            >
              Export Adjectives
            </button>
            <button 
              onClick={() => handleAnkiExport('ADVERB')}
              className="px-2 py-1 sm:px-3 text-xs sm:text-sm rounded bg-yellow-500 text-white"
            >
              Export Adverbs
            </button>
          </div>
        </div>

        {/* New flex container for side-by-side layout WITHOUT slider */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Text analysis section - full width on mobile, 3/5 on desktop */}
          <div className="w-full lg:w-3/5">
          <h2 className="text-lg font-semibold mb-2">Text Analysis:</h2>
            <div className="border rounded p-2 text-sm overflow-auto max-h-[60vh] lg:max-h-[70vh]">
              {/* We'll use a different approach that preserves exact layout */}
              {visibleText.split('\n').map((line, lineIndex) => (
                <div key={lineIndex} className="mb-2 whitespace-pre-wrap">
                  {line === '' ? (
                    // Empty line - render with height
                    <div className="h-5"></div>
                  ) : (
                    // Split the line into individual words and spaces
                    // This pattern ensures both words and spaces are captured
                    line.split(/(\S+)/).map((part, partIndex) => {
                      if (part.trim() === '') {
                        // It's just whitespace - preserve it exactly
                        return <span key={`${lineIndex}-space-${partIndex}`}>{part}</span>;
                      }
                      
                      // It's a word - apply highlighting if needed
                      const word = part;
                      const cleaned = cleanWord(word);
                      const info = combinedDatabase[cleaned];
                      const isActive = info && isWordTypeActiveCustom(info, activeTypes);
                      
                      return (
                        <span 
                          key={`${lineIndex}-word-${partIndex}`}
                          className={isActive ? getHighlightClass(word) : ""}
                          onMouseEnter={(e) => {
                            if (isActive) {
                        setHoveredAnalysis({
                          data: { ...info, word: cleaned },
                          x: e.clientX + 10,
                          y: e.clientY + 10
                        });
                              setHoveredWord(cleaned);
                      }
                    }}
                          onMouseLeave={() => {
                            setHoveredAnalysis(null);
                            setHoveredWord(null);
                          }}
                  >
                    {word}
                  </span>
                      );
                    })
                  )}
              </div>
            ))}
          </div>
        </div>

          {/* Word analysis section - full width on mobile, 2/5 on desktop */}
        {Object.keys(groupedAnalysis).length > 0 && (
            <div className="w-full lg:w-2/5">
            <h2 className="text-lg font-semibold mb-2">Word Analysis:</h2>
              <div className="text-xs text-gray-500 mb-2">
                Click on words to exclude them from Anki export
              </div>
              <div className="flex flex-col md:flex-row gap-2">
                {Object.keys(groupedAnalysis).map(type => {
                  // Count only non-excluded words for display
                  const activeWordCount = groupedAnalysis[type].filter(
                    word => !excludedWords.has(word.word)
                  ).length;
                  
                  // Calculate total words and excluded words
                  const totalWords = groupedAnalysis[type].length;
                  const excludedCount = totalWords - activeWordCount;
                  
                  return (
                    <div key={type} className="flex-1 min-w-[280px]">
                      <h3 className="text-base font-semibold mb-1">
                        {type} Analysis: 
                        <span className="ml-1 text-sm font-normal text-gray-600">
                          ({activeWordCount} active
                          {excludedCount > 0 && `, ${excludedCount} excluded`})
                        </span>
                      </h3>
                      <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                    {groupedAnalysis[type].map((analysis, index) => (
                      <div 
                        key={index} 
                            className={`border rounded p-2 ${bgMapping[type] || 'bg-white'} text-xs cursor-pointer 
                              transition-all duration-200 transform hover:scale-110 hover:shadow-lg 
                              ${excludedWords.has(analysis.word) ? 'opacity-40' : 'opacity-100'} 
                              ${hoveredWord === analysis.word ? 'ring-2 ring-offset-1 scale-110 shadow-lg' : ''}`}
                            onClick={() => toggleWordExclusion(analysis.word)}
                            onMouseEnter={() => setHoveredWord(analysis.word)}
                            onMouseLeave={() => setHoveredWord(null)}
                          >
                            {/* Top Section: Flex container for Word and Meanings */}
                        <div className="flex">
                          <div className="w-1/2">
                            <div className="font-semibold">Word</div>
                            <div className="font-serif">{analysis.word}</div>
                                
                                {/* Added frequency display */}
                                <div className="mt-1">
                                  <div className="font-semibold">Frequency</div>
                                  <div>{analysis.frequency || 'N/A'}</div>
                                </div>
                          </div>
                          <div className="w-1/2">
                                <div className="font-semibold">Meanings</div>
                              <ul className="list-disc pl-3">
                                {analysis.meanings.map((meaning, i) => (
                                  <li key={i}>{meaning}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                            {/* Second Section: Two-column layout for Lemma and Lemma Meanings */}
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <div>
                            <div className="font-semibold">Lemma</div>
                            <div className="font-serif">{analysis.lemma}</div>
                          </div>
                          <div>
                                <div className="font-semibold">Lemma Meanings</div>
                                <div>
                                  {Array.isArray(analysis.LemmaMeanings) 
                                    ? analysis.LemmaMeanings.join(', ') 
                                    : analysis.LemmaMeanings || analysis.bestLemmaTranslation || 'N/A'}
                                </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                  );
                })}
              </div>
            </div>
          )}
          </div>

        {/* Unique Words Panel - Enhanced with database generation option */}
        {showUniqueWordsPanel && (
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Unique Words Found: {uniqueWordsFromText.length}</h2>
              <div className="flex gap-2">
                <button 
                  onClick={generateDatabase}
                  className={`text-xs px-2 py-1 ${
                    isGeneratingDatabase ?
                      'bg-gray-300 cursor-not-allowed' :
                      'bg-green-500 text-white hover:bg-green-600'
                  }`}
                  disabled={isGeneratingDatabase}
                >
                  {isGeneratingDatabase ? 'Generating...' : 'Generate Database'}
                </button>
                <button 
                  onClick={() => setShowUniqueWordsPanel(false)}
                  className="text-xs px-2 py-1 bg-gray-200 rounded"
                >
                  Close
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              <div className="border rounded p-2 bg-green-100">
                <h3 className="font-medium text-sm mb-1">Words in Database: {uniqueWordsFromText.filter(w => w.inDatabase).length}</h3>
                <div className="max-h-40 overflow-y-auto text-xs">
                  {uniqueWordsFromText
                    .filter(w => w.inDatabase)
                    .map((item, idx) => (
                      <div key={idx} className="mb-1 p-1 bg-white rounded">
                        {item.word} {item.databaseInfo?.partOfSpeech ? `(${item.databaseInfo.partOfSpeech})` : ''}
                      </div>
                    ))
                  }
                </div>
              </div>
              
              <div className="border rounded p-2 bg-red-100">
                <h3 className="font-medium text-sm mb-1">Words NOT in Database: {uniqueWordsFromText.filter(w => !w.inDatabase).length}</h3>
                <div className="max-h-40 overflow-y-auto text-xs">
                  {uniqueWordsFromText
                    .filter(w => !w.inDatabase)
                    .map((item, idx) => (
                      <div key={idx} className="mb-1 p-1 bg-white rounded">
                        {item.word}
                      </div>
                    ))
                  }
                </div>
              </div>
              
              <div className="border rounded p-2 bg-blue-100 md:col-span-2 lg:col-span-1">
                <h3 className="font-medium text-sm mb-1">Statistics</h3>
                <div className="text-xs">
                  <p>Total unique words: {uniqueWordsFromText.length}</p>
                  <p>Words in database: {uniqueWordsFromText.filter(w => w.inDatabase).length} ({Math.round(uniqueWordsFromText.filter(w => w.inDatabase).length / uniqueWordsFromText.length * 100)}%)</p>
                  <p>Words missing from database: {uniqueWordsFromText.filter(w => !w.inDatabase).length} ({Math.round(uniqueWordsFromText.filter(w => !w.inDatabase).length / uniqueWordsFromText.length * 100)}%)</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tooltip for hovered word analysis - unchanged */}
      {hoveredAnalysis && (
        <div
          className={`p-1 text-xs shadow-lg ${getAnalysisBgClass(hoveredAnalysis.data)} text-black border`}
          style={{
            position: 'fixed',
            top: hoveredAnalysis.y,
            left: hoveredAnalysis.x,
            zIndex: 1000
          }}
        >
          <div><strong>Word:</strong> {hoveredAnalysis.data.word}</div>
          <div><strong>Best Translation:</strong> {hoveredAnalysis.data.bestTranslation}</div>
          <div><strong>Possible Meanings:</strong> {hoveredAnalysis.data.meanings.join(', ')}</div>
          <div><strong>Lemma:</strong> {hoveredAnalysis.data.lemma}</div>
          <div><strong>Lemma Meanings:</strong> {
            Array.isArray(hoveredAnalysis.data.LemmaMeanings) 
              ? hoveredAnalysis.data.LemmaMeanings.join(', ') 
              : hoveredAnalysis.data.LemmaMeanings || hoveredAnalysis.data.bestLemmaTranslation || 'N/A'
          }</div>
          {hoveredAnalysis.data.frequency && 
            <div><strong>Frequency:</strong> {hoveredAnalysis.data.frequency}</div>
          }
        </div>
      )}
    </div>
  );
};

export default GreekTextAnalyzer;
