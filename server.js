const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json({ limit: '10mb' })); // Increase payload limit for large databases

// API endpoint to save database files
app.post('/api/save-database', (req, res) => {
  try {
    const { filename, content } = req.body;
    
    if (!filename || !content) {
      return res.status(400).json({ error: 'Filename and content are required' });
    }
    
    // Sanitize filename to prevent directory traversal attacks
    const sanitizedFilename = path.basename(filename);
    
    // Define the target directory - adjust this path to your project structure
    const targetDir = path.join(__dirname, 'src', 'databases');
    
    // Ensure the directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Full path to the database file
    const filePath = path.join(targetDir, sanitizedFilename);
    
    // Write the file
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log(`Database file saved successfully: ${filePath}`);
    
    // Return success response
    res.status(200).json({ 
      success: true, 
      message: 'Database saved successfully',
      filename: sanitizedFilename,
      path: filePath
    });
    
  } catch (error) {
    console.error('Error saving database:', error);
    res.status(500).json({ error: 'Failed to save database', details: error.message });
  }
});

// Serve static files from the React app (if needed)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoint available at http://localhost:${PORT}/api/save-database`);
}); 