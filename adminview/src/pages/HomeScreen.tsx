import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import reactLogo from '/JGI.webp';
import viteLogo from '/JGI.webp';

const HomeScreen: React.FC = () => {
  const [count, setCount] = useState<number>(0);

  const handleIncrementCount = (): void => {
    setCount((prevCount) => prevCount + 1);
  };

  const clientUrl = process.env.NODE_ENV === 'development' 
    ? "http://localhost:5780/" 
    : "/";

  return (
    <Box className="container">
      <Box display="flex" justifyContent="center" gap={2}>
        <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </Box>
      
      <Typography variant="h4" component="h1" gutterBottom>
        Jain Events Portal - Admin
      </Typography>
      
      <Box className="card" marginY={3}>
        <Button 
          variant="contained" 
          onClick={handleIncrementCount}
          sx={{ marginBottom: 2 }}
        >
          Count is {count}
        </Button>
        
        <Typography variant="body1" component="p">
          Edit <code>src/pages/HomeScreen.tsx</code> and save to test HMR
        </Typography>
      </Box>
      
      <Typography variant="body2" className="read-the-docs" color="text.secondary">
        Click on the Vite and React logos to learn more
      </Typography>
      
      <Button 
        variant="outlined" 
        component="a" 
        href={clientUrl}
        sx={{ marginTop: 3 }}
      >
        Go to Client View
      </Button>
    </Box>
  );
};

export default HomeScreen;
