const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { exec } = require('child_process'); // Add this for running scripts

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

// Updated endpoint with better debugging for directory cleanup issues
app.post('/api/run-text2db', async (req, res) => {
  console.log('Received request to generate database from text');
  
  try {
    const { textContent, dbNameBase, isChapter, bookId, chapterTitle } = req.body;
    
    if (!textContent) {
      return res.status(400).json({ error: 'Missing text content' });
    }
    
    // Create a temporary file for the text
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    
    const tempFilePath = path.join(tempDir, `temp_text_${Date.now()}.txt`);
    fs.writeFileSync(tempFilePath, textContent);
    
    // Set up paths
    const dbDir = path.join(__dirname, 'src/databases');
    
    // Determine command based on whether this is a chapter or standalone
    let command;
    let outputDbName;
    
    if (isChapter && bookId) {
      // Chapter mode - need to check against existing book vocabulary
      outputDbName = `${dbNameBase}`;
      
      // Step 1: Generate basic database
      const text2dbCommand = `python scripts/text2db.py --input "${tempFilePath}" --output "${tempDir}/${outputDbName}_raw.js" --no-copy-to-db`;
      console.log(`Executing: ${text2dbCommand}`);
      await execPromise(text2dbCommand);
      
      // Step 2: Determine if we need to compare with a master vocabulary
      const masterDbPath = path.join(dbDir, `${bookId}_master.js`);
      
      if (fs.existsSync(masterDbPath)) {
        // Compare with master vocabulary to only get new words
        const compareCommand = `node scripts/updateWordDatabase.js "${tempDir}/${outputDbName}_raw.js" --existing "${masterDbPath}" --output "${dbDir}/${outputDbName}.js"`;
        console.log(`Executing comparison: ${compareCommand}`);
        const { stdout: compareOutput } = await execPromise(compareCommand);
        
        // Extract the number of new words from the output
        const newWordsMatch = compareOutput.match(/New words found[^:]*:\s*(\d+)/);
        const newWordCount = newWordsMatch ? parseInt(newWordsMatch[1]) : 0;
        
        // Update the master database
        const updateMasterCommand = `node scripts/updateMasterDb.js "${dbDir}/${outputDbName}.js" "${masterDbPath}"`;
        console.log(`Updating master: ${updateMasterCommand}`);
        await execPromise(updateMasterCommand);
        
        // Step 3: Enrich only if we have new words
        if (newWordCount > 0) {
          const enrichCommand = `python scripts/agents.py --file "${outputDbName}.js"`;
          console.log(`Enriching: ${enrichCommand}`);
          await execPromise(enrichCommand);
        }
        
        // Return results
        return res.json({
          success: true,
          databaseName: outputDbName,
          totalWords: parseInt(compareOutput.match(/Words in new database:\s*(\d+)/)[1] || 0),
          newWordCount
        });
        
      } else {
        // First chapter - create master vocabulary from this chapter
        fs.copyFileSync(`${tempDir}/${outputDbName}_raw.js`, `${dbDir}/${outputDbName}.js`);
        fs.copyFileSync(`${tempDir}/${outputDbName}_raw.js`, masterDbPath);
        
        // Enrich the database
        const enrichCommand = `python scripts/agents.py --file "${outputDbName}.js"`;
        console.log(`Enriching first chapter: ${enrichCommand}`);
        await execPromise(enrichCommand);
        
        // Get word count
        const content = fs.readFileSync(`${dbDir}/${outputDbName}.js`, 'utf8');
        const wordCount = Object.keys(JSON.parse(content.match(/=\s*({[\s\S]*?});/)[1])).length;
        
        return res.json({
          success: true,
          databaseName: outputDbName,
          totalWords: wordCount,
          newWordCount: wordCount
        });
      }
      
    } else {
      // Standard mode - just generate a standalone database
      outputDbName = `${dbNameBase}Database`;
      command = `python scripts/text2db.py --input "${tempFilePath}" --copy-to-db --db-dir "${dbDir}" --delete-output`;
      
      console.log(`Executing: ${command}`);
      const { stdout } = await execPromise(command);
      
      // Enrich the database
      const enrichCommand = `python scripts/agents.py --file "${outputDbName}.js"`;
      console.log(`Enriching: ${enrichCommand}`);
      await execPromise(enrichCommand);
      
      return res.json({
        success: true,
        databaseName: outputDbName
      });
    }
    
  } catch (error) {
    console.error('Error in database generation:', error);
    return res.status(500).json({
      error: 'Database generation failed',
      details: error.message
    });
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
  console.log(`API endpoints available at:`);
  console.log(`- http://localhost:${PORT}/api/save-database`);
  console.log(`- http://localhost:${PORT}/api/run-text2db`);
}); 