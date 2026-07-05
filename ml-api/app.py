"""
Flask API serving the Default Prediction model.
Your Node/Express backend calls this via HTTP POST to /predict.

Run: python3 app.py   (runs on http://localhost:5001)
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd

app = Flask(__name__)
CORS(app)  # allow calls from your Node/React app

import os
MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model")
model = joblib.load(f"{MODEL_DIR}/model.pkl")
scaler = joblib.load(f"{MODEL_DIR}/scaler.pkl")
feature_cols = joblib.load(f"{MODEL_DIR}/feature_columns.pkl")
emp_encoder = joblib.load(f"{MODEL_DIR}/employment_encoder.pkl")


def risk_tier(prob):
    if prob < 0.15:
        return "Low"
    elif prob < 0.40:
        return "Medium"
    else:
        return "High"


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/predict", methods=["POST"])
def predict():
    """
    Expected JSON body:
    {
      "age": 35,
      "annual_income": 45000,
      "loan_amount": 15000,
      "loan_term_months": 36,
      "credit_score": 680,
      "existing_loans_count": 1,
      "debt_to_income_ratio": 0.35,
      "credit_utilization": 0.5,
      "missed_payments_last_12m": 0,
      "employment_years": 5,
      "employment_type": "salaried"   # salaried | self_employed | business_owner
    }
    """
    try:
        data = request.get_json()

        # derived features (must match training)
        monthly_installment = data["loan_amount"] / data["loan_term_months"]
        installment_to_income_ratio = (monthly_installment * 12) / data["annual_income"]

        emp_type_enc = emp_encoder.transform([data["employment_type"]])[0]

        row = {
            "age": data["age"],
            "annual_income": data["annual_income"],
            "loan_amount": data["loan_amount"],
            "loan_term_months": data["loan_term_months"],
            "credit_score": data["credit_score"],
            "existing_loans_count": data["existing_loans_count"],
            "debt_to_income_ratio": data["debt_to_income_ratio"],
            "credit_utilization": data["credit_utilization"],
            "missed_payments_last_12m": data["missed_payments_last_12m"],
            "employment_years": data["employment_years"],
            "employment_type_enc": emp_type_enc,
            "monthly_installment": monthly_installment,
            "installment_to_income_ratio": installment_to_income_ratio,
        }

        X = pd.DataFrame([row])[feature_cols]
        X_scaled = scaler.transform(X)

        prob = float(model.predict_proba(X_scaled)[0, 1])
        tier = risk_tier(prob)

        # top contributing factors (simple heuristic using feature importances)
        importances = model.feature_importances_
        top_idx = np.argsort(importances)[::-1][:3]
        top_factors = [feature_cols[i] for i in top_idx]

        return jsonify({
            "default_probability": round(prob, 4),
            "risk_tier": tier,
            "top_risk_factors": top_factors,
        })

    except KeyError as e:
        return jsonify({"error": f"Missing field: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
