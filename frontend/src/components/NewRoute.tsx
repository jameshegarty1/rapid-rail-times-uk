import React, { useState, useEffect } from 'react';
import { Plus, Search, Save, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Watch } from 'react-loader-spinner';
import useTrains from '../hooks/useTrains';
import RouteSelector from './RouteSelector';
import TrainList from './TrainList';
import { Profile } from '@/utils/interfaces';

interface NewRouteFABProps {
  onCreateProfile: (origins: string[], destinations: string[]) => Promise<void>;
  onUpdateProfile?: (id: number, origins: string[], destinations: string[]) => Promise<void>;
  initialProfile?: Profile;
  isEditing?: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  isNewRoute?: boolean;
}

export default function NewRouteFAB({
                                      onCreateProfile,
                                      onUpdateProfile,
                                      initialProfile,
                                      isEditing = false,
                                      isOpen,
                                      onOpenChange,
                                      onClose,
                                      isNewRoute = true,
                                    }: NewRouteFABProps) {
  const [isSaveMode, setIsSaveMode] = useState(false);
  const [origins, setOrigins] = useState<string[]>([]);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);

  const {
    trainsData,
    loading: trainsLoading,
    error: trainsError,
    fetchTrainsForRoute,
  } = useTrains();

  const QUICK_LOOKUP_ID = 'quick-lookup';
  const currentTrains = trainsData[QUICK_LOOKUP_ID] || [];
  const isLoading = trainsLoading[QUICK_LOOKUP_ID];

  // Initialize form with edit data if provided
  useEffect(() => {
    if (initialProfile && isEditing && isOpen) {
      setOrigins(initialProfile.origins);
      setDestinations(initialProfile.destinations);
      setIsSaveMode(true); // Force save mode in edit
    } else if (!isOpen) {
      // Reset form when closing
      setOrigins([]);
      setDestinations([]);
      setIsSaveMode(true);
      setIsFormCollapsed(false);
    }
  }, [initialProfile, isEditing, isOpen]);

  const handleSelectChange = (
      values: string[],
      fieldName: 'origins' | 'destinations'
  ) => {
    if (fieldName === 'origins') {
      setOrigins(values);
    } else {
      setDestinations(values);
    }
  };

  const handleAction = async () => {
    if (isSaveMode) {
      if (isEditing && initialProfile && onUpdateProfile) {
        await onUpdateProfile(initialProfile.id, origins, destinations);
      } else {
        await onCreateProfile(origins, destinations);
      }
      handleClose();
    } else {
      await fetchTrainsForRoute(origins, destinations, QUICK_LOOKUP_ID);
      setIsFormCollapsed(true);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    onClose();
  };

  return (
      <>
        {isNewRoute && (
            <div className="fixed bottom-4 right-4 sm:bottom-10 sm:right-10 z-50">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                        size="lg"
                        className="h-14 w-14 rounded-full shadow-lg transition-shadow duration-200 hover:shadow-xl sm:scale-150"
                        onClick={() => onOpenChange(true)}
                        color="#1e293b"
                    >
                      <Plus className="h-6 w-6" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>New Route</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
        )}

        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[600px] p-0 h-[100dvh] sm:h-auto sm:max-h-[90vh] w-full overflow-hidden flex flex-col">
            <DialogHeader className="p-4 sm:p-6 pb-2 flex-shrink-0 border-b">
              <DialogTitle className="text-lg sm:text-xl flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
                <span>{isEditing ? 'Edit Route' : 'New Route'}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto">
              <div className="px-6 pb-6 space-y-6">
                {(!isFormCollapsed || isSaveMode) && (
                    <div className="space-y-4">
                      <RouteSelector
                          origins={origins}
                          destinations={destinations}
                          onChange={handleSelectChange}
                          maxOrigins={isSaveMode ? 3 : 1}
                      />
                    </div>
                )}

                {trainsError && (
                    <Alert variant="destructive">
                      <AlertDescription>{trainsError}</AlertDescription>
                    </Alert>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {!isSaveMode && currentTrains.length > 0 && (
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsFormCollapsed(!isFormCollapsed)}
                          className="mr-auto"
                      >
                        {isFormCollapsed ? (
                            <>
                              <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                              Show Form
                            </>
                        ) : (
                            <>
                              <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                              Hide Form
                            </>
                        )}
                      </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={handleClose}>
                    Cancel
                  </Button>
                  {(!isFormCollapsed || isSaveMode) && (
                      <Button
                          size="sm"
                          disabled={!origins.length || !destinations.length || isLoading}
                          onClick={handleAction}
                          className="min-w-[80px] sm:min-w-[100px]"
                      >
                        {isLoading ? (
                            <Watch
                                visible={true}
                                height="16"
                                width="16"
                                ariaLabel="loading"
                                wrapperClass=""
                                color="currentColor"
                            />
                        ) : isEditing ? (
                            'Update Route'
                        ) : isSaveMode ? (
                            'Save Route'
                        ) : (
                            'Search'
                        )}
                      </Button>
                  )}
                </div>

                {/* Mode Toggle - Only show in create mode */}
                {!isEditing && (
                    <div className="flex items-center gap-2 sm:gap-6 rounded-lg bg-muted p-1.5 sm:p-2 text-sm w-full">
                      <button
                          className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-md transition-colors flex-1 ${
                              isSaveMode
                                  ? 'bg-background text-foreground shadow-sm'
                                  : 'text-muted-foreground'
                          }`}
                          onClick={() => setIsSaveMode(true)}
                      >
                        <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4"/>
                        <span className="font-medium">Save Route</span>
                      </button>
                      <button
                          className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-md transition-colors flex-1 ${
                              !isSaveMode
                                  ? 'bg-background text-foreground shadow-sm'
                                  : 'text-muted-foreground'
                          }`}
                          onClick={() => setIsSaveMode(false)}
                      >
                        <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4"/>
                        <span className="font-medium">Quick Search</span>
                      </button>
                    </div>
                )}

                {/* Quick Search Results */}
                {!isSaveMode && currentTrains.length > 0 && (
                    <div className="pt-4 border-t space-y-4">
                      <TrainList
                          trains={currentTrains}
                          destinations={destinations}
                      />
                    </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
  );
}