require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const cors = require('cors'); // Import the cors library
const axios = require('axios'); // Make sure to install axios

const app = express();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const controllers = {};

const https = require('https');
const fs = require('fs'); // Node.js file system module

// Load SSL/TLS certificate and private key
const privateKey = fs.readFileSync('/etc/letsencrypt/live/back.powerlib.tech/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/back.powerlib.tech/fullchain.pem', 'utf8');

const credentials = { key: privateKey, cert: certificate };

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(443, () => {
  console.log(`Server is running on port 443 over HTTPS`);
});

const corsOptions = {
  origin: ['https://www.powerlib.tech', 'https://v11.10studio.tech', 'https://v6.10studio.tech'],
  methods: ['POST'], // Add other HTTP methods if needed
  optionsSuccessStatus: 204, // No Content response for preflight requests
};

// Use cors middleware and allow any origin (not recommended for production)
app.use(cors(corsOptions));

app.use(bodyParser.json());

app.post('/complete-new', async (req, res) => {
    // const user = res.locals.user;
    // console.log("user", user)
    const messages = req.body.messages;
    const input = {
        model: req.body.model === "gpt-4" ? "gpt-4-1106-preview" : req.body.model,
        messages: messages,
        stream: true,
    }

    const startTime = Date.now();
    let err, accumulatedText, result;
    try {
        // throw new Error('Simulated error for testing'); // simulate a run-time error
        const stream = await openai.chat.completions.create(input);

        accumulatedText = "";
        for await (const part of stream) {
            console.log("part.choices[0]?.delta?.content", part.choices[0]?.delta?.content)
            x = part.choices[0]?.delta?.content || '';
            accumulatedText += x;
            res.write(JSON.stringify({ type: "stream", value: x }) + "\n");
        }

        // count words to count tokens
        let prompt_words = 0;
        console.log("input.messages", input.messages)
        for (const message of input.messages) {
            console.log("message", message)
            const wordCount = message.content.split(' ').length;
            prompt_words += wordCount;
        }
        const completion_words = accumulatedText.split(/\s+/).filter(Boolean).length;

        // construct the result
        // https://gpt.space/blog/understanding-openai-gpt-tokens-a-comprehensive-guide#:~:text=OpenAI%20provides%20an%20official%20tokenizer,1%20word%20%E2%89%88%201.3%20tokens
        result = {
            model: req.body.model === "gpt-4" ? "gpt-4-1106-preview" : req.body.model,
            usage: {
                prompt_tokens: parseFloat((prompt_words * 1.3).toFixed(2)),
                completion_tokens: parseFloat((completion_words * 1.3).toFixed(2)),
                total_tokens: parseFloat((prompt_words * 1.3 + completion_words * 1.3).toFixed(2))
            }
        }
    } catch (error) {
		console.log("error", error)
		err = error;
        result = {
            model: req.body.model === "gpt-4" ? "gpt-4-1106-preview" : req.body.model,
            usage: {
                prompt_tokens: 0,
                completion_tokens: 0,
                total_tokens: 0
            }
        }
    }
    const endTime = Date.now();
	const executionTime = endTime - startTime;
	console.log("time, openai.createChatCompletion", executionTime, "ms")

    var aiResult_wo_userId = {
		date: new Date(),
		// userId: user._id,
		input: input,
		result: result,
		executionTime: executionTime,
		errorMessage: err? err.message : null,
		errorToString: err? err.toString() : null,
		settings: req.body.settings,
		account: "tie.cheng@matrixlead.com",
		caller: "ai-chat-v4-streaming"
	}

    // don't send emails at the moment
    // if (err) {
	// 	const msg = JSON.stringify(aiResult)
	// 	emailService.sendMailGrid({
	// 		to: 'chengtie@gmail.com', subject: "AI request error, streaming", text: msg, html: `<p>${msg}</p>`,
	// 		category: 'problem', unique_args: { user_email: 'chengtie@gmail.com' }})
	// }

    // Send either an error or aiResult to the frontend, don't save aiResult.
    if (err) {
        res.status(500).json({ errorMessage: err.message, errorToString: err.toString() });
    } else {
        res.write(JSON.stringify({ type: "aiResult_wo_userId", value: aiResult_wo_userId }) + "\n");
        res.end();
    }
});

app.post('/complete', async (req, res) => {
    const requestId = req.body.requestId; // You need to send a unique identifier with each request
    const controller = new AbortController();
    controllers[requestId] = controller;

    const userMessage = req.body.userMessage;
    const stream = await openai.chat.completions.create({
        model: 'gpt-4-1106-preview',
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

app.post('/get-table', async(req, res) => {
    const userMessage = req.body.userMessage;
    const x = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: userMessage }],
        stream: false
    })
    console.log("x", x);
    res.json(x)
})

app.post('/get-only-table', async(req, res) => {
    const tools = [
        {
            "type": "function",
            "function": {
                "name": "get_number_of_cells_of_a_table",
                "description": "Get the total number of the cells (i.e, the length times the height) of a table",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "table": {
                            "type": "string",
                            "descrption": "the stringified representation of a table in form of one-dimensional or two-dimensional array"
                        }
                    },
                    "required": ["table"]
                }
            }
        }
    ]

    const tools2 = [
        {
            "type": "function",
            "function": {
                "name": "extract_table_from_a_text",
                "description": "extract a table from a text which may include some unnecessary comments",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "text": {
                            "type": "string",
                            "description": "a string which should contain the stringified representation of a one-dimensional or two-dimensional table and maybe some comments."
                        }
                    },
                    "required": ["text"]
                }
            }
        }
    ]

    const userMessage = req.body.userMessage;
    const x = await openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages: [{ role: 'user', content: userMessage }],
        // tools: tools,
        tools: tools2,
        tool_choice: "auto"
    })
    console.log("x", x);
    res.json(x)
})

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

// app.listen(3000, () => {
//    console.log('Server is running on http://localhost:3001');
// });
