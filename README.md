# Flask Compliments API

A simple Flask API for managing compliments with a web interface.

## Features

- RESTful API for compliments CRUD operations
- Static file serving for web interface
- Environment-based configuration
- Production-ready with Gunicorn
- Docker support
- Heroku deployment ready

## API Endpoints

- `GET /` - Serve web interface
- `GET /api/stats` - Get compliment count
- `GET /api/compliments` - List compliments (with optional limit parameter)
- `GET /api/compliments/random` - Get random compliment
- `POST /api/compliments` - Create new compliment
- `DELETE /api/compliments/<id>` - Delete compliment by ID

## Development Setup

1. Create virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run development server:
   ```bash
   python app.py
   ```

## Production Deployment

### Local Production
```bash
./run_production.sh
```

### Docker
```bash
docker build -t flask-compliments .
docker run -p 8080:8080 flask-compliments
```

### Docker Compose
```bash
docker-compose up
```

### Heroku
```bash
git push heroku main
```

## Environment Variables

- `PORT` - Server port (default: 8080)
- `FLASK_DEBUG` - Enable debug mode (default: false)
- `FLASK_ENV` - Flask environment (development/production)

## Project Structure

```
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── Dockerfile         # Docker configuration
├── docker-compose.yml # Docker Compose setup
├── Procfile          # Heroku configuration
├── run_production.sh # Production runner script
├── static/           # Static files (HTML, CSS, JS)
└── .env.production   # Production environment variables
```