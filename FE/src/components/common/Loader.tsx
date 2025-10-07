import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoaderProps {
  message?: string;
  size?: number;
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ 
  message = 'Loading...', 
  size = 40, 
  fullScreen = false 
}) => {
  const content = (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
      sx={{
        ...(fullScreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 9999,
        }),
      }}
    >
      <CircularProgress size={size} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );

  return content;
};

export default Loader;
