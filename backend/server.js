require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const predictionsRouter = require("./routes/predictions");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/api", predictionsRouter);

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
