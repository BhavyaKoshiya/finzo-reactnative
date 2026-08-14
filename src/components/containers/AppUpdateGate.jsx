import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectIsOnline } from '../../store/slices/connectivitySlice';
import { realtimeConfigService } from '../../config/realtimeConfigService';
import appUpdateService from '../../services/appUpdateService';
import AppUpdateModal from '../modals/AppUpdateModal';
import log from '../../services/logger';

/**
 * App Update Gate.
 * Evaluates remote version policies from Firebase RTDB /config/appUpdate when the app is online.
 *
 * PRECEDENCE & SAFETY RULES:
 * 1. Offline Gate Precedence: When offline, ConnectivityGate renders InternetRequiredScreen.
 * 2. Mandatory Update: If installedVersion < minimumVersion, AppUpdateModal locks UI.
 * 3. Optional Update: If installedVersion < latestVersion (and >= minimum), shows dismissible prompt once per session.
 * 4. Fail-Safe: Malformed or missing remote config never forces an update or locks users out.
 */
export const AppUpdateGate = ({ children }) => {
  const isOnline = useSelector(selectIsOnline);
  const [updateInfo, setUpdateInfo] = useState(() =>
    appUpdateService.checkAppUpdate(),
  );
  const [optionalModalVisible, setOptionalModalVisible] = useState(false);

  useEffect(() => {
    if (!isOnline) return;

    // Ensure RTDB subscription is active
    realtimeConfigService.initialize();

    const evaluateUpdate = config => {
      const result = appUpdateService.checkAppUpdate({
        config: config?.appUpdate,
      });
      log.debug('AppUpdateGate.evaluateUpdate', { result });
      setUpdateInfo(result);

      if (result.isOptional && !appUpdateService.isOptionalUpdateDismissed()) {
        setOptionalModalVisible(true);
      }
    };

    // Initial check with currently cached config
    evaluateUpdate(realtimeConfigService.getConfig());

    // Subscribe to live remote config updates
    const unsubscribe = realtimeConfigService.subscribe(config => {
      evaluateUpdate(config);
    });

    return () => {
      unsubscribe();
    };
  }, [isOnline]);

  const isMandatory = updateInfo?.isMandatory;
  const showModal =
    isMandatory || (optionalModalVisible && updateInfo?.isOptional);

  return (
    <>
      {children}
      {showModal && (
        <AppUpdateModal
          visible={showModal}
          updateInfo={updateInfo}
          onClose={() => setOptionalModalVisible(false)}
        />
      )}
    </>
  );
};

export default AppUpdateGate;
