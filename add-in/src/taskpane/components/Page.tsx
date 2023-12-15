import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid"; // import the uuid function
// import "./App.css";

export default function Page() {
    const [userMessage, setUserMessage] = useState("");
    const [response, setResponse] = useState("");
    const [requestId, setRequestId] = useState(""); // State to keep track of the current requestId

    const handleMessageChange = (e) => {
        setUserMessage(e.target.value);
    };

    const handleButtonClick = async () => {
        const newRequestId = uuidv4(); // Generate a new unique requestId
        setRequestId(newRequestId); // Set the requestId in the state

        const res = await fetch("https://back.powerlib.tech/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ requestId: newRequestId, userMessage }), // Send the new unique requestId with the request
        });
    
        if (res.body) {
            const reader = res.body.getReader();
            let text = "";

            return reader.read().then(function processText({ done, value }) {
                if (done) {
                    setResponse(text);
                    setRequestId(""); // Clear the requestId after completing the request
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
            <button onClick={handleButtonClick}>Send</button>
            <div style={{ whiteSpace: "pre-wrap", textAlign: "left" }}>{response}</div>
        </div>
    );
}