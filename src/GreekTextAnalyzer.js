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
  const [activeTypes, setActiveTypes] = useState([]); // Array for multiple types
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

  // Change the redGroup definition to become a function that checks if a part of speech is NOT in the main categories
  const isRedGroup = (part) => {
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

  // Update the isWordTypeActiveCustom function
  const isWordTypeActiveCustom = (info, types) => {
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
    
    if (info && isWordTypeActiveCustom(info, activeTypes)) {
      const part = info.partOfSpeech.toUpperCase();
      
      // Add the basic highlight color - darker shades for dark mode
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
      
      // If this word or any of its instances is being hovered, add the glow effect
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
      classes += darkMode ? 'bg-gray-700 border-gray-600 ' : 'bg-white border ';
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

        <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
          <button 
            onClick={() => handleTypeClick('NOUN')}
            className={`px-2 py-1 sm:px-3 text-xs sm:text-sm rounded ${activeTypes.includes('NOUN') ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Highlight Nouns
          </button>
          <button 
            onClick={() => handleTypeClick('VERB')}
            className={`px-2 py-1 sm:px-3 text-xs sm:text-sm rounded ${activeTypes.includes('VERB') ? 'bg-pink-500 text-white' : 'bg-gray-200'}`}
          >
            Highlight Verbs
          </button>
          <button 
            onClick={() => handleTypeClick('ADJECTIVE')}
            className={`px-2 py-1 sm:px-3 text-xs sm:text-sm rounded ${activeTypes.includes('ADJECTIVE') ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
          >
            Highlight Adjectives
          </button>
          <button 
            onClick={() => handleTypeClick('RED')}
            className={`px-2 py-1 sm:px-3 text-xs sm:text-sm rounded ${activeTypes.includes('RED') ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
          >
            Highlight Other Parts of Speech
          </button>
          <button 
            onClick={() => handleTypeClick('ADVERB')}
            className={`px-2 py-1 sm:px-3 text-xs sm:text-sm rounded ${activeTypes.includes('ADVERB') ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
          >
            Highlight Adverbs
          </button>
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
