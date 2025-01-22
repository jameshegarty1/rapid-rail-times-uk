export interface Train {
  service_id: string;
  scheduled_departure: string;
  estimated_departure: string;
  platform: string;
  origin: string;
  destination: string;
  destination_name: string;
  via: string;
  coaches: number;
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
  favourite: boolean;
}

export interface CallingPoint {
  crs: string;
  station_name: string;
  scheduled_time: string; // scheduled time
}


export interface TaskResponse {
  status: 'pending' | 'completed' | 'failed';
  task_id: string;
  check_status_url?: string;
  result?: Train[];
  error?: string;
}
