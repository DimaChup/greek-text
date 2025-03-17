import React, { useState } from 'react';

const WordFrequencyGenerator = () => {
  const [text, setText] = useState('');
  const [outputName, setOutputName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');

  // Helper to calculate word frequencies (client-side)
  const calculateWordFrequencies = (text) => {
    const words = text
      .toLowerCase()
      .replace(/[,.;:!?()¡¿\[\]{}*#@%&^+_=|~<>\/\\-]/g, '')
      .split(/\s+/)
      .filter(word => word.trim().length > 0);
    
    const frequencies = {};
    
    words.forEach(word => {
      frequencies[word] = (frequencies[word] || 0) + 1;
    });
    
    return frequencies;
  };

  // Function to generate CSV content
  const generateCsvContent = (frequencies) => {
    const sortedFrequencies = Object.entries(frequencies)
      .sort((a, b) => b[1] - a[1]);
    
    const csvHeader = 'Word,Frequency\n';
    const csvContent = sortedFrequencies
      .map(([word, frequency]) => `${word},${frequency}`)
      .join('\n');
    
    return csvHeader + csvContent;
  };

  // Function to handle CSV generation and download
  const handleGenerateFrequency = async () => {
    if (!text.trim()) {
      alert('Please enter some text first');
      return;
    }
    
    if (!outputName.trim()) {
      alert('Please enter an output name');
      return;
    }
    
    setIsGenerating(true);
    setGenerationStatus('Generating word frequency analysis...');
    
    try {
      // Calculate frequencies
      const frequencies = calculateWordFrequencies(text);
      
      // Generate CSV content
      const csvContent = generateCsvContent(frequencies);
      
      // Create downloadable file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${outputName}_word_frequency.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setGenerationStatus(`Success! File "${outputName}_word_frequency.csv" has been downloaded.`);
    } catch (error) {
      setGenerationStatus(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="text-lg font-bold mb-4">Word Frequency Generator</h1>
      
      <textarea 
        placeholder="Enter your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-24 p-2 border rounded mb-3 text-sm"
      />

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="Output filename (e.g., my_analysis)"
          value={outputName}
          onChange={(e) => setOutputName(e.target.value)}
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={handleGenerateFrequency}
          disabled={isGenerating}
          className="px-3 py-1 rounded bg-indigo-500 text-white hover:bg-indigo-600 disabled:bg-gray-400"
        >
          {isGenerating ? 'Generating...' : 'Generate Word Frequency CSV'}
        </button>
      </div>

      {/* Status message */}
      {generationStatus && (
        <div className="p-2 bg-gray-100 rounded text-sm">
          {generationStatus}
        </div>
      )}
    </div>
  );
};

export default WordFrequencyGenerator; 