import React from 'react';
import Avatar from 'boring-avatars';
import { type UserAvatarProps } from '../types';

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  name, 
  size = 40, 
  variant = 'bauhaus' 
}) => {
  return (
    <div className="rounded-full overflow-hidden shrink-0 shadow-inner" style={{ width: size, height: size }}>
      <Avatar
        size={size}
        name={name}
        variant={variant}
        colors={['#0052FF', '#FF6B00', '#F59E0B', '#10B981', '#F43F5E']} 
      />
    </div>
  );
};