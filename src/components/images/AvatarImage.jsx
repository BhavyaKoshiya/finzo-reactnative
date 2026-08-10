import React from 'react';
import AppImage from './AppImage';

export const AvatarImage = ({ size = 48, ...props }) => {
  return (
    <AppImage
      width={size}
      height={size}
      borderRadius={size / 2}
      {...props}
    />
  );
};

export default AvatarImage;
