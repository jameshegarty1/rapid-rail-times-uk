export interface Train {
  service_id: string;
  scheduled_departure: string;
  estimated_departure: string;
  platform: string;
  origin: string;
  destination: string;
  via: string;
  length: number;
  operator: string;
  is_cancelled: boolean;
  delay_reason?: string;
  cancel_reason?: string;
  subsequent_calling_points: CallingPoint[]; 
}


export interface Profile {
  id: number;
  origins: string[];
  destinations: string[];
}

export interface CallingPoint {
  crs: string;
  location_name: string;
  st: string; // scheduled time
  et: string; // estimated time
  at: string; // actual time
}


export interface TaskResponse {
  status: 'pending' | 'completed' | 'failed';
  task_id: string;
  check_status_url?: string;
  result?: Train[];
  error?: string;
}
