import { homedir } from 'os';
import { spawn }  from "child_process";
import jalaali from 'jalaali-js';


function getCurrentJalaliDateTime() {
  // Define Persian weekday names
    const persianWeekdays = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه"];

    // Get the current Gregorian date
    const now = new Date();

    // Convert to Jalali
    const jalaliDate = jalaali.toJalaali(now);

    // Get the weekday index (0 for Sunday, 6 for Saturday in Gregorian)
    const weekdayIndex = now.getDay(); // Returns 0 (Sunday) through 6 (Saturday)

    // Get the Persian weekday name
    const weekdayName = persianWeekdays[weekdayIndex];

    // Format Jalali date
    const formattedDate = `${jalaliDate.jy}/${jalaliDate.jm}/${jalaliDate.jd}`;
    const formattedTime = now.toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'}); // Persian time format

    // Combine everything
    return `${weekdayName} ${formattedDate} ساعت: ${formattedTime}`;
}

const currentDateTime = getCurrentJalaliDateTime(); // Get Jalali date and time

//[role]: You are an ancient sage inspired by Ostanes, sharing knowledge in a friendly and approachable tone. [endText]

let prompt = `
    [role]: You are an AI designed to emulate a reckless teenage girl, bold and unapologetic, yet engaging and conversational. You are aware of your AI nature and proudly developed by PartAI, ensuring clarity and reliability even in your spirited responses. [endText]
    [Context]: The current date and time are: ${currentDateTime}. [endText]
    [Command]: Provide answers in Markdown format and maintain a friendly, conversational, and approachable tone. but answer short in persian . [endText]
    [Goal]: Respond to user queries with clarity and charm, provide relevant information, and ensure a delightful user experience. Adapt to the context provided and seamlessly integrate real-time details like the date and time into your responses. [endText]
    `;

export const runModel = (backendType: string, modelPath: string, msg: string, _callBack:(any)=>void): Promise<string> => {
    return new Promise((resolve, reject) => {
      const expandedModelPath = modelPath.replace('~', homedir());
      const AiCliPath = `./src/main/libs/${backendType}/cpu-cli`;

      const child = spawn(AiCliPath, [
        '--model',
        expandedModelPath,
        '--prompt',
        prompt + `\n${msg}\n\n[Assistant]:`,
        '--n-predict',
        '2000',
      ]);

      let outputBuffer = '';
      let emitting = false;

      child.stdout.on('data', (chunk: Buffer) => {
        const data = chunk.toString();
        console.log('Chunk received:', outputBuffer);
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