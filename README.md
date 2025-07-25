> **Note:** This project was created entirely using AI coding (no human intervention in the code). The codebase has not yet been cleaned up or refactored, as the goal is to observe how the code evolves when generated solely by AI.

# AI Lean Canvas

A simple web app to build and brainstorm Lean Canvas business models, featuring an AI-powered chat sidebar for brainstorming.

## Docker Deployment

To run the application using Docker, follow these steps:

1. Set the Ollama model environment variable:
   - On Windows:
     ```powershell
     $env:VITE_OLLAMA_MODEL="llama3"
     ```
   - On Linux/Mac:
     ```bash
     export VITE_OLLAMA_MODEL=llama3
     ```

2. Run the application:
   ```bash
   docker-compose up --build
   ```
   This will:
   - Start the frontend React application in development mode
   - Pull and run the official Ollama service
   - Pull the qwen3:4b model (or specify a different model using OLLAMA_MODEL environment variable)
   
3. Access the application:
   - Open http://localhost:3000 in your browser
   - The Ollama service will be available at http://localhost:11434
   - Access the Open WebUI interface at http://localhost:8080 for a rich, interactive LLM experience (learn more at [Open WebUI](https://github.com/open-webui/open-webui))

## Environment Configuration

If you prefer instead of setting the environment variable, you can use a `.env` file.

1. Using a `.env` file:
   - Copy the `.env-example` file to `.env`
   - Add the following line:
     ```
     VITE_OLLAMA_MODEL=llama3
     ```
   - The application will automatically use this model when started