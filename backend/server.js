require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const cors = require('cors'); // Import the cors library

const app = express();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Use cors middleware and allow any origin (not recommended for production)
app.use(cors());

app.use(bodyParser.json());

app.post('/complete', async (req, res) => {
    const userMessage = req.body.userMessage;
    const stream = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: userMessage }],
        stream: true,
    });
    
    for await (const part of stream) {
        console.log("part.choices[0]?.delta?.content", part.choices[0]?.delta?.content)
        res.write(part.choices[0]?.delta?.content || '');
    }
    res.end();
});

app.listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
});

