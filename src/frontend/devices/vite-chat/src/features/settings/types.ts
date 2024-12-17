import { ChatGPTModel } from "../../lib/constants/openai";

export type SettingsState = {
  maxTokens: number;
  preamble: string;
  shiftSend: boolean;
  apiKey: string | null;
  showPreamble: boolean;
  model: ChatGPTModel;
};
