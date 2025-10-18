#!/bin/bash

# Load production environment
export $(cat .env.production | xargs)

# Run with gunicorn
gunicorn --bind 0.0.0.0:${PORT:-8080} --workers 4 --access-logfile - --error-logfile - app:app