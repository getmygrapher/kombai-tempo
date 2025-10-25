import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Stack,
  Paper,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ProfileAnalytics as IProfileAnalytics } from '../../store/profileManagementStore';
import { useProfileManagementStore } from '../../store/profileManagementStore';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(10),
}));

const MetricCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  }
}));

const MetricValue = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: theme.typography.fontWeightBold,
  lineHeight: 1.2,
}));

const ChartContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: 400,
}));

const RecommendationCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1),
  backgroundColor: theme.palette.info.light,
  borderLeft: `4px solid ${theme.palette.info.main}`,
}));

interface ProfileAnalyticsProps {
  analytics: IProfileAnalytics;
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onBack: () => void;
}

export const ProfileAnalytics: React.FC<ProfileAnalyticsProps> = ({
  analytics: initialAnalytics,
  dateRange,
  onDateRangeChange,
  onBack
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const { analytics, loadAnalytics, isLoading } = useProfileManagementStore();

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const currentAnalytics = analytics.profileViews > 0 ? analytics : initialAnalytics;

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }
    
    onDateRangeChange({
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    });
  };

  const formatMetricValue = (value: number, type: string): string => {
    if (type === 'completion') {
      return `${value}%`;
    }
    return value.toLocaleString();
  };

  const getMetricColor = (value: number, type: string): string => {
    if (type === 'completion') {
      if (value >= 80) return 'success.main';
      if (value >= 60) return 'warning.main';
      return 'error.main';
    }
    return 'primary.main';
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16 }} />;
    } else if (current < previous) {
      return <TrendingDownIcon sx={{ color: 'error.main', fontSize: 16 }} />;
    }
    return null;
  };

  const getTrendPercentage = (current: number, previous: number): string => {
    if (previous === 0) return '+100%';
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const metrics = [
    {
      title: 'Profile Views',
      value: currentAnalytics.profileViews,
      previousValue: Math.floor(currentAnalytics.profileViews * 0.85),
      icon: <VisibilityIcon />,
      color: 'primary.main',
      type: 'views'
    },
    {
      title: 'Profile Saves',
      value: currentAnalytics.profileSaves,
      previousValue: Math.floor(currentAnalytics.profileSaves * 0.92),
      icon: <BookmarkIcon />,
      color: 'secondary.main',
      type: 'saves'
    },
    {
      title: 'Contact Requests',
      value: currentAnalytics.contactRequests,
      previousValue: Math.floor(currentAnalytics.contactRequests * 0.78),
      icon: <ContactMailIcon />,
      color: 'success.main',
      type: 'contacts'
    },
    {
      title: 'Profile Completion',
      value: currentAnalytics.completionRate,
      previousValue: Math.floor(currentAnalytics.completionRate * 0.95),
      icon: <TrendingUpIcon />,
      color: getMetricColor(currentAnalytics.completionRate, 'completion'),
      type: 'completion'
    }
  ];

  const chartData = currentAnalytics.viewsThisMonth.map((item, index) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }));

  return (
    <StyledContainer>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={onBack} 
            sx={{ mb: 2 }}
          >
            Back to Profile
          </Button>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Profile Analytics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track your profile performance and engagement metrics
              </Typography>
            </Box>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Period</InputLabel>
              <Select
                value={selectedPeriod}
                onChange={(e) => handlePeriodChange(e.target.value)}
                label="Period"
              >
                <MenuItem value="7d">Last 7 days</MenuItem>
                <MenuItem value="30d">Last 30 days</MenuItem>
                <MenuItem value="90d">Last 90 days</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {/* Metrics Cards */}
        <Grid container spacing={3}>
          {metrics.map((metric, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box sx={{ color: metric.color }}>
                        {metric.icon}
                      </Box>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        {getTrendIcon(metric.value, metric.previousValue)}
                        <Typography variant="caption" color="text.secondary">
                          {getTrendPercentage(metric.value, metric.previousValue)}
                        </Typography>
                      </Stack>
                    </Stack>
                    
                    <Box>
                      <MetricValue sx={{ color: metric.color }}>
                        {formatMetricValue(metric.value, metric.type)}
                      </MetricValue>
                      <Typography variant="body2" color="text.secondary">
                        {metric.title}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </MetricCard>
            </Grid>
          ))}
        </Grid>

        {/* Profile Views Chart */}
        <ChartContainer>
          <Typography variant="h6" fontWeight="medium" gutterBottom>
            Profile Views Trend
          </Typography>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#666"
                fontSize={12}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="views" 
                stroke="#6366F1" 
                strokeWidth={3}
                dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#6366F1', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Recommendations */}
        <Paper sx={{ p: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <LightbulbIcon color="primary" />
            <Typography variant="h6" fontWeight="medium">
              Recommendations to Improve Your Profile
            </Typography>
          </Stack>
          
          <Stack spacing={2}>
            {currentAnalytics.recommendations.map((recommendation, index) => (
              <RecommendationCard key={index}>
                <Typography variant="body2">
                  {recommendation}
                </Typography>
              </RecommendationCard>
            ))}
          </Stack>
        </Paper>

        {/* Performance Insights */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="medium" gutterBottom>
            Performance Insights
          </Typography>
          
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Chip 
                      label="High" 
                      color={currentAnalytics.profileViews > 1000 ? 'success' : 'warning'} 
                      size="small" 
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Profile Visibility"
                    secondary={`${currentAnalytics.profileViews} views in the selected period`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Chip 
                      label={currentAnalytics.contactRequests > 20 ? 'Excellent' : 'Good'} 
                      color={currentAnalytics.contactRequests > 20 ? 'success' : 'primary'} 
                      size="small" 
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Client Interest"
                    secondary={`${currentAnalytics.contactRequests} contact requests received`}
                  />
                </ListItem>
              </List>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Chip 
                      label={currentAnalytics.completionRate >= 80 ? 'Complete' : 'Incomplete'} 
                      color={currentAnalytics.completionRate >= 80 ? 'success' : 'warning'} 
                      size="small" 
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Profile Completeness"
                    secondary={`${currentAnalytics.completionRate}% of profile information filled`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Chip 
                      label="Active" 
                      color="primary" 
                      size="small" 
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Engagement Rate"
                    secondary={`${((currentAnalytics.contactRequests / currentAnalytics.profileViews) * 100).toFixed(1)}% of viewers contact you`}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Paper>
      </Stack>
    </StyledContainer>
  );
};