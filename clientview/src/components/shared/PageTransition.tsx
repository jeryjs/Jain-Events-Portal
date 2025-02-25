import React from 'react';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';

const TransitionWrapper = styled(motion.div)(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

interface PageTransitionProps {
  children: React.ReactNode;
  transitionKey?: string | number;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, transitionKey }) => {
  const pageVariants = {
    initial: {
      opacity: 0,
      x: "-5vw",
    },
    in: {
      opacity: 1,
      x: 0,
    },
    out: {
      opacity: 0,
      x: "5vw",
    }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
  };

  return (
    <TransitionWrapper
      key={transitionKey}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </TransitionWrapper>
  );
};

export default PageTransition;
