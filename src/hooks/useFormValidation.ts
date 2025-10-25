import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  basicInfoSchema,
  scheduleLocationSchema,
  budgetRequirementsSchema,
  applicationSchema,
  locationSchema
} from '../utils/validationSchemas';

interface UseFormValidationOptions<T extends z.ZodType> {
  schema: T;
  defaultValues?: Partial<z.infer<T>>;
  mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all';
}

export function useFormValidation<T extends z.ZodType>({
  schema,
  defaultValues,
  mode = 'onChange'
}: UseFormValidationOptions<T>): UseFormReturn<z.infer<T>> {
  return useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
    mode
  });
}

// Specific hooks for job creation steps
export function useBasicInfoValidation(defaultValues?: Partial<z.infer<typeof basicInfoSchema>>) {
  return useFormValidation({
    schema: basicInfoSchema,
    defaultValues,
    mode: 'onChange'
  });
}

export function useScheduleLocationValidation(defaultValues?: Partial<z.infer<typeof scheduleLocationSchema>>) {
  return useFormValidation({
    schema: scheduleLocationSchema,
    defaultValues,
    mode: 'onChange'
  });
}

export function useBudgetRequirementsValidation(defaultValues?: Partial<z.infer<typeof budgetRequirementsSchema>>) {
  return useFormValidation({
    schema: budgetRequirementsSchema,
    defaultValues,
    mode: 'onChange'
  });
}

export function useApplicationValidation(defaultValues?: Partial<z.infer<typeof applicationSchema>>) {
  return useFormValidation({
    schema: applicationSchema,
    defaultValues,
    mode: 'onChange'
  });
}

export function useLocationValidation(defaultValues?: Partial<z.infer<typeof locationSchema>>) {
  return useFormValidation({
    schema: locationSchema,
    defaultValues,
    mode: 'onChange'
  });
}