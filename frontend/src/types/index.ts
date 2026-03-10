export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  dateTime: string;
  location: string;
  capacity: number | null;
  organizer: User;
  participants: User[];
}