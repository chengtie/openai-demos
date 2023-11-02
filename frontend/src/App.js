import React, { useState } from 'react';
import './App.css';

function App() {
    const [userMessage, setUserMessage] = useState('');
    const [response, setResponse] = useState('');

    const handleMessageChange = (e) => {
        setUserMessage(e.target.value);
    };

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
                console.log("text", text);
                return reader.read().then(processText);
            });
        }
    };    

    return (
        <div className="App">
            <input type="text" value={userMessage} onChange={handleMessageChange} />
            <button onClick={handleButtonClick}>Send</button>
            <div style={{ textAlign: 'left' }}>{response}</div>
        </div>
    );
}

export default App;

