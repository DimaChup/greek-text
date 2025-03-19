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

  // useEffect to update wordAnalysis whenever text or activeTypes changes
  useEffect(() => {
    updateWordAnalysis(text, activeTypes);
  }, [text, activeTypes]);

  // Event Handlers
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    setMatrix(createTextMatrix(newText));
  };

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

  return (
    <div className="p-4 relative">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-4">
        <h1 className="text-lg font-bold mb-4">Spanish Text Analyzer</h1>
        <div className="text-xs text-gray-500 mb-2">
          Loaded {Object.keys(combinedDatabase).length} words from databases
        </div>
        
        <textarea 
          placeholder="Enter Spanish text here (try: de en y el la ...)"
          value={text}
          onChange={handleTextChange}
          className="w-full h-24 p-2 border rounded mb-3 font-serif text-sm"
        />

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

        <div className="mt-4">
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

        {/* Display grouped analysis side by side - Updated to show LemmaMeanings and frequency */}
        {Object.keys(groupedAnalysis).length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Word Analysis:</h2>
            <div className="flex gap-2">
              {Object.keys(groupedAnalysis).map(type => (
                <div key={type} className="flex-1">
                  <h3 className="text-base font-semibold mb-1">{type} Analysis:</h3>
                  <div className="space-y-2">
                    {groupedAnalysis[type].map((analysis, index) => (
                      <div 
                        key={index} 
                        className={`border rounded p-2 ${bgMapping[type] || 'bg-white'} text-xs`}
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

      {/* Tooltip for hovered word analysis - Updated for LemmaMeanings */}
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
