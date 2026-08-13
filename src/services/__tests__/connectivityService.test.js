import connectivityService from '../connectivityService';
import NetInfo from '@react-native-community/netinfo';
import { CONNECTIVITY_STATUS } from '../types/connectivityTypes';

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
  addEventListener: jest.fn(),
}));

describe('connectivityService NetInfo Wrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('evaluates status as ONLINE when isConnected is true and isInternetReachable is true', async () => {
    NetInfo.fetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    });

    const res = await connectivityService.getConnectivityState();
    expect(res.status).toBe(CONNECTIVITY_STATUS.ONLINE);
    expect(res.isConnected).toBe(true);
  });

  it('evaluates status as OFFLINE when Wi-Fi is connected but internet is unreachable', async () => {
    NetInfo.fetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: false,
      type: 'wifi',
    });

    const res = await connectivityService.getConnectivityState();
    expect(res.status).toBe(CONNECTIVITY_STATUS.OFFLINE);
  });

  it('evaluates status as OFFLINE when disconnected', async () => {
    NetInfo.fetch.mockResolvedValue({
      isConnected: false,
      isInternetReachable: false,
      type: 'none',
    });

    const res = await connectivityService.getConnectivityState();
    expect(res.status).toBe(CONNECTIVITY_STATUS.OFFLINE);
  });

  it('subscribes to NetInfo addEventListener changes', () => {
    const mockListener = jest.fn();
    NetInfo.addEventListener.mockImplementation((cb) => {
      cb({ isConnected: true, isInternetReachable: true, type: 'cellular' });
      return jest.fn();
    });

    connectivityService.subscribeToConnectivity(mockListener);
    expect(mockListener).toHaveBeenCalledWith(
      expect.objectContaining({ status: CONNECTIVITY_STATUS.ONLINE })
    );
  });
});
