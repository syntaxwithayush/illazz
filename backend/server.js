const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "Illazz backend is running",
        status: "success"
    });
});

// Symptom assessment API
app.post("/api/symptoms", (req, res) => {
    const { symptoms } = req.body;

    // Validate input
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Please provide at least one symptom."
        });
    }

    // Clean symptoms
    const normalizedSymptoms = symptoms.map(
        symptom => symptom.toLowerCase().trim()
    );

    // Demo triage logic
    let risk = "low";

    if (
        normalizedSymptoms.includes("chest pain") ||
        normalizedSymptoms.includes("difficulty breathing")
    ) {
        risk = "high";
    } else if (
        normalizedSymptoms.includes("fever") ||
        normalizedSymptoms.includes("cough") ||
        normalizedSymptoms.includes("headache")
    ) {
        risk = "moderate";
    }

    // Response
    res.json({
        success: true,
        type: "preliminary_assessment",
        symptoms: normalizedSymptoms,
        risk: risk,
        recommendation:
            risk === "high"
                ? "Please seek urgent medical attention."
                : "Please consult a qualified doctor for proper evaluation.",
        disclaimer:
            "This is preliminary health guidance and is not a medical diagnosis."
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Illazz backend running on http://localhost:${PORT}`);
});