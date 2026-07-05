const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema(
  {
    // Applicant input data
    age: { type: Number, required: true },
    annualIncome: { type: Number, required: true },
    loanAmount: { type: Number, required: true },
    loanTermMonths: { type: Number, required: true },
    creditScore: { type: Number, required: true },
    existingLoansCount: { type: Number, default: 0 },
    debtToIncomeRatio: { type: Number, required: true },
    creditUtilization: { type: Number, required: true },
    missedPaymentsLast12m: { type: Number, default: 0 },
    employmentYears: { type: Number, required: true },
    employmentType: {
      type: String,
      enum: ["salaried", "self_employed", "business_owner"],
      required: true,
    },

    // Model output
    defaultProbability: { type: Number, required: true },
    riskTier: { type: String, enum: ["Low", "Medium", "High"], required: true },
    topRiskFactors: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prediction", predictionSchema);
