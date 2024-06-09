import React, { useState } from 'react';
import Select, { MultiValue, ActionMeta, InputActionMeta } from 'react-select';
import Fuse from 'fuse.js';
import { Form, Button } from './ProfileList.styles';

export default function ProfileForm({
  origins,
  destinations,
  loading,
  onChange,
  onSubmit,
  editingProfile,
  maxOrigins
}: {
  origins: string[];
  destinations: string[];
  loading: boolean;
  onChange: (selectedOptions: MultiValue<{ label: string; value: string }>, actionMeta: ActionMeta<{ label: string; value: string }>, fieldName: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  editingProfile: boolean;
  maxOrigins: number
}) {

  const initialOptions = [
    { label: 'London Bridge (LBG)', value: 'LBG' },
    { label: 'London Victoria (VIC)', value: 'VIC' },
    { label: 'Blackheath (BKH)', value: 'BKH' },
    { label: 'Hither Green (HGR)', value: 'HGR' }
  ];

  const [options, setOptions] = useState(initialOptions);
  const [filteredOptions, setFilteredOptions] = useState(initialOptions);

  const fuse = new Fuse(options, {
    keys: ['label', 'value'],
    threshold: 0.3, // Adjust threshold according to your needs
  });

  const handleInputChange = (inputValue: string, { action }: InputActionMeta) => {
    console.log('Input change:', inputValue);
    if (action === 'input-change') {
      if (!inputValue) {
        setFilteredOptions(options);
        return;
      }
      const results = fuse.search(inputValue);
      setFilteredOptions(results.map(result => result.item));
      results.forEach(result => {
        console.log("Item", result.item);
      });
    }
  };
  return (
    <Form onSubmit={onSubmit}>
      <Select
        options={filteredOptions}
        isMulti
        value={origins.map(origin => ({ label: origin, value: origin }))}
        onChange={(selectedOptions, actionMeta) => {
          console.log('Origins onChange called', selectedOptions, actionMeta);
          if (selectedOptions.length > maxOrigins) {
            console.warn(`Maximum of ${maxOrigins} options can be selected`);
            return;
          }
          onChange(selectedOptions as MultiValue<{ label: string; value: string }>, actionMeta, 'origins');
        }}
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
        onChange={(selectedOptions, actionMeta) => {
          console.log('Destinations onChange called', selectedOptions, actionMeta);
          onChange(selectedOptions as MultiValue<{ label: string; value: string }>, actionMeta, 'destinations');
        }}        placeholder="Select destinations"
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
