import React from 'react';
import GreekTextAnalyzer from './GreekTextAnalyzer';
import WordFrequencyGenerator from './WordFrequencyGenerator';

function App() {
  return (
    <div className="App">
      <div className="mb-8">
        <WordFrequencyGenerator />
      </div>
      
      <div>
        <GreekTextAnalyzer />
      </div>
    </div>
  );
}

export default App;
