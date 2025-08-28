export interface RoomTarif {
  id: number;
  ressource_id: number;
  tarif_h: string;
  tarif_j: string;
  tarif_sem: string;
  tarif_mois: string;
  tarif_an: string;
}

export interface Room {
  id: number;
  name: string;
  description: string;
  capacity: string;
  availability: string;
  location: string;
  status: string;
  company_id: number;
  type_id: number;
  created_at: string;
  type_name: string;
  company_name: string;
  tarifs: RoomTarif;
  photos: string[];
}

export interface ReservationData {
  start_date: string;
  end_date: string;
  price: number;
  duration_type: 'hours' | 'days' | 'weeks' | 'months' | 'years';
  duration_count: number;
  ressource_id: number;
}