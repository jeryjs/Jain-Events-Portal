import { EventType } from '@common/constants';
import { ProfileButton } from '@components/shared';
import { Box, Button, Tab, Tabs, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';
import { Link } from 'react-router-dom';

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
  &.Mui-selected { color: ${theme.palette.background.default}; background-color: ${theme.palette.text.primary}; font-weight: bold; }
  &.Mui-focusVisible { background-color: ${theme.palette.action.focus}; }
`);

const HeaderWrapper = styled(Box)(({ theme }) => `
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`);

const categories = [
  { id: -1, label: 'Discover' },
  ...Object.entries(EventType)
    .filter(([key]) => key == '0' || key.endsWith('00'))
    .map(([key, value]) => ({
      id: Number(key),
      label: value,
    })),
];

interface HomeHeaderProps {
  tabValue: number;
  onTabChange: (newTabId: number, newCatId: number) => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ tabValue, onTabChange }) => {
  return (
    <>
      <AppHeader>
        <HeaderWrapper>
          <Box>
            <Typography variant="h4" fontWeight="bold">Jain FET-Hub</Typography>
            <Typography variant="subtitle1" color="text.secondary">The Pulse of Jain FET</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: { xs: 0, sm: 1, md: 2 }, alignItems: 'center' }}>
            <Button component={Link} to="/timeline">Timeline</Button>
            <ProfileButton className="profile-button" />
          </Box>
        </HeaderWrapper>
      </AppHeader>
      <TabsContainer>
        <Tabs value={tabValue} onChange={(_, idx) => onTabChange(idx, categories[idx].id)} variant="scrollable" scrollButtons="auto" TabIndicatorProps={{ style: { display: 'none' } }}>
          {categories.map((cat, idx) => (
            <StyledTab key={cat.id} label={cat.label} />
          ))}
        </Tabs>
      </TabsContainer>
    </>
  );
};

export default HomeHeader;