import React from 'react';
import AppImage from './AppImage';

export const RemoteImage = ({ uri, headers, priority, ...props }) => {
  return (
    <AppImage
      source={{
        uri,
        headers,
        priority,
      }}
      {...props}
    />
  );
};

export default RemoteImage;
