import React from 'react';
import Avatar from 'boring-avatars';
import { type UserAvatarProps } from '../types';


export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  name, 
  size = 40, 
  variant = 'beam' 
}) => {
  return (
    <div className="rounded-full overflow-hidden shrink-0" style={{ width: size, height: size }}>
      <Avatar
        size={size}
        name={name}
        variant={variant}
        colors={['#0052FF', '#FF6B00', '#F3F4F6', '#1F2937', '#9CA3AF']}
      />
    </div>
  );
};