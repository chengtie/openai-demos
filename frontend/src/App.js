import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid'; // import the uuid function
import './App.css';

function App() {
    const [userMessage, setUserMessage] = useState('');
    const [response, setResponse] = useState('');
    const [tokenCount, setTokenCount] = useState(null); // New state for token count
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

    const handleButtonClick = async () => {
        const newRequestId = uuidv4(); // Generate a new unique requestId
        setRequestId(newRequestId); // Set the requestId in the state

        const res = await fetch('http://localhost:3001/complete', {
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
    
                text += new TextDecoder("utf-8").decode(value);
                setResponse(text);
                return reader.read().then(processText);
            });
        }
    };

    return (
        <div className="App">
            <input type="text" value={userMessage} onChange={handleMessageChange} />
            <button onClick={handleButtonClick}>Send</button>
            <button onClick={handleButtonClickStop}>Stop</button>
            <button onClick={handleButtonClickCount}>Count</button>
            {tokenCount !== null && <p>Token Count: {tokenCount}</p>} {/* Display the token count */}
            <div style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>{response}</div>
        </div>
    );
}

export default App;