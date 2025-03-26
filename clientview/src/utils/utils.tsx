import { EventType } from "@common/constants";
import useTheme from "@mui/material/styles/useTheme";

// Helper function to generate a unique color based on a string
export const generateColorFromString = (str: string): string => {
    const theme = useTheme();
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const baseColor = (hash & 0x00FFFFFF);
    const hexColor = '#' + baseColor.toString(16).toUpperCase().padStart(6, '0');
    
    // Darken the color in dark mode
    const isDarkMode = theme.palette.mode === 'dark';
    const color = isDarkMode ? darkenColor(hexColor) : hexColor;
    return color.substring(0, 7);
};

// Function to darken a color
const darkenColor = (hexColor: string, factor: number = 0.2): string => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const newR = Math.max(0, Math.floor(r * (1 - factor)));
    const newG = Math.max(0, Math.floor(g * (1 - factor)));
    const newB = Math.max(0, Math.floor(b * (1 - factor)));

    const newHexR = newR.toString(16).padStart(2, '0');
    const newHexG = newG.toString(16).padStart(2, '0');
    const newHexB = newB.toString(16).padStart(2, '0');

    return `#${newHexR}${newHexG}${newHexB}`;
};

export const pascalCase = (input: string, replaceUnderscore: boolean = true): string => {
    if (!input) return '';

    // Replace underscores with spaces if specified
    const processedInput = replaceUnderscore ? input.replace(/_/g, ' ') : input;

    // Find all alphanumeric word segments
    const words = processedInput.match(/[A-Za-z0-9]+/g);
    if (!words) return '';
    
    return words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};