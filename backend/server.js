require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const cors = require('cors'); // Import the cors library

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

app.listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
});