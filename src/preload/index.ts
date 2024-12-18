import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

type Api = {
  runModel: (backendType: string, modelPath: string, prompt: string) => Promise<string>;
  onModelOutput: (callback: (data: string) => void) => void;
  openFile: () => Promise<string | null>;
};

// Custom APIs for renderer
const api: Api = {
  runModel: (backendType, modelPath, prompt) =>
    ipcRenderer.invoke('run-model', backendType, modelPath, prompt),
  onModelOutput: (callback) =>
    ipcRenderer.on('model-output', (_, data) => callback(data)),
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
};

// Use `contextBridge` APIs to expose Electron APIs to renderer only if context isolation is enabled
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // Fallback for environments where context isolation is disabled
  // @ts-ignore (define in global.d.ts for better typings)
  window.electron = electronAPI;
  // @ts-ignore (define in global.d.ts for better typings)
  window.api = api;
}
