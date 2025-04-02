import React from 'react';

const BookDashboard = ({ book }) => {
  if (!book) return null;
  
  // Process chapter data for visualization
  const chapterData = book.vocabulary?.wordsPerChapter || [];
  const totalWords = book.totalWords || 0;
  
  // Calculate cumulative words per chapter
  const cumulativeWords = [];
  let runningTotal = 0;
  chapterData.forEach(words => {
    runningTotal += words;
    cumulativeWords.push(runningTotal);
  });
  
  return (
    <div className="border rounded p-3 mt-4">
      <h3 className="font-bold text-lg">{book.title}</h3>
      <div className="text-sm text-gray-600">
        Created: {new Date(book.createdAt).toLocaleDateString()}
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-3">
        <div className="border rounded p-2 bg-blue-50">
          <div className="text-lg font-semibold">{book.chapterCount}</div>
          <div className="text-xs text-gray-600">Chapters Processed</div>
        </div>
        
        <div className="border rounded p-2 bg-green-50">
          <div className="text-lg font-semibold">{totalWords}</div>
          <div className="text-xs text-gray-600">Total Unique Words</div>
        </div>
      </div>
      
      {chapterData.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-sm mb-2">Vocabulary Growth</h4>
          <div className="h-20 bg-gray-100 relative flex items-end">
            {cumulativeWords.map((words, i) => {
              const percentage = (words / totalWords) * 100;
              return (
                <div
                  key={i}
                  className="bg-blue-500 mx-px"
                  style={{
                    height: `${percentage}%`,
                    width: `${100 / chapterData.length}%`
                  }}
                  title={`Chapter ${i+1}: ${chapterData[i]} new words (${words} total)`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <div>Ch 1</div>
            <div>Ch {chapterData.length}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDashboard; 