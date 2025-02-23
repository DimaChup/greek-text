// GreekTextAnalyzer.js

import React from 'react';
import wordDatabase from './wordDatabase';

const GreekTextAnalyzer = () => {
  // State
  const [text, setText] = React.useState('');
  const [matrix, setMatrix] = React.useState([]);
  const [activeTypes, setActiveTypes] = React.useState([]); // Array for multiple types
  const [wordAnalysis, setWordAnalysis] = React.useState([]);

  // Define groups for special handling:
  // RED group: Articles, Pronouns, Particles, Prepositions, Conjunctions, and Demonstrative Pronouns
  const redGroup = [
    'ARTICLE',
    'PRONOUN',
    'PARTICLE',
    'PREPOSITION',
    'CONJUNCTION',
    'DEMONSTRATIVE PRONOUN'
  ];

  // Helper Functions
  const cleanWord = (word) => {
    return word
      .replace(/[,.;']$/g, '')
      .replace(/^['']/, '')
      .replace(/[᾽]/g, '')
      .replace(/·/g, '') // Strip the middle dot "·"
      .trim();
  };

  const createTextMatrix = (text) => {
    if (!text) return [];
    return text.split('\n').map(line =>
      line.trim().split(/\s+/).filter(word => word)
    );
  };

  // Determine if a word's type is active
  const isWordTypeActive = (info) => {
    const part = info.partOfSpeech.toUpperCase();
    // Check for specific type toggles
    if (activeTypes.includes(part)) return true;
    // Check if the RED group is active and the part belongs to it
    if (activeTypes.includes('RED') && redGroup.includes(part)) return true;
    return false;
  };

  // Check if a word should be highlighted
  const isHighlighted = (word) => {
    const clean = cleanWord(word);
    const info = wordDatabase[clean];
    return info && isWordTypeActive(info);
  };

  // Return the appropriate Tailwind class based on the word's part of speech
  const getHighlightClass = (word) => {
    const clean = cleanWord(word);
    const info = wordDatabase[clean];
    if (info && isWordTypeActive(info)) {
      const part = info.partOfSpeech.toUpperCase();
      if (part === 'VERB' && activeTypes.includes('VERB')) return 'bg-pink-200';
      if (part === 'ADJECTIVE' && activeTypes.includes('ADJECTIVE')) return 'bg-green-200';
      if (part === 'NOUN' && activeTypes.includes('NOUN')) return 'bg-blue-200';
      if (activeTypes.includes('RED') && redGroup.includes(part)) return 'bg-red-200';
      if (part === 'ADVERB' && activeTypes.includes('ADVERB')) return 'bg-yellow-200';
    }
    return 'bg-white border';
  };

  // Update word analysis based on the current text and active types
  const updateWordAnalysis = (text, types) => {
    const newMatrix = createTextMatrix(text);
    const analysis = [];
    newMatrix.forEach(row => {
      row.forEach(word => {
        const clean = cleanWord(word);
        const info = wordDatabase[clean];
        if (info && isWordTypeActive(info)) {
          analysis.push({
            word: clean,
            ...info
          });
        }
      });
    });
    setWordAnalysis(analysis);
  };

  // Event Handlers
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    setMatrix(createTextMatrix(newText));
    updateWordAnalysis(newText, activeTypes);
  };

  // Toggle a type (or group) on/off.
  // For the red group, we use 'RED' as the type indicator.
  const handleTypeClick = (type) => {
    let newActiveTypes;
    if (activeTypes.includes(type)) {
      newActiveTypes = activeTypes.filter(t => t !== type);
    } else {
      newActiveTypes = [...activeTypes, type];
    }
    setActiveTypes(newActiveTypes);
    updateWordAnalysis(text, newActiveTypes);
  };

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Greek Text Analyzer</h1>
        
        <textarea 
          placeholder="Enter Greek text here (try: ἵπποι ἱκάνοι ...)"
          value={text}
          onChange={handleTextChange}
          className="w-full h-32 p-2 border rounded mb-4 font-serif"
        />

        <div className="flex gap-2 mb-6">
          <button 
            onClick={() => handleTypeClick('NOUN')}
            className={`px-4 py-2 rounded ${
              activeTypes.includes('NOUN') ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Highlight Nouns
          </button>
          <button 
            onClick={() => handleTypeClick('VERB')}
            className={`px-4 py-2 rounded ${
              activeTypes.includes('VERB') ? 'bg-pink-500 text-white' : 'bg-gray-200'
            }`}
          >
            Highlight Verbs
          </button>
          <button 
            onClick={() => handleTypeClick('ADJECTIVE')}
            className={`px-4 py-2 rounded ${
              activeTypes.includes('ADJECTIVE') ? 'bg-green-500 text-white' : 'bg-gray-200'
            }`}
          >
            Highlight Adjectives
          </button>
          <button 
            onClick={() => handleTypeClick('RED')}
            className={`px-4 py-2 rounded ${
              activeTypes.includes('RED') ? 'bg-red-500 text-white' : 'bg-gray-200'
            }`}
          >
            Highlight Articles/Pronouns/Particles/Prepositions/Conjunctions/Demonstrative Pronouns
          </button>
          <button 
            onClick={() => handleTypeClick('ADVERB')}
            className={`px-4 py-2 rounded ${
              activeTypes.includes('ADVERB') ? 'bg-yellow-500 text-white' : 'bg-gray-200'
            }`}
          >
            Highlight Adverbs
          </button>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Text Analysis:</h2>
          <div className="border rounded p-4">
            {matrix.map((row, rowIndex) => (
              <div key={rowIndex} className="mb-4">
                {row.map((word, colIndex) => (
                  <span 
                    key={`${rowIndex}-${colIndex}`}
                    className={`inline-block px-2 py-1 m-1 rounded font-serif ${getHighlightClass(word)}`}
                  >
                    {word}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {wordAnalysis.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Word Analysis:</h2>
            <div className="space-y-4">
              {wordAnalysis.map((analysis, index) => (
                <div key={index} className="border rounded p-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">Word</div>
                        <div className="font-serif text-lg">{analysis.word}</div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Line {analysis.lineNumber}, Word {analysis.wordOrder}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold">Part of Speech</div>
                      <div>{analysis.partOfSpeech}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Morphology</div>
                      <div>{analysis.morphology}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Best Translation</div>
                      <div>{analysis.bestTranslation}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Possible Meanings</div>
                      <ul className="list-disc pl-4">
                        {analysis.meanings.map((meaning, i) => (
                          <li key={i}>{meaning}</li>
                        ))}
                      </ul>
                    </div>
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
        )}
      </div>
    </div>
  );
};

export default GreekTextAnalyzer;
