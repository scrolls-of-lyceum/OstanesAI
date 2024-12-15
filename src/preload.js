const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  runModel: (backendType, modelPath, prompt) => ipcRenderer.invoke('run-model', backendType, modelPath, prompt),
  onModelOutput: (callback) => ipcRenderer.on('model-output', (_, data) => callback(data)),
});

