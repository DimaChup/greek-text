// GreekTextAnalyzer.js

import React, { useEffect, useState } from 'react';
import wordDatabase from './wordDatabase';

const GreekTextAnalyzer = () => {
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

  // Helper to clean the word string
  const cleanWord = (word) => {
    return word
      .replace(/[,.;']$/g, '')
      .replace(/^['']/, '')
      .replace(/[᾽]/g, '')
      .replace(/·/g, '')
      .trim();
  };

  const createTextMatrix = (text) => {
    if (!text) return [];
    return text.split('\n').map(line =>
      line.trim().split(/\s+/).filter(word => word)
    );
  };

  // Custom function to check if a word's info matches any active type
  const isWordTypeActiveCustom = (info, types) => {
    const part = info.partOfSpeech.toUpperCase();
    if (types.includes(part)) return true;
    if (types.includes('RED') && redGroup.includes(part)) return true;
    return false;
  };

  // Update word analysis based on current text and provided active types
  const updateWordAnalysis = (text, types) => {
    const newMatrix = createTextMatrix(text);
    const analysis = [];
    newMatrix.forEach(row => {
      row.forEach(word => {
        const cleaned = cleanWord(word);
        const info = wordDatabase[cleaned];
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

  // Returns the appropriate highlight class for a given word
  const getHighlightClass = (word) => {
    const cleaned = cleanWord(word);
    const info = wordDatabase[cleaned];
    if (info && isWordTypeActiveCustom(info, activeTypes)) {
      const part = info.partOfSpeech.toUpperCase();
      if (part === 'VERB' && activeTypes.includes('VERB')) return 'bg-pink-200';
      if (part === 'ADJECTIVE' && activeTypes.includes('ADJECTIVE')) return 'bg-green-200';
      if (part === 'NOUN' && activeTypes.includes('NOUN')) return 'bg-blue-200';
      if (activeTypes.includes('RED') && redGroup.includes(part)) return 'bg-red-200';
      if (part === 'ADVERB' && activeTypes.includes('ADVERB')) return 'bg-yellow-200';
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
        redGroup.includes(word.partOfSpeech.toUpperCase())
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
        <h1 className="text-lg font-bold mb-4">Greek Text Analyzer</h1>
        
        <textarea 
          placeholder="Enter Greek text here (try: ἵπποι ἱκάνοι ...)"
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
            Highlight Articles/Pronouns/Particles/Prepositions/Conjunctions/Demonstrative Pronouns
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
                      const info = wordDatabase[cleaned];
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

        {/* Display grouped analysis side by side */}
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
                        {/* Top Section: Flex container for Word and Best Translation with Possible Meanings */}
                        <div className="flex">
                          <div className="w-1/2">
                            <div className="font-semibold">Word</div>
                            <div className="font-serif">{analysis.word}</div>
                          </div>
                          <div className="w-1/2">
                            <div className="font-semibold">Best Translation</div>
                            <div>{analysis.bestTranslation}</div>
                            <div className="mt-1">
                              <div className="font-semibold">Possible Meanings</div>
                              <ul className="list-disc pl-3">
                                {analysis.meanings.map((meaning, i) => (
                                  <li key={i}>{meaning}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                        {/* Second Section: Two-column layout for Lemma and Lemma Translation */}
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <div>
                            <div className="font-semibold">Lemma</div>
                            <div className="font-serif">{analysis.lemma}</div>
                          </div>
                          <div>
                            <div className="font-semibold">Lemma Translation</div>
                            <div>{analysis.bestLemmaTranslation}</div>
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

      {/* Tooltip for hovered word analysis */}
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
          <div><strong>Lemma Translation:</strong> {hoveredAnalysis.data.bestLemmaTranslation}</div>
        </div>
      )}
    </div>
  );
};

export default GreekTextAnalyzer;
