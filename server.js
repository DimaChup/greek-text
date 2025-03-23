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
  let tempFilePath = null;
  
  try {
    const { textContent } = req.body;
    
    if (!textContent) {
      return res.status(400).json({ error: 'Text content is required' });
    }
    
    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Create a unique filename based on timestamp
    const timestamp = Date.now();
    const tempFileName = `temp_text_${timestamp}`;
    tempFilePath = path.join(tempDir, `${tempFileName}.txt`);
    
    // Write the text content to the temporary file
    fs.writeFileSync(tempFilePath, textContent, 'utf8');
    console.log(`Temporary file created: ${tempFilePath}`);
    
    // Get the database directory path - use absolute path for clarity
    const dbDir = path.resolve(__dirname, 'src', 'databases');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // Ensure data directory exists
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Check if the Python script exists
    const pythonScriptPath = path.resolve(__dirname, 'scripts', 'text2db.py');
    if (!fs.existsSync(pythonScriptPath)) {
      throw new Error(`text2db.py script not found at path: ${pythonScriptPath}`);
    }
    
    console.log("Running text2db.py script with delete-output option");
    
    // Use python or python3 depending on the platform
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
    
    // Run the command from the project root directory to ensure paths are relative to it
    // Use absolute paths for the input file and database directory
    const command = `cd "${__dirname}" && ${pythonCommand} "${pythonScriptPath}" --input "${tempFilePath}" --copy-to-db --db-dir "${dbDir}" --delete-output`;
    
    console.log(`Executing command: ${command}`);
    
    // Execute text2db.py and capture output
    const { stdout, stderr } = await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing text2db.py: ${error.message}`);
          console.error(`stderr: ${stderr}`);
          reject({ error, stderr });
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
    
    console.log(`Python script output: ${stdout}`);
    
    // Extract the database name from the output
    const dbNameMatch = stdout.match(/Copied database to:.*[/\\](.+_db\.js)/);
    const databaseName = dbNameMatch 
      ? dbNameMatch[1].replace('.js', '') 
      : `${tempFileName}_db`;
    
    // Check if output directory still exists
    const outputDir = path.join(__dirname, 'data', `output_${tempFileName}`);
    const outputDirExists = fs.existsSync(outputDir);
    
    console.log(`Output directory check: ${outputDirExists ? 'Still exists' : 'Successfully deleted'}`);
    
    // Try manual cleanup if directory still exists
    if (outputDirExists) {
      console.log(`Attempting manual cleanup of directory: ${outputDir}`);
      try {
        // Use rimraf for more reliable directory removal
        const rimraf = require('rimraf');
        rimraf.sync(outputDir);
        console.log(`Manual cleanup successful: ${outputDir}`);
      } catch (cleanupError) {
        console.warn(`Manual cleanup failed: ${cleanupError.message}`);
      }
    }
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Database generated successfully',
      databaseName,
      pythonOutput: stdout,
      cleanup: outputDirExists ? 'Manual cleanup attempted' : 'Python script cleaned up successfully'
    });
    
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ 
      error: 'Server error while processing request', 
      details: error.message,
      ...(error.stderr && { stderr: error.stderr })
    });
  } finally {
    // Clean up temporary input file
    try {
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
        console.log(`Temporary file deleted: ${tempFilePath}`);
      }
    } catch (cleanupError) {
      console.warn(`Warning: Could not delete temporary file: ${cleanupError.message}`);
    }
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