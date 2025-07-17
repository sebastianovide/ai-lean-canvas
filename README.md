# AI Lean Canvas

A simple web app to build and brainstorm Lean Canvas business models, featuring an AI-powered chat sidebar for brainstorming.

## Prerequisite: Running Ollama with deepseek-r1

To use the AI-powered features, you must have Ollama running locally and thedeepseek-r1 model installed:

1. **Install and Start Ollama**

   - Download and install Ollama from [https://ollama.com/download](https://ollama.com/download).
   - Start Ollama by running:
     ```bash
     ollama serve
     ```

2. **Install the deepseek-r1 Model**

   - With Ollama running, install the model by running:
     ```bash
     ollama pull deepseek-r1
     ```

3. **Keep Ollama Running**
   - Make sure Ollama stays running in the background while you use the app.

## How to Run

1. Install dependencies:
   ```bash
   npm install
   # Installs all required packages listed in package.json
   ```
2. Start the development server:
   ```bash
   npm run dev
   # Starts the app in development mode (hot reload enabled)
   ```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## How to Build and Deploy

1. Build the production static files:
   ```bash
   npm run build
   # Generates optimized static files in the dist/ directory
   ```
2. Deploy the contents of the `dist/` directory to your preferred static hosting provider (e.g., Vercel, Netlify, GitHub Pages, or your own server).
   # The app is fully static and can be hosted on any static file server.

## How to Preview the Static Build Locally

1. Install a static file server (e.g., `serve`):
   ```bash
   npm install -g serve
   # Installs the 'serve' package globally
   ```
2. Build the project (if you haven't already):
   ```bash
   npm run build
   # Generates the production build in the dist/ directory
   ```
3. Serve the static files:
   ```bash
   serve -s dist
   # Starts a local server at http://localhost:3000 to preview the production build
   ```

You can use any static file server (such as `http-server` or `python -m http.server`), but `serve` is recommended for Vite/React projects because it handles SPA routing correctly.
