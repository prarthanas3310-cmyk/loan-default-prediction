"""
Trains a Default Prediction model on loan_data.csv.
Saves: model.pkl, scaler.pkl, feature_columns.pkl, encoders.pkl
"""
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import (
    roc_auc_score, classification_report, confusion_matrix
)
from xgboost import XGBClassifier

df = pd.read_csv("/home/claude/default-prediction/data/loan_data.csv")

# Encode categorical
le = LabelEncoder()
df["employment_type_enc"] = le.fit_transform(df["employment_type"])

feature_cols = [
    "age", "annual_income", "loan_amount", "loan_term_months",
    "credit_score", "existing_loans_count", "debt_to_income_ratio",
    "credit_utilization", "missed_payments_last_12m", "employment_years",
    "employment_type_enc", "monthly_installment", "installment_to_income_ratio",
]

X = df[feature_cols]
y = df["default"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

model = XGBClassifier(
    n_estimators=200,
    max_depth=4,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    eval_metric="logloss",
    random_state=42,
)
model.fit(X_train_scaled, y_train)

# Evaluate
y_pred = model.predict(X_test_scaled)
y_proba = model.predict_proba(X_test_scaled)[:, 1]

print("=== Model Evaluation ===")
print("AUC-ROC:", round(roc_auc_score(y_test, y_proba), 4))
print(classification_report(y_test, y_pred))
print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))

# Feature importance
importances = pd.Series(model.feature_importances_, index=feature_cols).sort_values(ascending=False)
print("\n=== Top Risk Factors ===")
print(importances)

# Save artifacts
joblib.dump(model, "/home/claude/default-prediction/model/model.pkl")
joblib.dump(scaler, "/home/claude/default-prediction/model/scaler.pkl")
joblib.dump(feature_cols, "/home/claude/default-prediction/model/feature_columns.pkl")
joblib.dump(le, "/home/claude/default-prediction/model/employment_encoder.pkl")
importances.to_csv("/home/claude/default-prediction/model/feature_importance.csv")

print("\nSaved model artifacts to /home/claude/default-prediction/model/")
