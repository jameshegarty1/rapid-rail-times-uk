import React, { useState, useMemo } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Station {
  ALPHA: string;
  NAME: string;
}

interface StationSelectorProps {
  label: string;
  selectedStations: string[];
  onChange: (stations: string[]) => void;
  stations: Station[];
  maxSelections?: number;
  disabled?: boolean;
}

const StationItem = React.memo(
  ({
    station,
    isSelected,
    onSelect,
  }: {
    station: Station;
    isSelected: boolean;
    onSelect: (value: string) => void;
  }) => (
    <CommandItem value={station.NAME} onSelect={() => onSelect(station.ALPHA)}>
      <Check
        className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')}
      />
      {station.NAME} ({station.ALPHA})
    </CommandItem>
  )
);

const SelectedStationButton = React.memo(
  ({
    station,
    onClick,
  }: {
    station: Station;
    onClick: (value: string) => void;
  }) => (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => onClick(station.ALPHA)}
      type="button"
    >
      {station.NAME} ({station.ALPHA}) ×
    </Button>
  )
);

export default function StationSelector({
  label,
  selectedStations,
  onChange,
  stations,
  maxSelections = Infinity,
  disabled = false,
}: StationSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredStations = useMemo(() => {
    const searchTerm = search.toLowerCase();
    if (searchTerm) {
      const filtered = stations.filter((station) => {
        const nameMatches = station.NAME.toLowerCase().includes(searchTerm) || station.ALPHA.toLowerCase().includes(searchTerm);
        const notSelected = !selectedStations.includes(station.ALPHA);
        return nameMatches && notSelected;
      });
      return filtered.slice(0, 100);
    }
    return stations
      .filter((station) => !selectedStations.includes(station.ALPHA))
      .slice(0, 100);
  }, [stations, selectedStations, search]);

  const handleStationChange = (value: string) => {
    const currentStations = [...selectedStations];
    if (currentStations.includes(value)) {
      onChange(currentStations.filter((s) => s !== value));
    } else if (currentStations.length < maxSelections) {
      onChange([...currentStations, value]);
      setOpen(false);
      setSearch('');
    }
  };

  const stationsMap = useMemo(
    () => new Map(stations.map((station) => [station.ALPHA, station])),
    [stations]
  );

  const buttonText =
    selectedStations.length > 0
      ? `${selectedStations.length} ${label.toLowerCase()} selected`
      : `Select ${label.toLowerCase()}`;

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled || selectedStations.length >= maxSelections}
          >
            {buttonText}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput
              placeholder="Search stations..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No stations found.</CommandEmpty>
              <CommandGroup heading="Stations">
                {filteredStations.length === 0 ? (
                  <CommandItem disabled>No stations found</CommandItem>
                ) : (
                  filteredStations.map((station) => (
                    <StationItem
                      key={station.ALPHA}
                      station={station}
                      isSelected={selectedStations.includes(station.ALPHA)}
                      onSelect={handleStationChange}
                    />
                  ))
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedStations.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedStations.map((stationCode) => {
            const station = stationsMap.get(stationCode);
            if (!station) return null;
            return (
              <SelectedStationButton
                key={stationCode}
                station={station}
                onClick={handleStationChange}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
