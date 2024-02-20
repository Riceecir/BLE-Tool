import { Event } from '~/plugins/Event/index';
import { Middleware } from '~/plugins/Middleware/index';

// 发送和接收拦截器
const interceptors = {
  send: new Middleware<{ value: string }>(),
  receive: new Middleware<{ value: string }>(),
};

/* 蓝牙通讯基类，只处理基本的开启、关闭蓝牙，设备搜索，设备连接 */
class BLE extends Event<BLE.Events> {
  // 设备ID(connecting)
  protected deviceId: string = '';
  // 服务ID(connecting)
  protected serviceId: string = '';

  // 设备、服务、特征值列表
  protected devices: WechatMiniprogram.BlueToothDevice[] = [];
  protected services: WechatMiniprogram.BLEService[] = [];
  protected characteristics: WechatMiniprogram.BLECharacteristic[] = [];
  constructor() {
    super();
  }

  // 拦截器注册函数
  interceptors: {
    send: { use: typeof interceptors.send.use };
    receive: { use: typeof interceptors.send.use };
  } = {
    send: {
      use(cb) {
        return interceptors.send.use(cb);
      },
    },
    receive: {
      use(cb) {
        return interceptors.send.use(cb);
      },
    },
  };

  /* 初始化蓝牙连接器 */
  async start() {
    try {
      await this.openBluetoothAdapter();
      await this.startBluetoothDevicesDiscovery();

      return true;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /* 授权 */
  protected authorize(): void {}

  /* 开启蓝牙 */
  protected openBluetoothAdapter(): Promise<
    WechatMiniprogram.BluetoothError | string
  > {
    return new Promise((resolve, reject) => {
      wx.openBluetoothAdapter({
        mode: 'central',
        success: resolve,
        fail: (err) => {
          reject(`初始化失败: 请开启蓝牙后重试; ${err.errCode}:${err.errMsg};`);
        },
      });
    });
  }

  /* 关闭蓝牙 */
  protected closeBluetoothAdapter(): Promise<
    WechatMiniprogram.BluetoothError | string
  > {
    return new Promise((resolve, reject) => {
      wx.closeBluetoothAdapter({
        success: resolve,
        fail: (err) => {
          reject(`关闭蓝牙失败: \n ${err.errCode}:${err.errMsg}`);
        },
      });
    });
  }

  /* 开始搜索蓝牙设备 */
  protected startBluetoothDevicesDiscovery(options = {}) {
    return new Promise((resolve, reject) => {
      wx.startBluetoothDevicesDiscovery({
        allowDuplicatesKey: true,
        success: (res) => {
          wx.onBluetoothDeviceFound((res) => {
            this.emit('device', res.devices);
          });
          resolve(res);
        },
        fail: (err) => {
          reject(`开启搜索设备出错：${err.errCode}:${err.errMsg}`);
        },
        ...options,
      });
    });
  }

  /* 关闭蓝牙设备搜索 */
  stop() {
    return new Promise((resolve, reject) => {
      wx.stopBluetoothDevicesDiscovery({
        success: resolve,
        fail: (err) => {
          reject(`停止搜索设备出错: ${err.errCode}:${err.errMsg}`);
        },
      });
    });
  }

  // 连接设备
  connect(deviceId: string) {
    return new Promise(async (resolve, reject) => {
      wx.createBLEConnection({
        deviceId,
        success: (res) => {
          if (res.errCode === 0) {
            this.deviceId = deviceId;
            this.emit('connected', res);
            resolve(res);
          }
        },
        fail: (err) => {
          reject(err.errMsg);
        },
      });
    });
  }

  // 获取所有service
  getServices(deviceId: string) {
    return new Promise((resolve, reject) => {
      wx.getBLEDeviceServices({
        deviceId,
        success: (res) => {
          this.emit('service', res.services || []);
          resolve(res.services || []);
        },
        fail: (err) => {
          reject(err.errMsg);
        },
      });
    });
  }

  /* 获取所有特征值  */
  async getChrs(serviceId: string) {
    return new Promise((resolve, reject) => {
      wx.getBLEDeviceCharacteristics({
        deviceId: this.deviceId,
        serviceId,
        success: (res) => {
          this.serviceId = serviceId;
          this.emit('chr', res.characteristics);
          resolve(res.characteristics);
        },
        fail: (err) => {
          reject(err.errMsg);
        },
      });
    });
  }
}

export { BLE };
export default new BLE();
