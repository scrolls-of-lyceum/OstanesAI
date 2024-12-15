const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const readline = require('readline');


let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});


let prompt = "";

ipcMain.handle('run-model', async (_, backendType, modelPath, msg) => {
  return new Promise((resolve, reject) => {
    const expandedModelPath = modelPath.replace('~', require('os').homedir());
    const AiCliPath = `./src/lib/${backendType}/cpu-cli`;
    console.log(expandedModelPath);
    
    const child = spawn(AiCliPath, [
      '--model', expandedModelPath,
      '--prompt', prompt + ` \n[User]: ${msg}. [endText] \n\n [Assistant]:`,
      '--n-predict', '1000',
    ]);

    let outputBuffer = '[role]: You are an ancient sage inspired by Ostanes, sharing knowledge in a friendly and approachable tone.';

    // Listen to data events from the stdout stream
    child.stdout.on('data', (chunk) => {
      const data = chunk.toString(); // Convert Buffer to string
      console.log('Chunk received:', data);

      // Process the data chunk into words or smaller pieces
      const words = data.split(/\s+/); // Split by spaces
      words.forEach((word) => {
        // Send each word or chunk to the frontend
        mainWindow.webContents.send('model-output', word);

        // Check for the end marker
        if (word.includes('[end')) {
          console.log('End marker found. Terminating child process.');
          child.kill(); // Terminate the child process
          resolve(); // Resolve the promise
        }
      });

      // Accumulate the output (optional)
      outputBuffer += data;
    });

    child.stderr.on('data', (chunk) => {
      console.error('Error chunk received:', chunk.toString());
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(outputBuffer); // Resolve with all collected data if needed
      } else {
        reject(`llama.cpp exited with status code ${code}`);
      }
    });

    child.on('error', (err) => {
      reject(`Failed to start llama.cpp: ${err.message}`);
    });
  });
});



