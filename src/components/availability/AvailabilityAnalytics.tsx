import React, { useState } from 'react';
import {
  Stack,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import PollOutlinedIcon from '@mui/icons-material/PollOutlined';

const AnalyticsContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
}));

const StatCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  color: theme.palette.primary.main,
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  height: 300,
  width: '100%',
  '& .recharts-wrapper': {
    fontSize: theme.typography.caption.fontSize,
  },
}));

interface AvailabilityAnalyticsProps {
  userId: string;
}

export const AvailabilityAnalytics: React.FC<AvailabilityAnalyticsProps> = ({
  userId,
}) => {
  const [timeRange, setTimeRange] = useState('last_30_days');

  // Mock analytics data
  const stats = {
    totalAvailableHours: 160,
    bookedHours: 96,
    utilizationRate: 60,
    averageBookingDuration: 4,
    mostBookedTimeSlot: '14:00-18:00',
    totalBookings: 24,
    averageRating: 4.8,
    repeatClients: 15,
  };

  const weeklyTrendData = [
    { week: 'Week 1', available: 40, booked: 20, utilization: 50 },
    { week: 'Week 2', available: 45, booked: 25, utilization: 56 },
    { week: 'Week 3', available: 38, booked: 28, utilization: 74 },
    { week: 'Week 4', available: 42, booked: 23, utilization: 55 },
  ];

  const timeSlotData = [
    { timeSlot: '06:00-09:00', bookings: 2, color: '#8884d8' },
    { timeSlot: '09:00-12:00', bookings: 8, color: '#82ca9d' },
    { timeSlot: '12:00-15:00', bookings: 6, color: '#ffc658' },
    { timeSlot: '15:00-18:00', bookings: 12, color: '#ff7300' },
    { timeSlot: '18:00-21:00', bookings: 4, color: '#00ff00' },
    { timeSlot: '21:00-23:00', bookings: 1, color: '#0088fe' },
  ];

  const statusDistribution = [
    { name: 'Booked', value: stats.bookedHours, color: '#3B82F6' },
    { name: 'Available', value: stats.totalAvailableHours - stats.bookedHours, color: '#10B981' },
    { name: 'Unavailable', value: 24, color: '#EF4444' },
  ];

  const monthlyBookingData = [
    { month: 'Jan', bookings: 18, revenue: 7200 },
    { month: 'Feb', bookings: 22, revenue: 8800 },
    { month: 'Mar', bookings: 24, revenue: 9600 },
    { month: 'Apr', bookings: 19, revenue: 7600 },
    { month: 'May', bookings: 26, revenue: 10400 },
    { month: 'Jun', bookings: 24, revenue: 9600 },
  ];

  const handleTimeRangeChange = (event: any) => {
    setTimeRange(event.target.value);
  };

  const formatTooltipValue = (value: any, name: string) => {
    if (name === 'utilization') {
      return [`${value}%`, 'Utilization Rate'];
    }
    return [value, name];
  };

  return (
    <AnalyticsContainer elevation={2}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" alignItems="center" spacing={1}>
            <PollOutlinedIcon color="primary" />
            <Typography variant="h5" fontWeight={600}>
              Availability Analytics
            </Typography>
          </Stack>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value="last_7_days">Last 7 Days</MenuItem>
              <MenuItem value="last_30_days">Last 30 Days</MenuItem>
              <MenuItem value="last_3_months">Last 3 Months</MenuItem>
              <MenuItem value="last_6_months">Last 6 Months</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Key Metrics */}
        <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
            <StatCard>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <AccessTimeIcon color="primary" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Available Hours
                  </Typography>
                </Stack>
                <StatValue>{stats.totalAvailableHours}h</StatValue>
                <Typography variant="caption" color="text.secondary">
                  This month
                </Typography>
              </CardContent>
            </StatCard>
          </Box>

          <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
            <StatCard>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <BookmarkIcon color="success" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Booked Hours
                  </Typography>
                </Stack>
                <StatValue>{stats.bookedHours}h</StatValue>
                <Typography variant="caption" color="text.secondary">
                  {stats.totalBookings} bookings
                </Typography>
              </CardContent>
            </StatCard>
          </Box>

          <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
            <StatCard>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <TrendingUpIcon color="warning" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Utilization Rate
                  </Typography>
                </Stack>
                <StatValue>{stats.utilizationRate}%</StatValue>
                <LinearProgress
                  variant="determinate"
                  value={stats.utilizationRate}
                  sx={{ mt: 1, height: 6, borderRadius: 3 }}
                />
              </CardContent>
            </StatCard>
          </Box>

          <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
            <StatCard>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <EventAvailableIcon color="info" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Avg. Booking Duration
                  </Typography>
                </Stack>
                <StatValue>{stats.averageBookingDuration}h</StatValue>
                <Typography variant="caption" color="text.secondary">
                  Per session
                </Typography>
              </CardContent>
            </StatCard>
          </Box>
        </Stack>

        <Divider />

        {/* Charts Section */}
        <Stack spacing={3}>
          {/* Weekly Trend Chart */}
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
            <Box sx={{ flex: '2 1 600px' }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Weekly Availability Trend
                </Typography>
                <ChartContainer>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip formatter={formatTooltipValue} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="available"
                        stroke="#10B981"
                        strokeWidth={2}
                        name="Available Hours"
                      />
                      <Line
                        type="monotone"
                        dataKey="booked"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        name="Booked Hours"
                      />
                      <Line
                        type="monotone"
                        dataKey="utilization"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        name="Utilization %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </Paper>
            </Box>

            {/* Status Distribution Pie Chart */}
            <Box sx={{ flex: '1 1 300px' }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Time Distribution
                </Typography>
                <ChartContainer>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false as any}
                        label={({ name, percent }) => `${name} ${(Number(percent) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </Paper>
            </Box>
          </Stack>

          {/* Time Slot Popularity and Monthly Bookings */}
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
            <Box sx={{ flex: '1 1 400px' }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Popular Time Slots
                </Typography>
                <ChartContainer>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeSlotData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timeSlot" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="bookings" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </Paper>
            </Box>

            <Box sx={{ flex: '1 1 400px' }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Monthly Booking Trend
                </Typography>
                <ChartContainer>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyBookingData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="bookings"
                        stroke="#10B981"
                        strokeWidth={2}
                        name="Bookings"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </Paper>
            </Box>
          </Stack>
        </Stack>

        {/* Insights and Recommendations */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Insights & Recommendations
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600} color="success.main">
                🎯 Peak Performance
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your most popular time slot is {stats.mostBookedTimeSlot} with the highest booking rate.
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" fontWeight={600} color="info.main">
                📈 Growth Opportunity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Consider increasing availability during 15:00-18:00 as this slot shows high demand.
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" fontWeight={600} color="warning.main">
                ⚡ Optimization Tip
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your current utilization rate is {stats.utilizationRate}%. You could potentially increase bookings by 
                {100 - Number(stats.utilizationRate)}% with better time slot management.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </AnalyticsContainer>
  );
};