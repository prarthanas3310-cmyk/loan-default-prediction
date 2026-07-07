import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

const initialForm = {
  age: "",
  annual_income: "",
  loan_amount: "",
  loan_term_months: 36,
  credit_score: "",
  existing_loans_count: 0,
  debt_to_income_ratio: "",
  credit_utilization: "",
  missed_payments_last_12m: 0,
  employment_years: "",
  employment_type: "salaried",
};

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload = {
        ...form,
        age: Number(form.age),
        annual_income: Number(form.annual_income),
        loan_amount: Number(form.loan_amount),
        loan_term_months: Number(form.loan_term_months),
        credit_score: Number(form.credit_score),
        existing_loans_count: Number(form.existing_loans_count),
        debt_to_income_ratio: Number(form.debt_to_income_ratio),
        credit_utilization: Number(form.credit_utilization),
        missed_payments_last_12m: Number(form.missed_payments_last_12m),
        employment_years: Number(form.employment_years),
      };
      const res = await axios.post(`${API_BASE}/predict`, payload);
      setResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.error || "Prediction failed. Check inputs and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const tierClass = {
    Low: "tier-low",
    Medium: "tier-medium",
    High: "tier-high",
  };

  return (
    <div className="app-container">
      <header>
        <h1>Default Prediction Model</h1>
        <p className="subtitle">Problem Statement 4 — Credit Risk Assessment</p>
      </header>

      <form onSubmit={handleSubmit} className="form-grid">
        <input name="age" type="number" placeholder="Age" value={form.age} onChange={handleChange} required />
        <input name="annual_income" type="number" placeholder="Annual Income" value={form.annual_income} onChange={handleChange} required />
        <input name="loan_amount" type="number" placeholder="Loan Amount" value={form.loan_amount} onChange={handleChange} required />
        <select name="loan_term_months" value={form.loan_term_months} onChange={handleChange}>
          {[12, 24, 36, 48, 60].map((m) => (
            <option key={m} value={m}>{m} months</option>
          ))}
        </select>
        <input name="credit_score" type="number" placeholder="Credit Score (300-900)" value={form.credit_score} onChange={handleChange} required />
        <input name="existing_loans_count" type="number" placeholder="Existing Loans Count" value={form.existing_loans_count} onChange={handleChange} />
        <input name="debt_to_income_ratio" type="number" step="0.01" placeholder="Debt-to-Income Ratio (0-1)" value={form.debt_to_income_ratio} onChange={handleChange} required />
        <input name="credit_utilization" type="number" step="0.01" placeholder="Credit Utilization (0-1)" value={form.credit_utilization} onChange={handleChange} required />
        <input name="missed_payments_last_12m" type="number" placeholder="Missed Payments (12m)" value={form.missed_payments_last_12m} onChange={handleChange} />
        <input name="employment_years" type="number" step="0.1" placeholder="Employment Years" value={form.employment_years} onChange={handleChange} required />
        <select name="employment_type" value={form.employment_type} onChange={handleChange} className="full-width">
          <option value="salaried">Salaried</option>
          <option value="self_employed">Self-Employed</option>
          <option value="business_owner">Business Owner</option>
        </select>

        <button type="submit" disabled={loading} className="submit-btn full-width">
          {loading ? "Predicting..." : "Predict Default Risk"}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      {result && (
        <div className={`result-card ${tierClass[result.risk_tier]}`}>
          <p className="result-prob">
            Default Probability: <strong>{(result.default_probability * 100).toFixed(1)}%</strong>
          </p>
          <p className="result-tier">Risk Tier: <strong>{result.risk_tier}</strong></p>
          <p className="result-factors">
            Top Risk Factors: {result.top_risk_factors.join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}