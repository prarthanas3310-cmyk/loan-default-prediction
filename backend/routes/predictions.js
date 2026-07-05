const express = require("express");
const axios = require("axios");
const router = express.Router();
const Prediction = require("../models/Prediction");

const ML_API_URL = process.env.ML_API_URL || "http://localhost:5001";

// POST /api/predictions  -> run prediction + save to DB
router.post("/predictions", async (req, res) => {
  try {
    const {
      age,
      annualIncome,
      loanAmount,
      loanTermMonths,
      creditScore,
      existingLoansCount,
      debtToIncomeRatio,
      creditUtilization,
      missedPaymentsLast12m,
      employmentYears,
      employmentType,
    } = req.body;

    if (
      [age, annualIncome, loanAmount, loanTermMonths, creditScore, employmentType].some(
        (v) => v === undefined || v === null || v === ""
      )
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const mlResponse = await axios.post(`${ML_API_URL}/predict`, {
      age,
      annual_income: annualIncome,
      loan_amount: loanAmount,
      loan_term_months: loanTermMonths,
      credit_score: creditScore,
      existing_loans_count: existingLoansCount,
      debt_to_income_ratio: debtToIncomeRatio,
      credit_utilization: creditUtilization,
      missed_payments_last_12m: missedPaymentsLast12m,
      employment_years: employmentYears,
      employment_type: employmentType,
    });

    const { default_probability, risk_tier, top_risk_factors } = mlResponse.data;

    const prediction = new Prediction({
      age,
      annualIncome,
      loanAmount,
      loanTermMonths,
      creditScore,
      existingLoansCount,
      debtToIncomeRatio,
      creditUtilization,
      missedPaymentsLast12m,
      employmentYears,
      employmentType,
      defaultProbability: default_probability,
      riskTier: risk_tier,
      topRiskFactors: top_risk_factors,
    });

    await prediction.save();

    return res.status(201).json(prediction);
  } catch (err) {
    console.error("Prediction error:", err.message);
    if (err.response) {
      // error from Flask API
      return res.status(502).json({ error: "ML API error: " + JSON.stringify(err.response.data) });
    }
    return res.status(500).json({ error: "Prediction failed" });
  }
});

// GET /api/predictions -> history, most recent first
router.get("/predictions", async (req, res) => {
  try {
    const predictions = await Prediction.find().sort({ createdAt: -1 }).limit(50);
    res.json(predictions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch predictions" });
  }
});

// GET /api/predictions/:id
router.get("/predictions/:id", async (req, res) => {
  try {
    const prediction = await Prediction.findById(req.params.id);
    if (!prediction) return res.status(404).json({ error: "Not found" });
    res.json(prediction);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch prediction" });
  }
});

module.exports = router;
