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

        const text = await res.text();
        setResponse(text);
    };

    return (
        <div className="App">
            <input type="text" value={userMessage} onChange={handleMessageChange} />
            <button onClick={handleButtonClick}>Send</button>
            <div>{response}</div>
        </div>
    );
}

export default App;

