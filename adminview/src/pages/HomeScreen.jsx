import React, { useState } from 'react';
import { Box } from '@mui/material';
import reactLogo from '../assets/JGI.webp'
import viteLogo from '../assets/JGI.webp'

function HomeScreen() {
    const [count, setCount] = useState(0);

    return (
        <Box className="container">
            <div>
                <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
                <p>
                    Edit <code>src/App.jsx</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
            <button>
                <a href={process.env.NODE_ENV == 'development' ? "http://localhost:5780/" : "/"}>
                    Goto '/''
                </a>
            </button>
        </Box>
    );
};

export default HomeScreen;