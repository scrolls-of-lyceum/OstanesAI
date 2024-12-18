import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      runModel: (backendType: string, modelPath: string, prompt: string) => Promise<string>;
      onModelOutput: (callback: (data: string) => void) => void;
      openFile: () => Promise<string | null>;
    };
  }
}
