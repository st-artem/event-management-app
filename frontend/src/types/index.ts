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

export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export interface UserAvatarProps {
  name: string; 
  size?: number; 
  variant?: 'beam' | 'marble' | 'pixel' | 'sunset' | 'ring' | 'bauhaus';
}

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

export interface FullUser extends User {
  bio?: string;
  location?: string;
  github?: string;
  website?: string;
  telegram?: string;
}

export interface ProfileStats {
  organized: number;
  attended: number;
  topTags: { name: string; count: number }[];
}

export interface EditProfileData {
  name?: string;
  bio?: string;
  location?: string;
  github?: string;
  website?: string;
  telegram?: string;
}