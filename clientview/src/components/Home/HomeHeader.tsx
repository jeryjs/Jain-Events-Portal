import React from 'react';
import { Box, Typography, IconButton, Tab, Tabs } from '@mui/material';
import { styled } from '@mui/material/styles';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useContext } from 'react';
import { ColorModeContext } from '../../App';

const AppHeader = styled(Box)(({ theme }) => `
  padding: 32px 0 16px;
  display: flex;
  color: ${theme.palette.text.primary};
  justify-content: space-between;
  align-items: center;
`);
const TabsContainer = styled(Box)(({ theme }) => `
  margin: 16px 0;
  & .MuiTabs-flexContainer { overflow-x: auto; scrollbar-width: none; }
  & .MuiTabs-flexContainer::-webkit-scrollbar { display: none; }
`);
const StyledTab = styled(Tab)(({ theme }) => `
  min-width: auto; padding: 4px 24px; border-radius: 24px; margin: 0 4px; font-weight: 500;
  &:hover { color: ${theme.palette.text.secondary}; opacity: 1; background-color: ${theme.palette.action.hover}; }
  &.Mui-selected { color: ${theme.palette.background.paper}; background-color: ${theme.palette.text.primary}; }
  &.Mui-focusVisible { background-color: ${theme.palette.action.focus}; }
`);

const HeaderWrapper = styled(Box)(({ theme }) => `
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`);

const categories = [
  { id: 'discover', label: 'Discover' },
  { id: 'sports', label: 'Sports' },
  { id: 'tech', label: 'Tech' },
  { id: 'cultural', label: 'Cultural' },
  { id: 'other', label: 'Other' },
];

interface HomeHeaderProps {
  tabValue: number;
  onTabChange: (evt: React.SyntheticEvent, newValue: number) => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ tabValue, onTabChange }) => {
  const colorMode = useContext(ColorModeContext);
  return (
    <>
      <AppHeader>
        <HeaderWrapper>
          <Box>
            <Typography variant="h4" fontWeight="bold">Jain FET-Hub</Typography>
            <Typography variant="subtitle1" color="text.secondary">The Pulse of Jain FET</Typography>
          </Box>
          <IconButton onClick={colorMode.toggleColorMode}>
            {colorMode.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </HeaderWrapper>
      </AppHeader>
      <TabsContainer>
        <Tabs value={tabValue} onChange={onTabChange} variant="scrollable" scrollButtons="auto" TabIndicatorProps={{ style: { display: 'none' } }}>
          {categories.map((cat, idx) => (
            <StyledTab key={cat.id} label={cat.label} />
          ))}
        </Tabs>
      </TabsContainer>
    </>
  );
};

export default HomeHeader;