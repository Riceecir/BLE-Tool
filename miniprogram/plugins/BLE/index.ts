import { Event } from "~/plugins/Event/index";
import { Middleware } from "~/plugins/Middleware/index";
import { abTohex, abTostr, hexToAb, strToAb } from "~/utils/String";

/* 蓝牙通讯基类，只处理基本的开启、关闭蓝牙，设备搜索，设备连接 */
class BLE extends Event<BLE.Events> {
  // 中间件
  middleware = {
    send: new Middleware<BLE.Context>(),
    receive: new Middleware<BLE.Context>(),
  };
  // 设备ID(connecting)
  protected deviceId: string = "";
  // 服务ID(connecting)
  protected serviceId: string = "";
  // 特征值ID(connecting)
  protected characteristicId: string = "";
  // 特征值支持的操作类型
  protected properties: (keyof WechatMiniprogram.BLECharacteristicProperties)[] =
    [];
  // 设备、服务、特征值列表
  protected devices: WechatMiniprogram.BlueToothDevice[] = [];
  protected services: WechatMiniprogram.BLEService[] = [];
  protected characteristics: WechatMiniprogram.BLECharacteristic[] = [];

  constructor() {
    super();
  }

  /* 初始化蓝牙连接器 */
  async start() {
    try {
      await this.disconnect();
      await this.openBluetoothAdapter();
      await this.startBluetoothDevicesDiscovery();

      return true;
    } catch (e) {
      return Promise.reject(e);
    }
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
            this.emit("connected", res);
            resolve(res);
          }
        },
        fail: (err) => {
          reject(err.errMsg);
        },
      });
    });
  }

  // 断开连接
  disconnect(deviceId = this.deviceId) {
    if (!deviceId) return Promise.resolve();
    return new Promise((resolve) => {
      wx.closeBLEConnection({ deviceId })
        .then((res) => {
          if (res.errCode === 0) {
            resolve(res);
            this.emit("disConnected", res);
          }
        })
        .finally(() => {
          resolve(null);
          // 初始化连接信息
          this.deviceId = "";
          this.serviceId = "";
          this.characteristicId = "";
          this.properties = [];
          this.services = [];
          this.characteristics = [];
          this.emit("chr", this.characteristics);
          this.emit("service", this.services);
        });
    });
  }

  // 获取所有service
  getServices(deviceId: string): Promise<WechatMiniprogram.BLEService[]> {
    return new Promise((resolve, reject) => {
      wx.getBLEDeviceServices({
        deviceId,
        success: (res) => {
          this.emit("service", res.services || []);
          resolve(res.services || []);
        },
        fail: (err) => {
          reject(err.errMsg);
        },
      });
    });
  }

  /* 获取所有特征值  */
  getChrs(serviceId: string): Promise<WechatMiniprogram.BLECharacteristic[]> {
    return new Promise((resolve, reject) => {
      wx.getBLEDeviceCharacteristics({
        deviceId: this.deviceId,
        serviceId,
        success: (res) => {
          this.emit("chr", res.characteristics);
          resolve(res.characteristics);
        },
        fail: (err) => {
          reject(err.errMsg);
        },
      });
    });
  }

  /* 设置特征值 */
  setChrs(
    serviceId: string,
    characteristicId: string,
    properties: (keyof WechatMiniprogram.BLECharacteristicProperties)[]
  ) {
    this.serviceId = serviceId;
    this.characteristicId = characteristicId;
    this.properties = properties;
  }

  /* 写入 */
  async write({ text, type }: { text: string; type: BLE.Context["type"] }) {
    const { ab } = await this.middleware.send.start(
      this.getContext({ text, type })
    );

    if (!ab) {
      this.emit("notify", "error", { text: "写入数据格式错误" });
      return Promise.reject();
    }

    wx.writeBLECharacteristicValue({
      deviceId: this.deviceId,
      serviceId: this.serviceId,
      characteristicId: this.characteristicId,
      value: ab,
      success: () => {},
      fail: (e) => {
        this.emit("error", e);
        this.emit("notify", "error", {
          text: `错误码: ${e.errCode}; 错误信息: ${e.errMsg}`,
        });
      },
    });
  }

  /* 读取 */
  read() {
    wx.readBLECharacteristicValue({
      deviceId: this.deviceId,
      serviceId: this.serviceId,
      characteristicId: this.characteristicId,
      success: () => {},
      fail: (e) => {
        this.emit("error", e);
        this.emit("notify", "error", {
          text: `错误码: ${e.errCode}; 错误信息: ${e.errMsg}`,
        });
      },
    });
  }

  /* 监听 */
  notify() {
    wx.offBLECharacteristicValueChange();
    wx.onBLECharacteristicValueChange(async (res) => {
      const { text, hex, type } = await this.middleware.receive.start(
        this.getContext({ ab: res.value })
      );
      this.emit("notify", "notify", { text, hex, type }, res);
    });
  }

  // 获取连接信息
  getConnection() {
    return {
      deviceId: this.deviceId,
      serviceId: this.serviceId,
      characteristicId: this.characteristicId,
      properties: this.properties,
    };
  }

  /* 获取上下文(中间件使用) */
  protected getContext(mixins: BLE.Context) {
    return {
      deviceId: this.deviceId,
      serviceId: this.serviceId,
      characteristicId: this.characteristicId,
      ...mixins,
    };
  }

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
        success: (res) => {
          wx.onBluetoothDeviceFound((res) => {
            this.emit("device", res.devices);
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
}

const ble = new BLE();

// 注册中间件(写入)
ble.middleware.send.use((ctx) => {
  // 类型转换
  let ab: ArrayBuffer | undefined = undefined;
  const { type, text } = ctx;
  if (text) {
    if (type === "HEX") ab = hexToAb(text);
    else if (type === "TEXT") ab = strToAb(text);
  }
  ctx.ab = ab;

  return ctx;
});

// 注册中间件(响应)
ble.middleware.receive.use((ctx) => {
  // 类型转换
  ctx.text = ctx.ab ? abTostr(ctx.ab) : "";
  ctx.hex = ctx.ab ? abTohex(ctx.ab) : "";
  return ctx;
});

export { BLE };
export default ble;
