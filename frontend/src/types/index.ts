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
  tags?: Tag[];
}

export interface EventCardProps {
  event: Event;
  currentUserId: number | null;
  onJoin: (eventId: number) => void;
  onLeave: (eventId: number) => void;
  onClick: () => void;
}

export interface LoaderProps {
  text?: string;
  fullScreen?: boolean;
}

export interface EmptyStateProps {
  icon?: any;
  title: string;
  description?: string;
  action?: any;
}

export interface Tag {
  id: string;
  name: string;
}

export interface TagChipProps {
  name: string;
  className?: string; 
}

export interface TagOption {
  label: string;
  value: string;
}

export interface TagSelectProps {
  value: TagOption[];
  onChange: (newValue: TagOption[]) => void;
  options?: TagOption[];
  maxTags?: number;
  placeholder?: string;
}
