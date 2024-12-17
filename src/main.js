const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const readline = require("readline");
const { startServer } = require("./backend/server");
const { runModel } = require("./utils");

let mainWindow;

startServer();

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
});

ipcMain.handle("run-model", async (_, backendType, modelPath, msg) => {
  runModel(backendType, modelPath, msg, (outputBuffer) => {
    mainWindow.webContents.send("model-output", outputBuffer);
  });
});
