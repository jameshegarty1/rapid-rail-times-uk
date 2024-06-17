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
}


export interface Profile {
  id: number;
  origins: string[];
  destinations: string[];
}
