import { useState, useCallback } from 'react';
import { FormData } from '../types';
import { INITIAL_FORM_DATA } from '../constants';

/**
 * Custom hook for managing form data state
 * Provides type-safe setters for all form fields
 */
export const useFormData = () => {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

  const updateField = useCallback(<K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetField = useCallback((field: keyof FormData) => {
    setFormData(prev => ({ ...prev, [field]: INITIAL_FORM_DATA[field] }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
  }, []);

  return {
    formData,
    updateField,
    resetField,
    resetForm,
    setFormData,
  };
};

