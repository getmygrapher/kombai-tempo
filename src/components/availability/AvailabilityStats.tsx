import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Card,
  CardContent,
  LinearProgress,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAvailabilityStats } from '../../hooks/useAvailability';
import { formatUtilizationRate, formatDuration } from '../../utils/availabilityFormatters';
import { TierType } from '../../types/enums';

const StatsCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)',
  border: `1px solid ${theme.palette.divider}`
}));

const MetricValue = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  color: theme.palette.primary.main
}));

const ChartContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  height: 300
}));

interface AvailabilityStatsProps {
  userTier: TierType;
}

export const AvailabilityStats: React.FC<AvailabilityStatsProps> = ({
  userTier
}) => {
  const { data: stats, isLoading } = useAvailabilityStats('user_123');

  // Mock weekly trend data for chart
  const weeklyTrendData = [
    { day: 'Mon', hours: 8, bookings: 3 },
    { day: 'Tue', hours: 7, bookings: 4 },
    { day: 'Wed', hours: 9, bookings: 2 },
    { day: 'Thu', hours: 8, bookings: 5 },
    { day: 'Fri', hours: 6, bookings: 3 },
    { day: 'Sat', hours: 10, bookings: 6 },
    { day: 'Sun', hours: 8, bookings: 4 }
  ];

  // Mock monthly booking data
  const monthlyBookingData = [
    { month: 'Jan', bookings: 12, revenue: 15000 },
    { month: 'Feb', bookings: 18, revenue: 22000 },
    { month: 'Mar', bookings: 15, revenue: 18500 },
    { month: 'Apr', bookings: 22, revenue: 28000 },
    { month: 'May', bookings: 25, revenue: 32000 },
    { month: 'Jun', bookings: 20, revenue: 25000 }
  ];

  if (isLoading) {
    return (
      <Box>
        <Typography>Loading analytics...</Typography>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box>
        <Typography>No analytics data available.</Typography>
      </Box>
    );
  }

  const isPremiumFeature = userTier !== TierType.PRO;

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <InsightsOutlinedIcon color="primary" />
        <Typography variant="h6" fontWeight={600}>
          Availability Analytics
        </Typography>
        {userTier === TierType.PRO && (
          <Chip label="Pro Feature" color="primary" size="small" />
        )}
      </Stack>

      {/* Key Metrics */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={4}>
        <StatsCard sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <AccessTimeIcon color="primary" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Available Hours
                </Typography>
                <MetricValue>{stats.totalAvailableHours}h</MetricValue>
              </Box>
            </Stack>
          </CardContent>
        </StatsCard>

        <StatsCard sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <EventAvailableIcon color="success" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Booked Hours
                </Typography>
                <MetricValue sx={{ color: 'success.main' }}>
                  {stats.bookedHours}h
                </MetricValue>
              </Box>
            </Stack>
          </CardContent>
        </StatsCard>

        <StatsCard sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <TrendingUpIcon color="secondary" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Utilization Rate
                </Typography>
                <MetricValue sx={{ color: 'secondary.main' }}>
                  {formatUtilizationRate(stats.utilizationRate)}
                </MetricValue>
              </Box>
            </Stack>
          </CardContent>
        </StatsCard>
      </Stack>

      {/* Utilization Progress */}
      <StatsCard sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" mb={2} fontWeight={600}>
            Weekly Utilization
          </Typography>
          <Box mb={1}>
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="text.secondary">
                {stats.bookedHours}h booked of {stats.totalAvailableHours}h available
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {formatUtilizationRate(stats.utilizationRate)}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={stats.utilizationRate}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: 'linear-gradient(90deg, #10B981 0%, #3B82F6 100%)'
                }
              }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary">
            Most booked time slot: {stats.mostBookedTimeSlot}
          </Typography>
        </CardContent>
      </StatsCard>

      {/* Charts Section */}
      {isPremiumFeature ? (
        <Paper sx={{ p: 4, textAlign: 'center', opacity: 0.6 }}>
          <Typography variant="h6" mb={2}>
            Advanced Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Upgrade to Pro to unlock detailed charts and insights
          </Typography>
          <Box sx={{ filter: 'blur(4px)', pointerEvents: 'none' }}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="hours" stroke="#6366F1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {/* Weekly Availability Trend */}
          <ChartContainer elevation={2}>
            <Typography variant="h6" mb={2} fontWeight={600}>
              Weekly Availability Trend
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="day" 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#6366F1" 
                  strokeWidth={3}
                  dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#6366F1', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Monthly Booking Trends */}
          <ChartContainer elevation={2}>
            <Typography variant="h6" mb={2} fontWeight={600}>
              Monthly Booking Performance
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyBookingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="bookings" 
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Stack>
      )}

      {/* Additional Insights */}
      <StatsCard sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2} fontWeight={600}>
            Key Insights
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" fontWeight={500} mb={0.5}>
                Average Booking Duration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDuration(stats.averageBookingDuration * 60)} per booking
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={500} mb={0.5}>
                Peak Availability
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Most bookings occur during {stats.mostBookedTimeSlot}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={500} mb={0.5}>
                Weekly Performance
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.utilizationRate > 50 ? 'High' : stats.utilizationRate > 25 ? 'Moderate' : 'Low'} utilization rate this week
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </StatsCard>
    </Box>
  );
};