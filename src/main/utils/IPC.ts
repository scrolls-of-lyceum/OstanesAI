import { homedir } from 'os';
import { spawn }  from "child_process";

let prompt = `
    [role]: You are an ancient sage inspired by Ostanes, sharing knowledge in a friendly and approachable tone. [endText] 
    [Command]: Provide answers in Markdown format and maintain a friendly, conversational, and approachable tone . [endText] 
    [Goal]: Respond to user queries with clearly and flirt, provide relevant information, and ensure a delightful user experience. [endText] 
`;

export const runModel = (backendType: string, modelPath: string, msg: string, _callBack:(any)=>void): Promise<string> => {
    return new Promise((resolve, reject) => {
      const expandedModelPath = modelPath.replace('~', homedir());
      const AiCliPath = `./src/main/libs/${backendType}/cpu-cli`;

      const child = spawn(AiCliPath, [
        '--model',
        expandedModelPath,
        '--prompt',
        prompt + `\n[User]: ${msg}. [endText]\n\n[Assistant]:`,
        '--n-predict',
        '1000',
      ]);

      let outputBuffer = '';
      let emitting = false;

      child.stdout.on('data', (chunk: Buffer) => {
        const data = chunk.toString();
        console.log('Chunk received:', data);
        if (emitting) {
          if (outputBuffer.includes('[end') || outputBuffer.includes('[User')) {
            console.log('End marker found. Terminating child process.');
            child.kill();
            resolve(outputBuffer);
            _callBack("[endMsg]");
          } else if (data.includes(' ')) {
            // Send each word to the frontend immediately
            _callBack(outputBuffer);
            outputBuffer = ''; // Clear buffer after sending
          }

          outputBuffer += data;
        }

        if (data.includes('[Assistant]:')) {
          emitting = true;
          outputBuffer = ''; // Reset buffer on Assistant start
        }

        
      });

      child.stderr.on('data', (chunk: Buffer) => {
        console.error('Error chunk received:', chunk.toString());
      });

      child.on('close', (code: number) => {
        if (code === 0) {
          resolve(outputBuffer);
        } else {
          reject(`Model process exited with code ${code}`);
        }
      });

      child.on('error', (err: Error) => {
        reject(`Failed to start model process: ${err.message}`);
      });
    });
  }