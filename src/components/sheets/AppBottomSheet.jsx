import React, { useCallback, useMemo, forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import AppText from '../common/AppText';
import { useAppTheme } from '../../hooks/useAppTheme';

export const AppBottomSheet = forwardRef(
  (
    {
      snapPoints: customSnapPoints,
      title,
      children,
      onClose,
      onChange,
      index = -1,
      style,
      contentStyle,
      ...props
    },
    ref
  ) => {
    const { currentTheme } = useAppTheme();
    const snapPoints = useMemo(
      () => customSnapPoints || ['40%', '70%'],
      [customSnapPoints]
    );

    const renderBackdrop = useCallback(
      (backdropProps) => (
        <BottomSheetBackdrop
          {...backdropProps}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    );

    return (
      <BottomSheet
        ref={ref}
        index={index}
        snapPoints={snapPoints}
        onChange={onChange}
        onClose={onClose}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: currentTheme.surface }}
        handleIndicatorStyle={{ backgroundColor: currentTheme.border }}
        style={style}
        {...props}
      >
        <BottomSheetView style={[styles.container, contentStyle]}>
          {title && (
            <View style={[styles.header, { borderBottomColor: currentTheme.border }]}>
              <AppText variant="cardTitle" align="center">
                {title}
              </AppText>
            </View>
          )}
          <View style={styles.body}>{children}</View>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  body: {
    flex: 1,
  },
});

export default AppBottomSheet;
