import { consoleTransport, logger } from 'react-native-logs';
import {
  log as crashlyticsLog,
  getCrashlytics,
} from '@react-native-firebase/crashlytics';

let _crashlyticsInstance = null;

const customTransport = props => {
  // Lazily resolve crashlytics — Firebase may not be initialized on first calls
  try {
    if (!_crashlyticsInstance) {
      _crashlyticsInstance = getCrashlytics();
    }
    crashlyticsLog(_crashlyticsInstance, props.msg);
  } catch (_e) {
    // Firebase not ready yet — skip crashlytics logging, use console only
  }
  if (__DEV__) {
    consoleTransport({ ...props, msg: props?.msg });
  }
};

const config = {
  transport: customTransport,
  severity: __DEV__ ? 'debug' : 'error',
  transportOptions: {
    colors: {
      info: 'blueBright',
      warn: 'yellowBright',
      error: 'redBright',
    },
  },
};

const log = logger.createLogger(config);

export default log;
