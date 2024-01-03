import { Event } from "~/plugins/Event/index";

/* 蓝牙通讯基类，只处理基本的开启、关闭蓝牙，设备搜索，设备连接 */
class BLE extends Event {
  // 设备ID(connecting)
  protected deviceId: string = "";
  // 服务ID(connecting)
  protected serviceId: string = "";

  // 设备、服务、特征值列表
  protected devices: WechatMiniprogram.BlueToothDevice[] = [];
  protected services: WechatMiniprogram.BLEService[] = [];
  protected characteristics: WechatMiniprogram.BLECharacteristic[] = [];
  constructor() {
    super();
  }

  /* 授权 */
  protected authorize(): void {}

  /* 开启蓝牙 */
  protected openBluetoothAdapter(): Promise<
    WechatMiniprogram.BluetoothError | string
  > {
    return new Promise((resolve, reject) => {
      wx.openBluetoothAdapter({
        mode: "central",
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
          resolve(res);
        },
        fail: (err) => {
          reject(`开启搜索设备出错：${err.errCode}:${err.errMsg}`);
        },
        ...options,
      });
    });
  }
}

export { BLE };
export default new BLE();
