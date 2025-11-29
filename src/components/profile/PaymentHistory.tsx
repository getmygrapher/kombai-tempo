import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    HourglassEmpty as PendingIcon,
    Undo as RefundedIcon,
} from '@mui/icons-material';
import { usePaymentHistory } from '../../hooks/useSubscription';
import { Payment } from '../../services/paymentService';

const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
        case 'success':
            return <CheckCircleIcon fontSize="small" />;
        case 'failed':
            return <ErrorIcon fontSize="small" />;
        case 'pending':
            return <PendingIcon fontSize="small" />;
        case 'refunded':
            return <RefundedIcon fontSize="small" />;
        default:
            return null;
    }
};

const getStatusColor = (status: Payment['status']) => {
    switch (status) {
        case 'success':
            return 'success';
        case 'failed':
            return 'error';
        case 'pending':
            return 'warning';
        case 'refunded':
            return 'info';
        default:
            return 'default';
    }
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

export const PaymentHistory: React.FC = () => {
    const { payments, loading, error } = usePaymentHistory(20, 0);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>
                Failed to load payment history: {error}
            </Alert>
        );
    }

    if (payments.length === 0) {
        return (
            <Card>
                <CardContent>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No Payment History
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Your payment transactions will appear here
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Payment History
                </Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Payment ID</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {payments.map((payment) => (
                                <TableRow key={payment.paymentId}>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {formatDate(payment.createdAt)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">
                                            {formatAmount(payment.amount, payment.currency)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            icon={getStatusIcon(payment.status)}
                                            label={payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                            color={getStatusColor(payment.status) as any}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontFamily: 'monospace',
                                                color: 'text.secondary',
                                            }}
                                        >
                                            {payment.razorpayPaymentId || 'N/A'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
};
