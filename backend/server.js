require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const cors = require('cors'); // Import the cors library
const axios = require('axios'); // Make sure to install axios

const app = express();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const controllers = {};

// Use cors middleware and allow any origin (not recommended for production)
app.use(cors());

app.use(bodyParser.json());

app.post('/complete', async (req, res) => {
    const requestId = req.body.requestId; // You need to send a unique identifier with each request
    const controller = new AbortController();
    controllers[requestId] = controller;

    const userMessage = req.body.userMessage;
    const stream = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: userMessage }],
        stream: true,
    }, { signal: controllers[requestId].signal });
    
    for await (const part of stream) {
        console.log("part", part);
        console.log("part.choices[0]?.delta?.content", part.choices[0]?.delta?.content)
        res.write(part.choices[0]?.delta?.content || '');
    }
    console.log("stream", stream)
    res.end();
});

app.post('/stop', async (req, res) => {
    const requestId = req.body.requestId; // Expect the same unique identifier to abort the right stream
    if (controllers[requestId]) {
        controllers[requestId].abort();
        delete controllers[requestId];
        res.send(`Stream ${requestId} aborted`).status(200).end();
    } else {
        res.send(`Stream ${requestId} not found or already aborted`).status(404).end();
    }
});

// New endpoint to get the token count for a given text
app.post('/token-count', async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).send({ error: 'Text is required' });
    }

    // Function to interact with the Python microservice to get the token count
    try {
        const response = await axios.post('http://localhost:5000/tokenize', { text });
        res.send({ tokenCount: response.data.token_count });
    } catch (error) {
        console.error('Error getting token count:', error);
        res.status(500).send({ error: 'Failed to get token count' });
    }
});

app.listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
});