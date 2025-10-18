from flask import Flask, request, jsonify, send_from_directory, abort
import random
from datetime import datetime, timezone
import os
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='static', static_url_path='/static')

# In-memory store
compliments = []
next_id = 1


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def normalize(text: str) -> str:
    # lower, trim, collapse whitespace
    return ' '.join(text.strip().lower().split())


# Seed data
_seed = [
    "You're doing great!",
    "Your code is clean and readable.",
    "You have a knack for solving problems.",
    "Your naming is on point.",
    "You're a quick learner.",
]

for t in _seed:
    compliments.append({"id": next_id, "text": t, "created_at": now_iso()})
    next_id += 1


@app.get('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')


@app.get('/api/stats')
def stats():
    return jsonify({"count": len(compliments)})


@app.get('/api/compliments')
def list_compliments():
    try:
        limit = int(request.args.get('limit', '10'))
    except ValueError:
        limit = 10
    limit = max(1, min(100, limit))
    items = list(reversed(compliments))[:limit]
    return jsonify([{"id": c["id"], "text": c["text"]} for c in items])


@app.get('/api/compliments/random')
def random_compliment():
    if not compliments:
        return ('', 204)
    c = random.choice(compliments)
    return jsonify({"id": c["id"], "text": c["text"]})


@app.post('/api/compliments')
def create_compliment():
    data = request.get_json(silent=True) or {}
    text = (data.get('text') or '').strip()
    if not (1 <= len(text) <= 140):
        return jsonify({"error": "Compliment must be 1–140 characters."}), 400
    ntext = normalize(text)
    if any(normalize(c['text']) == ntext for c in compliments):
        return jsonify({"error": "That compliment already exists."}), 400

    global next_id
    item = {"id": next_id, "text": text, "created_at": now_iso()}
    compliments.append(item)
    next_id += 1
    return jsonify({"id": item["id"], "text": item["text"]}), 201


@app.delete('/api/compliments/<int:cid>')
def delete_compliment(cid: int):
    idx = next((i for i, c in enumerate(compliments) if c['id'] == cid), None)
    if idx is None:
        return jsonify({"error": "Not found"}), 404
    compliments.pop(idx)
    return ('', 204)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', '8080'))
    debug = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    logger.info(f'Starting Flask app on port {port}, debug={debug}')
    app.run(host='0.0.0.0', port=port, debug=debug)
