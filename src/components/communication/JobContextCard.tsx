import React from 'react';
import { Card, CardContent, Typography, Stack, Chip } from '@mui/material';

interface JobContextCardProps {
  jobTitle: string;
  jobType?: string;
}

export const JobContextCard: React.FC<JobContextCardProps> = ({ jobTitle, jobType }) => {
  return (
    <Card variant="outlined" sx={{ mb: 1 }}>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle2" fontWeight={600} noWrap>
            {jobTitle}
          </Typography>
          {jobType && <Chip size="small" label={jobType} />}
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Job context
        </Typography>
      </CardContent>
    </Card>
  );
};

