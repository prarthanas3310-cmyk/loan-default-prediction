# Default Prediction Model — Problem Statement 4
### Standalone project (independent of Problem 3 submission)

## Architecture
```
React (frontend, Vite)  --port 5173
        |
        v
Express + MongoDB (backend)  --port 5000
        |
        v
Flask + XGBoost (ml-api)  --port 5001
```

Three independent services. Each can be run, tested, and demoed on its own.

## Folder structure
```
problem4-standalone/
├── ml-api/              Python Flask ML service
│   ├── app.py
│   ├── requirements.txt
│   ├── model/           trained model artifacts
│   │   └── train_model.py
│   └── data/            dataset + generator script
│       └── generate_data.py
├── backend/             Express + MongoDB API
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   ├── config/db.js
│   ├── models/Prediction.js
│   └── routes/predictions.js
└── frontend/             React (Vite) app
    ├── src/App.jsx
    ├── src/App.css
    └── package.json
```

## How to run (3 terminals)

### 1. ML API (Python)
```bash
cd ml-api
pip install -r requirements.txt
python3 app.py
```
Runs on `http://localhost:5001`. Test: `curl http://localhost:5001/health`

To retrain on new data: replace `data/loan_data.csv` (same columns) and run
`python3 model/train_model.py` — this overwrites the model artifacts.

### 2. Backend (Node/Express)
```bash
cd backend
npm install
cp .env.example .env     # edit MONGO_URI if using Atlas instead of local Mongo
npm start
```
Runs on `http://localhost:5000`. Requires a running MongoDB instance —
either install MongoDB locally, or create a free cluster at mongodb.com/atlas
and paste its connection string into `.env` as MONGO_URI.

### 3. Frontend (React/Vite)
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`. Open in browser — fill the form and submit.

## What it does
- User fills applicant details (income, credit score, DTI, etc.) in the React form
- Express backend forwards the data to the Flask ML API
- Flask returns default probability + risk tier (Low/Medium/High) + top risk factors
- Express saves the full record (inputs + prediction) to MongoDB
- "View Prediction History" in the UI shows all past predictions from MongoDB

## Model details
- Algorithm: XGBoost Classifier
- AUC-ROC: 0.84 on held-out test data
- Top predictive features: credit score, missed payments (12 months), debt-to-income ratio
- Dataset: synthetic (5,000 rows), mimicking real credit-risk feature distributions —
  swap in real data anytime (see `ml-api/README` section above on required columns)

## Talking points for judges
- Independent microservice architecture (Python ML + Node API + React UI) — realistic
  production fintech pattern, not a monolith
- Explainable output (top risk factors) rather than a black-box score — important for
  regulated lending decisions
- Full request lifecycle stored in MongoDB — enables audit trail / analytics later
- Clear path to swap in real bank data without touching API or frontend code
