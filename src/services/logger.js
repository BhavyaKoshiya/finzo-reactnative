import { consoleTransport, logger } from 'react-native-logs';

const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : true;

const config = {
  transport: consoleTransport,
  severity: isDev ? 'debug' : 'error',
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
