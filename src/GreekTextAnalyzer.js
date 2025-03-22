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
  const [textPercentage, setTextPercentage] = useState(100);

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
  const bgMapping = {
    'VERB': 'bg-pink-200',
    'NOUN': 'bg-blue-200',
    'ADJECTIVE': 'bg-green-200',
    'RED': 'bg-red-200',
    'ADVERB': 'bg-yellow-200'
  };

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

  const createTextMatrix = (text) => {
    if (!text) return [];
    return text.split('\n').map(line =>
      line.trim().split(/\s+/).filter(word => word)
    );
  };

  // Change the redGroup definition to become a function that checks if a part of speech is NOT in the main categories
  const isRedGroup = (part) => {
    const mainCategories = ['NOUN', 'VERB', 'ADJECTIVE', 'ADVERB'];
    return !mainCategories.includes(part);
  };

  // Update word analysis based on current text and provided active types
  const updateWordAnalysis = (text, types) => {
    const newMatrix = createTextMatrix(text);
    const analysis = [];
    newMatrix.forEach(row => {
      row.forEach(word => {
        const cleaned = cleanWord(word);
        const info = combinedDatabase[cleaned];
        if (info && isWordTypeActiveCustom(info, types)) {
          analysis.push({
            word: cleaned,
            ...info
          });
        }
      });
    });
    setWordAnalysis(analysis);
  };

  // Missing dependency: Add combinedDatabase to the dependency array
  useEffect(() => {
    updateWordAnalysis(text, activeTypes);
  }, [text, activeTypes, combinedDatabase]); // Add combinedDatabase here

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

  // Function to get the visible portion of text based on slider percentage
  const getVisibleText = (fullText, percentage) => {
    if (!fullText) return '';
    if (percentage >= 100) return fullText;
    
    const totalChars = fullText.length;
    const visibleChars = Math.floor(totalChars * (percentage / 100));
    return fullText.substring(0, visibleChars);
  };
  
  // Compute visible text based on current percentage
  const visibleText = useMemo(() => getVisibleText(text, textPercentage), [text, textPercentage]);
  
  // Update the handleTextChange to only update the raw text
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
  };
  
  // Handler for slider changes
  const handleSliderChange = (e) => {
    setTextPercentage(parseInt(e.target.value, 10));
  };
  
  // Update matrix and word analysis whenever visible text changes
  useEffect(() => {
    setMatrix(createTextMatrix(visibleText));
    updateWordAnalysis(visibleText, activeTypes);
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
    if (info && isWordTypeActiveCustom(info, activeTypes)) {
      const part = info.partOfSpeech.toUpperCase();
      if (part === 'VERB' && activeTypes.includes('VERB')) return 'bg-pink-200';
      if (part === 'ADJECTIVE' && activeTypes.includes('ADJECTIVE')) return 'bg-green-200';
      if (part === 'NOUN' && activeTypes.includes('NOUN')) return 'bg-blue-200';
      if (part === 'ADVERB' && activeTypes.includes('ADVERB')) return 'bg-yellow-200';
      if (activeTypes.includes('RED') && isRedGroup(part)) return 'bg-red-200';
    }
    return 'bg-white border';
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

  // Update the handleAnkiExport function to use visibleText instead of full text
  const handleAnkiExport = (partOfSpeech) => {
    // Get all unique words from the VISIBLE text (controlled by slider)
    const newMatrix = createTextMatrix(visibleText);
    const uniqueTextWords = new Set();
    
    // Collect all unique words from the visible text
    newMatrix.forEach(row => {
      row.forEach(word => {
        const cleaned = cleanWord(word);
        uniqueTextWords.add(cleaned);
      });
    });
    
    // Filter words that are both in the visible text, match the part of speech, and are not excluded
    const filteredWords = Array.from(uniqueTextWords)
      .map(word => {
        const info = combinedDatabase[word];
        if (!info) return null;
        
        // Check if the word matches the requested part of speech and is not excluded
        const pos = info.partOfSpeech?.toUpperCase().split('/')[0];
        if (pos === partOfSpeech && !excludedWords.has(word)) {
          return [word, info];
        }
        return null;
      })
      .filter(item => item !== null);
    
    if (filteredWords.length === 0) {
      alert(`No ${partOfSpeech} words found in the current visible text.`);
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

  return (
    <div className="p-4 relative">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-4">
        <h1 className="text-lg font-bold mb-4">Greek Text Analyzer</h1>
        <div className="text-xs text-gray-500 mb-2">
          Loaded {Object.keys(combinedDatabase).length} words from databases
        </div>
        
        <textarea 
          placeholder="Enter Greek text here (try pasting some Ancient Greek text)"
          value={text}
          onChange={handleTextChange}
          className="w-full h-24 p-2 border rounded mb-3 font-serif text-sm"
        />

        {/* Horizontal slider section - moved to top */}
        <div className="mb-4 p-3 border rounded bg-gray-50">
          <div className="flex flex-col mb-1">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Text Portion to Analyze</span>
              <span className="text-sm font-medium">{textPercentage}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              value={textPercentage}
              onChange={handleSliderChange}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div className="text-xs text-gray-500">
            Analyzing first {textPercentage}% of text ({visibleText.length} characters)
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          <button 
            onClick={() => handleTypeClick('NOUN')}
            className={`px-3 py-1 rounded ${activeTypes.includes('NOUN') ? 'bg-blue-500 text-white' : 'bg-gray-200 text-sm'}`}
          >
            Highlight Nouns
          </button>
          <button 
            onClick={() => handleTypeClick('VERB')}
            className={`px-3 py-1 rounded ${activeTypes.includes('VERB') ? 'bg-pink-500 text-white' : 'bg-gray-200 text-sm'}`}
          >
            Highlight Verbs
          </button>
          <button 
            onClick={() => handleTypeClick('ADJECTIVE')}
            className={`px-3 py-1 rounded ${activeTypes.includes('ADJECTIVE') ? 'bg-green-500 text-white' : 'bg-gray-200 text-sm'}`}
          >
            Highlight Adjectives
          </button>
          <button 
            onClick={() => handleTypeClick('RED')}
            className={`px-3 py-1 rounded ${activeTypes.includes('RED') ? 'bg-red-500 text-white' : 'bg-gray-200 text-sm'}`}
          >
            Highlight Other Parts of Speech
          </button>
          <button 
            onClick={() => handleTypeClick('ADVERB')}
            className={`px-3 py-1 rounded ${activeTypes.includes('ADVERB') ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-sm'}`}
          >
            Highlight Adverbs
          </button>
        </div>

        {/* Add Anki Export section */}
        <div className="mb-4 mt-3 border-t pt-3">
          <h3 className="text-base font-semibold mb-2">Export to Anki:</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => handleAnkiExport('VERB')}
              className="px-3 py-1 rounded bg-pink-500 text-white text-sm"
            >
              Export Verbs
            </button>
            <button 
              onClick={() => handleAnkiExport('NOUN')}
              className="px-3 py-1 rounded bg-blue-500 text-white text-sm"
            >
              Export Nouns
            </button>
            <button 
              onClick={() => handleAnkiExport('ADJECTIVE')}
              className="px-3 py-1 rounded bg-green-500 text-white text-sm"
            >
              Export Adjectives
            </button>
            <button 
              onClick={() => handleAnkiExport('ADVERB')}
              className="px-3 py-1 rounded bg-yellow-500 text-white text-sm"
            >
              Export Adverbs
            </button>
          </div>
        </div>

        {/* New flex container for side-by-side layout WITHOUT slider */}
        <div className="flex gap-4">
          {/* Text analysis section */}
          <div className="w-1/2">
            <h2 className="text-lg font-semibold mb-2">Text Analysis:</h2>
            <div className="border rounded p-2 text-sm">
              {matrix.map((row, rowIndex) => (
                <div key={rowIndex} className="mb-2">
                  {row.map((word, colIndex) => (
                    <span 
                      key={`${rowIndex}-${colIndex}`}
                      className={`inline-block px-1 py-1 m-1 rounded font-serif ${getHighlightClass(word)}`}
                      onMouseEnter={(e) => {
                        const cleaned = cleanWord(word);
                        const info = combinedDatabase[cleaned];
                        if (info && isWordTypeActiveCustom(info, activeTypes)) {
                          setHoveredAnalysis({
                            data: { ...info, word: cleaned },
                            x: e.clientX + 10,
                            y: e.clientY + 10
                          });
                        }
                      }}
                      onMouseLeave={() => setHoveredAnalysis(null)}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Word analysis section */}
          {Object.keys(groupedAnalysis).length > 0 && (
            <div className="w-1/2">
              <h2 className="text-lg font-semibold mb-2">Word Analysis:</h2>
              <div className="text-xs text-gray-500 mb-2">
                Click on words to exclude them from Anki export
              </div>
              <div className="flex gap-2">
                {Object.keys(groupedAnalysis).map(type => (
                  <div key={type} className="flex-1">
                    <h3 className="text-base font-semibold mb-1">{type} Analysis:</h3>
                    <div className="space-y-2">
                      {groupedAnalysis[type].map((analysis, index) => (
                        <div 
                          key={index} 
                          className={`border rounded p-2 ${bgMapping[type] || 'bg-white'} text-xs cursor-pointer transition-opacity duration-200 ${
                            excludedWords.has(analysis.word) ? 'opacity-40' : 'opacity-100'
                          }`}
                          onClick={() => toggleWordExclusion(analysis.word)}
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
                ))}
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
    </div>
  );
};

export default GreekTextAnalyzer;
