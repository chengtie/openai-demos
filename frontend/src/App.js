import React, { useState } from 'react';
import './App.css';

function App() {
    const [userMessage, setUserMessage] = useState('');
    const [response, setResponse] = useState('');

    const handleMessageChange = (e) => {
        setUserMessage(e.target.value);
    };

    const handleButtonClickStop = async () => {
        try {
            const res = await fetch('http://localhost:3001/stop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userMessage }),
            });
            if (!res.ok) {
                console.log("!res.ok")
                throw new Error(`HTTP error! status: ${res.status}`);
            } 
            console.log("Handle successful stop action here if needed.")
        } catch (error) {
            console.log("Error stopping the message:", error)
            console.error("Error stopping the message:", error);
            // You might want to set an error state and display it to the user.
        }
    }

    const handleButtonClick = async () => {
        const res = await fetch('http://localhost:3001/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userMessage }),
        });
    
        if (res.body) {
            const reader = res.body.getReader();
            let text = '';
    
            return reader.read().then(function processText({ done, value }) {
                if (done) {
                    setResponse(text);
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
            <div style={{ textAlign: 'left' }}>{response}</div>
        </div>
    );
}

export default App;

