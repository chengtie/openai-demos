import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid'; // import the uuid function
import './App.css';

function App() {
    const [userMessage, setUserMessage] = useState('');
    const [response, setResponse] = useState('');
    const [tokenCount, setTokenCount] = useState(null); // New state for token count
    const [wordCount, setWordCount] = useState(null); // New state for word count
    const [requestId, setRequestId] = useState(''); // State to keep track of the current requestId

    const handleMessageChange = (e) => {
        setUserMessage(e.target.value);
    };

    const handleButtonClickCount = async () => {
        try {
            const res = await fetch('http://localhost:3001/token-count', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: userMessage }), // Send the userMessage to be counted
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json(); // Get the token count from the response
            setTokenCount(data.tokenCount); // Update the tokenCount state

            const words = userMessage.match(/\S+/g);
            // Return the number of matches, which is the word count.
            // If there are no matches, return 0.
            if (words) {
                setWordCount(words.length);
            } else {
                setWordCount(0)
            }

        } catch (error) {
            console.error("Error counting tokens:", error);
            setTokenCount(null); // Reset token count on error
        }
    };

    const handleButtonClickStop = async () => {
        try {
            const res = await fetch('http://localhost:3001/stop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId }), // Send the current requestId
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            setRequestId(''); // Clear the requestId after stopping the request
            console.log("Handle successful stop action here if needed.")
        } catch (error) {
            console.error("Error stopping the message:", error);
        }
    };

    const getTable = async () => {
        try {
            const res = await fetch('http://localhost:3001/get-table', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userMessage })
            });
            if (res.ok) {
                const data = await res.json(); // This parses the JSON body of the response
                console.log("data", data);
            } else {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
        } catch (error) {
            console.error("There is an error:", error);
        }
    }

    const getOnlyTable = async () => {
        try {
            const res = await fetch('http://localhost:3001/get-only-table', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userMessage })
            });
            if (res.ok) {
                const data = await res.json(); // This parses the JSON body of the response
                console.log("data", data);
            } else {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
        } catch (error) {
            console.error("There is an error:", error);
        }
    }

    const handleButtonClick = async () => {
        const newRequestId = uuidv4(); // Generate a new unique requestId
        setRequestId(newRequestId); // Set the requestId in the state

        const res = await fetch('http://47.242.26.87:3001/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId: newRequestId, userMessage }), // Send the new unique requestId with the request
        });
    
        if (res.body) {
            const reader = res.body.getReader();
            let text = '';

            return reader.read().then(function processText({ done, value }) {
                if (done) {
                    setResponse(text);
                    setRequestId(''); // Clear the requestId after completing the request
                    return;
                }
    
                const v = new TextDecoder("utf-8").decode(value);
                console.log(v)
                text = text + v;
                setResponse(text);
                return reader.read().then(processText);
            });
        }
    };

    return (
        <div className="App">
            <input type="text" value={userMessage} onChange={handleMessageChange} />
            <button onClick={getTable}>getTable</button>
            <button onClick={getOnlyTable}>getOnlyTable</button>
            <button onClick={handleButtonClick}>Send</button>
            <button onClick={handleButtonClickStop}>Stop</button>
            <button onClick={handleButtonClickCount}>Count</button>
            {tokenCount !== null && <p>Token Count: {tokenCount}</p>} {/* Display the token count */}
            {wordCount !== null && <p>Word Count: {wordCount/0.75}</p>} {/* Display the word count */}
            <div style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>{response}</div>
        </div>
    );
}

export default App;
