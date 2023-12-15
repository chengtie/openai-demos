import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

// Check if Office is defined and Office.onReady is a function
if (typeof Office !== 'undefined' && typeof Office.onReady === 'function') {
  Office.onReady((info) => {
    if (info.host === Office.HostType.Excel) {
      // Office is ready, render your React app
      ReactDOM.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>,
        document.getElementById('root')
      );
    }
  });
} else {
  // Office is not available (e.g., when running outside of Excel), you can handle this case accordingly
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  );
}
