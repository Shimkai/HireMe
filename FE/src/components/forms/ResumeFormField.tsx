import React from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Chip,
  Stack,
} from '@mui/material';
import { Add } from '@mui/icons-material';

interface ResumeFormFieldProps {
  label: string;
  value: any;
  onChange: (value: any) => void;
  type?: 'text' | 'email' | 'tel' | 'number' | 'url' | 'select' | 'multiselect' | 'date' | 'textarea';
  options?: Array<{ value: string; label: string }>;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  error?: boolean;
}

const ResumeFormField: React.FC<ResumeFormFieldProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  options = [],
  multiline = false,
  rows = 1,
  required = false,
  placeholder,
  helperText,
  error = false,
}) => {
  const handleArrayAdd = () => {
    if (Array.isArray(value)) {
      onChange([...value, '']);
    }
  };

  const handleArrayRemove = (index: number) => {
    if (Array.isArray(value)) {
      onChange(value.filter((_, i) => i !== index));
    }
  };

  const handleArrayItemChange = (index: number, newValue: string) => {
    if (Array.isArray(value)) {
      const newArray = [...value];
      newArray[index] = newValue;
      onChange(newArray);
    }
  };

  if (type === 'select') {
    return (
      <FormControl fullWidth error={error}>
        <InputLabel>{label}</InputLabel>
        <Select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          label={label}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {helperText && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {helperText}
          </Typography>
        )}
      </FormControl>
    );
  }

  if (type === 'multiselect') {
    return (
      <Box>
        <Typography variant="body2" gutterBottom>
          {label} {required && '*'}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          {Array.isArray(value) && value.map((item: string, index: number) => (
            <Chip
              key={index}
              label={item}
              onDelete={() => handleArrayRemove(index)}
              size="small"
            />
          ))}
          <IconButton size="small" onClick={handleArrayAdd}>
            <Add />
          </IconButton>
        </Stack>
        {Array.isArray(value) && value.map((item: string, index: number) => (
          <TextField
            key={index}
            fullWidth
            size="small"
            value={item}
            onChange={(e) => handleArrayItemChange(index, e.target.value)}
            placeholder={`Enter ${label.toLowerCase()}`}
            sx={{ mb: 1 }}
          />
        ))}
        {helperText && (
          <Typography variant="caption" color="text.secondary">
            {helperText}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <TextField
      fullWidth
      label={label}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      type={type}
      multiline={multiline}
      rows={multiline ? rows : undefined}
      required={required}
      placeholder={placeholder}
      helperText={helperText}
      error={error}
    />
  );
};

export default ResumeFormField;
