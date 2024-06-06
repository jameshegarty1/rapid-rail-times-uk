import React, { useState } from 'react';
import Select, { MultiValue, ActionMeta } from 'react-select';
import Fuse from 'fuse.js';
import { Form, Input, Button } from './ProfileList.styles';

export default function ProfileForm({
  origins,
  destinations,
  loading,
  onChange,
  onSubmit,
  editingProfile,
}: {
  origins: string[];
  destinations: string[];
  loading: boolean;
  onChange: (selectedOptions: MultiValue<{ label: string; value: string }>, actionMeta: ActionMeta<{ label: string; value: string }>) => void;
  onSubmit: (e: React.FormEvent) => void;
  editingProfile: boolean; 
}) {

  const initialOptions = [
    { label: 'London Bridge', value: 'LBG' },
    { label: 'London Victoria', value: 'VIC' },
    { label: 'Blackheath', value: 'BKH' },
    { label: 'Hither Green', value: 'HGR' }
  ];

  const [options, setOptions] = useState(initialOptions);
  const [filteredOptions, setFilteredOptions] = useState(initialOptions);

  const fuse = new Fuse(options, {
    keys: ['label', 'value'],
    threshold: 0.3, // Adjust threshold according to your needs
  });

  const handleInputChange = (inputValue: string) => {
    if (!inputValue) {
      setFilteredOptions(options);
      return;
    }
    const results = fuse.search(inputValue);
    setFilteredOptions(results.map(result => result.item));
    for (let i=0; i< results.length; i++) {
      console.log("Item" + results[i].item)
    }
  };

  return (
    <Form onSubmit={onSubmit}>
      <Select
        options={filteredOptions}
        isMulti
        value={origins.map(origin => ({ label: origin, value: origin }))}
        onChange={(selectedOptions, actionMeta) => onChange(selectedOptions as MultiValue<{ label: string; value: string }>, actionMeta)}
        placeholder="Select origins"
        onInputChange={handleInputChange}
        backspaceRemovesValue
        tabSelectsValue
        required
      />

      <Select
        isMulti
        options={filteredOptions}
        value={destinations.map(destination => ({ label: destination, value: destination }))}
        onChange={(selectedOptions, actionMeta) => onChange(selectedOptions as MultiValue<{ label: string; value: string }>, actionMeta)}
        placeholder="Select destinations"
        onInputChange={handleInputChange}
        backspaceRemovesValue
        tabSelectsValue
      />
 
      <Button type="submit" disabled={loading}>
        {editingProfile ? 'Update Profile' : 'Create Profile'}
      </Button>
    </Form>
  );
};
