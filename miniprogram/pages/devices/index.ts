import ble from '~/plugins/BLE/index';
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';

// 模拟蓝牙设备
const mockData = [
  {
    deviceId: 'FB0E6F6E-5B75-4EC8-C3C9-FBEC5FB7E01F',
    connectable: false,
    name: 'iPhone',
    advertisData: {},
    RSSI: -64,
  },
  {
    deviceId: '9E5F1C11-8BC1-D2B5-365B-A5F1071C206E',
    connectable: false,
    name: '',
    RSSI: -59,
  },
  {
    deviceId: 'AEB97FE5-ABE7-5B62-CFF9-EFB4E0EADAD1',
    connectable: false,
    name: '',
    RSSI: -61,
  },
  {
    deviceId: '253912F7-8AF6-4936-3225-6B5C2CE39140',
    connectable: true,
    name: '',
    RSSI: -58,
  },
  {
    deviceId: '715246B6-8310-4159-1F92-16DF6F3651DF',
    connectable: false,
    name: '',
    RSSI: -84,
  },
  {
    deviceId: '80C72316-A4A5-825F-97CF-58EAC62DE1AC',
    connectable: false,
    name: '',
    RSSI: -60,
  },
] as unknown as WechatMiniprogram.BlueToothDevice[];
// pages/devices/index.ts
Page<
  {
    system: string;
    devices: BLE.BlueToothDevices;
    isConnecting: boolean;
  },
  {
    getDevices: (res: BLE.BlueToothDevices) => void;
    start: () => void;
    stop: () => void;
    connect: (
      event: WechatMiniprogram.BaseEvent<{}, { deviceid: string }>
    ) => void;
  }
>({
  /**
   * 页面的初始数据
   */
  data: {
    system: '',
    isConnecting: false,
    devices: ['develop'].includes(
      wx.getAccountInfoSync().miniProgram.envVersion
    )
      ? mockData
      : [],
  },

  onReady() {
    const app = getApp();
    if (app) {
      this.setData({
        system: String(app.globalData.platform).toLocaleLowerCase(),
      });
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow() {
    this.start();
  },

  onHide() {
    this.stop();
  },

  // 启动！
  async start() {
    Toast.loading({
      message: 'loading...',
      duration: 0,
    });
    ble.remove('device', this.getDevices);
    ble.on('device', this.getDevices);
    this.setData({ reInit: false });
    try {
      await ble.start();
      Toast.clear();
    } catch (e) {
      this.setData({ reInit: true });
      Toast({ message: e as string, duration: 3000 });
    }
  },

  // 关闭搜索
  stop() {
    ble.stop();
    ble.remove('device', this.getDevices);
  },

  // 接收设备信息
  getDevices(newList) {
    const devices = [...this.data.devices];

    newList.forEach((d) => {
      /* 替换重复设备 */
      const idx = devices.findIndex(({ deviceId }) => deviceId === d.deviceId);
      if (idx === -1) {
        devices.push(d);
      } else {
        devices.splice(idx, 1, d);
      }
    });

    // ts-ignore
    this.setData({ devices });
  },

  // 连接设备
  connect(e: WechatMiniprogram.BaseEvent) {
    if (this.data.isConnecting) return;
    this.data.isConnecting = true;
    const device = e.currentTarget.dataset?.device;
    if (!device) return;
    Toast.loading({
      message: 'connecting...',
      duration: 0,
    });

    const { deviceId, name } = device;
    ble
      .connect(deviceId)
      .then(() => {
        Toast.clear();
        wx.navigateTo({
          url: `/pages/device_detail/index?deviceId=${deviceId}&name=${name}`,
        });
      })
      .catch((e) => {
        Toast(e);
      })
      .finally(() => (this.data.isConnecting = false));
  },
});
