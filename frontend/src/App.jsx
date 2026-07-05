import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_BASE = "http://localhost:5000/api";

const initialForm = {
  age: "",
  annualIncome: "",
  loanAmount: "",
  loanTermMonths: 36,
  creditScore: "",
  existingLoansCount: 0,
  debtToIncomeRatio: "",
  creditUtilization: "",
  missedPaymentsLast12m: 0,
  employmentYears: "",
  employmentType: "salaried",
};

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/predictions`);
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  useEffect(() => {
    if (showHistory) fetchHistory();
  }, [showHistory]);

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
        annualIncome: Number(form.annualIncome),
        loanAmount: Number(form.loanAmount),
        loanTermMonths: Number(form.loanTermMonths),
        creditScore: Number(form.creditScore),
        existingLoansCount: Number(form.existingLoansCount),
        debtToIncomeRatio: Number(form.debtToIncomeRatio),
        creditUtilization: Number(form.creditUtilization),
        missedPaymentsLast12m: Number(form.missedPaymentsLast12m),
        employmentYears: Number(form.employmentYears),
      };
      const res = await axios.post(`${API_BASE}/predictions`, payload);
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
        <button className="link-btn" onClick={() => setShowHistory((s) => !s)}>
          {showHistory ? "Back to Form" : "View Prediction History"}
        </button>
      </header>

      {!showHistory ? (
        <>
          <form onSubmit={handleSubmit} className="form-grid">
            <input name="age" type="number" placeholder="Age" value={form.age} onChange={handleChange} required />
            <input name="annualIncome" type="number" placeholder="Annual Income" value={form.annualIncome} onChange={handleChange} required />
            <input name="loanAmount" type="number" placeholder="Loan Amount" value={form.loanAmount} onChange={handleChange} required />
            <select name="loanTermMonths" value={form.loanTermMonths} onChange={handleChange}>
              {[12, 24, 36, 48, 60].map((m) => (
                <option key={m} value={m}>{m} months</option>
              ))}
            </select>
            <input name="creditScore" type="number" placeholder="Credit Score (300-900)" value={form.creditScore} onChange={handleChange} required />
            <input name="existingLoansCount" type="number" placeholder="Existing Loans Count" value={form.existingLoansCount} onChange={handleChange} />
            <input name="debtToIncomeRatio" type="number" step="0.01" placeholder="Debt-to-Income Ratio (0-1)" value={form.debtToIncomeRatio} onChange={handleChange} required />
            <input name="creditUtilization" type="number" step="0.01" placeholder="Credit Utilization (0-1)" value={form.creditUtilization} onChange={handleChange} required />
            <input name="missedPaymentsLast12m" type="number" placeholder="Missed Payments (12m)" value={form.missedPaymentsLast12m} onChange={handleChange} />
            <input name="employmentYears" type="number" step="0.1" placeholder="Employment Years" value={form.employmentYears} onChange={handleChange} required />
            <select name="employmentType" value={form.employmentType} onChange={handleChange} className="full-width">
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
            <div className={`result-card ${tierClass[result.riskTier]}`}>
              <p className="result-prob">
                Default Probability: <strong>{(result.defaultProbability * 100).toFixed(1)}%</strong>
              </p>
              <p className="result-tier">Risk Tier: <strong>{result.riskTier}</strong></p>
              <p className="result-factors">
                Top Risk Factors: {result.topRiskFactors.join(", ")}
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="history-section">
          <h2>Recent Predictions</h2>
          {history.length === 0 ? (
            <p>No predictions yet.</p>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Credit Score</th>
                  <th>Loan Amount</th>
                  <th>Default Prob.</th>
                  <th>Tier</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h._id}>
                    <td>{new Date(h.createdAt).toLocaleString()}</td>
                    <td>{h.creditScore}</td>
                    <td>{h.loanAmount}</td>
                    <td>{(h.defaultProbability * 100).toFixed(1)}%</td>
                    <td className={tierClass[h.riskTier]}>{h.riskTier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
