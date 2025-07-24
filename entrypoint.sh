#!/bin/bash

echo "ENV DUMP:"
env | grep OLLAMA

echo "Pulling model: $OLLAMA_MODEL_DEFAULT"

ollama serve &

sleep 5

ollama pull "$OLLAMA_MODEL_DEFAULT"

wait
