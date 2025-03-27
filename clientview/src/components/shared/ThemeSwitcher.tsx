import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { ListItem, Switch, ListItemIcon, ListItemText } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { useColorMode } from '@utils/ColorMode';
import React from 'react';

interface ThemeSwitcherProps {
    variant?: 'text' | 'expanded' | 'button';
    size?: 'small' | 'medium' | 'large';
    sx?: React.CSSProperties;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ variant, size, sx }) => {
    const colorMode = useColorMode();

    // temp: Hide the switcher in production
    // if (process.env.NODE_ENV !== 'development') return null;

    if (variant === 'text') return (
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

    if (variant == 'button') return (
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

    if (variant === 'expanded') return (
        <ListItem
            sx={{
                borderRadius: 2,
                boxShadow: 3,
                my: 1,
                bgcolor: 'action.hover',
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: 6
                },
            }}
            secondaryAction={
                <Switch
                    edge="end"
                    checked={colorMode.mode === 'dark'}
                    onChange={colorMode.toggleColorMode}
                    inputProps={{
                        'aria-label': `Switch to ${colorMode.mode === 'dark' ? 'light' : 'dark'} mode`
                    }}
                    sx={{
                        ml: 2,
                        '& .MuiSwitch-switchBase.Mui-checked': {
                            color: 'primary.main',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            bgcolor: 'primary.light',
                        },
                        '& .MuiSwitch-track': {
                            opacity: 0.7,
                        }
                    }}
                />
            }
        >
            <ListItemIcon sx={{ color: 'text.primary', minWidth: 40 }}>
                {colorMode.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </ListItemIcon>
            <ListItemText 
                primary={`Theme: ${colorMode.mode === 'dark' ? 'Dark' : 'Light'}`} 
                secondary="Tap the switch to change theme"
            />
        </ListItem>
    );
};

export default ThemeSwitcher;