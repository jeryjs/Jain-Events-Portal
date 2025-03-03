import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import IconButton from '@mui/material/IconButton';
import { useColorMode } from '@utils/ColorMode';
import React from 'react';

interface ThemeSwitcherProps {
    size?: 'small' | 'medium' | 'large';
    sx?: React.CSSProperties;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ size, sx }) => {
    const colorMode = useColorMode();

    // Hide the switcher in production
    if (process.env.NODE_ENV !== 'development') return null;

    return (
        <IconButton
            aria-label={`Switch to ${colorMode.mode === 'dark' ? 'light' : 'dark'} mode`}
            color={colorMode.mode === 'dark' ? 'default' : 'primary'}
            onClick={colorMode.toggleColorMode}
            onDoubleClick={colorMode.clearStoredMode}
            size={size}
            sx={sx}
        >
            {colorMode.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
    );
};

export default ThemeSwitcher;