"""
Generates a realistic synthetic loan/credit dataset for Default Prediction Model.
Mimics real-world features used in fintech credit risk models (similar to
Kaggle 'Loan Default Prediction' / German Credit Data style features).

Replace this with your real dataset later (see README for expected columns).
"""
import numpy as np
import pandas as pd

np.random.seed(42)
N = 5000

df = pd.DataFrame({
    "age": np.random.randint(21, 65, N),
    "annual_income": np.random.lognormal(mean=10.8, sigma=0.5, size=N).round(2),
    "loan_amount": np.random.lognormal(mean=9.5, sigma=0.6, size=N).round(2),
    "loan_term_months": np.random.choice([12, 24, 36, 48, 60], N),
    "credit_score": np.random.normal(650, 90, N).clip(300, 900).round(0),
    "existing_loans_count": np.random.poisson(1.2, N),
    "debt_to_income_ratio": np.random.uniform(0.05, 0.9, N).round(3),
    "credit_utilization": np.random.uniform(0.0, 1.0, N).round(3),
    "missed_payments_last_12m": np.random.poisson(0.5, N),
    "employment_years": np.random.uniform(0, 30, N).round(1),
    "employment_type": np.random.choice(
        ["salaried", "self_employed", "business_owner"], N, p=[0.6, 0.25, 0.15]
    ),
})

# monthly installment approx (simple, for feature realism)
df["monthly_installment"] = (df["loan_amount"] / df["loan_term_months"]).round(2)
df["installment_to_income_ratio"] = (
    (df["monthly_installment"] * 12) / df["annual_income"]
).round(3)

# ---- Construct a realistic default probability from features (ground truth generator) ----
risk_score = (
    -0.020 * (df["credit_score"] - 650)
    + 3.0 * df["debt_to_income_ratio"]
    + 2.0 * df["credit_utilization"]
    + 0.9 * df["missed_payments_last_12m"]
    + 2.5 * df["installment_to_income_ratio"]
    - 0.03 * df["employment_years"]
    + 0.3 * df["existing_loans_count"]
    + np.random.normal(0, 1.0, N)  # noise
)

prob_default = 1 / (1 + np.exp(-(risk_score - 5.0)))  # sigmoid, shifted so ~15-20% default
df["default"] = (np.random.uniform(0, 1, N) < prob_default).astype(int)

df.to_csv("/home/claude/default-prediction/data/loan_data.csv", index=False)
print("Saved loan_data.csv:", df.shape)
print("Default rate:", df["default"].mean().round(3))
print(df.head())
