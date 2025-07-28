> **Note:** This project was created entirely using AI coding (no human intervention in the code). The codebase has not yet been cleaned up or refactored, as the goal is to observe how the code evolves when generated solely by AI.

# AI Lean Canvas

A simple web app to build and brainstorm Lean Canvas business models, featuring an AI-powered chat sidebar for brainstorming.

## Quick Start

The application uses deepseek-r1:latest as its default model. To get started, simply run:

```bash
docker-compose up
```

This will start the application with all default settings. The frontend will be available at http://localhost:3000.

You can find more models available in the [Ollama model search page](https://ollama.com/search?c=thinking).

## Custom Model Setup

If you want to use a different model, you can set the `VITE_OLLAMA_MODEL` environment variable and rebuild the containers:

1. Set the model environment variable:
   - On Windows:
     ```powershell
     $env:VITE_OLLAMA_MODEL="your-model-name"
     ```
   - On Linux/Mac:
     ```bash
     export VITE_OLLAMA_MODEL=your-model-name
     ```

2. Rebuild and run the containers:
   ```bash
   docker-compose up --build
   ```

## Accessing the Application

Once running, you can access:
- The main application at http://localhost:3000
- The Ollama service at http://localhost:11434
- The Open WebUI interface at http://localhost:8080 for a rich, interactive LLM experience (learn more at [Open WebUI](https://github.com/open-webui/open-webui))

## Environment Configuration

If you prefer, you can also set the model configuration using a `.env` file:

1. Copy the `.env-example` file to `.env`
2. Add or modify the following line:
   ```
   VITE_OLLAMA_MODEL=your-model-name
   ```
3. Run `docker-compose up --build` to apply the changes