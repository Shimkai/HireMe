import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  OutlinedInput,
  SelectChangeEvent,
  Typography,
  Divider,
  ListSubheader,
} from '@mui/material';
import { PREDEFINED_SKILLS, SKILL_CATEGORIES } from '../../constants/skills';

interface SkillsMultiSelectProps {
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  label?: string;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;
}

const SkillsMultiSelect: React.FC<SkillsMultiSelectProps> = ({
  selectedSkills,
  onSkillsChange,
  label = 'Required Skills',
  placeholder = 'Select skills...',
  error = false,
  helperText,
  required = false,
}) => {
  const [open, setOpen] = useState(false);

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onSkillsChange(typeof value === 'string' ? value.split(',') : value);
  };

  const handleDelete = (skillToDelete: string) => {
    onSkillsChange(selectedSkills.filter(skill => skill !== skillToDelete));
  };

  const renderValue = (selected: string[]) => {
    if (selected.length === 0) {
      return <Typography color="text.secondary">{placeholder}</Typography>;
    }
    
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {selected.map((skill) => (
          <Chip
            key={skill}
            label={skill}
            size="small"
            onDelete={() => handleDelete(skill)}
            color="primary"
            variant="outlined"
          />
        ))}
      </Box>
    );
  };

  return (
    <FormControl fullWidth error={error} required={required}>
      <InputLabel id="skills-select-label">{label}</InputLabel>
      <Select
        labelId="skills-select-label"
        multiple
        value={selectedSkills}
        onChange={handleChange}
        input={<OutlinedInput label={label} />}
        renderValue={renderValue}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 300,
              width: 250,
            },
          },
        }}
      >
        {Object.entries(SKILL_CATEGORIES).map(([category, skills]) => [
          <ListSubheader key={`header-${category}`} sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            {category}
          </ListSubheader>,
          ...skills.map((skill) => (
            <MenuItem key={skill} value={skill}>
              {skill}
            </MenuItem>
          )),
          <Divider key={`divider-${category}`} sx={{ my: 0.5 }} />,
        ]).flat()}
      </Select>
      {helperText && (
        <Typography variant="caption" color={error ? 'error' : 'text.secondary'} sx={{ mt: 0.5 }}>
          {helperText}
        </Typography>
      )}
    </FormControl>
  );
};

export default SkillsMultiSelect;
