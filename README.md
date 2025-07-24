> **Note:** This project was created entirely using AI coding (no human intervention in the code). The codebase has not yet been cleaned up or refactored, as the goal is to observe how the code evolves when generated solely by AI.

# AI Lean Canvas

A simple web app to build and brainstorm Lean Canvas business models, featuring an AI-powered chat sidebar for brainstorming.

## Prerequisite: Running Ollama with deepseek-r1

To use the AI-powered features, you must have Ollama running locally and the deepseek-r1 model installed:

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

## Docker Deployment (Recommended)

To run the application using Docker, follow these steps:

1. Run the application:
   ```bash
   docker-compose up
   ```
   This will:
   - Start the frontend React application in development mode
   - Pull and run the official Ollama service
   - Pull the qwen3:4b model (or specify a different model using OLLAMA_MODEL environment variable)
   
2. Access the application:
   - Open http://localhost:5173 in your browser
   - The Ollama service will be available at http://localhost:11434

## Local Development (Alternative)

If you prefer local development without Docker:

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

Note: For local development, you'll need to have Ollama running locally as described in the "Prerequisite" section above.

## Environment Configuration

You can configure the Ollama model used by the application in two ways:

1. Using a `.env` file:
   - Create a `.env` file in the root directory
   - Add the following line:
     ```
     VITE_OLLAMA_MODEL=llama3
     ```
   - The application will automatically use this model when started

2. Using command-line prefix:
   - Prefix your docker-compose commands with `VITE_OLLAMA_MODEL=llama3`
   - For example:
     ```bash
     VITE_OLLAMA_MODEL=llama3 docker-compose up
     ```

3. Using Docker:
   - When using Docker, you can set the model in two ways:
     a. Using docker-compose.yml:
        ```yaml
        environment:
          - OLLAMA_MODEL=llama3
        ```
     b. Or when running docker-compose:
        ```bash
        OLLAMA_MODEL=llama3 docker-compose up
        ```

The model name must match one of the available models in your Ollama installation. You can check available models by running `ollama list` in your terminal.

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
