import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
} from '@mui/material';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  subtitle,
  trend,
}) => {
  const getColorValue = (colorName: string) => {
    const colors = {
      primary: '#A78BFA',
      secondary: '#7C3AED',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    };
    return colors[colorName as keyof typeof colors] || colors.primary;
  };

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{ fontWeight: 500 }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              component="div"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                mb: subtitle ? 0.5 : 0,
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Typography
                variant="caption"
                sx={{
                  color: trend.isPositive ? 'success.main' : 'error.main',
                  fontWeight: 500,
                }}
              >
                {trend.isPositive ? '+' : ''}{trend.value}% from last month
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: getColorValue(color),
              width: 56,
              height: 56,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
