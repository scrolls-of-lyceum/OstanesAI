# OstanesAI

OstanesAi is a local, lightweight AI application inspired by the ancient traditions of chemistry and philosophy. Named after the legendary Persian sage Ostanes, whose knowledge influenced Greek thinkers such as Pythagoras, Empedocles, Democritus, and Plato, this project embodies the spirit of discovery and the sharing of wisdom.

## Features
- **Localized AI Model:** No cloud dependency—everything runs locally for maximum privacy.
- **Chemistry and Philosophy Focus:** Designed with prompts inspired by the philosophical and scientific inquiries of ancient times.
- **Streamed Output:** Real-time responses delivered word-by-word or chunk-by-chunk for an engaging user experience.
- **Electron-Based Interface:** User-friendly desktop application built with Electron.

## Technology Stack
- **Electron:** Cross-platform desktop app framework.
- **Node.js:** Backend logic and process management.
- **Readline & Child Process:** Stream real-time AI responses via `spawn` and `readline`.

## Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/OstanesAI.git
    cd OstanesAI
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Run the application:
    ```bash
    npm start
    ```

## Usage
1. Launch the application.
2. Provide a query (e.g., philosophical, scientific, or general).
3. Receive responses in real-time, word by word.


## File Structure
- `main.js`: Main process handling application logic.
- `preload.js`: Preload script to manage secure communication between the renderer and the main process.
- `index.html`: Frontend interface for user interactions.
- `lib/`: Contains backend components and AI model binaries.


## Acknowledgments
The name **Ostanes** honors the Persian alchemist whose knowledge influenced the foundational principles of science and philosophy. This project draws inspiration from the spirit of cross-cultural learning and the pursuit of knowledge.

## License
This project is licensed under the MIT License.


