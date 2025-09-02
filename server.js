// server.js
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware to parse JSON bodies and serve static files
app.use(express.json());
app.use(express.static('public')); // We'll create a 'public' folder for our frontend

// Initialize the Google Gemini AI model
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Define the API endpoint for task decomposition
app.post('/api/decompose-task', async (req, res) => {
    const { task } = req.body;

    if (!task) {
        return res.status(400).json({ error: 'Task is required' });
    }

    const prompt = `
        You are an expert project manager. Your task is to take a complex user-submitted task and decompose it into a series of smaller, actionable sub-tasks.
        Provide the output as a clean JSON array of objects. Each object should have two keys: "subtask" (a string describing the step) and "time" (a string estimating the time required, e.g., "30 mins", "2 hours").
        Do not include any introductory text, markdown formatting like \`\`\`json, or explanations. Just the raw JSON array.
        If the task is too simple (e.g., "drink water"), return an empty array.

        User's Task: "${task}"
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean the response to ensure it's valid JSON
        const jsonResponse = JSON.parse(text.trim());
        res.json(jsonResponse);
    } catch (error) {
        console.error('Error with AI API:', error);
        res.status(500).json({ error: 'Failed to decompose task' });
    }
});

app.listen(port, () => {
    console.log(`ZenFlow server listening at http://localhost:${port}`);
});