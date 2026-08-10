import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Image } from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import { useAppTheme } from '../../hooks/useAppTheme';

export const AppImage = ({
  source,
  width,
  height,
  borderRadius,
  resizeMode = FastImage.resizeMode.cover,
  placeholder,
  fallbackImage,
  accessibilityLabel,
  style,
  onLoadStart,
  onLoadEnd,
  onError,
  ...otherProps
}) => {
  const { currentTheme } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const imageStyle = [
    width !== undefined && { width },
    height !== undefined && { height },
    borderRadius !== undefined && { borderRadius },
    style,
  ];

  const handleLoadStart = () => {
    setLoading(true);
    if (onLoadStart) onLoadStart();
  };

  const handleLoadEnd = () => {
    setLoading(false);
    if (onLoadEnd) onLoadEnd();
  };

  const handleError = () => {
    setLoading(false);
    setHasError(true);
    if (onError) onError();
  };

  const isRemote =
    source &&
    typeof source === 'object' &&
    source.uri &&
    typeof source.uri === 'string';

  if (hasError && fallbackImage) {
    return (
      <Image
        source={fallbackImage}
        style={[imageStyle, styles.image]}
        accessibilityLabel={accessibilityLabel}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        imageStyle,
        { backgroundColor: currentTheme.border },
      ]}
      accessibilityLabel={accessibilityLabel}
      accessible={!!accessibilityLabel}
    >
      {isRemote ? (
        <FastImage
          source={source}
          style={[styles.image, imageStyle]}
          resizeMode={resizeMode}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          {...otherProps}
        />
      ) : (
        <Image
          source={source}
          style={[styles.image, imageStyle]}
          resizeMode={
            resizeMode === FastImage.resizeMode.cover ? 'cover' : 'contain'
          }
          {...otherProps}
        />
      )}

      {loading && (
        <View
          style={[
            styles.loadingOverlay,
            StyleSheet.absoluteFill,
            { backgroundColor: currentTheme.surface },
          ]}
        >
          <ActivityIndicator size="small" color={currentTheme.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    justify: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
});

export default AppImage;
