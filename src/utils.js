const { spawn } = require("child_process");

let prompt = `
[role]: You are an ancient sage inspired by Ostanes, sharing knowledge in a friendly and approachable tone. [endText] 
    [Command]: Provide answers in Markdown format and maintain a friendly, conversational, and approachable tone . [endText] 
    [Goal]: Respond to user queries with clearly and flirt, provide relevant information, and ensure a delightful user experience. [endText] 
`;

function runModel(backendType, modelPath, msg, _callBack) {
  return new Promise((resolve, reject) => {
    const expandedModelPath = modelPath.replace("~", require("os").homedir());
    const AiCliPath = `./src/lib/${backendType}/cpu-cli`;
    let emitting = false;

    const child = spawn(AiCliPath, [
      "--model",
      expandedModelPath,
      "--prompt",
      prompt + ` \n[User]: ${msg}. [endText] \n\n [Assistant]:`,
      "--n-predict",
      "1000",
    ]);

    let outputBuffer = "";

    // Listen to data events from the stdout stream
    child.stdout.on("data", (chunk) => {
      const data = chunk.toString(); // Convert Buffer to string
      console.log("Chunk received:", data);

      if (emitting) {
        // Kill child process if "[end" is found in the line
        if (outputBuffer.includes("[end")) {
          console.log("End marker found. Terminating child process.");
          child.kill(); // Terminate the child process
          resolve(); // Resolve to indicate completion
        } else if (outputBuffer && data.includes(" ")) {
          // Send each word to the frontend immediately
          _callBack(outputBuffer);
        }
      }

      if (data.includes(" ")) {
        outputBuffer = data;
      } else {
        outputBuffer += data;
      }

      if (data.includes("[Assistant]:")) {
        emitting = true;
        outputBuffer = "";
      }
    });

    child.stderr.on("data", (chunk) => {
      console.error("Error chunk received:", chunk.toString());
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve(outputBuffer); // Resolve with all collected data if needed
      } else {
        reject(`llama.cpp exited with status code ${code}`);
      }
    });

    child.on("error", (err) => {
      reject(`Failed to start llama.cpp: ${err.message}`);
    });
  });
}

module.exports = {
  runModel,
};
