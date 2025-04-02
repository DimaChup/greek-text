import React, { useState, useEffect } from 'react';

const BookSelector = ({ onBookSelect, currentBook }) => {
  const [books, setBooks] = useState([]);
  const [newBookName, setNewBookName] = useState('');
  const [showNewBookForm, setShowNewBookForm] = useState(false);

  // Load books from localStorage on component mount
  useEffect(() => {
    const savedBooks = JSON.parse(localStorage.getItem('languageBooks') || '[]');
    setBooks(savedBooks);
  }, []);

  const createBook = () => {
    if (!newBookName.trim()) return;
    
    const newBook = {
      id: Date.now().toString(),
      title: newBookName,
      createdAt: new Date().toISOString(),
      chapterCount: 0,
      totalWords: 0,
      vocabulary: {}
    };
    
    const updatedBooks = [...books, newBook];
    setBooks(updatedBooks);
    localStorage.setItem('languageBooks', JSON.stringify(updatedBooks));
    setNewBookName('');
    setShowNewBookForm(false);
    onBookSelect(newBook);
  };

  return (
    <div className="mb-4 p-3 border rounded bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Current Book</h3>
        <button 
          onClick={() => setShowNewBookForm(!showNewBookForm)}
          className="text-xs px-2 py-1 bg-blue-500 text-white rounded"
        >
          {showNewBookForm ? 'Cancel' : 'New Book'}
        </button>
      </div>

      {showNewBookForm ? (
        <div className="flex mt-2">
          <input
            type="text"
            value={newBookName}
            onChange={(e) => setNewBookName(e.target.value)}
            placeholder="Enter book title"
            className="flex-1 p-1 text-sm border rounded"
          />
          <button 
            onClick={createBook}
            className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded"
          >
            Create
          </button>
        </div>
      ) : (
        <div className="flex items-center">
          <select
            className="flex-1 p-1 text-sm border rounded"
            value={currentBook?.id || ''}
            onChange={(e) => {
              const selected = books.find(b => b.id === e.target.value);
              onBookSelect(selected || null);
            }}
          >
            <option value="">-- Select a book --</option>
            {books.map(book => (
              <option key={book.id} value={book.id}>
                {book.title} ({book.chapterCount} chapters)
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default BookSelector; 